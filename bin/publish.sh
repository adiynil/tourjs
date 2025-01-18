#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 包名
PACKAGE_NAME="@adiynil/tourjs"

# 错误处理函数
handle_error() {
  echo -e "${RED}$1${NC}"
  if [[ $2 != 5 ]]; then
    npm version $3 --no-git-tag-version --allow-same-version
  fi
  exit 1
}

# 检查 npm 登录状态
echo -e "${YELLOW}检查 npm 登录状态...${NC}"
if ! npm whoami >/dev/null 2>&1; then
  echo -e "${RED}未登录 npm，请先登录${NC}"
  npm login || exit 1
fi

# 获取当前版本
current_version=$(node -p "require('./package.json').version")
echo -e "${GREEN}当前版本: v$current_version${NC}"

# 选择版本更新类型
echo -e "\n${YELLOW}选择版本更新类型:${NC}"
echo "1) patch (补丁版本: 0.0.1 -> 0.0.2)"
echo "2) minor (次要版本: 0.0.1 -> 0.1.0)"
echo "3) major (主要版本: 0.0.1 -> 1.0.0)"
echo "4) 手动输入版本号"
echo "5) 保持当前版本"
read -p "请选择 (1-5): " choice

case $choice in
  1)
    new_version=$(npm version patch --no-git-tag-version)
    ;;
  2)
    new_version=$(npm version minor --no-git-tag-version)
    ;;
  3)
    new_version=$(npm version major --no-git-tag-version)
    ;;
  4)
    read -p "请输入新版本号 (例如 1.0.0): " input_version
    new_version="v$input_version"
    npm version $input_version --no-git-tag-version
    ;;
  5)
    new_version="v$current_version"
    ;;
  *)
    echo -e "${RED}无效的选择${NC}"
    exit 1
    ;;
esac

# 清理和构建
echo -e "\n${YELLOW}清理旧文件并重新构建...${NC}"
npm run clean || handle_error "清理失败" $choice $current_version
npm run build || handle_error "构建失败" $choice $current_version

# 确认发布
echo -e "\n${GREEN}即将发布 $PACKAGE_NAME $new_version${NC}"
read -p "确认发布? (y/N) " confirm
if [[ $confirm != [yY] ]]; then
  echo -e "${YELLOW}发布已取消${NC}"
  if [[ $choice != 5 ]]; then
    npm version $current_version --no-git-tag-version --allow-same-version
  fi
  exit 0
fi

# 发布到 npm
echo -e "\n${YELLOW}发布到 npm...${NC}"
npm publish || handle_error "发布失败" $choice $current_version

# Git 操作
echo -e "\n${YELLOW}创建 Git 提交和标签...${NC}"
git add package.json
git commit -m "chore: release $new_version" || handle_error "Git 提交失败" $choice $current_version
git tag -a "$new_version" -m "Release $new_version" || handle_error "创建标签失败" $choice $current_version

# 推送到远程
echo -e "\n${YELLOW}推送到远程仓库...${NC}"
git push && git push origin "$new_version" || handle_error "推送到远程失败" $choice $current_version

echo -e "\n${GREEN}✨ 发布完成!${NC}" 