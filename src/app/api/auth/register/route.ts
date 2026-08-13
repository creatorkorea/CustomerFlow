import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";
import {
  registerFormSchema
} from "@/server/auth/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerFormSchema.safeParse(json);

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "입력값을 확인해주세요.", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existingUser) {
      return failure("DUPLICATE_RESOURCE", "이미 가입된 이메일입니다.", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
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
            source: "register"
          }
        }
      });

      return {
        user: {
          id: owner?.id,
          name: owner?.name,
          email: owner?.email,
          role: owner?.role
        },
        organization: {
          id: organization.id,
          name: organization.name,
          plan: organization.plan
        }
      };
    });

    return success(result, 201);
  } catch (error) {
    const apiError = toApiError(error);
    return failure(apiError.code, apiError.message, apiError.status);
  }
}
