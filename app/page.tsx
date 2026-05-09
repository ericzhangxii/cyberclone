export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { CloneCard } from "@/components/CloneCard";
import { buttonVariants } from "@/components/ui/button";

async function getPublicClones() {
  try {
    return await prisma.cyberclone.findMany({
      where: { isPublic: true },
      include: { user: { select: { username: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [clones, session] = await Promise.all([getPublicClones(), auth()]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.9_0.05_265),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_60%,oklch(1_0_0))]" />

        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          Powered by Claude
        </span>

        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-6 max-w-3xl leading-[1.08]">
          Be{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            everywhere
          </span>{" "}
          at once
        </h1>

        <p className="text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
          Create an AI version of yourself and let anyone interact with it &mdash; even when you&apos;re away.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href={session?.user ? "/dashboard" : "/sign-up"}
            className={buttonVariants({ size: "lg" }) + " shadow-lg shadow-primary/20"}
          >
            {session?.user ? "Go to dashboard" : "Create your cyberclone"}
          </Link>
          {!session?.user && (
            <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Sign in
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-16 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{clones.length}</div>
            <div>cyberclones</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">3</div>
            <div>Claude models</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">∞</div>
            <div>conversations</div>
          </div>
        </div>
      </section>

      {/* Clone grid */}
      {clones.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-24 w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Discover cyberclones</h2>
            <span className="text-sm text-muted-foreground">{clones.length} clones</span>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {clones.map((clone) => (
              <CloneCard
                key={clone.id}
                username={clone.user.username!}
                name={clone.name}
                bio={clone.bio}
                image={clone.user.image}
                model={clone.model}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
