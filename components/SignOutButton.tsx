"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  async function handleSignOut() {
    await signOut({ callbackUrl: "/sign-in", redirect: true });
  }

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      Sign out
    </DropdownMenuItem>
  );
}
