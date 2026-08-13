# CustomerFlow MVP — REST API Specification v1.0

## 1. Base

Next.js App Router의 Route Handler로 구현한다.

```text
/api
```

Authentication:
- Auth.js Credentials + database session
- 모든 보호 API는 `auth()` 또는 동일한 서버 세션 helper로 사용자와 organization scope를 확인한다.
- request body/query/path의 `organizationId` 또는 `organization_id`는 신뢰하지 않는다.

Content-Type:

```text
application/json
```

Date/Time:
- API 입력은 ISO 8601 string
- DB 저장은 UTC
- 화면 표시는 organization timezone, MVP 기본값은 `Asia/Seoul`

Validation:
- 모든 request body와 query는 Zod schema를 통과해야 한다.
- validation 실패는 `400 VALIDATION_ERROR`를 반환한다.

---

# 2. Standard Response

## Success

```json
{
  "success": true,
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "고객을 찾을 수 없습니다."
  }
}
```

---

# 3. Error Codes

| HTTP | Code | 의미 |
|---|---|---|
| 400 | VALIDATION_ERROR | 입력 오류 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | DUPLICATE_RESOURCE | 중복 |
| 422 | BUSINESS_RULE_ERROR | 비즈니스 규칙 위반 |
| 429 | RATE_LIMITED | 요청 제한 |
| 500 | INTERNAL_ERROR | 서버 오류 |

Tenant isolation 실패는 기본적으로 `404 NOT_FOUND`를 사용한다. 다른 조직의 리소스 존재 여부를 노출하지 않는다.

---

# 4. TypeScript DTO / Zod 기준

```ts
type CreateCustomerInput = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: "new" | "consulting" | "reserved" | "completed" | "dormant" | "cancelled";
  memo?: string;
  tagIds?: string[];
};

type UpdateCustomerInput = Partial<CreateCustomerInput>;

type CreateConsultationInput = {
  customerId: string;
  userId?: string;
  channel: "phone" | "sms" | "kakao" | "danggeun" | "visit" | "other";
  type: "inquiry" | "quote" | "booking" | "complaint" | "returning" | "other";
  content: string;
  result?: string;
  nextAction?: string;
  followUpAt?: string;
  status: "new" | "consulting" | "quote" | "reserved" | "completed" | "on_hold" | "cancelled";
};

type CreateReservationInput = {
  customerId: string;
  userId?: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  memo?: string;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
};

type CreateFollowUpInput = {
  customerId: string;
  consultationId?: string;
  userId?: string;
  title: string;
  memo?: string;
  dueAt: string;
};
```

구현 시 ID는 URL/API에서는 string으로 받고, service 계층에서 BigInt 변환과 범위 검증을 수행한다.

---

# 5. Auth API

Auth.js가 `/api/auth/*` route를 담당한다.

## POST /api/auth/register

회원가입 + 조직 생성. 커스텀 Route Handler로 구현한다.

Request:

```json
{
  "organizationName": "홍길동 정비소",
  "businessNumber": "123-45-67890",
  "name": "홍길동",
  "email": "owner@example.com",
  "password": "strong-password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "홍길동",
      "email": "owner@example.com",
      "role": "owner"
    },
    "organization": {
      "id": "1",
      "name": "홍길동 정비소",
      "plan": "free"
    }
  }
}
```

서버 동작:
1. Zod validation
2. organization 생성
3. owner user 생성
4. free subscription 생성
5. activity log 생성
6. 로그인 session 생성 또는 로그인 페이지로 이동할 수 있는 성공 응답 반환

## POST /api/auth/callback/credentials

Auth.js Credentials provider가 처리한다.

## POST /api/auth/signout

Auth.js가 처리한다.

## GET /api/auth/session

Auth.js가 처리한다.

---

# 6. Dashboard API

## GET /api/dashboard

Query:

```text
?date=2026-08-13
```

Response:

```json
{
  "success": true,
  "data": {
    "stats": {
      "todayReservations": 5,
      "newCustomers": 8,
      "pendingFollowUps": 3,
      "overdueFollowUps": 1,
      "incompleteConsultations": 2
    },
    "todayReservations": [],
    "pendingFollowUps": [],
    "recentCustomers": [],
    "recentConsultations": []
  }
}
```

date 기준은 organization timezone으로 해석한다.

---

# 7. Customer API

## GET /api/customers

Query:

```text
?page=1
&limit=20
&search=김철수
&status=reserved
&tagId=3
&sort=createdAt
&order=desc
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 120,
      "totalPages": 6
    }
  }
}
```

## POST /api/customers

```json
{
  "name": "김철수",
  "phone": "010-1111-1111",
  "email": "customer@example.com",
  "address": "서울시",
  "status": "new",
  "memo": "신규 문의",
  "tagIds": ["1", "3"]
}
```

서버 동작:
1. session에서 organizationId 확인
2. Zod validation
3. tagIds가 있으면 모든 tag가 현재 organization 소유인지 검증
4. customer 생성
5. activity log 생성

## GET /api/customers/[id]

고객 기본정보 + 태그 + 상담 + 예약 + 후속관리 + 타임라인 반환.

## PUT /api/customers/[id]

Partial update 허용.

## DELETE /api/customers/[id]

Soft delete. `deletedAt`을 설정한다.

---

# 8. Consultation API

## GET /api/consultations

Query:

```text
?page=1
&limit=20
&customerId=1
&status=consulting
&channel=phone
&from=2026-08-01
&to=2026-08-31
```

## POST /api/consultations

```json
{
  "customerId": "1",
  "userId": "1",
  "channel": "phone",
  "type": "inquiry",
  "content": "에어컨 설치 가격 문의",
  "result": "토요일 방문 가능 안내",
  "nextAction": "견적 확인 후 연락",
  "followUpAt": "2026-08-14T10:00:00+09:00",
  "status": "consulting"
}
```

