import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AppError } from "@/server/shared/http-errors";

function parseSessionBigInt(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  return BigInt(value);
}

export async function getCurrentUser() {
  const session = await auth();

  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  return user;
}

export async function requireOrganizationId() {
  const user = await requireUser();

  if (!user.organizationId) {
    throw new AppError("FORBIDDEN", "사업장 권한을 확인할 수 없습니다.", 403);
  }

  return BigInt(user.organizationId);
}

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePageOrganizationId() {
  const user = await requirePageUser();
  const organizationId = parseSessionBigInt(user.organizationId);

  if (!organizationId) {
    redirect("/login");
  }

  return organizationId;
}

export async function requirePageTenantUser() {
  const user = await requirePageUser();
  const id = parseSessionBigInt(user.id);
  const organizationId = parseSessionBigInt(user.organizationId);

  if (!id || !organizationId) {
    redirect("/login");
  }

  return {
    ...user,
    id,
    organizationId
  };
}
