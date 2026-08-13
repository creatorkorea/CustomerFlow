import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import {
  loginAction,
  logoutAction,
  registerAction
} from "@/server/auth/actions";
import { initialAuthActionState } from "@/server/auth/action-state";
import { signOut } from "@/lib/auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";

function formDataOf(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid login form values without signing in", async () => {
    const result = await loginAction(
      initialAuthActionState,
      formDataOf({
        email: "not-an-email",
        password: ""
      })
    );

    expect(result).toEqual({
      status: "error",
      message: "이메일과 비밀번호를 확인해주세요."
    });
  });

  it("rethrows Auth.js redirect errors after a successful login", async () => {
    const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/dashboard;303;"
    });

    vi.mocked(signIn).mockRejectedValueOnce(redirectError);

    await expect(
      loginAction(
        initialAuthActionState,
        formDataOf({
          email: "owner@example.com",
          password: "customerflow-demo-password"
        })
      )
    ).rejects.toBe(redirectError);
  });


  it("rejects invalid register form values without touching the database", async () => {
    const result = await registerAction(
      initialAuthActionState,
      formDataOf({
        organizationName: "",
        businessNumber: "",
        name: "",
        email: "not-an-email",
        password: "short"
      })
    );

    expect(result).toEqual({
      status: "error",
      message: "회원가입 정보를 확인해주세요."
    });
  });

  it("returns a friendly register error when the database is unavailable", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
      Object.assign(new Error("Can't reach database server"), {
        code: "ECONNREFUSED"
      })
    );

    const result = await registerAction(
      initialAuthActionState,
      formDataOf({
        organizationName: "홍길동 정비소",
        businessNumber: "",
        name: "홍길동",
        email: "owner@example.com",
        password: "strong-password"
      })
    );

    expect(result).toEqual({
      status: "error",
      message: "데이터베이스 연결을 확인해주세요."
    });
  });


  it("signs out through Auth.js and returns to login", async () => {
    await logoutAction();

    expect(signOut).toHaveBeenCalledWith({
      redirectTo: "/login"
    });
  });
});
