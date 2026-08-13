export type ConsultationActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialConsultationActionState: ConsultationActionState = {
  status: "idle",
  message: ""
};
