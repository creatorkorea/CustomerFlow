import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AppError } from "@/server/shared/http-errors";

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

  if (!user.organizationId) {
    redirect("/login");
  }

  return BigInt(user.organizationId);
}
