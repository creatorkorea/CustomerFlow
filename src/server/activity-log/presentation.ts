import type { Prisma } from "@prisma/client";

const actionLabels: Record<string, string> = {
  AUTH_REGISTERED: "회원가입",
  CONSULTATION_CREATED: "상담 등록",
  CUSTOMER_CREATED: "고객 등록",
  CUSTOMER_DELETED: "고객 삭제",
  CUSTOMER_UPDATED: "고객 수정",
  FOLLOW_UP_CREATED: "후속관리 등록",
  FOLLOW_UP_STATUS_UPDATED: "후속관리 상태 변경",
  ORGANIZATION_UPDATED: "사업장 설정 변경",
  RESERVATION_CREATED: "예약 등록",
  RESERVATION_STATUS_UPDATED: "예약 상태 변경",
  TAG_CREATED: "태그 등록"
};

const entityLabels: Record<string, string> = {
  CONSULTATION: "상담",
  CUSTOMER: "고객",
  FOLLOW_UP: "후속관리",
  ORGANIZATION: "사업장",
  RESERVATION: "예약",
  TAG: "태그",
  USER: "사용자"
};

function getMetadataString(
  metadata: Prisma.JsonValue | null | undefined,
  key: string
) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = metadata[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

export function formatActivityAction(action: string) {
  return actionLabels[action] ?? action;
}

export function formatActivityEntity(entityType: string) {
  return entityLabels[entityType] ?? entityType;
}

export function getActivityHref({
  entityType,
  entityId,
  metadata
}: {
  entityType: string;
  entityId: bigint | string | null;
  metadata?: Prisma.JsonValue | null;
}) {
  const entityIdValue = entityId?.toString() ?? null;
  const customerId = getMetadataString(metadata, "customerId");

  if (entityType === "CUSTOMER" && entityIdValue) {
    return `/customers/${entityIdValue}`;
  }

  if (entityType === "CONSULTATION") {
    return customerId ? `/consultations?customerId=${customerId}` : "/consultations";
  }

  if (entityType === "RESERVATION") {
    return customerId ? `/reservations?customerId=${customerId}` : "/reservations";
  }

  if (entityType === "FOLLOW_UP") {
    return customerId ? `/follow-ups?customerId=${customerId}` : "/follow-ups";
  }

  if (entityType === "TAG") {
    return "/tags";
  }

  if (entityType === "ORGANIZATION") {
    return "/settings/business";
  }

  return null;
}
