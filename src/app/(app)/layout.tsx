import { AppShell } from "@/components/layout/app-shell";
import { requirePageTenantUser } from "@/server/auth/session";
import { getUnreadNotificationCount } from "@/server/notifications/service";

async function getSafeUnreadNotificationCount({
  organizationId,
  userId
}: {
  organizationId: bigint;
  userId: bigint;
}) {
  try {
    return await getUnreadNotificationCount({
      organizationId,
      userId
    });
  } catch (error) {
    console.error("Failed to load unread notification count", error);
    return 0;
  }
}

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePageTenantUser();
  const unreadNotificationCount = await getSafeUnreadNotificationCount({
    organizationId: user.organizationId,
    userId: user.id
  });

  return (
    <AppShell
      unreadNotificationCount={unreadNotificationCount}
      userName={user.name}
    >
      {children}
    </AppShell>
  );
}
