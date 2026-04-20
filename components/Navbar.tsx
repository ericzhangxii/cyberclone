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
    <nav className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Cyberclone
        </Link>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback>
                    {session.user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
              <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
