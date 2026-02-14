# 用户认证系统部署文档

## 目录

- [部署概述](#部署概述)
- [本地开发部署](#本地开发部署)
- [Docker 部署](#docker-部署)
- [生产环境部署](#生产环境部署)
- [环境配置说明](#环境配置说明)
- [常见问题排查](#常见问题排查)

---

## 部署概述

本系统采用前后端分离架构：

- **后端**: Express.js + TypeScript + SQLite3
- **前端**: React + TypeScript + Vite
- **端口规划**:
  - 后端服务: `3000`
  - 前端服务: `3001`

### 部署方式

| 部署方式 | 适用场景 | 难度 |
|---------|---------|------|
| 本地开发部署 | 开发调试 | 简单 |
| Docker 部署 | 快速部署、测试环境 | 中等 |
| 生产环境部署 | 生产服务器 | 较复杂 |

---

## 本地开发部署

### 前置条件

- Node.js 18+
- npm 或 pnpm

### 步骤 1: 克隆项目

```bash
git clone <repository-url>
cd user-auth-system
```

### 步骤 2: 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
cd backend && npm install
cd ../frontend && npm install
```

### 步骤 3: 配置环境变量

```bash
# 复制环境变量示例文件
cp backend/.env.example backend/.env
```

根据需要修改 `.env` 文件中的配置。

### 步骤 4: 初始化数据库

```bash
cd backend
npm run migrate  # 创建数据表
npm run seed     # 初始化种子数据（创建超级管理员）
```

### 步骤 5: 启动服务

```bash
# 一键启动（推荐）
./start.sh  # Linux/Mac
start.bat   # Windows

# 或者分别启动
npm run dev:backend   # 后端: http://localhost:3000
npm run dev:frontend  # 前端: http://localhost:3001
```

### 验证部署

访问 http://localhost:3001 检查前端是否正常运行。

---

## Docker 部署

### 前置条件

- Docker 20.10+
- Docker Compose 2.0+

### 使用 Docker Compose

#### 1. 创建 Dockerfile

**后端 Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
```

**前端 Dockerfile** (`frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx 配置** (`frontend/nginx.conf`):

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2. 创建 Docker Compose 配置

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: auth-backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_PATH=./data/auth.db
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=1h
      - CORS_ORIGIN=http://localhost
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: auth-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # 可选: 使用 SQLite 文件数据库（生产推荐）
  # 如需 MySQL/PostgreSQL，请添加对应服务
```

#### 3. 构建和启动

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

#### 4. 验证

- 前端: http://localhost
- 后端 API: http://localhost:3000/api

---

## 生产环境部署

### 前置条件

- Node.js 18+ (生产环境建议使用 PM2 管理进程)
- Nginx (反向代理)
- SSL 证书 (HTTPS)

### 步骤 1: 服务器准备

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

### 步骤 2: 部署后端

```bash
# 克隆项目
git clone <repository-url> /var/www/user-auth-system
cd /var/www/user-auth-system

# 安装后端依赖
cd backend
npm install --production

# 配置环境变量
cp .env.example .env
nano .env

# 构建
npm run build

# 使用 PM2 启动
pm2 start dist/index.js --name auth-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤 3: 部署前端

```bash
cd ../frontend
npm install

# 构建生产版本
npm run build

# 将构建文件复制到 Nginx 目录
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
```

### 步骤 4: 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # 前端静态文件
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 步骤 5: 配置 SSL (可选)

使用 Let's Encrypt 免费证书：

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 步骤 6: 安全配置

1. 设置防火墙规则：
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. 设置文件权限：
```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## 环境配置说明

### 后端环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|-------|------|--------|------|
| PORT | 服务端口 | 3000 | 是 |
| NODE_ENV | 运行环境 | development | 是 |
| DB_PATH | 数据库文件路径 | ./data/auth.db | 是 |
| JWT_SECRET | JWT 密钥 | - | 是 |
| JWT_EXPIRES_IN | Token 过期时间 | 1h | 否 |
| REFRESH_TOKEN_EXPIRES_IN | 刷新 Token 过期时间 | 7d | 否 |
| BCRYPT_ROUNDS | 密码加密轮数 | 10 | 否 |
| CORS_ORIGIN | 允许的跨域来源 | http://localhost:3001 | 是 |

### 生产环境注意事项

1. **JWT_SECRET**: 必须使用强随机字符串，建议 32 位以上
2. **CORS_ORIGIN**: 生产环境应设置为实际域名
3. **数据库备份**: 定期备份 `data/auth.db` 文件
4. **日志管理**: 使用 PM2 logs 查看日志

---

## 常见问题排查

### 后端启动失败

```bash
# 检查端口是否被占用
lsof -i :3000

# 查看后端日志
pm2 logs auth-backend

# 检查数据库文件权限
ls -la backend/data/
```

### 前端无法连接后端

1. 检查后端是否正常运行
2. 检查 CORS 配置
3. 检查 Nginx 代理配置

### 数据库问题

```bash
# 重新初始化数据库
cd backend
rm -f data/auth.db
npm run migrate
npm run seed
```

### PM2 管理命令

```bash
pm2 list              # 查看进程列表
pm2 restart auth-backend  # 重启后端
pm2 logs auth-backend    # 查看后端日志
pm2 monit             # 监控面板
```

---

## 快速命令参考

```bash
# 开发环境启动
./start.sh

# Docker 部署
docker-compose up -d

# 生产环境部署
pm2 start backend/dist/index.js --name auth-backend

# 查看状态
pm2 status
docker-compose ps

# 停止服务
pm2 stop all
docker-compose down
```

---

**文档版本**: 1.0.0
**创建日期**: 2026-02-14
