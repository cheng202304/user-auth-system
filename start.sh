#!/bin/bash

# ============================================
#   用户认证系统 - 一键启动脚本 (Linux/Mac)
# ============================================

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   用户认证系统 - 一键启动${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Node.js，请先安装 Node.js 18+${NC}"
    exit 1
fi

# 获取 Node 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}[错误] Node.js 版本过低，请升级到 18+${NC}"
    exit 1
fi

echo -e "${GREEN}[1/4]${NC} 检查并安装后端依赖..."
cd "$(dirname "$0")/backend"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[错误] 后端依赖安装失败${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}[OK]${NC} 后端依赖安装完成"

echo ""
echo -e "${GREEN}[2/4]${NC} 检查并安装前端依赖..."
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[错误] 前端依赖安装失败${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}[OK]${NC} 前端依赖安装完成"

echo ""
echo -e "${GREEN}[3/4]${NC} 初始化数据库..."
cd "$(dirname "$0")/backend"
mkdir -p data
if [ ! -f "data/auth.db" ]; then
    npm run migrate
    npm run seed
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}[警告] 数据库初始化遇到问题，但将继续启动${NC}"
    else
        echo -e "${GREEN}[OK]${NC} 数据库初始化完成"
    fi
else
    echo -e "     数据库已存在，跳过初始化"
fi

echo ""
echo -e "${GREEN}[4/4]${NC} 启动应用服务..."
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "   后端服务: ${YELLOW}http://localhost:3000${NC}"
echo -e "   前端服务: ${YELLOW}http://localhost:3001${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "按 Ctrl+C 可停止服务"
echo ""

# 启动后端
cd "$(dirname "$0")/backend"
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

# 打开浏览器
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
elif command -v open &> /dev/null; then
    open http://localhost:3001
fi

echo ""
echo -e "${GREEN}启动完成！如需停止服务，请按 Ctrl+C${NC}"

# 等待中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
