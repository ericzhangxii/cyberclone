import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { CLAUDE_MODELS } from "@/lib/models";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: { cyberclone: true },
  });
  if (!user?.cyberclone) return { title: "Cyberclone" };
  return {
    title: `${user.cyberclone.name} — Cyberclone`,
    description: user.cyberclone.bio ?? undefined,
  };
}

export default async function ClonePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      cyberclone: true,
    },
  });

  if (!user || !user.cyberclone) notFound();

  const clone = user.cyberclone;
  const modelLabel = CLAUDE_MODELS.find((m) => m.id === clone.model)?.label ?? clone.model;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xl">{clone.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{clone.name}</h1>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            {clone.bio && <p className="mt-2 text-sm">{clone.bio}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{modelLabel}</Badge>
              <Link
                href={`/${username}/conversations`}
                className="text-xs text-muted-foreground hover:underline"
              >
                View public conversations →
              </Link>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        <ChatInterface
          cloneId={clone.id}
          cloneName={clone.name}
          cloneImage={user.image}
          cloneInitial={clone.name[0]?.toUpperCase() ?? "?"}
        />
      </main>
    </>
  );
}
