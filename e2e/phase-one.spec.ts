import { expect, test, type Page } from "@playwright/test";

import { prisma } from "../src/lib/db";

const e2eRunPrefix = `E2E ${Date.now()}`;

function e2eName(label: string) {
  return `${e2eRunPrefix} ${label} ${Date.now()}`;
}

async function chooseCustomer(page: Page, query: string, customerName: string) {
  const selectedCustomerId = await page.locator('input[name="customerId"]').inputValue();

  if (selectedCustomerId) {
    await expect(page.getByRole("textbox", { name: "고객 검색" })).toHaveValue(
      new RegExp(customerName)
    );
    return;
  }

  await page.getByRole("textbox", { name: "고객 검색" }).fill(query);
  await page.getByRole("option", { name: new RegExp(customerName) }).click();
}

test.afterAll(async () => {
  const e2eCustomers = await prisma.customer.findMany({
    where: {
      name: {
        startsWith: e2eRunPrefix
      }
    },
    select: {
      id: true,
      organizationId: true
    }
  });
  const e2eCustomerIds = e2eCustomers.map((customer) => customer.id);
  const e2eOrganizationIds = [
    ...new Set(e2eCustomers.map((customer) => customer.organizationId))
  ];

  if (e2eCustomerIds.length > 0) {
    await prisma.customerTag.deleteMany({
      where: {
        customerId: {
          in: e2eCustomerIds
        }
      }
    });
    await prisma.followUp.deleteMany({
      where: {
        customerId: {
          in: e2eCustomerIds
        }
      }
    });
    await prisma.reservation.deleteMany({
      where: {
        customerId: {
          in: e2eCustomerIds
        }
      }
    });
    await prisma.consultation.deleteMany({
      where: {
        customerId: {
          in: e2eCustomerIds
        }
      }
    });
    await prisma.customer.deleteMany({
      where: {
        id: {
          in: e2eCustomerIds
        }
      }
    });
  }

  await prisma.tag.deleteMany({
    where: {
      name: {
        startsWith: e2eRunPrefix
      }
    }
  });
  await prisma.notification.deleteMany({
    where: {
      OR: [
        {
          title: {
            startsWith: e2eRunPrefix
          }
        },
        {
          message: {
            startsWith: e2eRunPrefix
          }
        }
      ]
    }
  });

  if (e2eOrganizationIds.length > 0) {
    await prisma.organization.updateMany({
      where: {
        id: {
          in: e2eOrganizationIds
        }
      },
      data: {
        name: "CustomerFlow Demo",
        phone: "02-0000-0000",
        email: "owner@example.com"
      }
    });
  }

  await prisma.$disconnect();
});

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
  const customerName = e2eName("고객");

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

  await expect(page).toHaveURL(/\/customers\/\d+/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByRole("link", { name: "상담 등록" })).toBeVisible();
  await expect(page.getByRole("link", { name: "예약 등록" })).toBeVisible();
  await expect(page.getByRole("link", { name: "후속관리 등록" })).toBeVisible();

  await page
    .getByRole("searchbox", { name: "고객 또는 전화번호 검색" })
    .fill(customerName);
  await page
    .getByRole("searchbox", { name: "고객 또는 전화번호 검색" })
    .press("Enter");
  await expect(page).toHaveURL(/\/customers\?search=/);
  await expect(page.locator('[data-desktop-table="customers"]')).toContainText(
    customerName
  );
});

