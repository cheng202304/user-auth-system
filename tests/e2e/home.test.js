// E2E 测试 - 首页功能
const { test, expect } = require('@playwright/test');

test.describe('首页功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('未登录状态首页显示', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('text=欢迎使用用户认证系统')).toBeVisible();
    
    // 验证导航栏
    await expect(page.locator('text=用户认证系统')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();
    await expect(page.locator('button:has-text("注册")')).toBeVisible();
    
    // 验证操作按钮
    await expect(page.locator('button:has-text("立即登录")')).toBeVisible();
    await expect(page.locator('button:has-text("免费注册")')).toBeVisible();
    
    // 验证底部信息
    await expect(page.locator('text=© 2026 用户认证系统. 保留所有权利.')).toBeVisible();
  });

  test('登录状态首页显示', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 返回首页
    await page.goto('/');
    
    // 验证导航栏变化
    await expect(page.locator('a:has-text("个人中心")')).toBeVisible();
    await expect(page.locator('button:has-text("退出")')).toBeVisible();
    
    // 验证欢迎消息
    await expect(page.locator('text=您好，')).toBeVisible();
    
    // 验证进入仪表盘按钮
    await expect(page.locator('button:has-text("进入仪表盘")')).toBeVisible();
  });

  test('导航栏链接功能', async ({ page }) => {
    // 点击登录链接
    await page.click('button:has-text("登录")');
    await expect(page).toHaveURL('/login');
    
    // 返回首页
    await page.goto('/');
    
    // 点击注册链接
    await page.click('button:has-text("注册")');
    await expect(page).toHaveURL('/register');
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 验证移动端布局
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('text=欢迎使用用户认证系统')).toBeVisible();
    
    // 测试桌面端视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 验证桌面端布局
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('text=欢迎使用用户认证系统')).toBeVisible();
  });
});