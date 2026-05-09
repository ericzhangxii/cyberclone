import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true },
      })
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<aside className="w-60 shrink-0 border-r border-border bg-muted/20" />}>
        <DashboardSidebar
          name={session?.user?.name ?? null}
          email={session?.user?.email ?? null}
          image={session?.user?.image ?? null}
          username={user?.username ?? null}
        />
      </Suspense>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
