import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Cyberclone
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8 ring-2 ring-border">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-semibold">
                    {session.user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 mb-1 border-b">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
                <DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonVariants({ size: "sm" }) + " bg-gradient-to-r from-violet-600 to-indigo-500 hover:opacity-90 border-0"}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