서버 동작:
1. customerId가 현재 organization에 속하는지 검증
2. userId가 있으면 현재 organization에 속하는지 검증
3. consultation 생성
4. followUpAt이 있으면 follow_up 생성
5. customer.lastContactedAt 갱신
6. activity log 생성

## GET /api/consultations/[id]

## PUT /api/consultations/[id]

## DELETE /api/consultations/[id]

Soft delete. `deletedAt`을 설정한다.

---

# 9. Reservation API

## GET /api/reservations

Query:

```text
?from=2026-08-01
&to=2026-08-31
&status=scheduled
&customerId=1
```

## POST /api/reservations

```json
{
  "customerId": "1",
  "userId": "1",
  "title": "에어컨 설치",
  "startAt": "2026-08-15T14:00:00+09:00",
  "endAt": "2026-08-15T16:00:00+09:00",
  "location": "고객 자택",
  "memo": "주차 필요",
  "status": "scheduled"
}
```

서버 동작:
- 고객 tenant 검증
- 담당자 tenant 검증
- startAt < endAt 검증
- activity log 생성
- 필요 시 customer.status를 `reserved`로 변경

## GET /api/reservations/[id]

## PUT /api/reservations/[id]

## DELETE /api/reservations/[id]

Soft delete 또는 status `cancelled` 중 하나로 처리한다. MVP 기본값은 status `cancelled` + activity log다.

---

# 10. Follow-up API

## GET /api/follow-ups

Query:

```text
?status=pending
&date=today
```

date 값:
- `today`
- `overdue`
- `upcoming`
- ISO date string

## POST /api/follow-ups

```json
{
  "customerId": "1",
  "consultationId": "5",
  "userId": "1",
  "title": "견적 확인 연락",
  "memo": "오전 중 연락",
  "dueAt": "2026-08-14T10:00:00+09:00"
}
```

## PUT /api/follow-ups/[id]

```json
{
  "status": "completed"
}
```

완료 시 `completedAt` 기록.

## DELETE /api/follow-ups/[id]

Soft delete. `deletedAt`을 설정한다.

---

# 11. Tag API

## GET /api/tags

## POST /api/tags

```json
{
  "name": "VIP",
  "color": "#7C3AED"
}
```

## PUT /api/tags/[id]

## DELETE /api/tags/[id]

삭제 전 연결된 customer_tags 처리 정책을 확인한다. MVP 기본값은 tag 삭제 시 연결도 cascade 삭제다.

---

# 12. Notification API

## GET /api/notifications

Query:

```text
?page=1&limit=20&unread=true
```

## PUT /api/notifications/[id]/read

## PUT /api/notifications/read-all

---

# 13. User API — P1

## GET /api/users

Owner/Admin only.

## POST /api/users/invite

```json
{
  "name": "김영희",
  "email": "staff@example.com",
  "role": "staff"
}
```

## PUT /api/users/[id]

## PUT /api/users/[id]/status

---

# 14. Organization API

## GET /api/organization

## PUT /api/organization

```json
{
  "name": "홍길동 정비소",
  "businessNumber": "123-45-67890",
  "phone": "02-1234-5678"
}
```

---

# 15. Subscription API — P2

## GET /api/subscription

## POST /api/subscription/checkout

MVP에서는 실제 PG 연결 전 mock checkout 가능.

## POST /api/subscription/cancel

---

# 16. Search API

## GET /api/search

Query:

```text
?q=김철수
```

검색 대상:
- 고객명
- 전화번호
- 이메일
- 상담내용

Response:

```json
{
  "success": true,
  "data": {
    "customers": [],
    "consultations": [],
    "reservations": []
  }
}
```

---

# 17. CSV API — P1

## POST /api/customers/import

Multipart file upload.

CSV columns:

```text
name,phone,email,address,status,memo
```

처리:
1. 파일 확장자 검증
2. 크기 제한
3. CSV 파싱
4. row validation
5. 성공/실패 row 목록 반환

## GET /api/customers/export

CSV 다운로드.

---

# 18. AI API — P2

## POST /api/ai/consultation-summary

```json
{
  "content": "고객 상담 원문..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "summary": "에어컨 설치 문의",
    "requirements": ["토요일 방문"],
    "nextAction": "견적 확인 후 연락"
  }
}
```

## POST /api/ai/reply-draft

```json
{
  "customerMessage": "토요일 방문 가능한가요?",
  "context": "토요일 오후 방문 가능"
}
```

---

# 19. API Security Rules

1. 모든 protected API는 인증 필수.
2. URL의 ID만으로 권한을 판단하지 않는다.
3. 모든 resource 조회에 organization scope 적용.
4. Owner/Admin/Staff 권한 검사.
5. 입력값은 Zod schema validation.
6. Prisma query 또는 parameterized SQL만 사용.
7. 비밀번호는 Argon2id 또는 bcrypt로 해시.
8. 비밀번호/API key/session token을 로그에 기록하지 않는다.
9. Rate limit 적용.
10. cookie 인증은 httpOnly, secure, SameSite 설정을 사용한다.
11. 삭제는 기본 soft delete. 예약 취소처럼 상태 전이가 명확한 경우 status 변경을 우선한다.
12. 모든 주요 변경은 activity_logs 기록.

---

# 20. API 구현 순서

P0:
1. auth/register/session
2. organization
3. customers
4. consultations
5. reservations
6. follow-ups
7. dashboard

P1:
8. tags
9. notifications
10. users
11. CSV

P2:
12. subscription
13. AI
14. external integrations
