# Codex 개발 프롬프트 — CustomerFlow MVP

아래 내용을 그대로 프로젝트 루트의 Codex/코딩 에이전트에게 전달한다.

---

## 역할

너는 시니어 풀스택 엔지니어이자 SaaS 아키텍트다.

목표는 **CustomerFlow**라는 멀티테넌트 고객관리 SaaS의 MVP를 실제 실행 가능한 코드로 구현하는 것이다.

단순 샘플 코드가 아니라 유지보수 가능한 구조, 보안, 데이터 격리, validation, error handling, 테스트를 포함한 production-oriented MVP를 작성한다.

---

# 1. 제품 목표

CustomerFlow는 소상공인/1인 사업자가 다음 업무를 한곳에서 관리하도록 한다.

```text
고객 문의
-> 고객 등록
-> 상담
-> 예약
-> 방문/처리
-> 후속 연락
-> 재방문 관리
```

핵심 화면:
- 로그인
- 대시보드
- 고객
- 고객 상세
- 상담
- 예약/캘린더
- 후속관리
- 알림
- 설정

---

# 2. 기술 스택

기존 프로젝트가 이미 존재한다면 기존 기술을 우선 존중한다. 신규 프로젝트라면 다음 스택을 기본값으로 사용한다.

Runtime:
- Node.js 24 LTS
- pnpm 또는 npm. Windows PowerShell에서는 `npm.cmd`, `npx.cmd` 사용 가능

Framework:
- Next.js App Router
- TypeScript
- React Server Components를 기본으로 사용하고, 상호작용이 필요한 컴포넌트만 Client Component로 만든다.

UI:
- Tailwind CSS
- shadcn/ui
- lucide-react
- 카드 남발을 피하고 업무형 admin SaaS UI로 구성한다.

Database:
- PostgreSQL 18 계열 권장
- Prisma ORM + Prisma Migrate

Authentication:
- Auth.js Credentials provider
- database session
- 비밀번호는 Argon2id 또는 bcrypt

Validation:
- Zod
- API request body/query와 server action 입력 모두 Zod로 검증한다.

Testing:
- Vitest
- React Testing Library
- Playwright

Architecture:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (app)/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   └── domain/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── env.ts
│   ├── errors.ts
│   └── utils.ts
├── server/
│   ├── customers/
│   ├── consultations/
│   ├── reservations/
│   ├── follow-ups/
│   ├── dashboard/
│   └── shared/
└── styles/

prisma/
├── schema.prisma
└── seed.ts

tests/
├── unit/
├── integration/
└── tenant/

