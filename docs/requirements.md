# 用户注册登录系统需求文档

## 1. 项目概述

### 1.1 项目简介
本项目是一个基于 Web 的用户注册登录系统，提供完整的用户认证和管理功能。系统支持多角色管理，包括超级管理员、管理员、教师和学生四种角色，采用 6 位数字账号体系。系统提供简洁商业风格的首页，游客可直接访问。

### 1.2 项目目标
- 实现安全、可靠的用户注册登录功能
- 提供灵活的用户角色管理和权限控制
- 实现完整的用户生命周期管理（增删改查）
- 提供友好的用户界面和操作体验
- 打造简洁大气的商业风格首页，提升用户体验

## 2. 功能需求

### 2.1 首页模块（游客可访问）

#### 2.1.1 首页设计
**功能描述：**
- 首页为游客可访问的公共页面
- 采用简洁商业风格设计
- 主色调为白色背景，黑色文字
- 页面响应式设计，支持移动端

**页面布局：**
- 顶部导航栏
  - Logo/系统名称
  - 右侧按钮区域（登录状态动态变化）
- 主体内容区
  - 欢迎标语或系统介绍
  - 系统核心功能展示
  - 简洁的视觉设计元素
- 底部区域
  - 版权信息
  - 联系方式（可选）

**导航栏按钮状态变化：**

**未登录状态：**
- 显示"登录"按钮/超链接
- 显示"注册"按钮/超链接
- 点击"登录"跳转到登录页面
- 点击"注册"跳转到注册页面

**已登录状态：**
- 原位置的"登录"和"注册"按钮替换为：
  - "个人中心"超链接
  - "退出"按钮/超链接
- 显示当前用户账号或用户名（可选）
- 点击"个人中心"跳转到个人中心页面
- 点击"退出"执行登出操作，清空 Token，刷新首页

**交互规则：**
- 首页保持简洁，避免过多元素干扰
- 按钮位置固定，登录前后位置不变，避免用户困惑
- 首页不显示敏感信息
- 首页加载时自动检测登录状态，更新导航栏

### 2.2 用户认证模块

#### 2.2.1 用户注册
**功能描述：**
- 系统自动生成 6 位数字账号（000000-999999）
- 默认密码设置为 `123456`
- 新注册用户默认角色为"学生"

**业务规则：**
- 账号随机生成，不允许重复
- 账号必须为 6 位数字（000000-999999）
- 000000 为超级管理员账号，不能被随机生成
- 注册成功后，用户需要登录系统并修改默认密码

**异常处理：**
- 如果所有 6 位数字账号已用完，提示"系统账号已满，请联系管理员"
- 账号冲突时自动重新生成

#### 2.2.2 用户登录
**功能描述：**
- 用户使用账号和密码登录系统
- 支持记住密码功能
- 实现基于 Token 的会话管理
- 登录成功后跳转回首页，导航栏显示登录状态

**业务规则：**
- 账号必须是 6 位数字
- 密码长度至少 6 位
- 登录失败 5 次后锁定账号 30 分钟
- 登录成功后生成访问令牌（Token）

**异常处理：**
- 账号不存在，提示"账号或密码错误"
- 密码错误，提示"账号或密码错误"（不明确提示哪个错误）
- 账号被锁定，提示"账号已锁定，请 30 分钟后再试"

#### 2.2.3 用户登出
**功能描述：**
- 用户主动退出登录
- 清除本地存储的 Token
- 刷新当前页面或重定向到首页
- 首页导航栏恢复为未登录状态

### 2.3 个人中心模块

#### 2.3.1 个人资料管理
**功能描述：**
- 查看个人信息
- 修改个人信息（用户名、邮箱、手机号等）
- 上传头像

**业务规则：**
- 用户名不能为空，长度 2-20 个字符
- 邮箱格式必须正确
- 手机号必须为 11 位数字
- 头像大小限制在 2MB 以内，支持 jpg、png 格式

**超级管理员和管理员额外功能：**
- 可以修改用户角色（教师/学生/管理员）
- 可以禁用/启用账号

#### 2.3.2 密码修改
**功能描述：**
- 用户可以修改自己的登录密码
- 修改密码需要验证旧密码

