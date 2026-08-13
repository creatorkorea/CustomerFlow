export type TagActionState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "error";
      message: string;
    };

export const initialTagActionState: TagActionState = {
  status: "idle",
  message: null
};
