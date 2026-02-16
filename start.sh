#!/bin/bash

# 用户认证系统启动脚本
# 支持开发和生产环境

set -e

echo "🚀 启动用户认证系统..."

# 创建必要的目录
mkdir -p data logs

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  .env 文件不存在，使用 .env.example 作为模板"
    cp .env.example .env
fi

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend
npm start &
BACKEND_PID=$!

# 启动前端预览服务（生产环境通常由Nginx提供静态文件）
echo "🌐 启动前端服务..."
cd ../frontend
npm run preview -- --port 3001 --host 0.0.0.0 &
FRONTEND_PID=$!

echo "✅ 服务已启动!"
echo "   后端: http://localhost:3000"
echo "   前端: http://localhost:3001"

# 等待信号并优雅关闭
cleanup() {
    echo "🛑 正在关闭服务..."
    kill $BACKEND_PID $FRONTEND_PID
    wait $BACKEND_PID $FRONTEND_PID
    echo "✅ 服务已关闭"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 保持容器运行
wait $BACKEND_PID $FRONTEND_PID