**业务规则：**
- 新密码长度至少 6 位
- 新密码不能与旧密码相同
- 修改成功后重新登录

### 2.4 用户管理模块（仅超级管理员和管理员可访问）

#### 2.4.1 用户查询
**功能描述：**
- 支持按账号查询
- 支持按用户名模糊查询
- 支持按角色筛选（管理员、教师、学生）
- 支持按账号状态筛选（正常、禁用）
- 分页展示用户列表

**业务规则：**
- 每页显示 20 条记录
- 默认按账号升序排列

#### 2.4.2 用户新增
**功能描述：**
- 手动添加用户
- 设置用户基本信息和角色

**业务规则：**
- 系统自动分配可用账号
- 默认密码为 `123456`
- 可以设置用户角色（管理员、教师、学生）

**限制：**
- 不能创建超级管理员账号（000000）
- 超级管理员只能由超级管理员创建

#### 2.4.3 用户修改
**功能描述：**
- 修改用户基本信息
- 修改用户角色
- 重置用户密码

**业务规则：**
- 用户名不能为空
- 重置密码后密码变为 `123456`

**限制：**
- 超级管理员不能修改自己的角色
- 超级管理员账号（000000）不能被禁用或删除

#### 2.4.4 用户删除
**功能描述：**
- 删除指定用户

**业务规则：**
- 删除前需要二次确认
- 删除后账号将被释放，可以再次分配

**限制：**
- 超级管理员账号（000000）不能被删除
- 管理员不能删除其他管理员（只有超级管理员可以）

## 3. 界面设计规范

### 3.1 首页设计规范

#### 3.1.1 整体风格
- **主色调：** 白色背景（#FFFFFF）
- **文字颜色：** 黑色文字（#000000），次级文字使用深灰色（#333333）
- **辅助色：** 品牌色（蓝色/紫色，可选），用于强调和按钮
- **设计风格：** 简洁商业风格，避免过度装饰
- **留白：** 充足的留白，提升可读性

#### 3.1.2 导航栏设计
- **高度：** 60-80px
- **背景色：** 白色（#FFFFFF）
- **边框：** 底部 1px 浅灰色边框（#E0E0E0）
- **Logo/系统名：** 左侧，黑色，字号 18-20px
- **按钮区域：** 右侧，按钮间距 16px

**未登录按钮样式：**
- 登录按钮：白色背景，黑色边框，黑色文字
- 注册按钮：品牌色背景，白色文字（品牌色推荐：蓝色 #1890FF 或紫色 #722ED1）

**已登录按钮样式：**
- 个人中心：文字超链接，黑色文字，悬停时品牌色
- 退出：白色背景，黑色边框，黑色文字

#### 3.1.3 主体内容区
- **背景色：** 白色（#FFFFFF）或极浅灰色（#FAFAFA）
- **文字：** 黑色，字号 14-16px
- **标题：** 黑色，字号 24-32px，加粗
- **卡片/模块：** 白色背景，轻微阴影，圆角 4-8px

#### 3.1.4 响应式设计
- 桌面端（≥ 768px）：完整布局
- 移动端（< 768px）：
  - 导航栏简化，按钮缩小或折叠
  - 主体内容单列布局
  - 触摸友好的按钮尺寸（最小 44px 高度）

### 3.2 其他页面设计规范

#### 3.2.1 登录/注册页面
- **布局：** 居中卡片式布局
- **背景：** 极浅灰色（#FAFAFA）
- **卡片：** 白色背景，阴影，圆角 8px
- **输入框：** 白色背景，灰色边框，聚焦时品牌色边框
- **按钮：** 全宽，品牌色背景，白色文字

#### 3.2.2 个人中心页面
- **布局：** 侧边栏 + 内容区（桌面端）/ 单列布局（移动端）
- **菜单：** 白色背景，选中项品牌色背景
- **表单：** 统一风格，清晰的标签和输入框
- **表格：** 白色背景，灰色边框，行悬停高亮

### 3.3 交互设计

