# 用户认证系统开发者指南

## 🚀 快速开始

### 环境要求
- **Node.js**: v18+
- **npm**: v8+
- **Git**: 最新版本
- **操作系统**: Linux/macOS/Windows (WSL 推荐)

### 克隆项目
```bash
git clone https://github.com/cheng202304/user-auth-system.git
cd user-auth-system
```

### 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖  
cd ../frontend
npm install
```

### 配置环境
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件（开发环境可使用默认值）
```

### 启动开发服务器
```bash
# 终端1: 启动后端
cd backend
npm run dev

# 终端2: 启动前端
cd frontend  
npm run dev
```

### 访问应用
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000/api

## 📁 项目结构说明

### 核心目录
```
user-auth-system/
├── backend/           # 后端服务
├── frontend/          # 前端应用
├── docs/              # 项目文档
└── scripts/           # 开发脚本
```

### 后端核心文件
- `src/app.ts`: Express 应用配置
- `src/config/index.ts`: 环境变量配置
- `src/database/connection.ts`: 数据库连接
- `src/database/schema.ts`: 数据库模式定义
- `src/middleware/auth.middleware.ts`: 认证中间件
- `src/routes/*.ts`: 路由定义
- `src/controllers/*.ts`: 控制器逻辑
- `src/database/services/*.ts`: 业务服务层

### 前端核心文件
- `src/App.tsx`: 根组件和路由配置
- `src/contexts/AuthContext.tsx`: 认证状态管理
- `src/services/api.ts`: API 客户端
- `src/pages/*.tsx`: 页面组件
- `src/components/*.tsx`: 通用组件
- `src/styles/global.css`: 全局样式

## 💻 开发工作流

### 代码规范
- **TypeScript**: 严格类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Git Hooks**: 提交前自动检查

### 开发命令
#### 后端
```bash
npm run dev        # 开发模式，热重载
npm run build      # 构建生产版本
npm run test       # 运行测试
npm run test:watch # 监听模式测试
npm run lint       # 代码检查
```

#### 前端
```bash
npm run dev        # 开发模式，热重载
npm run build      # 构建生产版本  
npm run preview    # 预览生产构建
npm run test       # 运行测试
npm run test:watch # 监听模式测试
npm run lint       # 代码检查
```

### 调试技巧
#### 后端调试
```bash
# 使用 Node.js 内置调试器
npm run debug

# VS Code 调试配置 (.vscode/launch.json)
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "preLaunchTask": "tsc: build - backend/tsconfig.json"
}
```

#### 前端调试
- 浏览器开发者工具
- React Developer Tools 扩展
- VS Code 调试配置

## 🧪 测试指南

### 测试结构
```
backend/src/__tests__/
├── api/           # API 集成测试
├── database/      # 数据库测试  
├── middleware/    # 中间件测试
└── utils/         # 工具函数测试

frontend/src/__tests__/
├── auth-context.test.tsx  # 认证上下文测试
├── components.test.tsx    # 组件测试
├── login.test.tsx         # 登录页面测试
└── profile.test.tsx       # 个人中心测试
```

### 编写测试
#### 后端测试示例
```typescript
// src/__tests__/api/auth.test.ts
import request from 'supertest';
import app from '../../app';

describe('Authentication API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .expect(200);
    
    expect(response.body.data).toHaveProperty('account');
    expect(response.body.data).toHaveProperty('password');
  });
});
```

#### 前端测试示例
```typescript
// src/__tests__/login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../pages/LoginPage';

describe('Login Page', () => {
  it('renders login form with email and password fields', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/邮箱地址/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });
});
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- auth.test.ts

# 生成测试覆盖率报告
npm run test -- --coverage
```

## 🔧 配置管理

### 环境变量
所有敏感配置都通过环境变量管理：

```bash
# .env 文件示例
PORT=3000
DATABASE_PATH=./data/auth.db
JWT_SECRET=your_secure_jwt_secret_key
BCRYPT_SALT_ROUNDS=12
```

### TypeScript 配置
- `tsconfig.json`: 基础 TypeScript 配置
- `tsconfig.node.json`: Node.js 特定配置
- `vite.config.ts`: Vite 构建配置

### ESLint 配置
- `eslint.config.js`: ESLint 规则配置
- 支持 TypeScript、React、Jest 规则

