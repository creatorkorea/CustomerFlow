# CustomerFlow 개발 문서 패키지

이 폴더는 CustomerFlow MVP를 최신 SaaS 스택으로 구현하기 위한 제품/DB/API/UI/개발 지시 문서 모음이다.

## 기준 기술 스택

- Runtime: Node.js 24 LTS
- Framework: Next.js App Router + TypeScript
- UI: Tailwind CSS + shadcn/ui + lucide-react
- Database: PostgreSQL 18 계열 권장
- ORM/Migration: Prisma ORM
- Auth: Auth.js Credentials + database session
- Validation: Zod
- Test: Vitest, React Testing Library, Playwright

## 파일

- `01_DB_ERD.md`
  - Mermaid ERD
  - PostgreSQL/Prisma 기준 데이터 모델
  - Prisma schema 초안
  - PostgreSQL DDL 참고안
  - 멀티테넌트 보안 규칙

- `02_WIREFRAME.md`
  - 전체 IA
  - shadcn/ui 기반 공통 레이아웃
  - 로그인/회원가입
  - 대시보드
  - 고객/고객 상세
  - 상담/예약/후속관리
  - 알림/설정
  - 반응형 UX

- `03_API_SPEC.md`
  - Next.js Route Handler 기준 REST API
  - Request/Response
  - Error code
  - Auth.js session 인증
  - 고객/상담/예약/후속관리 API
  - Zod validation
  - 보안 규칙

- `04_CODEX_PROMPT.md`
  - Codex/코딩 에이전트에 전달할 개발 지시문
  - 구현 순서
  - Next.js 프로젝트 구조
  - Prisma/Auth.js/Zod 보안 규칙
  - 테스트
  - 완료 조건

## 권장 개발 순서

1. 프로젝트 초기화 및 환경변수 검증
2. Prisma schema/migration/seed
3. Auth.js Credentials + session
4. 공통 앱 레이아웃
5. Customer
6. Consultation
7. Reservation
8. Follow-up
9. Dashboard
10. Notification
11. P1 기능
12. AI/결제/외부연동

## 중요한 제품 원칙

MVP의 목표는 기능 수가 아니라 첫 유료 고객이 실제로 매일 사용하는 것이다.

`고객 -> 상담 -> 예약 -> 후속관리` 흐름을 가장 먼저 완성한다.

AI, 결제, 외부 연동은 제품 흐름이 검증된 뒤 P2로 진행한다.