e2e/
└── customer-flow.spec.ts
```

---

# 3. 절대 하지 말 것

1. 한 파일에 모든 로직을 작성하지 않는다.
2. SQL을 문자열로 직접 이어붙이지 않는다.
3. client가 보낸 `organizationId` 또는 `organization_id`를 신뢰하지 않는다.
4. 비밀번호를 평문으로 저장하지 않는다.
5. API key를 frontend에 노출하지 않는다.
6. 모든 기능을 한 번에 만들려고 하지 않는다.
7. AI 기능부터 개발하지 않는다.
8. 필요 이상의 npm package를 설치하지 않는다.
9. 기존 프로젝트 설정을 이유 없이 갈아엎지 않는다.
10. 테스트 없이 대규모 리팩터링하지 않는다.
11. 상호작용이 없는 화면까지 무조건 Client Component로 만들지 않는다.
12. tenant isolation 실패 시 다른 조직 데이터의 존재 여부를 노출하지 않는다.

---

# 4. Multi-Tenant 보안

가장 중요한 요구사항이다.

모든 사용자에게 `organizationId`가 있다.

모든 주요 테이블:
- customers
- consultations
- reservations
- follow_ups
- tags
- notifications
- subscriptions
- activity_logs

에는 organization scope가 존재한다.

예:

```ts
await prisma.customer.findFirst({
  where: {
    id: customerId,
    organizationId: session.user.organizationId,
    deletedAt: null,
  },
});
```

`organizationId`는 인증 세션에서 가져온 값을 사용한다.

클라이언트 request body의 `organizationId`는 무시한다.

다른 organization의 customer ID를 알아도 조회/수정/삭제할 수 없어야 한다.

tenant isolation 실패는 기본적으로 `404 NOT_FOUND`로 응답한다.

---

# 5. 구현 순서

## Phase 1 — 기반

먼저:
1. Next.js App Router + TypeScript 프로젝트 초기화
2. Tailwind CSS + shadcn/ui 초기 설정
3. 환경변수 검증 `src/lib/env.ts`
4. Prisma schema 작성
5. Prisma migration/seed 준비
6. Prisma client singleton `src/lib/db.ts`
7. Auth.js Credentials skeleton
8. 공통 error/response helper
9. 앱 레이아웃 shell
10. 기본 로그인/회원가입 화면

완료 후 서버가 정상 실행되는지 확인한다.

## Phase 2 — 인증

구현:
- 회원가입
- 로그인
- 로그아웃
- 현재 사용자/session
- 로그인 보호

회원가입 시:
1. organization 생성
2. owner user 생성
3. free subscription 생성
4. activity log 생성
5. session 생성 또는 로그인 가능한 상태 반환

트랜잭션을 사용한다.

## Phase 3 — 고객

구현:
- 목록
- 검색
- 필터
- 등록
- 수정
- 삭제
- 상세
- 태그 연결

## Phase 4 — 상담

구현:
- 상담 목록
- 등록
- 상세
- 수정
- 삭제
- 후속관리 생성
- 고객 lastContactedAt 갱신

## Phase 5 — 예약

구현:
- 캘린더
- 등록
- 수정
- 취소
- 완료
- 노쇼

## Phase 6 — 후속관리

구현:
- 오늘
- 지연
- 예정
- 완료

## Phase 7 — 대시보드

다음 데이터를 보여준다.

- 오늘 예약
- 신규 고객
- 후속 연락
- 지연 후속 연락
- 미완료 상담
- 최근 고객
- 최근 상담

## Phase 8 — 알림

내부 알림만 구현한다.

## Phase 9 — P1

- 사용자 초대
- 권한
- CSV import/export
- 태그 관리 고도화

AI/PG/외부 연동은 P2로 미룬다.

---

# 6. UI 요구사항

shadcn/ui 기반으로 깔끔하고 현대적인 업무형 SaaS UI를 만든다.

레이아웃:

```text
Sidebar 240px
Header: Search / Notification / Profile
Main: Page title / Actions / Content
```

고객 상세 페이지는 가장 중요한 화면이다.

반드시 다음을 한 화면에서 볼 수 있게 한다.

- 기본정보
- 태그
- 상담이력
- 예약
- 후속관리
- 활동 타임라인

UI 원칙:
- lucide-react 아이콘 사용
- 주요 action은 명확한 버튼으로 제공
- 상태는 Badge로 표시
- 삭제는 AlertDialog로 확인
- Form 오류는 필드 가까이에 표시
- 저장 성공/실패는 toast로 표시
- 데이터 로딩에는 skeleton 사용
- 모바일에서는 sidebar를 drawer로 전환

---

# 7. UX 규칙

- 저장 버튼 클릭 시 중복 submit 방지
- API 호출 중 loading 표시
- 성공 시 toast
- 실패 시 사용자 친화적 error
- 삭제 시 confirmation modal
- 빈 목록은 안내 문구 + CTA
- 검색 결과 없음 상태 제공
- form validation 표시
- 모바일에서도 사용 가능
- AI 관련 UI는 P2 전까지 숨김 또는 disabled 처리

---

# 8. API 규칙

Base:

```text
/api
```

응답:

```json
{
  "success": true,
  "data": {}
}
```

오류:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인해주세요."
  }
}
```

모든 Route Handler는 직접 Prisma query를 남발하지 말고 server service/repository 계층을 사용한다.

모든 protected Route Handler는 session에서 `organizationId`를 가져와야 한다.

---

# 9. DB 구현

`prisma/schema.prisma`에 ERD 문서의 모델을 구현한다.

필수 모델:

- Organization
- User
- Customer
- Tag
- CustomerTag
- Consultation
- Reservation
- FollowUp
- Notification
- Subscription
- ActivityLog

모든 foreign key와 index를 만든다.

Prisma migration을 source of truth로 사용한다.

---

# 10. Validation

다음 필드는 반드시 validation한다.

Customer:
- name required
- phone optional but valid format
- email optional but valid
- tagIds는 현재 organization에 속하는 tag만 허용

Consultation:
- customerId required
- channel enum
- type enum
- status enum
- content required
- followUpAt optional ISO datetime

Reservation:
- customerId required
- title required
- startAt required ISO datetime
- endAt required ISO datetime
- startAt < endAt

Follow-up:
- customerId required
- title required
- dueAt required ISO datetime

---

# 11. Business Rules

## 고객

고객 생성:
- organizationId는 session에서 설정

고객 삭제:
- hard delete하지 않는다.
- deletedAt 설정

## 상담

상담 생성 시:
- customer가 같은 organization인지 검사
- userId가 있으면 같은 organization인지 검사
- lastContactedAt 갱신
- activity log 생성

followUpAt이 입력되면:
- follow_up record 생성

## 예약

예약 생성 시:
- customer tenant 확인
- 담당자 tenant 확인
- 시작시간 < 종료시간 확인
- 필요 시 customer.status를 reserved로 변경

예약 취소:
- status = cancelled
- activity log 생성

## 후속관리

완료:

```text
status = completed
completedAt = current time
```

---

# 12. Dashboard

`GET /api/dashboard` 또는 Server Component data loading을 사용한다.

반환 데이터:

```text
todayReservations
newCustomers
pendingFollowUps
overdueFollowUps
incompleteConsultations
recentCustomers
recentConsultations
```

날짜 기준은 organization timezone을 사용한다.

---

# 13. Activity Log

다음 이벤트는 기록한다.

