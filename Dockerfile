# 用户认证系统 Dockerfile
# 支持多阶段构建，优化镜像大小

# 构建阶段 - 前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

# 构建阶段 - 后端  
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache \
    sqlite3 \
    && mkdir -p /app/data /app/logs

# 复制前端构建产物
COPY --from=frontend-builder /app/dist ./frontend/dist
COPY --from=frontend-builder /app/package*.json ./frontend/
COPY --from=frontend-builder /app/node_modules ./frontend/node_modules

# 复制后端构建产物
COPY --from=backend-builder /app/dist ./backend/dist
COPY --from=backend-builder /app/package*.json ./backend/
COPY --from=backend-builder /app/node_modules ./backend/node_modules

# 复制环境配置文件
COPY .env ./
COPY .env.example ./

# 创建数据目录并设置权限
RUN mkdir -p /app/data /app/logs && chown -R node:node /app

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 3000

# 启动脚本
COPY start.sh .
RUN chmod +x start.sh

# 启动应用
CMD ["./start.sh"]