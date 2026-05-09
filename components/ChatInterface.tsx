"use client";

import { useState, useRef, useEffect } from "react";
import { createConversation } from "@/actions/conversation";
import { ConversationMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const MODES: { key: ConversationMode; label: string; icon: string; description: string }[] = [
  { key: "PUBLIC", label: "Public", icon: "🌐", description: "Visible to everyone" },
  { key: "PRIVATE", label: "Private", icon: "🔒", description: "Only the clone owner sees this" },
  { key: "INCOGNITO", label: "Incognito", icon: "👻", description: "Only you can see this" },
];

export function ChatInterface({ cloneId, cloneName, cloneImage, cloneInitial }: ChatInterfaceProps) {
  const [mode, setMode] = useState<ConversationMode>("PUBLIC");
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

      if (!res.ok || !res.body) throw new Error("Chat request failed");

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

  const currentMode = MODES.find((m) => m.key === mode)!;

  return (
    <div className="flex flex-col">
      {/* Mode selector */}
      {!conversationId && (
        <div className="mb-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Conversation mode</p>
          <div className="flex gap-2 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  mode === m.key
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <span>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{currentMode.description}</p>
        </div>
      )}

      {conversationId && (
        <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
          <span>{currentMode.icon}</span>
          <span>{currentMode.label} conversation</span>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 mb-5 min-h-[260px] max-h-[500px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-3xl mb-2">👋</div>
            <p className="font-medium">Start a conversation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Say hello to {cloneName}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3 items-end", msg.role === "USER" && "flex-row-reverse")}
          >
            {msg.role === "ASSISTANT" && (
              <Avatar className="h-7 w-7 shrink-0 mb-0.5">
                <AvatarImage src={cloneImage ?? undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-semibold">
                  {cloneInitial}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "USER"
                  ? "bg-gradient-to-br from-violet-600 to-indigo-500 text-white rounded-br-sm"
                  : "bg-muted rounded-bl-sm",
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
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${cloneName}…`}
          rows={1}
          className="resize-none rounded-xl min-h-[44px]"
          disabled={streaming}
        />
        <Button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          className="rounded-xl h-11 px-5 bg-gradient-to-r from-violet-600 to-indigo-500 hover:opacity-90 border-0 shrink-0"
        >
          {streaming ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