test("authenticated owner can update and soft delete a customer", async ({ page }) => {
  const customerName = e2eName("수정");
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
  test.setTimeout(60_000);

  const customerName = e2eName("상담");
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
  await expect(page).toHaveURL(/\/customers\/\d+/, { timeout: 15000 });

  await page.getByRole("link", { name: "상담 등록" }).click();
  await expect(page).toHaveURL(/\/consultations\/new\?customerId=\d+/);
  await chooseCustomer(page, customerName, customerName);
  await page.getByLabel("상담 내용").fill(consultationContent);
  await page.getByLabel("상담 결과").fill("토요일 오후 가능 안내");
  await page.getByLabel("다음 액션").fill("예약 확정 연락");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/consultations\?customerId=\d+/);
  const customerId = new URL(page.url()).searchParams.get("customerId");
  if (!customerId) {
    throw new Error("Expected created consultation customerId in URL");
  }
  expect(customerId).toMatch(/^\d+$/);
  await expect(page.getByRole("textbox", { name: "고객 검색" })).toHaveValue(
    new RegExp(customerName)
  );
  const consultationsTable = page.locator('[data-desktop-table="consultations"]');
  await expect(consultationsTable.getByText(consultationContent)).toBeVisible();
  await page.keyboard.press("Escape");
  const consultationDetailHref = await consultationsTable
    .getByRole("link", { name: "상세 보기" })
    .first()
    .getAttribute("href");
  expect(consultationDetailHref).toMatch(/^\/consultations\/\d+$/);
  await page.goto(consultationDetailHref ?? "/consultations", {
    waitUntil: "domcontentloaded"
  });
  await expect(page).toHaveURL(/\/consultations\/\d+/);
  await expect(page.getByRole("heading", { name: "상담 상세" })).toBeVisible();
  await expect(page.getByText(consultationContent).first()).toBeVisible();
  await page.getByLabel("상태").selectOption("completed");
  await page.getByLabel("상담 결과").fill("예약 확정 완료");
  await page.getByLabel("다음 액션").fill("");
  await page.getByRole("button", { name: "변경 저장" }).click();
  await expect(page.getByText("예약 확정 완료").first()).toBeVisible();
  await expect(page.getByText("완료").first()).toBeVisible();

  await page.goto(`/consultations?customerId=${customerId}`);
  await expect(
    page.getByRole("heading", { name: "상담", exact: true })
  ).toBeVisible();
  const refreshedConsultationsTable = page.locator(
    '[data-desktop-table="consultations"]'
  );
  await expect(
    refreshedConsultationsTable.getByRole("link", { name: "상세 보기" }).first()
  ).toBeVisible();
  await expect(
    refreshedConsultationsTable.getByRole("link", { name: "예약 생성" }).first()
  ).toBeVisible();
  await expect(
    refreshedConsultationsTable.getByRole("link", { name: "후속관리 생성" }).first()
  ).toBeVisible();

  await page.goto(`/customers/${customerId}`);
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(consultationContent).first()).toBeVisible();
  await page.locator('a[href$="?timelineType=consultation"]').click();
  await expect(page).toHaveURL(/timelineType=consultation/);
  await expect(page.getByText(consultationContent).first()).toBeVisible();
});

test("authenticated owner can create a reservation for a customer", async ({ page }) => {
  test.setTimeout(60_000);

  const customerName = e2eName("예약");
  const reservationTitle = e2eName("방문 설치 예약");
  const updatedReservationTitle = `${reservationTitle} 변경`;

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-6666-0000");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/\d+/, { timeout: 15000 });

  await page.getByRole("link", { name: "예약 등록" }).click();
  await expect(page).toHaveURL(/\/reservations\/new\?customerId=\d+/);
  await chooseCustomer(page, customerName, customerName);
  await page.getByLabel("예약명").fill(reservationTitle);
  await page.getByLabel("시작").fill("2026-08-14T10:00");
  await page.getByLabel("종료").fill("2026-08-14T11:00");
  await page.getByLabel("장소").fill("서울 강남구");
  await page.getByLabel("메모").fill("엘리베이터 예약 필요");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/reservations\?customerId=\d+/);
  const customerId = new URL(page.url()).searchParams.get("customerId");
  if (!customerId) {
    throw new Error("Expected created reservation customerId in URL");
  }
  await expect(page.getByRole("textbox", { name: "고객 검색" })).toHaveValue(
    new RegExp(customerName)
  );
  const reservationsTable = page.locator('[data-desktop-table="reservations"]');
  await expect(reservationsTable.getByText(reservationTitle)).toBeVisible();
  const reservationDetailHref = await reservationsTable
    .getByRole("link", { name: "상세 보기" })
    .first()
    .getAttribute("href");
  expect(reservationDetailHref).toMatch(/^\/reservations\/\d+$/);
  await page.goto(reservationDetailHref ?? "/reservations", {
    waitUntil: "domcontentloaded"
  });
  await expect(page).toHaveURL(/\/reservations\/\d+/);
  await expect(page.getByRole("heading", { name: "예약 상세" })).toBeVisible();
  await expect(page.getByText(reservationTitle).first()).toBeVisible();
  await page.getByLabel("예약명").fill(updatedReservationTitle);
  await page.getByLabel("시작").fill("2026-08-14T11:00");
  await page.getByLabel("종료").fill("2026-08-14T12:00");
  await page.getByLabel("상태").selectOption("in_progress");
  await page.getByLabel("장소").fill("서울 서초구");
  await page.getByLabel("메모").fill("");
  await page.getByRole("button", { name: "변경 저장" }).click();
  await expect(page.getByText(updatedReservationTitle).first()).toBeVisible();
  await expect(page.getByText("진행중").first()).toBeVisible();

  await page.goto(`/reservations?customerId=${customerId}`);
  await expect(
    page.getByRole("heading", { name: "예약", exact: true })
  ).toBeVisible();
  const refreshedReservationsTable = page.locator(
    '[data-desktop-table="reservations"]'
  );
  await expect(page.getByRole("link", { name: "상세 보기" }).first()).toBeVisible();
  await refreshedReservationsTable
    .getByRole("button", { name: "완료 처리" })
    .first()
    .click();
  await expect(
    page.getByRole("row", { name: new RegExp(`${updatedReservationTitle}.*완료`) })
  ).toBeVisible();

  await page.goto(`/customers/${customerId}`);
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(updatedReservationTitle).first()).toBeVisible();
});

