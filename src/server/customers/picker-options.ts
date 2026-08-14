import { getCustomer, listCustomers } from "@/server/customers/service";

type ListCustomerPickerOptionsParams = {
  organizationId: bigint;
  defaultCustomerId?: string;
};

export async function listCustomerPickerOptions({
  organizationId,
  defaultCustomerId
}: ListCustomerPickerOptionsParams) {
  const { customers } = await listCustomers({
    organizationId,
    pageSize: 100
  });

  if (
    !defaultCustomerId ||
    customers.some((customer) => customer.id === defaultCustomerId)
  ) {
    return customers;
  }

  const defaultCustomer = await getCustomer({
    customerId: BigInt(defaultCustomerId),
    organizationId
  }).catch(() => null);

  return defaultCustomer ? [defaultCustomer, ...customers] : customers;
}
