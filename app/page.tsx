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
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12 w-full">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Be everywhere at once
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Create an AI version of yourself and let anyone interact with it &mdash; even when you&apos;re away.
          </p>
          <Link
            href={session?.user ? "/dashboard" : "/sign-up"}
            className={buttonVariants({ size: "lg" })}
          >
            {session?.user ? "Go to dashboard" : "Create your cyberclone"}
          </Link>
        </section>

        {clones.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Discover cyberclones</h2>
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
      </main>
    </>
  );
}
