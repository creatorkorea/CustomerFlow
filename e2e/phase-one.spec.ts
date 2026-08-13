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
