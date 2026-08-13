import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const protectedViews = [
  { path: "/dashboard", heading: "오늘 해야 할 일", name: "dashboard" },
  { path: "/customers", heading: "고객", name: "customers" },
  { path: "/consultations", heading: "상담", name: "consultations" },
  { path: "/reservations", heading: "예약", name: "reservations" },
  { path: "/follow-ups", heading: "후속관리", name: "follow-ups" },
  { path: "/notifications", heading: "알림", name: "notifications" },
  { path: "/settings/business", heading: "사업장 설정", name: "settings-business" }
];

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
    await expect(page.getByRole("heading", { name: view.heading })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: view.heading })).toBeVisible();
    await expectNoBodyOverflow(page);
    await page.screenshot({
      caret: "initial",
      fullPage: true,
      path: path.join(process.cwd(), ".next", "ui-checks", `${view.name}-mobile.png`)
    });
  }
});