- CUSTOMER_CREATED
- CUSTOMER_UPDATED
- CUSTOMER_DELETED
- CONSULTATION_CREATED
- CONSULTATION_UPDATED
- RESERVATION_CREATED
- RESERVATION_UPDATED
- RESERVATION_CANCELLED
- FOLLOW_UP_CREATED
- FOLLOW_UP_COMPLETED
- USER_INVITED
- LOGIN

metadata에는 민감정보/비밀번호/API key/session token을 넣지 않는다.

---

# 14. 테스트

최소한 다음 테스트를 작성한다.

## Auth

- 회원가입 성공
- 중복 email 실패
- 로그인 성공
- 잘못된 비밀번호 실패
- 로그아웃

## Customer

- 생성
- 조회
- 수정
- 삭제
- 검색
- 태그 연결

## Tenant isolation — 매우 중요

다음 테스트를 반드시 작성한다.

```text
Organization A user
↓
Organization B customer ID 요청
↓
404 반환
```

절대로 B의 고객 데이터가 반환되면 안 된다.

## Reservation

- 정상 생성
- 잘못된 시간
- 다른 tenant 고객 접근 실패

## Follow-up

- 생성
- 완료
- 지연 조회

## E2E

Playwright로 최소 happy path를 검증한다.

```text
회원가입 -> 고객 등록 -> 상담 등록 -> 예약 등록 -> 후속관리 완료
```

---

# 15. 완료 조건

다음 조건을 모두 만족해야 MVP 1차 완료로 판단한다.

### 인증
- [ ] 회원가입
- [ ] 로그인
- [ ] 로그아웃
- [ ] 인증 보호

### 고객
- [ ] CRUD
- [ ] 검색
- [ ] 필터
- [ ] 상세
- [ ] 태그

### 상담
- [ ] CRUD
- [ ] 고객 연결
- [ ] 후속관리 연결

### 예약
- [ ] CRUD
- [ ] 캘린더
- [ ] 상태 변경

### 후속관리
- [ ] 목록
- [ ] 오늘
- [ ] 지연
- [ ] 완료

### 대시보드
- [ ] 통계
- [ ] 오늘 일정
- [ ] 후속관리
- [ ] 최근 고객

### 보안
- [ ] tenant isolation
- [ ] Prisma/parameterized query 사용
- [ ] password hashing
- [ ] Zod validation
- [ ] auth middleware/helper
- [ ] 민감정보 로그 금지

### 품질
- [ ] npm test 통과
- [ ] npm run lint 통과
- [ ] Prisma migration 성공
- [ ] seed 실행 성공
- [ ] production build 성공
- [ ] Playwright happy path 통과

---

# 16. 개발 방식

한 번에 모든 파일을 생성하지 말고 단계별로 작업한다.

각 Phase가 끝날 때:

1. 변경 파일 목록 출력
2. 구현한 기능 요약
3. 실행 방법
4. 테스트 결과
5. 남은 문제
6. 다음 Phase 제안

을 출력한다.

기존 코드가 있는 경우:
- 먼저 프로젝트 구조를 분석한다.
- package.json을 확인한다.
- 기존 DB 설정을 확인한다.
- 기존 인증 구조를 확인한다.
- 기존 UI 컴포넌트를 재사용한다.

코드를 작성하기 전에 현재 프로젝트를 분석하고 충돌 가능성을 먼저 확인한다.

---

# 17. 중요: 첫 실행 단계

지금부터 다음 순서로 진행한다.

### STEP 1
프로젝트 구조 분석.

### STEP 2
package.json 분석.

### STEP 3
현재 DB 연결 구조 분석.

### STEP 4
기존 인증 구조 분석.

### STEP 5
위 구조와 기존 프로젝트의 차이를 정리.

### STEP 6
필요한 최소 변경사항을 결정.

### STEP 7
Phase 1 구현.

절대로 분석 전에 대규모 파일을 생성하지 않는다.

현재 폴더처럼 구현 코드가 없는 신규 문서 패키지라면, 신규 Next.js App Router 프로젝트로 Phase 1을 시작한다.

---

# 18. 개발자의 판단 기준

기능을 추가할 때 항상 다음 질문을 한다.

> "이 기능이 MVP 첫 유료 고객에게 반드시 필요한가?"

아니면 P2로 미룬다.

목표는 완벽한 CRM이 아니라:

> **사업자가 실제로 매일 사용하는 간단한 고객관리 SaaS**

다.

---

# 19. 최종 명령

위 요구사항을 기준으로 현재 프로젝트를 먼저 분석한 뒤, 기존 구조를 최대한 보존하면서 CustomerFlow MVP를 단계적으로 구현하라.

첫 응답에서는 코드를 무작정 작성하지 말고 다음만 보고하라.

1. 현재 프로젝트 구조
2. 사용 중인 기술 스택
3. package.json 주요 dependency
4. DB 연결 방식
5. 인증 방식
6. 재사용 가능한 기존 코드
7. 충돌 가능성이 있는 부분
8. CustomerFlow 구현 계획
9. Phase 1에서 수정/생성할 파일 목록

그 후 위험하지 않은 범위에서 Phase 1부터 구현을 진행할 수 있다.
