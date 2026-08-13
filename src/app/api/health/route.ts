import { success } from "@/server/shared/api-response";

export function GET() {
  return success({
    status: "ok",
    service: "customerflow",
    timestamp: new Date()
  });
}
