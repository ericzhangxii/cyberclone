"use client";

import { useState, useRef, useEffect } from "react";
import { createConversation } from "@/actions/conversation";
import { ConversationMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
  pending?: boolean;
}

interface ChatInterfaceProps {
  cloneId: string;
  cloneName: string;
  cloneImage?: string | null;
  cloneInitial: string;
}

const MODE_LABELS: Record<ConversationMode, { label: string; description: string; color: string }> = {
  PUBLIC: { label: "Public", description: "Visible to everyone", color: "bg-green-100 text-green-700" },
  PRIVATE: { label: "Private", description: "Visible to clone owner only", color: "bg-yellow-100 text-yellow-700" },
  INCOGNITO: { label: "Incognito", description: "Only you can see this", color: "bg-gray-100 text-gray-700" },
};

export function ChatInterface({ cloneId, cloneName, cloneImage, cloneInitial }: ChatInterfaceProps) {
  const [mode, setMode] = useState<ConversationMode>(ConversationMode.PUBLIC);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    let convId = conversationId;
    if (!convId) {
      const conv = await createConversation(cloneId, mode);
      convId = conv.id;
      setConversationId(convId);
    }

    setMessages((prev) => [...prev, { role: "USER", content: text }]);
    setMessages((prev) => [...prev, { role: "ASSISTANT", content: "", pending: true }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: text }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Chat request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "ASSISTANT", content: accumulated, pending: false };
          return copy;
        });
      }
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const modeInfo = MODE_LABELS[mode];

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector — only before first message */}
      {!conversationId && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(MODE_LABELS) as ConversationMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                mode === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              )}
            >
              {MODE_LABELS[m].label}
            </button>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-1">
            {modeInfo.description}
          </span>
        </div>
      )}

      {conversationId && (
        <div className="mb-3">
          <Badge className={cn("text-xs", modeInfo.color)} variant="outline">
            {modeInfo.label} conversation
          </Badge>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px]">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center pt-8">
            Start a conversation with {cloneName}
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "USER" && "flex-row-reverse")}>
            {msg.role === "ASSISTANT" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={cloneImage ?? undefined} />
                <AvatarFallback>{cloneInitial}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                msg.role === "USER"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted",
                msg.pending && "animate-pulse"
              )}
            >
              {msg.content || (msg.pending ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="resize-none"
          disabled={streaming}
        />
        <Button onClick={sendMessage} disabled={streaming || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
