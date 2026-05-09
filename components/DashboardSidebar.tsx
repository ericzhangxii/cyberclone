"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteAccountButton } from "./DeleteAccountButton";

interface Props {
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
}

const NAV = [
  {
    key: "clone",
    label: "My Cyberclone",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    key: "documents",
    label: "Documents",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
      </svg>
    ),
  },
];

export function DashboardSidebar({ name, email, image, username }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "clone";

  function isActive(key: string) {
    if (pathname.startsWith("/dashboard/conversations")) return key === "inbox";
    return tab === key;
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-muted/20 h-full">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <Link href="/" className="font-bold text-base tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Cyberclone
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.key}
            href={`/dashboard?tab=${item.key}`}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive(item.key)
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-border space-y-0.5">
        {username && (
          <Link
            href={`/${username}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/60 transition-colors"
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={image ?? undefined} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-semibold">
                {name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate leading-tight">{name}</p>
              <p className="text-xs text-muted-foreground truncate">@{username}</p>
            </div>
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          Sign out
        </button>
        <div className="px-3 py-1">
          <DeleteAccountButton />
        </div>
      </div>
    </aside>
  );
}
