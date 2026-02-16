// E2E 测试 - 登录功能
const { test, expect } = require('@playwright/test');

test.describe('用户登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('成功登录', async ({ page }) => {
    // 输入有效的账号和密码
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123456');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 验证跳转到仪表盘
    await expect(page).toHaveURL('/dashboard');
    
    // 验证显示用户信息
    await expect(page.locator('text=欢迎回来')).toBeVisible();
  });

  test('无效密码登录失败', async ({ page }) => {
    // 输入有效的邮箱和无效密码
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 验证显示错误消息
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('text=账号或密码错误')).toBeVisible();
  });

  test('空表单提交验证', async ({ page }) => {
    // 不输入任何内容，直接提交
    await page.click('button[type="submit"]');
    
    // 验证显示表单验证错误
    await expect(page.locator('text=邮箱不能为空')).toBeVisible();
    await expect(page.locator('text=密码不能为空')).toBeVisible();
  });

  test('邮箱格式验证', async ({ page }) => {
    // 输入无效邮箱格式
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123456');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 验证显示邮箱格式错误
    await expect(page.locator('text=请输入有效的邮箱地址')).toBeVisible();
  });
});