import { expect, test } from "@playwright/test";

test("login page renders", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "CustomerFlow 로그인" })).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
});

test("register page renders", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "CustomerFlow 회원가입" })).toBeVisible();
  await expect(page.getByRole("button", { name: "가입하기" })).toBeVisible();
});

test("dashboard redirects anonymous users to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login/);
});

test("login form shows validation feedback", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("이메일").fill("not-an-email");
  await page.getByLabel("비밀번호").fill("");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.getByText("이메일과 비밀번호를 확인해주세요.")).toBeVisible();
});

test("register form shows validation feedback", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("사업장명").fill("");
  await page.getByLabel("이름").fill("");
  await page.getByLabel("이메일").fill("not-an-email");
  await page.getByLabel("비밀번호").fill("short");
  await page.getByRole("button", { name: "가입하기" }).click();

  await expect(page.getByText("회원가입 정보를 확인해주세요.")).toBeVisible();
});

test("seed owner can log in and see the dashboard shell", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "오늘 해야 할 일" })).toBeVisible();
});

test("authenticated owner can create a customer", async ({ page }) => {
  const customerName = `E2E 고객 ${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-9999-0000");
  await page.getByLabel("이메일").fill("e2e-customer@example.com");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/customers\/\d+/);
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
});

test("authenticated owner can update and soft delete a customer", async ({ page }) => {
  const customerName = `E2E 수정 ${Date.now()}`;
  const updatedName = `${customerName} 완료`;

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-8888-0000");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/\d+/);

  await page.getByLabel("고객명").fill(updatedName);
  await page.getByRole("button", { name: "변경 저장" }).click();
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("button", { name: "고객 삭제" }).click();
  await expect(page).toHaveURL(/\/customers$/);
  await expect(page.getByText(updatedName)).not.toBeVisible();
});

test("authenticated owner can create a consultation for a customer", async ({ page }) => {
  const customerName = `E2E 상담 ${Date.now()}`;
  const consultationContent = "설치 가능 시간 문의";

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-7777-0000");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/\d+/);

  await page.goto("/consultations/new");
  await page.locator('select[name="customerId"]').selectOption({
    label: `${customerName} / 010-7777-0000`
  });
  await page.getByLabel("상담 내용").fill(consultationContent);
  await page.getByLabel("상담 결과").fill("토요일 오후 가능 안내");
  await page.getByLabel("다음 액션").fill("예약 확정 연락");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/consultations\?customerId=\d+/);
  await expect(page.getByText(consultationContent)).toBeVisible();

  await page.goto(page.url().replace(/\/consultations\?customerId=(\d+)/, "/customers/$1"));
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(consultationContent).first()).toBeVisible();
});

test("authenticated owner can create a reservation for a customer", async ({ page }) => {
  const customerName = `E2E 예약 ${Date.now()}`;
  const reservationTitle = "방문 설치 예약";

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-6666-0000");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/\d+/);

  await page.goto("/reservations/new");
  await page.locator('select[name="customerId"]').selectOption({
    label: `${customerName} / 010-6666-0000`
  });
  await page.getByLabel("예약명").fill(reservationTitle);
  await page.getByLabel("시작").fill("2026-08-14T10:00");
  await page.getByLabel("종료").fill("2026-08-14T11:00");
  await page.getByLabel("장소").fill("서울 강남구");
  await page.getByLabel("메모").fill("엘리베이터 예약 필요");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/reservations\?customerId=\d+/);
  await expect(page.getByText(reservationTitle)).toBeVisible();

  await page.goto(page.url().replace(/\/reservations\?customerId=(\d+)/, "/customers/$1"));
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(reservationTitle).first()).toBeVisible();
});

test("authenticated owner can create a follow-up for a customer", async ({ page }) => {
  const customerName = `E2E 후속 ${Date.now()}`;
  const followUpTitle = "예약 전 확인 연락";

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-5555-0000");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/\d+/);

  await page.goto("/follow-ups/new");
  await page.locator('select[name="customerId"]').selectOption({
    label: `${customerName} / 010-5555-0000`
  });
  await page.getByLabel("할 일").fill(followUpTitle);
  await page.getByLabel("마감").fill("2026-08-15T10:00");
  await page.getByLabel("메모").fill("방문 가능 여부 재확인");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/follow-ups\?customerId=\d+/);
  await expect(page.getByText(followUpTitle)).toBeVisible();

  await page.goto(page.url().replace(/\/follow-ups\?customerId=(\d+)/, "/customers/$1"));
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(followUpTitle).first()).toBeVisible();
});

test("authenticated owner can create a tag and assign it to a customer", async ({ page }) => {
  const tagName = `E2E 태그 ${Date.now()}`;
  const customerName = `E2E 태그고객 ${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/tags/new");
  await page.getByLabel("태그명").fill(tagName);
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/tags$/);
  await expect(page.getByText(tagName)).toBeVisible();

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-4444-0000");
  await page.getByLabel(tagName).check();
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/customers\/\d+/);
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(tagName).first()).toBeVisible();
});
