import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPublicConversations } from "@/actions/conversation";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ConversationsPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { cyberclone: true },
  });
  if (!user?.cyberclone) notFound();

  const conversations = await getPublicConversations(user.cyberclone.id);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Public conversations</h1>
            <p className="text-muted-foreground text-sm">with {user.cyberclone.name}</p>
          </div>
          <Link href={`/${username}`} className={buttonVariants({ variant: "outline" })}>
            ← Chat with clone
          </Link>
        </div>

        {conversations.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No public conversations yet.</p>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Card key={conv.id}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conv.visitor?.image ?? undefined} />
                    <AvatarFallback>{conv.visitor?.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{conv.visitor?.name ?? "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                {conv.messages[0] && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {conv.messages[0].content}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
