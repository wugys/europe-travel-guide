#!/bin/bash

# Europe Travel Guide - 部署腳本
# 使用方法: ./deploy.sh

echo "🚀 Europe Travel Guide 部署腳本"
echo "================================"

# 檢查是否在正確的目錄
if [ ! -f "index.html" ]; then
    echo "❌ 錯誤：請在 europe-travel-guide 目錄中執行此腳本"
    exit 1
fi

# 檢查 git 是否初始化
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 倉庫..."
    git init
fi

# 取得當前日期作為提交訊息
DATE=$(date +"%Y-%m-%d %H:%M")

echo ""
echo "📝 準備提交變更..."
git add .

echo ""
read -p "輸入提交訊息 (預設: 'Update ${DATE}'): " message
message=${message:-"Update ${DATE}"}

git commit -m "$message"

echo ""
echo "☁️ 推送到 GitHub..."

# 檢查是否有遠端倉庫
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "⚠️ 尚未設定遠端倉庫"
    echo "請先執行以下指令："
    echo "  git remote add origin https://github.com/你的帳號/europe-travel-guide.git"
    exit 1
fi

git push origin main

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 網站網址: https://$(git remote get-url origin | sed 's/.*github.com[/:]//' | sed 's/\.git$//').github.io/europe-travel-guide/"
echo ""
echo "💡 提示: GitHub Pages 可能需要 1-2 分鐘才會更新"
