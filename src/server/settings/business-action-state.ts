export type BusinessSettingsActionState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "success" | "error";
      message: string;
    };

export const initialBusinessSettingsActionState: BusinessSettingsActionState = {
  status: "idle",
  message: null
};
