export type CustomerActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialCustomerActionState: CustomerActionState = {
  status: "idle",
  message: ""
};
