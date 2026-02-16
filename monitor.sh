#!/bin/bash

# 用户认证系统监控脚本

set -e

# 配置
APP_NAME="user-auth-system"
PORT=3000
HEALTH_CHECK_URL="http://localhost:3001/health"
LOG_FILE="./logs/monitor.log"

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 检查服务状态
check_service() {
    if pgrep -f "$APP_NAME" > /dev/null; then
        log "✅ 服务正在运行"
        return 0
    else
        log "❌ 服务未运行"
        return 1
    fi
}

# 检查端口
check_port() {
    if lsof -i :$PORT > /dev/null 2>&1; then
        log "✅ 端口 $PORT 正在监听"
        return 0
    else
        log "❌ 端口 $PORT 未监听"
        return 1
    fi
}

# 健康检查
health_check() {
    if curl -s --connect-timeout 5 "$HEALTH_CHECK_URL" | grep -q "OK"; then
        log "✅ 健康检查通过"
        return 0
    else
        log "❌ 健康检查失败"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    USAGE=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$USAGE" -gt 80 ]; then
        log "⚠️  磁盘使用率过高: ${USAGE}%"
        return 1
    else
        log "✅ 磁盘使用率正常: ${USAGE}%"
        return 0
    fi
}

# 检查内存使用
check_memory() {
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2 }')
    if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
        log "⚠️  内存使用率过高: ${MEMORY_USAGE}%"
        return 1
    else
        log "✅ 内存使用率正常: ${MEMORY_USAGE}%"
        return 0
    fi
}

# 主监控函数
main() {
    log "🔍 开始系统监控检查..."
    
    check_service
    check_port
    health_check
    check_disk_space
    check_memory
    
    log "✅ 监控检查完成"
}

# 执行主函数
main