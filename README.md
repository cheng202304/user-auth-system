# 用户认证系统 (User Authentication System)

一个功能完整的全栈用户认证系统，支持用户注册、登录、权限管理等功能。

## 项目简介

本系统采用前后端分离架构，提供完整的用户认证和管理功能。

### 技术栈

**后端**
- Node.js + Express.js
- TypeScript
- SQLite3 数据库
- JWT 身份认证
- BCrypt 密码加密

**前端**
- React 18
- TypeScript
- Vite 构建工具
- React Router 路由

## 功能特性

- 用户注册（自动生成6位数字账号）
- 用户登录（JWT Token 认证）
- 密码修改与重置
- 个人资料管理
- 用户管理（管理员功能）
- 多角色权限控制
- 响应式设计

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd user-auth-system

# 2. 安装依赖
npm run install:all

# 3. 初始化数据库
cd backend
npm run migrate
npm run seed
```

### 启动服务

```bash
# 一键启动（推荐）
./start.sh  # Linux/Mac
start.bat   # Windows

# 或分别启动
npm run dev:backend   # 后端: http://localhost:3000
npm run dev:frontend # 前端: http://localhost:3001
```

### 访问系统

- 前端地址：http://localhost:3001
- 后端 API：http://localhost:3000

### 默认账号

- 账号：`000000`
- 密码：`123456`

## 项目结构

```
user-auth-system/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── database/       # 数据库
│   │   └── config/         # 配置
│   ├── data/               # 数据库文件
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # 服务
│   │   ├── contexts/       # 上下文
│   │   └── types/          # 类型定义
│   └── package.json
├── docs/                   # 文档
│   ├── requirements.md     # 需求文档
│   ├── tech-stack.md      # 技术栈文档
│   ├── deployment.md       # 部署文档
│   └── user-manual.md     # 使用手册
├── start.sh               # Linux/Mac 启动脚本
├── start.bat              # Windows 启动脚本
└── package.json           # 根目录统一管理
```

## 可用命令

### 根目录命令

```bash
npm run install:all     # 安装所有依赖
npm run dev             # 启动开发服务
npm run build           # 构建生产版本
npm run test            # 运行所有测试
npm run test:coverage   # 生成测试覆盖率报告
npm run clean           # 清理构建文件
```

### 后端命令

```bash
cd backend
npm run dev             # 开发模式启动
npm run build           # TypeScript 编译
npm run start           # 生产模式启动
npm run migrate         # 数据库迁移
npm run seed            # 初始化种子数据
npm run test            # 运行测试
```

### 前端命令

```bash
cd frontend
npm run dev             # 开发模式启动
npm run build           # 构建生产版本
npm run preview         # 预览生产版本
npm run test            # 运行测试
npm run lint            # 代码检查
```

## API 接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | 否 |
| `/api/auth/login` | POST | 用户登录 | 否 |
| `/api/auth/logout` | POST | 用户登出 | 是 |
| `/api/auth/status` | GET | 获取登录状态 | 否 |
| `/api/user/profile` | GET | 获取个人信息 | 是 |
| `/api/user/profile` | PUT | 更新个人信息 | 是 |
| `/api/user/change-password` | POST | 修改密码 | 是 |
| `/api/admin/users` | GET | 用户列表 | 是(管理员) |
| `/api/admin/users` | POST | 创建用户 | 是(管理员) |
| `/api/admin/users/:id` | PUT | 更新用户 | 是(管理员) |
| `/api/admin/users/:id` | DELETE | 删除用户 | 是(管理员) |
| `/api/admin/users/:id/reset-password` | POST | 重置密码 | 是(管理员) |

## 用户角色

| 角色 | 权限 |
|------|------|
| 超级管理员 | 所有权限 |
| 管理员 | 用户管理、个人信息管理 |
| 教师 | 个人信息管理 |
| 学生 | 个人信息管理 |

## 部署方式

详见 [部署文档](docs/deployment.md)

### Docker 部署

```bash
docker-compose up -d
```

### 生产环境部署

1. 构建前端：`npm run build:frontend`
2. 编译后端：`npm run build:backend`
3. 使用 PM2 运行后端
4. Nginx 配置反向代理

## 开发指南

### 添加新功能

1. 在后端 `src/routes/` 添加路由
2. 在后端 `src/controllers/` 添加控制器
3. 在前端 `src/pages/` 添加页面
4. 更新文档

### 运行测试

```bash
# 后端测试
cd backend && npm test

# 前端测试
cd frontend && npm test

# 所有测试
npm test
```

## 文档

- [需求文档](docs/requirements.md)
- [技术栈文档](docs/tech-stack.md)
- [部署文档](docs/deployment.md)
- [使用手册](docs/user-manual.md)

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

## 版本

当前版本：1.0.0
