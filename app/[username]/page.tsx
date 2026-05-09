import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const MODEL_GRADIENTS: Record<string, string> = {
  opus: "from-amber-500 to-orange-500",
  sonnet: "from-violet-500 to-indigo-500",
  haiku: "from-emerald-500 to-teal-500",
};

function getGradient(model: string) {
  const key = Object.keys(MODEL_GRADIENTS).find((k) => model.includes(k));
  return key ? MODEL_GRADIENTS[key] : "from-violet-500 to-indigo-500";
}

export default async function ClonePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { cyberclone: true },
  });

  if (!user || !user.cyberclone) notFound();

  const clone = user.cyberclone;
  const modelLabel = CLAUDE_MODELS.find((m) => m.id === clone.model)?.label ?? clone.model;
  const gradient = getGradient(clone.model);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Banner */}
      <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <main className="max-w-3xl mx-auto px-4 w-full flex-1 -mt-12">
        {/* Profile header */}
        <div className="flex items-end gap-4 mb-6">
          <Avatar className="h-20 w-20 ring-4 ring-background shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className={`text-2xl font-bold text-white bg-gradient-to-br ${gradient}`}>
              {clone.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-tight">{clone.name}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {clone.bio && (
          <p className="text-muted-foreground mb-4">{clone.bio}</p>
        )}

        <div className="flex items-center gap-3 mb-8">
          <Badge className={`text-white border-0 bg-gradient-to-r ${gradient} text-xs`}>
            {modelLabel.split(" ").slice(0, 2).join(" ")}
          </Badge>
          <Link
            href={`/${username}/conversations`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View public conversations →
          </Link>
        </div>

        {/* Chat */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 mb-8">
          <ChatInterface
            cloneId={clone.id}
            cloneName={clone.name}
            cloneImage={user.image}
            cloneInitial={clone.name[0]?.toUpperCase() ?? "?"}
          />
        </div>
      </main>
    </div>
  );
}
