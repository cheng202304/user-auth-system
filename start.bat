@echo off
chcp 65001 >nul
echo ============================================
echo    用户认证系统 - 一键启动 (Windows)
echo ============================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo [1/4] 检查并安装后端依赖...
cd /d "%~dp0backend"
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo [OK] 后端依赖安装完成

echo.
echo [2/4] 检查并安装前端依赖...
cd /d "%~dp0frontend"
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo [OK] 前端依赖安装完成

echo.
echo [3/4] 初始化数据库...
cd /d "%~dp0backend"
if not exist data (
    mkdir data
)
if exist data\auth.db (
    echo      数据库已存在，跳过初始化
) else (
    call npm run migrate
    call npm run seed
    if %errorlevel% neq 0 (
        echo [警告] 数据库初始化遇到问题，但将继续启动
    ) else (
        echo [OK] 数据库初始化完成
    )
)

echo.
echo [4/4] 启动应用服务...
echo.
echo ============================================
echo    后端服务: http://localhost:3000
echo    前端服务: http://localhost:3001
echo ============================================
echo.
echo 按 Ctrl+C 可停止服务
echo.

REM 启动后端和前端
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo 服务已启动，浏览器将自动打开...
timeout /t 3 /nobreak >nul
start http://localhost:3001

echo.
echo 启动完成！如需停止服务，请关闭打开的命令行窗口
pause
