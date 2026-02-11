# 注册功能实现文档

## 概述

本文档描述了用户注册功能的完整实现，包括后端 API、前端界面和相关配置。

## 功能特性

### 后端功能

1. **用户注册 API** (`POST /api/auth/register`)
   - 邮箱格式验证
   - 密码强度验证（至少 8 位，包含大小写字母和数字）
   - 密码哈希加密（BCrypt）
   - 自动生成 6 位数字账号
   - 邮箱唯一性检查
   - 返回创建的用户信息（不包含密码）

2. **验证中间件**
   - 使用 `express-validator` 进行输入验证
   - 统一的错误处理
   - 详细的验证错误信息

3. **错误处理**
   - 全局错误处理中间件
   - 404 路由处理器
   - 异步错误包装器

### 前端功能

1. **注册表单组件** (`RegisterForm`)
   - 邮箱输入（必填，格式验证）
   - 用户名输入（可选，2-20 字符）
   - 密码输入（必填，8-128 字符，强度验证）
   - 实时表单验证
   - 错误提示显示
   - 成功提示（自动消失）
   - 加载状态指示器

2. **通用组件**
   - `FormInput`: 可复用的表单输入组件
   - `Button`: 支持多种变体的按钮组件
   - `Alert`: 消息提示组件（成功/错误/警告/信息）

3. **API 客户端**
   - 基于 Axios 的 HTTP 客户端
   - 请求拦截器（自动添加 Token）
   - 响应拦截器（401 自动跳转登录）
   - 统一的错误处理

## 文件结构

### 后端文件

```
backend/src/
├── middleware/
│   ├── validation.middleware.ts    # 输入验证中间件
│   └── error.middleware.ts          # 错误处理中间件
├── controllers/
│   └── auth.controller.ts          # 认证控制器（包含注册功能）
├── routes/
│   └── auth.routes.ts              # 认证路由
├── database/
│   ├── schema.ts                    # 数据库模式定义
│   ├── models/
│   │   └── user.model.ts           # 用户数据模型
│   ├── repositories/
│   │   └── user.repository.ts      # 用户数据访问层
│   └── services/
│       └── user.service.ts         # 用户业务逻辑层
└── app.ts                          # Express 应用配置
```

### 前端文件

```
frontend/src/
├── components/
│   ├── auth/
│   │   └── RegisterForm.tsx        # 注册表单组件
│   └── common/
│       ├── FormInput.tsx           # 表单输入组件
│       ├── Button.tsx              # 按钮组件
│       └── Alert.tsx               # 消息提示组件
├── api/
│   └── auth.ts                     # 认证 API 封装
├── utils/
│   └── api.ts                      # Axios 客户端配置
├── App.tsx                         # 主应用组件
└── App.css                         # 应用样式
```

## API 接口

### 注册接口

**请求：**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "username": "JohnDoe"
}
```

**响应（成功）：**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "account": "123456",
    "email": "user@example.com",
    "username": "JohnDoe",
    "role": "student",
    "status": 1,
    "created_at": "2025-02-11T00:00:00.000Z"
  }
}
```

**响应（验证错误）：**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    }
  ]
}
```

**响应（邮箱已存在）：**
```json
{
  "success": false,
  "error": "User already exists with this email"
}
```

## 数据验证

### 后端验证规则

1. **邮箱验证**
   - 必填
   - 有效的邮箱格式

2. **密码验证**
   - 必填
   - 长度 8-128 字符
   - 包含至少一个小写字母
   - 包含至少一个大写字母
   - 包含至少一个数字

3. **用户名验证**（可选）
   - 长度 2-20 字符

### 前端验证规则

前端验证与后端保持一致，提供即时反馈：

```typescript
// 邮箱验证
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  newErrors.email = 'Invalid email format';
}

// 密码验证
if (password.length < 8) {
  newErrors.password = 'Password must be at least 8 characters long';
} else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
  newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
}

// 用户名验证
if (username && (username.length < 2 || username.length > 20)) {
  newErrors.username = 'Username must be between 2 and 20 characters';
}
```

## 安全考虑

1. **密码加密**
   - 使用 BCrypt 哈希算法
   - 配置 10 轮盐值（可配置）

2. **输入验证**
   - 前后端双重验证
   - 防止 SQL 注入
   - 防止 XSS 攻击

3. **错误处理**
   - 不泄露敏感信息
   - 生产环境隐藏堆栈信息

4. **账号生成**
   - 随机生成 6 位数字账号
   - 排除保留账号（000000）
   - 检查账号唯一性

## 环境配置

### 后端环境变量 (`.env`)

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./data/auth.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Session Configuration
SESSION_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 前端环境变量 (`.env`)

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

## 依赖安装

### 后端依赖

```bash
cd backend
npm install express-validator @types/express-validator
```

### 前端依赖

```bash
cd frontend
npm install axios
```

## 运行指南

### 启动后端

```bash
cd backend
npm run dev
```

后端将在 `http://localhost:3000` 启动。

### 启动前端

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:3001` 启动。

### 访问注册页面

在浏览器中访问 `http://localhost:3001/register`。

## 测试

### 测试注册 API

使用 curl 测试：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "username": "TestUser"
  }'
```

### 测试前端注册

1. 打开浏览器访问 `http://localhost:3001/register`
2. 填写表单：
   - 邮箱：`test@example.com`
   - 用户名：`TestUser`（可选）
   - 密码：`Password123`
3. 点击 "Register" 按钮
4. 查看成功提示

## 数据库

注册功能使用以下数据表：

### users 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INTEGER | 主键，自增 |
| account | VARCHAR(6) | 6 位数字账号 |
| password_hash | VARCHAR(255) | 密码哈希 |
| username | VARCHAR(20) | 用户名 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(11) | 手机号 |
| role | TEXT | 角色 |
| avatar | VARCHAR(255) | 头像 URL |
| status | INTEGER | 状态（1-正常，0-禁用） |
| failed_attempts | INTEGER | 登录失败次数 |
| locked_until | DATETIME | 锁定到期时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 已知限制

1. 账号生成是随机的，最多尝试 100 次生成唯一账号
2. 如果所有 6 位数字账号已用完，会抛出错误
3. 当前实现不包含邮件验证功能
4. 用户名是可选字段，如果未提供则使用邮箱前缀

## 后续改进建议

1. 添加邮件验证功能
2. 添加验证码功能
3. 实现社交账号注册
4. 添加用户协议和隐私政策同意
5. 实现账号激活机制
6. 添加注册频率限制
7. 实现头像上传功能
8. 添加更详细的密码强度指示器
9. 实现用户名可用性实时检查
10. 添加多语言支持

## 故障排除

### 常见问题

1. **端口被占用**
   - 修改 `.env` 文件中的 `PORT` 配置

2. **数据库连接失败**
   - 确保 `data/` 目录存在且有写入权限
   - 检查 `DB_PATH` 配置是否正确

3. **CORS 错误**
   - 检查 `CORS_ORIGIN` 配置
   - 确保后端 CORS 中间件配置正确

4. **前端无法连接到后端**
   - 确保 `VITE_API_URL` 配置正确
   - 检查后端是否正在运行
   - 检查防火墙设置

---

**文档版本：** v1.0
**创建日期：** 2025-02-11
**最后更新：** 2025-02-11
