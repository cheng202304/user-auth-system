# 用户认证系统技术架构文档

## 🏗️ 系统架构概览

### 整体架构
用户认证系统采用**前后端分离的单体架构**，具有以下特点：

- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express + TypeScript  
- **数据库**: SQLite3 (嵌入式数据库)
- **认证**: JWT (JSON Web Token)
- **部署**: Docker 容器化 + Nginx 反向代理

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   浏览器     │───▶│   Nginx     │───▶│   后端API   │
│  (React)    │    │ (反向代理)   │    │ (Express)   │
└─────────────┘    └─────────────┘    └─────────────┘
                                          │
                                          ▼
                                    ┌─────────────┐
                                    │   SQLite3   │
                                    │   数据库    │
                                    └─────────────┘
```

### 技术栈选择理由

#### 前端技术栈
- **React**: 组件化开发，生态丰富，社区活跃
- **TypeScript**: 类型安全，减少运行时错误，提升开发体验
- **Vite**: 快速构建和热重载，开发体验优秀
- **Tailwind CSS**: 实用优先的 CSS 框架，快速实现 UI

#### 后端技术栈  
- **Node.js**: JavaScript 全栈开发，性能优秀
- **Express**: 轻量级 Web 框架，灵活易用
- **TypeScript**: 与前端技术栈统一，类型安全
- **JWT**: 无状态认证，适合分布式系统

#### 数据库选择
- **SQLite3**: 
  - 零配置，无需独立数据库服务器
  - 单文件存储，便于备份和迁移
  - 适合中小型应用和快速开发
  - 支持完整的 SQL 功能
  - 跨平台兼容

## 📁 项目结构

### 根目录结构
```
user-auth-system/
├── backend/           # 后端服务
├── frontend/          # 前端应用  
├── docs/              # 项目文档
├── data/              # 数据库文件（生产环境）
├── logs/              # 日志文件
├── .env               # 环境变量配置
├── .env.example       # 环境变量模板
├── Dockerfile         # Docker 构建文件
├── docker-compose.yml # Docker Compose 配置
├── nginx.conf         # Nginx 配置
├── start.sh           # 启动脚本
├── backup.sh          # 备份脚本
└── monitor.sh         # 监控脚本
```

### 后端项目结构
```
backend/
├── src/
│   ├── app.ts         # Express 应用入口
│   ├── config/        # 配置文件
│   ├── controllers/   # 控制器层
│   ├── database/      # 数据库相关
│   │   ├── connection.ts  # 数据库连接
│   │   ├── schema.ts      # 数据库模式
│   │   ├── models/        # 数据模型
│   │   ├── repositories/  # 数据访问层
│   │   └── services/      # 业务逻辑层
│   ├── middleware/    # 中间件
│   ├── routes/        # 路由定义
│   └── __tests__/     # 测试文件
├── dist/              # 编译输出
├── package.json       # 依赖配置
└── tsconfig.json      # TypeScript 配置
```

### 前端项目结构
```
frontend/
├── src/
│   ├── App.tsx        # 根组件
│   ├── contexts/      # React Context
│   ├── components/    # 通用组件
│   ├── pages/         # 页面组件
│   ├── services/      # API 服务
│   ├── styles/        # 样式文件
│   └── types/         # TypeScript 类型
├── dist/              # 构建输出
├── public/            # 静态资源
├── package.json       # 依赖配置
└── tsconfig.json      # TypeScript 配置
```

## 🔐 认证与授权

### JWT 认证流程
1. **用户登录**: 提交账号密码
2. **服务端验证**: 验证凭据，生成 JWT Token
3. **返回 Token**: 包含 Access Token 和 Refresh Token
4. **客户端存储**: Token 存储在 localStorage
5. **后续请求**: 在 Authorization 头中携带 Bearer Token
6. **Token 刷新**: Access Token 过期时使用 Refresh Token 获取新 Token

### 角色权限控制
系统支持四种角色，权限矩阵如下：

| 功能 | 游客 | 超级管理员 | 管理员 | 教师 | 学生 |
|------|------|-----------|--------|------|------|
| 访问首页 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 用户注册 | ✓ | - | - | - | - |
| 用户登录 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 用户登出 | - | ✓ | ✓ | ✓ | ✓ |
| 查看个人资料 | - | ✓ | ✓ | ✓ | ✓ |
| 修改个人资料 | - | ✓ | ✓ | ✓ | ✓ |
| 修改密码 | - | ✓ | ✓ | ✓ | ✓ |
| 用户查询 | - | ✓ | ✓ | - | - |
| 用户新增 | - | ✓ | ✓ | - | - |
| 用户修改 | - | ✓ | ✓* | - | - |
| 用户删除 | - | ✓* | ✓* | - | - |

> *注：超级管理员不能修改/删除超级管理员账号；管理员不能修改/删除其他管理员*

### 安全措施
- **密码加密**: BCrypt 哈希算法
- **登录保护**: 5次失败锁定30分钟
- **Token 安全**: JWT 签名验证，合理过期时间
- **输入验证**: 所有用户输入都经过验证和清理
- **SQL 注入防护**: 使用 ORM 参数化查询
- **XSS 防护**: 前端输出转义，后端输入验证

## 🗄️ 数据库设计

### 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| account | VARCHAR(6) | 6位数字账号 |
| password | VARCHAR(255) | BCrypt 加密密码 |
| username | VARCHAR(20) | 用户名 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(11) | 手机号 |
| role | TEXT | 角色 (super_admin/admin/teacher/student) |
| avatar | VARCHAR(255) | 头像URL |
| status | INTEGER | 状态 (1-正常, 0-禁用) |
| failed_attempts | INTEGER | 登录失败次数 |
| locked_until | DATETIME | 锁定到期时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 索引设计
- **主键索引**: `id`
- **唯一索引**: `account` (账号唯一)
- **普通索引**: `username`, `email`, `phone`, `role`, `status`

## 🔄 API 设计

### RESTful 接口规范
- **GET**: 获取资源
- **POST**: 创建资源
- **PUT**: 更新资源  
- **DELETE**: 删除资源

### 主要 API 端点

#### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录  
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/status` - 获取登录状态

