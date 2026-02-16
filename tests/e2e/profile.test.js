// E2E 测试 - 个人中心功能
const { test, expect } = require('@playwright/test');

test.describe('个人中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟已登录状态
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 进入个人中心
    await page.click('text=个人中心');
    await page.waitForURL('/profile');
  });

  test('个人信息更新', async ({ page }) => {
    // 切换到个人信息标签页
    await page.click('text=个人信息');
    
    // 更新用户名
    await page.fill('input[name="username"]', '更新后的用户名');
    
    // 更新邮箱
    await page.fill('input[name="email"]', 'updated@example.com');
    
    // 更新手机号
    await page.fill('input[name="phone"]', '13800138000');
    
    // 点击保存
    await page.click('button:has-text("保存更改")');
    
    // 验证成功消息
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('text=个人信息更新成功')).toBeVisible();
  });

  test('密码修改', async ({ page }) => {
    // 切换到修改密码标签页
    await page.click('text=修改密码');
    
    // 输入当前密码
    await page.fill('input[name="oldPassword"]', '123456');
    
    // 输入新密码
    await page.fill('input[name="newPassword"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    
    // 点击修改密码
    await page.click('button:has-text("修改密码")');
    
    // 验证成功消息
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('text=密码修改成功')).toBeVisible();
  });

  test('密码修改验证', async ({ page }) => {
    await page.click('text=修改密码');
    
    // 当前密码为空
    await page.fill('input[name="newPassword"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    await page.click('button:has-text("修改密码")');
    
    await expect(page.locator('text=当前密码不能为空')).toBeVisible();
    
    // 新密码为空
    await page.fill('input[name="oldPassword"]', '123456');
    await page.fill('input[name="newPassword"]', '');
    await page.fill('input[name="confirmPassword"]', '');
    await page.click('button:has-text("修改密码")');
    
    await expect(page.locator('text=新密码不能为空')).toBeVisible();
    
    // 密码不一致
    await page.fill('input[name="newPassword"]', 'password1');
    await page.fill('input[name="confirmPassword"]', 'password2');
    await page.click('button:has-text("修改密码")');
    
    await expect(page.locator('text=两次输入的密码不一致')).toBeVisible();
  });

  test('只读信息显示', async ({ page }) => {
    await page.click('text=个人信息');
    
    // 验证账号字段为只读
    const accountInput = await page.locator('input[disabled]').first();
    await expect(accountInput).toBeDisabled();
    
    // 验证角色字段为只读
    const roleInput = await page.locator('input[disabled]').last();
    await expect(roleInput).toBeDisabled();
  });
});