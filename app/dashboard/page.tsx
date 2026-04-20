import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { CloneEditor } from "@/components/CloneEditor";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getMyInboxConversations } from "@/actions/conversation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { cyberclone: { include: { documents: true } } },
  });

  const clone = user?.cyberclone;
  const inbox = clone ? await getMyInboxConversations() : [];

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>{session.user.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{session.user.name}</p>
            {user?.username && (
              <Link href={`/${user.username}`} className="text-sm text-muted-foreground hover:underline">
                @{user.username}
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue="clone">
          <TabsList className="mb-6">
            <TabsTrigger value="clone">My Cyberclone</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="inbox">
              Inbox
              {inbox.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {inbox.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clone">
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
          </TabsContent>

          <TabsContent value="documents">
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
          </TabsContent>

          <TabsContent value="inbox">
            <Card>
              <CardHeader>
                <CardTitle>Conversations with your clone</CardTitle>
              </CardHeader>
              <CardContent>
                {inbox.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {inbox.map((conv) => (
                      <li key={conv.id} className="flex items-start gap-3 border rounded-lg p-3">
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
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