#### 个人中心接口
- `GET /api/user/profile` - 获取个人信息
- `PUT /api/user/profile` - 更新个人信息
- `POST /api/user/change-password` - 修改密码

#### 用户管理接口 (管理员)
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户

### 响应格式
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

## 🚀 部署架构

### 开发环境
- 前后端独立运行
- 热重载开发
- 内存数据库 (可选)

### 生产环境
- **Docker 容器化**: 前后端打包为单个容器
- **Nginx 反向代理**: 静态文件服务 + API 代理
- **数据持久化**: 数据库文件挂载到宿主机
- **日志管理**: 应用日志 + Nginx 日志
- **监控告警**: 健康检查 + 系统监控

### 扩展性考虑
- **水平扩展**: 通过负载均衡部署多个实例
- **数据库升级**: 可平滑迁移到 PostgreSQL/MySQL
- **缓存层**: 可集成 Redis 用于会话管理和缓存
- **消息队列**: 可集成 RabbitMQ/Kafka 处理异步任务

## 🧪 测试策略

### 测试类型
- **单元测试**: 核心业务逻辑
- **集成测试**: API 接口测试  
- **E2E 测试**: 关键用户流程
- **安全测试**: 漏洞扫描和渗透测试

### 测试工具
- **前端**: Jest + React Testing Library
- **后端**: Jest + Supertest
- **E2E**: Cypress 或 Playwright
- **安全**: OWASP ZAP, SonarQube

## 📈 性能优化

### 数据库优化
- **索引优化**: 为常用查询字段创建索引
- **WAL 模式**: 启用 Write-Ahead Logging 提升并发性能
- **定期维护**: 执行 VACUUM 命令清理数据库

### 前端优化
- **代码分割**: 按路由分割代码
- **懒加载**: 图片和组件懒加载
- **缓存策略**: HTTP 缓存 + Service Worker

### 后端优化
- **连接池**: SQLite 连接池管理
- **响应压缩**: Gzip/Brotli 压缩
- **缓存**: 内存缓存热点数据

## 🛡️ 安全最佳实践

### 传输安全
- **HTTPS**: 强制使用 HTTPS
- **CORS**: 严格的跨域策略
- **CSRF**: CSRF 令牌防护

### 数据安全
- **敏感信息**: 不记录到日志
- **环境变量**: 敏感配置使用环境变量
- **依赖安全**: 定期更新依赖，扫描漏洞

### 认证安全
- **强密码**: 密码复杂度要求
- **多因素**: 可扩展 MFA 支持
- **会话管理**: 合理的会话超时

---
**文档版本**: v1.0  
**最后更新**: 2026-02-16