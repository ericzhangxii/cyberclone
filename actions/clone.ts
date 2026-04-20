"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const cloneSchema = z.object({
  name: z.string().min(1).max(60),
  bio: z.string().max(280).optional(),
  systemPrompt: z.string().max(4000).optional(),
  model: z.string(),
  isPublic: z.boolean().optional(),
});

export async function upsertClone(data: z.infer<typeof cloneSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = cloneSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const clone = await prisma.cyberclone.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  return { clone };
}

export async function deleteDocument(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { clone: { select: { userId: true } } },
  });

  if (!doc || doc.clone.userId !== session.user.id) {
    return { error: "Not found or unauthorized" };
  }

  await prisma.document.delete({ where: { id: documentId } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMyClone() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.cyberclone.findUnique({
    where: { userId: session.user.id },
    include: { documents: true },
  });
}
