// E2E 测试 - 注册功能
const { test, expect } = require('@playwright/test');

test.describe('用户注册功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('成功注册', async ({ page }) => {
    // 输入有效的注册信息
    await page.fill('input[name="username"]', '测试用户');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', '123456');
    
    // 点击注册按钮
    await page.click('button[type="submit"]');
    
    // 验证跳转到仪表盘
    await expect(page).toHaveURL('/dashboard');
    
    // 验证显示欢迎消息
    await expect(page.locator('text=欢迎回来')).toBeVisible();
  });

  test('用户名验证', async ({ page }) => {
    // 用户名为空
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', '123456');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名不能为空')).toBeVisible();
    
    // 用户名过短
    await page.fill('input[name="username"]', 'a');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名长度必须在2-20个字符之间')).toBeVisible();
    
    // 用户名过长
    await page.fill('input[name="username"]', 'a'.repeat(21));
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名长度必须在2-20个字符之间')).toBeVisible();
  });

  test('邮箱验证', async ({ page }) => {
    await page.fill('input[name="username"]', '测试用户');
    await page.fill('input[name="password"]', '123456');
    
    // 无效邮箱格式
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=请输入有效的邮箱地址')).toBeVisible();
    
    // 邮箱为空
    await page.fill('input[name="email"]', '');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=邮箱不能为空')).toBeVisible();
  });

  test('密码验证', async ({ page }) => {
    await page.fill('input[name="username"]', '测试用户');
    await page.fill('input[name="email"]', 'testuser@example.com');
    
    // 密码为空
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=密码不能为空')).toBeVisible();
    
    // 密码过短
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=密码长度至少6位')).toBeVisible();
  });
});