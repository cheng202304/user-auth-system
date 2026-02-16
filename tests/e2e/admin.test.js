// E2E 测试 - 管理员功能
const { test, expect } = require('@playwright/test');

test.describe('管理员功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟管理员登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('用户管理页面访问', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/admin/users');
    
    // 验证页面标题
    await expect(page.locator('text=用户管理')).toBeVisible();
    
    // 验证添加用户按钮
    await expect(page.locator('button:has-text("添加用户")')).toBeVisible();
    
    // 验证用户表格存在
    await expect(page.locator('table')).toBeVisible();
  });

  test('用户筛选功能', async ({ page }) => {
    await page.goto('/admin/users');
    
    // 按角色筛选
    await page.selectOption('select[name="role"]', 'student');
    await expect(page.locator('td:has-text("学生")')).toBeVisible();
    
    // 按状态筛选
    await page.selectOption('select[name="status"]', '1');
    await expect(page.locator('span:has-text("正常")')).toBeVisible();
    
    // 关键词搜索
    await page.fill('input[name="keyword"]', '张三');
    // 验证搜索结果包含关键词
    await expect(page.locator('td:has-text("张三")')).toBeVisible();
  });

  test('添加用户功能', async ({ page }) => {
    await page.goto('/admin/users');
    
    // 点击添加用户按钮（模拟）
    // 由于是表单提交，这里验证表单元素存在
    await expect(page.locator('text=添加用户')).toBeVisible();
    
    // 验证表单字段
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="you@example.com"]')).toBeVisible();
    await expect(page.locator('select:has-text("学生")')).toBeVisible();
  });

  test('用户操作功能', async ({ page }) => {
    await page.goto('/admin/users');
    
    // 验证编辑按钮存在
    await expect(page.locator('button:has-text("编辑")')).toBeVisible();
    
    // 验证删除按钮存在
    await expect(page.locator('button:has-text("删除")')).toBeVisible();
    
    // 验证用户信息显示
    await expect(page.locator('td:has-text("000000")')).toBeVisible(); // 超级管理员账号
    await expect(page.locator('td:has-text("超级管理员")')).toBeVisible();
  });

  test('分页功能', async ({ page }) => {
    await page.goto('/admin/users');
    
    // 验证分页控件存在
    await expect(page.locator('button:has-text("上一页")')).toBeVisible();
    await expect(page.locator('button:has-text("下一页")')).toBeVisible();
    
    // 验证统计信息
    await expect(page.locator('text=显示')).toBeVisible();
  });
});