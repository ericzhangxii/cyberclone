"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { redirect } from "next/navigation";

const usernameSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(30, "At most 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only");

export async function setUsername(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const raw = formData.get("username");
  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const taken = await prisma.user.findUnique({ where: { username: parsed.data } });
  if (taken) return { error: "Username already taken" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username: parsed.data },
  });

  redirect("/dashboard");
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
}
