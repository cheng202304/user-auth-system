#!/bin/bash

# 用户认证系统数据库备份脚本

set -e

# 配置
BACKUP_DIR="./backups"
DATABASE_FILE="./data/auth.db"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/auth_$TIMESTAMP.db"

echo "🔄 开始备份数据库..."

# 检查数据库文件是否存在
if [ ! -f "$DATABASE_FILE" ]; then
    echo "❌ 数据库文件不存在: $DATABASE_FILE"
    exit 1
fi

# 执行备份
cp "$DATABASE_FILE" "$BACKUP_FILE"

# 验证备份
if [ -f "$BACKUP_FILE" ]; then
    echo "✅ 备份成功: $BACKUP_FILE"
else
    echo "❌ 备份失败"
    exit 1
fi

# 清理旧备份
echo "🧹 清理 $RETENTION_DAYS 天前的旧备份..."
find "$BACKUP_DIR" -name "*.db" -mtime +$RETENTION_DAYS -delete

echo "📊 备份统计:"
ls -la "$BACKUP_DIR" | wc -l
echo "备份完成！"