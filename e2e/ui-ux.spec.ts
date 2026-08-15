import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const protectedViews = [
  { path: "/dashboard", heading: "오늘 해야 할 일", name: "dashboard" },
  { path: "/customers", heading: "고객 목록", name: "customers" },
  { path: "/consultations", heading: "상담", name: "consultations" },
  { path: "/consultations/new", heading: "상담 등록", name: "consultations-new" },
  { path: "/reservations", heading: "예약", name: "reservations" },
  { path: "/reservations/new", heading: "예약 등록", name: "reservations-new" },
  { path: "/follow-ups", heading: "후속관리", name: "follow-ups" },
  { path: "/follow-ups/new", heading: "후속관리 등록", name: "follow-ups-new" },
  { path: "/notifications", heading: "알림", name: "notifications" },
  { path: "/settings/business", heading: "사업장 설정", name: "settings-business" }
];

const mobileCardListViews = new Set([
  "customers",
  "consultations",
  "reservations",
  "follow-ups"
]);

const customerPickerViews = new Set([
  "consultations",
  "consultations-new",
  "reservations",
  "reservations-new",
  "follow-ups",
  "follow-ups-new"
]);

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill("owner@example.com");
  await page.getByLabel("비밀번호").fill("customerflow-demo-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function expectNoBodyOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );

  expect(hasOverflow).toBe(false);
}

test("primary app views pass desktop UI smoke checks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);

  for (const view of protectedViews) {
    await page.goto(view.path);
    await expect(
      page.getByRole("heading", { name: view.heading, exact: true })
    ).toBeVisible();
    if (view.name === "dashboard") {
      await expect(page.getByRole("heading", { name: "최근 상담" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "미확인 알림" }).nth(1)
      ).toBeVisible();
    }
    if (customerPickerViews.has(view.name)) {
      await expect(page.getByRole("textbox", { name: "고객 검색" })).toBeVisible();
    }
    await expectNoBodyOverflow(page);
    await page.screenshot({
      caret: "initial",
      fullPage: true,
      path: path.join(process.cwd(), ".next", "ui-checks", `${view.name}-desktop.png`)
    });
  }
});

test("primary app views pass mobile UI smoke checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);

  for (const view of protectedViews) {
    await page.goto(view.path);
    await expect(
      page.getByRole("heading", { name: view.heading, exact: true })
    ).toBeVisible();
    if (view.name === "dashboard") {
      await expect(page.getByRole("heading", { name: "최근 상담" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "미확인 알림" }).nth(1)
      ).toBeVisible();
    }
    if (customerPickerViews.has(view.name)) {
      await expect(page.getByRole("textbox", { name: "고객 검색" })).toBeVisible();
    }
    if (mobileCardListViews.has(view.name)) {
      await expect(page.locator(`[data-mobile-list="${view.name}"]`)).toBeVisible();
      await expect(
        page.locator(`[data-mobile-list="${view.name}"] [data-mobile-list-item]`).first()
      ).toBeVisible();
      await expect(page.locator(`[data-desktop-table="${view.name}"]`)).toBeHidden();
    }
    await expectNoBodyOverflow(page);
    await page.screenshot({
      caret: "initial",
      fullPage: true,
      path: path.join(process.cwd(), ".next", "ui-checks", `${view.name}-mobile.png`)
    });
  }
});
