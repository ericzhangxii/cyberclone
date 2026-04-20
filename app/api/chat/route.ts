import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { MessageRole } from "@prisma/client";
import { z } from "zod";

const bodySchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId, message } = parsed.data;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      clone: { include: { documents: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.message.create({
    data: { conversationId, role: MessageRole.USER, content: message },
  });

  const clone = conversation.clone;
  let systemPrompt = clone.systemPrompt || "You are a helpful assistant.";

  if (clone.documents.length > 0) {
    const docText = clone.documents
      .map((d) => `### ${d.filename}\n${d.textContent}`)
      .join("\n\n");
    systemPrompt += `\n\nContext from uploaded documents:\n---\n${docText}`;
  }

  const history = conversation.messages.map((m) => ({
    role: m.role === MessageRole.USER ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  const stream = await anthropic.messages.stream({
    model: clone.model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...history, { role: "user", content: message }],
  });

  const encoder = new TextEncoder();
  let fullContent = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullContent += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      await prisma.message.create({
        data: { conversationId, role: MessageRole.ASSISTANT, content: fullContent },
      });
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
