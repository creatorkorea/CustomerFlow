import { AppShell } from "@/components/layout/app-shell";
import { requirePageUser } from "@/server/auth/session";
import { getUnreadNotificationCount } from "@/server/notifications/service";

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePageUser();
  const unreadNotificationCount = user.organizationId
    ? await getUnreadNotificationCount({
        organizationId: BigInt(user.organizationId),
        userId: BigInt(user.id)
      })
    : 0;

  return (
    <AppShell
      unreadNotificationCount={unreadNotificationCount}
      userName={user.name}
    >
      {children}
    </AppShell>
  );
}
