export type FollowUpActionState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "error";
      message: string;
    };

export const initialFollowUpActionState: FollowUpActionState = {
  status: "idle",
  message: null
};
