export type AuthActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: ""
};