## 🌐 API 开发

### 创建新接口
1. **定义路由** (`src/routes/your-route.ts`)
2. **创建控制器** (`src/controllers/your-controller.ts`)
3. **实现服务层** (`src/database/services/your-service.ts`)
4. **编写测试** (`src/__tests__/api/your-test.ts`)

### 路由示例
```typescript
// src/routes/example.routes.ts
import { Router } from 'express';
import { exampleController } from '../controllers/example.controller';

const router = Router();

router.get('/', exampleController.getAll);
router.post('/', exampleController.create);
router.get('/:id', exampleController.getById);
router.put('/:id', exampleController.update);
router.delete('/: id', exampleController.delete);

export default router;
```

### 控制器示例
```typescript
// src/controllers/example.controller.ts
import { Request, Response } from 'express';
import { exampleService } from '../database/services/example.service';

export const exampleController = {
  async getAll(req: Request, res: Response) {
    try {
      const items = await exampleService.findAll();
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch items' });
    }
  },
  
  // ... 其他方法
};
```

## 🎨 UI 开发

### 组件开发
- 使用 TypeScript 接口定义 props
- 遵循原子设计原则
- 复用现有组件和样式

### 样式指南
- 使用 Tailwind CSS 实用类
- 自定义样式放在 `global.css`
- 响应式设计优先

### 组件示例
```typescript
// src/components/ExampleComponent.tsx
interface ExampleComponentProps {
  title: string;
  onClick: () => void;
}

export function ExampleComponent({ title, onClick }: ExampleComponentProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-medium">{title}</h3>
      <button 
        onClick={onClick}
        className="btn btn-primary mt-2"
      >
        Click me
      </button>
    </div>
  );
}
```

## 🗄️ 数据库操作

### TypeORM 使用
项目使用 TypeORM 作为 ORM：

```typescript
// 实体定义
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 6, unique: true })
  account: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;
  
  // ... 其他字段
}
```

### Repository 模式
```typescript
// 数据访问层
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByAccount(account: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { account } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
```

### 数据库迁移
```bash
# 生成迁移文件
npx typeorm migration:generate -n CreateUsersTable

# 运行迁移
npx typeorm migration:run

# 回滚迁移
npx typeorm migration:revert
```

## 🚀 部署准备

### 构建生产版本
```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd ../frontend
npm run build
```

### Docker 构建
```bash
# 构建镜像
docker build -t user-auth-system .

# 运行容器
docker run -d -p 3000:3000 -p 3001:3001 user-auth-system
```

### 环境变量安全
- **不要**在代码中硬编码敏感信息
- **不要**将 `.env` 文件提交到 Git
- 使用 `.env.example` 作为模板

## 🐛 调试和故障排除

### 常见问题
#### 1. 数据库连接失败
- 检查 `DATABASE_PATH` 配置
- 确保目录有写权限
- 查看数据库文件是否存在

#### 2. 认证失败
- 检查 JWT_SECRET 是否一致
- 验证 Token 是否过期
- 查看用户状态是否正常

#### 3. 构建错误
- 清理 node_modules 重新安装
- 检查 TypeScript 类型错误
- 验证环境变量配置

### 日志分析
- 后端日志: `logs/app.log`
- 前端控制台: 浏览器开发者工具
- Docker 日志: `docker logs <container-name>`

## 📈 性能优化

### 数据库优化
- 为常用查询字段添加索引
- 使用事务批量操作
- 避免 N+1 查询问题

### 前端优化
- 代码分割和懒加载
- 图片压缩和 CDN
- 缓存策略配置

### 后端优化
- 数据库连接池配置
- 响应数据压缩
- 内存缓存热点数据

## 🤝 贡献指南

### 代码提交
1. 创建特性分支: `git checkout -b feature/your-feature`
2. 编写代码和测试
3. 提交代码: `git commit -m "feat: add your feature"`
4. 推送到远程: `git push origin feature/your-feature`
5. 创建 Pull Request

### 代码审查
- 确保测试覆盖
- 遵循代码规范
- 更新相关文档

### 版本发布
- 更新 `package.json` 版本号
- 更新 CHANGELOG.md
- 创建 Git tag
- 发布到 npm (如果适用)

---
**文档版本**: v1.0  
**最后更新**: 2026-02-16