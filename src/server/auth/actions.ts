"use server";

import bcrypt from "bcrypt";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AuthActionState } from "@/server/auth/action-state";
import {
  formDataToObject,
  loginFormSchema,
  registerFormSchema
} from "@/server/auth/validation";

function isPrismaConnectionError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "P1001" ||
      error.code === "P2021" ||
      error.code === "ECONNREFUSED")
  );
}

function databaseErrorState(error: unknown): AuthActionState | null {
  if (!isPrismaConnectionError(error)) {
    return null;
  }

  return {
    status: "error",
    message: "데이터베이스 연결을 확인해주세요."
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "이메일과 비밀번호를 확인해주세요."
    };
  }

  try {
    const signInFormData = new FormData();
    signInFormData.set("email", parsed.data.email);
    signInFormData.set("password", parsed.data.password);
    signInFormData.set("redirectTo", "/dashboard");

    await signIn("credentials", signInFormData);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: "error",
      message: "이메일과 비밀번호를 확인해주세요."
    };
  }

  return {
    status: "idle",
    message: ""
  };
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "회원가입 정보를 확인해주세요."
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existingUser) {
      return {
        status: "error",
        message: "이미 가입된 이메일입니다."
      };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: parsed.data.organizationName,
          businessNumber: parsed.data.businessNumber,
          email: parsed.data.email,
          users: {
            create: {
              name: parsed.data.name,
              email: parsed.data.email,
              passwordHash,
              role: "owner"
            }
          },
          subscriptions: {
            create: {
              plan: "free",
              status: "trial",
              startedAt: new Date()
            }
          }
        },
        include: {
          users: true
        }
      });

      const owner = organization.users[0];

      await tx.activityLog.create({
        data: {
          organizationId: organization.id,
          userId: owner?.id,
          entityType: "USER",
          entityId: owner?.id,
          action: "USER_REGISTERED",
          metadata: {
            source: "register-action"
          }
        }
      });
    });
  } catch (error) {
    const state = databaseErrorState(error);

    if (state) {
      return state;
    }

    throw error;
  }

  try {
    const signInFormData = new FormData();
    signInFormData.set("email", parsed.data.email);
    signInFormData.set("password", parsed.data.password);
    signInFormData.set("redirectTo", "/dashboard");

    await signIn("credentials", signInFormData);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isPrismaConnectionError(error)) {
      return {
        status: "error",
        message: "회원가입은 완료됐지만 자동 로그인에 실패했습니다."
      };
    }

    return {
      status: "error",
      message: "회원가입은 완료됐지만 자동 로그인에 실패했습니다."
    };
  }

  return {
    status: "idle",
    message: ""
  };
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/login"
  });
}
