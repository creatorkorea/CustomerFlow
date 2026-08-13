export type ReservationActionState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "error";
      message: string;
    };

export const initialReservationActionState: ReservationActionState = {
  status: "idle",
  message: null
};
