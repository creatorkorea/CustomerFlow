import { requireUser } from "@/server/auth/session";
import {
  deleteCustomer,
  getCustomer,
  updateCustomer
} from "@/server/customers/service";
import { updateCustomerSchema } from "@/server/customers/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

type CustomerRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseCustomerId(id: string) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

async function requireCustomerContext(context: CustomerRouteContext) {
  const user = await requireUser();
  const { id } = await context.params;
  const customerId = parseCustomerId(id);

  if (!customerId || !user.organizationId) {
    return null;
  }

  return {
    customerId,
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id)
  };
}

export async function GET(
  _request: Request,
  context: CustomerRouteContext
) {
  try {
    const customerContext = await requireCustomerContext(context);

    if (!customerContext) {
      return failure("VALIDATION_ERROR", "고객 ID를 확인해주세요.", 400);
    }

    const customer = await getCustomer(customerContext);

    return success(customer);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}

export async function PUT(request: Request, context: CustomerRouteContext) {
  try {
    const customerContext = await requireCustomerContext(context);

    if (!customerContext) {
      return failure("VALIDATION_ERROR", "고객 ID를 확인해주세요.", 400);
    }

    const parsed = updateCustomerSchema.safeParse(await request.json());

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "고객 정보를 확인해주세요.", 400);
    }

    const customer = await updateCustomer({
      ...customerContext,
      input: parsed.data
    });

    return success(customer);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}

export async function DELETE(
  _request: Request,
  context: CustomerRouteContext
) {
  try {
    const customerContext = await requireCustomerContext(context);

    if (!customerContext) {
      return failure("VALIDATION_ERROR", "고객 ID를 확인해주세요.", 400);
    }

    await deleteCustomer(customerContext);

    return success({ deleted: true });
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
