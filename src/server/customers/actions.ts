"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/session";
import type { CustomerActionState } from "@/server/customers/action-state";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer
} from "@/server/customers/service";
import {
  createCustomerSchema,
  updateCustomerSchema
} from "@/server/customers/validation";

function formDataToObject(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const tagIds = formData.getAll("tagIds").map(String);

  return {
    ...data,
    tagIds
  };
}

function revalidateCustomerWorkflowPaths() {
  revalidatePath("/customers");
  revalidatePath("/consultations/new");
  revalidatePath("/reservations/new");
  revalidatePath("/follow-ups/new");
}

export async function createCustomerAction(
  _previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const user = await requireUser();
  const parsed = createCustomerSchema.safeParse(formDataToObject(formData));

  if (!parsed.success || !user.organizationId) {
    return {
      status: "error",
      message: "고객 정보를 확인해주세요."
    };
  }

  const customer = await createCustomer({
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  revalidateCustomerWorkflowPaths();
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const user = await requireUser();
  const parsed = updateCustomerSchema.safeParse(formDataToObject(formData));

  if (!parsed.success || !user.organizationId) {
    return {
      status: "error",
      message: "고객 정보를 확인해주세요."
    };
  }

  await updateCustomer({
    customerId: BigInt(customerId),
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  revalidateCustomerWorkflowPaths();
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteCustomerAction(customerId: string) {
  const user = await requireUser();

  if (!user.organizationId) {
    redirect("/customers");
  }

  await deleteCustomer({
    customerId: BigInt(customerId),
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id)
  });

  revalidateCustomerWorkflowPaths();
  revalidatePath(`/customers/${customerId}`);
  redirect("/customers");
}
