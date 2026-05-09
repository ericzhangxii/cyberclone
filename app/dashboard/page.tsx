import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CloneEditor } from "@/components/CloneEditor";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getMyInboxConversations } from "@/actions/conversation";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { cyberclone: { include: { documents: true } } },
  });

  if (!user?.username) redirect("/setup");

  const { tab = "clone" } = await searchParams;
  const clone = user.cyberclone;
  const inbox = clone ? await getMyInboxConversations() : [];

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 w-full">
      {tab === "clone" && (
        <Card>
          <CardHeader>
            <CardTitle>{clone ? "Edit your cyberclone" : "Create your cyberclone"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CloneEditor
              initialData={
                clone
                  ? {
                      name: clone.name,
                      bio: clone.bio,
                      systemPrompt: clone.systemPrompt,
                      model: clone.model,
                      isPublic: clone.isPublic,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {tab === "documents" && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge documents</CardTitle>
          </CardHeader>
          <CardContent>
            {clone ? (
              <DocumentUploader documents={clone.documents} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Create your cyberclone first, then upload documents.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "inbox" && (
        <Card>
          <CardHeader>
            <CardTitle>
              Conversations with your clone
              {inbox.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs font-normal">
                  {inbox.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inbox.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <ul className="space-y-2">
                {inbox.map((conv) => (
                  <li key={conv.id}>
                    <Link
                      href={`/dashboard/conversations/${conv.id}`}
                      className="flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={conv.visitor?.image ?? undefined} />
                        <AvatarFallback>
                          {conv.visitor?.name?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">
                            {conv.visitor?.name ?? "Anonymous"}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {conv.mode.toLowerCase()}
                          </Badge>
                        </div>
                        {conv.messages[0] && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {conv.messages[0].content}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