#### 3.3.1 按钮交互
- 悬停状态：背景色加深 10% 或透明度变化
- 点击状态：轻微缩小或透明度变化
- 禁用状态：灰色背景，不可点击

#### 3.3.2 链接交互
- 悬停状态：颜色变为品牌色
- 下划线：可选，建议使用品牌色下划线

#### 3.3.3 表单交互
- 输入框聚焦：边框变为品牌色，添加轻微阴影
- 验证错误：红色边框 + 错误提示文字
- 验证成功：绿色边框或勾选图标

#### 3.3.4 加载状态
- 按钮：显示加载图标，禁用点击
- 页面：全屏加载遮罩或骨架屏
- 列表：加载更多时的加载动画

## 4. 技术规范

### 4.1 技术栈推荐

#### 4.1.1 前端技术栈
- **框架：** Next.js 14+ 或 React 18+（推荐 Next.js）
- **状态管理：** Redux Toolkit 或 Zustand
- **UI 组件库：** Ant Design 或 Material-UI
- **样式方案：** Tailwind CSS 或 CSS Modules
- **HTTP 客户端：** Axios
- **表单处理：** React Hook Form + Zod
- **路由：** Next.js App Router 或 React Router v6

#### 4.1.2 后端技术栈
- **运行时：** Node.js 18+
- **框架：** Express.js 或 NestJS（推荐 NestJS）
- **语言：** TypeScript 5+
- **认证：** JWT (JSON Web Token)
- **密码加密：** BCrypt
- **API 文档：** Swagger/OpenAPI
- **日志：** Winston 或 Pino
- **环境管理：** dotenv

#### 4.1.3 数据库技术栈
- **数据库：** SQLite3
  - 轻量级嵌入式数据库
  - 零配置，无需独立数据库服务器
  - 适合中小型应用和快速开发
  - 数据存储在单个文件中
  - 支持完整的 SQL 功能
  - 跨平台兼容
- **ORM：** TypeORM
  - 完整的 TypeScript 支持
  - 原生支持 SQLite3
  - 活跃的社区和良好的文档
  - 支持数据迁移和种子数据
  - 查询构建器和装饰器风格
  - 适合与 NestJS 集成
- **缓存：** Redis 7+（可选，用于 Token 黑名单、会话管理）

#### 4.1.4 开发工具
- **包管理：** pnpm 或 npm
- **代码规范：** ESLint + Prettier
- **Git 钩子：** Husky + lint-staged
- **API 测试：** Postman 或 Insomnia
- **版本控制：** Git + GitHub/GitLab

### 4.2 项目结构

#### 4.2.1 前端项目结构（Next.js）
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── (auth)/          # 认证相关页面组
│   │   │   ├── login/       # 登录页面
│   │   │   └── register/    # 注册页面
│   │   ├── (dashboard)/    # 仪表盘页面组（需要登录）
│   │   │   ├── profile/     # 个人中心
│   │   │   └── admin/       # 管理后台
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   └── globals.css      # 全局样式
│   ├── components/          # 组件
│   │   ├── common/          # 通用组件
│   │   ├── auth/            # 认证组件
│   │   └── admin/           # 管理组件
│   ├── lib/                 # 工具库
│   ├── hooks/               # 自定义 Hooks
│   ├── store/               # 状态管理
│   ├── types/               # TypeScript 类型
│   └── api/                 # API 调用
├── public/                  # 静态资源
└── package.json
```

#### 4.2.2 后端项目结构（NestJS）
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/            # 认证模块
│   │   ├── users/           # 用户模块
│   │   └── common/          # 公共模块
│   ├── config/              # 配置
│   ├── common/              # 公共工具
│   ├── database/            # 数据库相关
│   └── main.ts              # 入口文件
├── test/                    # 测试
└── package.json
```

### 4.3 ORM 使用规范（TypeORM + SQLite3）

#### 4.3.1 TypeORM 配置
```typescript
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './data/database.sqlite',
  synchronize: process.env.NODE_ENV === 'development', // 开发环境自动同步
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: ['./src/database/migrations/*'],
  subscribers: ['./src/database/subscribers/*'],
});

// 初始化数据库连接
export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('SQLite3 数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}
```

