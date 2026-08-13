import { requireUser } from "@/server/auth/session";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

export async function GET() {
  try {
    const user = await requireUser();

    return success({
      user
    });
  } catch (error) {
    const apiError = toApiError(error);
    return failure(apiError.code, apiError.message, apiError.status);
  }
}
