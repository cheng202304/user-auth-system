# 用户认证系统部署手册

## 📋 部署要求

### 系统要求
- **操作系统**: Linux (推荐 Ubuntu 20.04+ 或 CentOS 7+)
- **内存**: 至少 2GB RAM
- **存储**: 至少 1GB 可用空间
- **网络**: 开放端口 3000 (API) 和 3001 (前端)

### 软件依赖
- **Node.js**: v18+
- **npm**: v8+
- **Docker**: v20+ (可选，推荐)
- **Docker Compose**: v2.0+ (可选)
- **SQLite3**: 已包含在应用中

## 🚀 部署方式

### 方式一：直接部署（开发/测试环境）

#### 1. 克隆项目
```bash
git clone https://github.com/cheng202304/user-auth-system.git
cd user-auth-system
```

#### 2. 安装依赖
```bash
# 安装后端依赖
cd backend
npm install --production

# 安装前端依赖
cd ../frontend
npm install --production
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改必要的配置
nano .env
```

#### 4. 构建项目
```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd ../frontend
npm run build
```

#### 5. 启动服务
```bash
# 使用启动脚本
chmod +x start.sh
./start.sh
```

### 方式二：Docker 部署（生产环境推荐）

#### 1. 构建 Docker 镜像
```bash
docker build -t user-auth-system .
```

#### 2. 运行容器
```bash
# 基础运行
docker run -d \
  --name user-auth-system \
  -p 3000:3000 \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  user-auth-system
```

#### 3. 使用 Docker Compose（推荐）
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 方式三：Nginx 反向代理部署（生产环境）

#### 1. 构建和启动应用
```bash
# 按照方式一构建应用
# 但只启动后端服务（前端由Nginx提供）
cd backend
npm start &
```

#### 2. 配置 Nginx
```bash
# 复制 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/user-auth-system

# 创建符号链接
sudo ln -s /etc/nginx/sites-available/user-auth-system /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 3. 访问应用
- **HTTP**: http://your-domain.com
- **API**: http://your-domain.com/api/

## 🔧 环境变量配置

### 必需配置
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端服务端口 | 3000 |
| `DATABASE_PATH` | 数据库文件路径 | ./data/auth.db |
| `JWT_SECRET` | JWT 密钥 | your_secure_jwt_secret_key_change_in_production |

### 安全建议
- **JWT_SECRET**: 必须修改为强随机字符串
- **数据库路径**: 确保目录有写权限
- **日志文件**: 配置适当的日志轮转

## 📊 监控和维护

### 日志管理
- **应用日志**: `./logs/app.log`
- **Nginx 访问日志**: `/var/log/nginx/user-auth-access.log`
- **Nginx 错误日志**: `/var/log/nginx/user-auth-error.log`

### 数据库备份
```bash
# 手动备份
cp data/auth.db backups/auth_$(date +%Y%m%d_%H%M%S).db

# 自动备份脚本
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
cp data/auth.db $BACKUP_DIR/auth_$(date +%Y%m%d_%H%M%S).db
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
```

### 健康检查
- **HTTP 端点**: `http://localhost:3001/health`
- **返回值**: `200 OK`

## 🔄 更新和升级

### 应用更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建
docker-compose down
docker-compose build
docker-compose up -d
```

### 数据库迁移
- 应用启动时会自动检查并应用数据库迁移
- 生产环境建议先备份数据库再更新

## 🛡️ 安全配置

### HTTPS 配置
1. 获取 SSL 证书（Let's Encrypt 推荐）
2. 配置 Nginx HTTPS
3. 重定向 HTTP 到 HTTPS

### 防火墙配置
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🆘 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>
```

#### 2. 数据库权限错误
```bash
# 确保数据目录有写权限
chmod -R 755 data/
chown -R $(whoami):$(whoami) data/
```

#### 3. 内存不足
- 增加服务器内存
- 优化 Node.js 内存限制：`NODE_OPTIONS="--max-old-space-size=1024"`

### 日志分析
```bash
# 实时查看应用日志
tail -f logs/app.log

# 查找错误
grep -i "error" logs/app.log
```

## 📈 性能优化

### Node.js 优化
- 使用 PM2 进程管理器
- 启用集群模式
- 配置适当的内存限制

### 数据库优化
- 定期执行 `VACUUM` 命令
- 为常用查询字段创建索引
- 启用 WAL 模式

### Nginx 优化
- 启用 Gzip 压缩
- 配置缓存策略
- 启用 HTTP/2

## 📞 支持

如遇问题，请参考以下资源：
- **项目文档**: `docs/` 目录
- **GitHub Issues**: 提交问题报告
- **社区支持**: Discord 或相关论坛

---
**最后更新**: 2026-02-16  
**版本**: v1.0.0