#### 4.3.2 实体定义
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 6, unique: true })
  account: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20 })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  phone: string;

  @Column({
    type: 'text',
    enum: ['super_admin', 'admin', 'teacher', 'student'],
    default: 'student'
  })
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'integer', default: 1 })
  status: number;

  @Column({ type: 'integer', default: 0 })
  failed_attempts: number;

  @Column({ type: 'datetime', nullable: true })
  locked_until: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**SQLite3 注意事项：**
- SQLite 使用 `text` 类型存储枚举值
- SQLite 使用 `integer` 类型替代 `tinyint`
- SQLite 不支持 `ENUM` 类型，需使用 `text` 配合应用层验证

#### 4.3.3 Repository 使用
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 根据账号查询
  async findByAccount(account: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { account } });
  }

  // 分页查询用户
  async findAll(page: number, pageSize: number, filters?: any) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }
    if (filters?.status !== undefined) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }
    if (filters?.keyword) {
      queryBuilder.andWhere('user.username LIKE :keyword', {
        keyword: `%${filters.keyword}%`
      });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.account', 'ASC');

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // 创建用户
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // 更新用户
  async update(id: number, userData: Partial<User>): Promise<void> {
    await this.userRepository.update(id, userData);
  }

  // 删除用户
  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // 生成随机账号
  async generateRandomAccount(): Promise<string> {
    let account: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      account = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('系统账号已满，请联系管理员');
      }
    } while (await this.findByAccount(account) !== null || account === '000000');

    return account;
  }
}
```

#### 4.3.4 数据迁移
```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'account',
            type: 'varchar',
            length: '6',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '11',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'text',
            default: "'student'",
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'integer',
            default: 1,
          },
          {
            name: 'failed_attempts',
            type: 'integer',
            default: 0,
          },
          {
            name: 'locked_until',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'datetime("now")',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'datetime("now")',
          },
        ],
        indices: [
          { name: 'IDX_account', columnNames: ['account'], isUnique: true },
          { name: 'IDX_username', columnNames: ['username'] },
          { name: 'IDX_role', columnNames: ['role'] },
          { name: 'IDX_status', columnNames: ['status'] },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

**SQLite3 数据类型映射：**
- `INTEGER` → TypeScript `number`
- `TEXT` → TypeScript `string`
- `REAL` → TypeScript `number`
- `BLOB` → TypeScript `Buffer`
- `DATETIME` → TypeScript `Date` 或 `string`

### 4.4 SQLite3 最佳实践

#### 4.4.1 数据库配置
- 开发环境：使用内存数据库 `:memory:` 或文件数据库 `./data/database.sqlite`
- 生产环境：使用文件数据库，设置正确的文件权限
- 定期备份数据库文件
- 启用 WAL（Write-Ahead Logging）模式提升并发性能

#### 4.4.2 性能优化
- 为常用查询字段创建索引
- 使用事务批量操作
- 避免 SELECT *，只查询需要的字段
- 定期执行 `VACUUM` 命令清理数据库

#### 4.4.3 连接管理
- SQLite 是文件数据库，连接数受限
- 使用连接池管理数据库连接
- TypeORM 自动管理连接池，配置合理的最大连接数

#### 4.4.4 数据迁移策略
- 开发环境：启用 `synchronize: true` 自动同步
- 生产环境：禁用自动同步，使用迁移文件
- 使用 TypeORM 迁移命令：`typeorm migration:run`

### 4.5 安全规范

#### 4.5.1 认证与授权
- 使用 JWT Token 进行身份认证
- Token 存储在 localStorage 或 httpOnly Cookie
- 敏感接口需要验证 Token 有效性
- 实现角色权限中间件

#### 4.5.2 数据安全
- 密码使用 BCrypt 加密，盐值自动生成
- 敏感信息（密码、Token）不记录到日志
- 数据库连接使用环境变量配置
- SQL 查询使用 ORM 参数化查询，防止 SQL 注入

#### 4.5.3 传输安全
- 所有 API 使用 HTTPS 协议
- 敏感数据传输使用加密
- 实现 CORS 策略

#### 4.5.4 防护措施
- 实现 CSRF 防护
- 实现请求频率限制（Rate Limiting）
- 实现 XSS 防护（输入验证、输出转义）
- 实现登录失败锁定机制

### 4.6 性能优化

#### 4.6.1 SQLite3 特定优化
- 启用 WAL 模式：`PRAGMA journal_mode=WAL;`
- 设置合适的缓存大小：`PRAGMA cache_size=-64000;`
- 同步模式设置：`PRAGMA synchronous=NORMAL;`
- 定期优化数据库：`PRAGMA optimize;`

#### 4.6.2 前端优化
- 代码分割和懒加载
- 图片压缩和懒加载
- 使用 CDN 加速静态资源
- 实现缓存策略（Service Worker）

#### 4.6.3 后端优化
- 数据库查询优化（索引、分页）
- 使用内存缓存热点数据
- 实现响应压缩（Gzip/Brotli）
- 连接池配置（SQLite 连接数建议 1-10）

### 4.7 测试规范

#### 4.7.1 测试类型
- 单元测试：核心业务逻辑
- 集成测试：API 接口测试
- E2E 测试：关键用户流程

#### 4.7.2 测试工具
- 前端：Jest + React Testing Library
- 后端：Jest + Supertest
- E2E：Cypress 或 Playwright
- 数据库测试：使用 SQLite 内存数据库 `:memory:`

## 5. 角色与权限设计

### 5.1 角色定义

| 角色 | 说明 | 账号示例 | 权限范围 |
|------|------|----------|----------|
| 超级管理员 | 系统最高权限管理者 | 000000 | 所有权限 |
| 管理员 | 系统普通管理员 | 由系统分配 | 用户管理、个人信息管理 |
| 教师 | 教学人员 | 由系统分配 | 个人信息管理 |
| 学生 | 普通用户 | 由系统分配 | 个人信息管理 |
| 游客 | 未登录用户 | - | 只能访问首页、登录、注册页面 |

### 5.2 权限矩阵

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
| 修改用户角色 | - | ✓ | ✓ | - | - |
| 重置用户密码 | - | ✓ | ✓ | - | - |
| 禁用/启用账号 | - | ✓ | ✓ | - | - |

*注：
- 超级管理员不能修改/删除超级管理员账号
- 管理员不能修改/删除其他管理员（只有超级管理员可以）

## 6. 数据设计

### 6.1 用户表（users）

**SQLite3 表定义：**
| 字段名 | SQLite 类型 | 长度 | 是否必填 | 默认值 | 说明 |
|--------|-----------|------|---------|--------|------|
| id | INTEGER | - | 是 | - | 主键，自增 |
| account | VARCHAR | 6 | 是 | - | 账号（6位数字） |
| password | VARCHAR | 255 | 是 | - | 密码（加密存储） |
| username | VARCHAR | 20 | 是 | - | 用户名 |
| email | VARCHAR | 100 | 否 | NULL | 邮箱 |
| phone | VARCHAR | 11 | 否 | NULL | 手机号 |
| role | TEXT | - | 是 | 'student' | 角色（super_admin, admin, teacher, student） |
| avatar | VARCHAR | 255 | 否 | NULL | 头像URL |
| status | INTEGER | 1 | 是 | 1 | 状态（1-正常，0-禁用） |
| failed_attempts | INTEGER | - | 是 | 0 | 登录失败次数 |
| locked_until | DATETIME | - | 否 | NULL | 锁定到期时间 |
| created_at | DATETIME | - | 是 | datetime('now') | 创建时间 |
| updated_at | DATETIME | - | 是 | datetime('now') | 更新时间 |

### 6.2 SQLite3 数据类型映射

| TypeScript 类型 | SQLite 类型 | TypeORM Column 定义 |
|----------------|------------|---------------------|
| number | INTEGER | `@Column({ type: 'integer' })` |
| string | TEXT | `@Column({ type: 'text' })` 或 `@Column({ type: 'varchar', length: 100 })` |
| number | REAL | `@Column({ type: 'real' })` |
| Buffer | BLOB | `@Column({ type: 'blob' })` |
| Date | TEXT/DATETIME | `@Column({ type: 'datetime' })` 或 `@CreateDateColumn()` |
| boolean | INTEGER | `@Column({ type: 'integer' })` (0/1) |

### 6.3 索引设计
- 主键索引：`id`
- 唯一索引：`account`（账号唯一）
- 普通索引：`username`、`email`、`phone`、`role`、`status`

## 7. 接口设计

### 7.1 首页接口

#### 7.1.1 获取登录状态
```
GET /api/auth/status
响应：
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "isAuthenticated": true,
    "user": {
      "id": 1,
      "account": "000000",
      "username": "超级管理员",
      "role": "super_admin",
      "avatar": "http://example.com/avatar.jpg"
    }
  }
}
```

**未登录状态：**
```
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "isAuthenticated": false,
    "user": null
  }
}
```

### 7.2 认证接口

#### 7.2.1 用户注册
```
POST /api/auth/register
请求体：{}
响应：
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "account": "123456",
    "password": "123456",
    "role": "student"
  }
}
```

#### 7.2.2 用户登录
```
POST /api/auth/login
请求体：
{
  "account": "000000",
  "password": "123456"
}
响应：
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "account": "000000",
      "username": "超级管理员",
      "role": "super_admin"
    }
  }
}
```

#### 7.2.3 用户登出
```
POST /api/auth/logout
请求头：Authorization: Bearer {token}
响应：
{
  "code": 200,
  "message": "登出成功"
}
```

### 7.3 个人中心接口

#### 7.3.1 获取个人信息
```
GET /api/user/profile
请求头：Authorization: Bearer {token}
响应：
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "account": "000000",
    "username": "超级管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": "super_admin",
    "avatar": "http://example.com/avatar.jpg",
    "created_at": "2025-02-10 00:00:00"
  }
}
```

#### 7.3.2 更新个人信息
```
PUT /api/user/profile
请求头：Authorization: Bearer {token}
请求体：
{
  "username": "新用户名",
  "email": "new@example.com",
  "phone": "13900139000"
}
响应：
{
  "code": 200,
  "message": "更新成功"
}
```

#### 7.3.3 修改密码
```
POST /api/user/change-password
请求头：Authorization: Bearer {token}
请求体：
{
  "oldPassword": "123456",
  "newPassword": "newpassword123"
}
响应：
{
  "code": 200,
  "message": "密码修改成功，请重新登录"
}
```

### 7.4 用户管理接口（仅管理员）

#### 7.4.1 获取用户列表
```
GET /api/admin/users?page=1&pageSize=20&role=student&status=1&keyword=张三
请求头：Authorization: Bearer {token}
响应：
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 2,
        "account": "123456",
        "username": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138001",
        "role": "student",
        "status": 1,
        "created_at": "2025-02-10 00:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

#### 7.4.2 创建用户
```
POST /api/admin/users
请求头：Authorization: Bearer {token}
请求体：
{
  "username": "李四",
  "email": "lisi@example.com",
  "phone": "13800138002",
  "role": "student"
}
响应：
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 3,
    "account": "123457",
    "password": "123456"
  }
}
```

#### 7.4.3 更新用户
```
PUT /api/admin/users/{id}
请求头：Authorization: Bearer {token}
请求体：
{
  "username": "新姓名",
  "email": "newemail@example.com",
  "role": "teacher",
  "status": 1
}
响应：
{
  "code": 200,
  "message": "更新成功"
}
```

#### 7.4.4 重置用户密码
```
POST /api/admin/users/{id}/reset-password
请求头：Authorization: Bearer {token}
响应：
{
  "code": 200,
  "message": "密码已重置为 123456"
}
```

#### 7.4.5 删除用户
```
DELETE /api/admin/users/{id}
请求头：Authorization: Bearer {token}
响应：
{
  "code": 200,
  "message": "删除成功"
}
```

## 8. 非功能需求

### 8.1 性能要求
- 系统响应时间 < 500ms（正常负载）
- 支持 1000+ 并发用户
- 用户列表查询支持分页，每页 20 条记录
- 首页加载时间 < 1s（首屏）

### 8.2 安全要求
- 密码使用 BCrypt 加密存储
- 登录失败 5 次后锁定账号 30 分钟
- Token 有效期 7 天，支持刷新
- 所有接口使用 HTTPS 传输
- 敏感操作需要二次确认
- 防止 SQL 注入、XSS 攻击
- 实现请求频率限制

### 8.3 可用性要求
- 系统可用性 ≥ 99.5%
- 支持主流浏览器（Chrome、Firefox、Safari、Edge）
- 响应式设计，支持移动端访问
- 符合 WCAG 2.1 AA 级无障碍标准

### 8.4 可维护性要求
- 代码结构清晰，模块化设计
- 完善的日志记录
- 统一的错误处理机制
- 完善的接口文档
- 代码注释完整，遵循团队规范

### 8.5 兼容性要求
- 支持最新版主流浏览器及最近两个版本
- 支持 iOS 12+ 和 Android 8+ 移动浏览器
- 支持 1920x1080、1366x768 等常见分辨率

## 9. 业务规则总结

### 9.1 账号规则
- 账号必须是 6 位数字（000000-999999）
- 超级管理员账号固定为 000000
- 超级管理员账号不能被删除
- 超级管理员账号不能被禁用
- 注册时系统随机生成账号

### 9.2 密码规则
- 默认密码为 123456
- 新用户注册后首次登录必须修改密码
- 密码长度至少 6 位
- 修改密码需要验证旧密码

### 9.3 角色规则
- 角色分为：超级管理员、管理员、教师、学生
- 游客只能访问首页、登录、注册页面
- 超级管理员可以修改/删除所有角色用户
- 管理员可以修改/删除教师和学生，不能修改/删除其他管理员
- 教师和学生只能管理自己的信息

### 9.4 权限规则
- 超级管理员拥有所有权限
- 管理员拥有用户管理权限（除超级管理员外）
- 教师和学生只能访问个人中心
- 游客只能访问首页和认证页面

### 9.5 界面交互规则
- 首页对所有用户开放
- 导航栏按钮位置固定，登录前后位置不变
- 未登录显示"登录"和"注册"
- 已登录显示"个人中心"和"退出"
- 退出后首页刷新，导航栏恢复未登录状态

## 10. 附录

### 10.1 术语表

| 术语 | 说明 |
|------|------|
| Token | 访问令牌，用于身份验证 |
| BCrypt | 一种密码哈希算法 |
| JWT | JSON Web Token，用于 Token 生成 |
| HTTPS | 超文本传输安全协议 |
| ORM | 对象关系映射 |
| TypeORM | TypeScript 的 ORM 框架 |
| SQLite3 | 轻量级嵌入式数据库 |
| SSR | 服务端渲染 |
| SPA | 单页应用 |
| WAL | Write-Ahead Logging，SQLite 日志模式 |

### 10.2 参考文档
- [技术栈文档](./tech-stack.md)
- [API 接口文档](./api-docs.md)（待补充）
- [数据库设计文档](./database-design.md)（待补充）
- [TypeORM 官方文档](https://typeorm.io/)
- [SQLite3 官方文档](https://www.sqlite.org/docs.html)
- [TypeORM SQLite 文档](https://typeorm.io/#/sqlite/overview)

### 10.3 颜色规范参考

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主背景 | #FFFFFF | 白色 |
| 次背景 | #FAFAFA | 极浅灰 |
| 主文字 | #000000 | 纯黑 |
| 次文字 | #333333 | 深灰 |
| 辅助文字 | #666666 | 中灰 |
| 边框 | #E0E0E0 | 浅灰 |
| 品牌色 | #1890FF | 蓝色（可选） |
| 品牌色 | #722ED1 | 紫色（可选） |
| 错误色 | #FF4D4F | 红色 |
| 成功色 | #52C41A | 绿色 |

---

**文档版本：** v2.1
**创建日期：** 2025-02-10
**最后更新：** 2025-02-10
**更新内容：**
- 数据库确定为 SQLite3
- ORM 确定为 TypeORM（首选推荐）
- 新增 SQLite3 配置和使用规范
- 新增 SQLite3 数据类型映射
- 新增 SQLite3 最佳实践和性能优化
