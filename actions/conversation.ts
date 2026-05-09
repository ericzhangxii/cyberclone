"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationMode } from "@prisma/client";

export async function createConversation(cloneId: string, mode: ConversationMode) {
  const session = await auth();

  const visitorId =
    mode === ConversationMode.INCOGNITO ? null : (session?.user?.id ?? null);

  const conversation = await prisma.conversation.create({
    data: { cloneId, visitorId, mode },
  });

  return conversation;
}

export async function getPublicConversations(cloneId: string) {
  return prisma.conversation.findMany({
    where: { cloneId, mode: ConversationMode.PUBLIC },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
      visitor: { select: { name: true, username: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

export async function getConversationDetail(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const clone = await prisma.cyberclone.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!clone) return null;

  return prisma.conversation.findUnique({
    where: { id: conversationId, cloneId: clone.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      visitor: { select: { name: true, username: true, image: true } },
    },
  });
}

export async function getMyInboxConversations() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const clone = await prisma.cyberclone.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!clone) return [];

  return prisma.conversation.findMany({
    where: {
      cloneId: clone.id,
      mode: { in: [ConversationMode.PRIVATE, ConversationMode.PUBLIC] },
    },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      visitor: { select: { name: true, username: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