test("authenticated owner can create a follow-up for a customer", async ({ page }) => {
  test.setTimeout(60_000);

  const customerName = e2eName("후속");
  const followUpTitle = e2eName("예약 전 확인 연락");
  const updatedFollowUpTitle = `${followUpTitle} 변경`;

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/customers/new");
  await page.getByLabel("고객명").fill(customerName);
  await page.getByLabel("전화번호", { exact: true }).fill("010-5555-0000");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/\d+/, { timeout: 15000 });

  await page.getByRole("link", { name: "후속관리 등록" }).click();
  await expect(page).toHaveURL(/\/follow-ups\/new\?customerId=\d+/);
  await chooseCustomer(page, customerName, customerName);
  await page.getByLabel("할 일").fill(followUpTitle);
  await page.getByLabel("마감").fill("2026-08-15T10:00");
  await page.getByLabel("메모").fill("방문 가능 여부 재확인");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/follow-ups\?customerId=\d+/);
  const customerId = new URL(page.url()).searchParams.get("customerId");
  if (!customerId) {
    throw new Error("Expected created follow-up customerId in URL");
  }
  await expect(page.getByRole("textbox", { name: "고객 검색" })).toHaveValue(
    new RegExp(customerName)
  );
  const followUpsTable = page.locator('[data-desktop-table="follow-ups"]');
  await expect(followUpsTable.getByText(followUpTitle)).toBeVisible();
  const followUpDetailHref = await followUpsTable
    .getByRole("link", { name: "상세 보기" })
    .first()
    .getAttribute("href");
  expect(followUpDetailHref).toMatch(/^\/follow-ups\/\d+$/);
  await page.goto(followUpDetailHref ?? "/follow-ups", {
    waitUntil: "domcontentloaded"
  });
  await expect(page).toHaveURL(/\/follow-ups\/\d+/);
  await expect(page.getByRole("heading", { name: "후속관리 상세" })).toBeVisible();
  await expect(page.getByText(followUpTitle).first()).toBeVisible();
  await page.getByLabel("할 일").fill(updatedFollowUpTitle);
  await page.getByLabel("마감").fill("2026-08-16T10:00");
  await page.getByLabel("상태").selectOption("completed");
  await page.getByLabel("메모").fill("");
  await page.getByRole("button", { name: "변경 저장" }).click();
  await expect(page.getByText(updatedFollowUpTitle).first()).toBeVisible();
  await expect(page.getByText("완료").first()).toBeVisible();

  await page.goto(`/follow-ups?customerId=${customerId}`);
  await expect(
    page.getByRole("heading", { name: "후속관리", exact: true })
  ).toBeVisible();
  const refreshedFollowUpsTable = page.locator('[data-desktop-table="follow-ups"]');
  await expect(
    refreshedFollowUpsTable.getByRole("link", { name: "상세 보기" }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: new RegExp(`${updatedFollowUpTitle}.*완료`) })
  ).toBeVisible();

  await page.goto(`/customers/${customerId}`);
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
  await expect(page.getByText(updatedFollowUpTitle).first()).toBeVisible();

  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "알림" })).toBeVisible();
  await expect(page.getByText(followUpTitle).first()).toBeVisible();
  await page.getByRole("link", { name: "관련 화면 열기" }).first().click();
  await expect(page).toHaveURL(/\/follow-ups\/\d+/);
  await expect(page.getByRole("heading", { name: "후속관리 상세" })).toBeVisible();
  await expect(page.getByText(updatedFollowUpTitle).first()).toBeVisible();
});

test("authenticated owner can create a tag and assign it to a customer", async ({ page }) => {
  const tagName = e2eName("태그");
  const customerName = e2eName("태그고객");

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

test("authenticated owner can update business settings", async ({ page }) => {
  const organizationName = `${e2eRunPrefix} 사업장`;

  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/settings/business");
  await expect(page.getByRole("heading", { name: "사업장 설정" })).toBeVisible();

  await page.getByLabel("사업장명").fill(organizationName);
  await page.getByLabel("대표 이메일").fill("owner@example.com");
  await page.getByLabel("대표 전화").fill("02-1234-5678");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page.getByText("사업장 설정을 저장했습니다.")).toBeVisible();
  await expect(page.getByLabel("사업장명")).toHaveValue(organizationName);
});
