import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getConversationDetail } from "@/actions/conversation";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { id } = await params;
  const conversation = await getConversationDetail(id);
  if (!conversation) notFound();

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={conversation.visitor?.image ?? undefined} />
              <AvatarFallback>
                {conversation.visitor?.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {conversation.visitor?.name ?? "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(conversation.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Badge variant="outline" className="text-xs capitalize ml-1">
              {conversation.mode.toLowerCase()}
            </Badge>
          </div>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
            ← Inbox
          </Link>
        </div>

        <div className="space-y-4">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex", msg.role === "USER" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "USER"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {conversation.messages.length === 0 && (
            <p className="text-muted-foreground text-center py-16 text-sm">No messages in this conversation.</p>
          )}
        </div>
      </main>
    </>
  );
}
