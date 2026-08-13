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
