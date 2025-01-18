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
  exit 1
}

# 警告函数
show_warning() {
  echo -e "${YELLOW}警告: $1${NC}"
}

# 版本回滚函数
rollback_version() {
  if [[ $1 != 5 ]]; then
    npm version $2 --no-git-tag-version --allow-same-version
  fi
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

# 选择发布类型
echo -e "\n${YELLOW}选择发布类型:${NC}"
echo "1) 正式版本"
echo "2) Beta 版本"
read -p "请选择 (1-2): " release_type

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
    if [[ $release_type == 2 ]]; then
      new_version=$(npm version prepatch --preid=beta --no-git-tag-version)
    else
      new_version=$(npm version patch --no-git-tag-version)
    fi
    ;;
  2)
    if [[ $release_type == 2 ]]; then
      new_version=$(npm version preminor --preid=beta --no-git-tag-version)
    else
      new_version=$(npm version minor --no-git-tag-version)
    fi
    ;;
  3)
    if [[ $release_type == 2 ]]; then
      new_version=$(npm version premajor --preid=beta --no-git-tag-version)
    else
      new_version=$(npm version major --no-git-tag-version)
    fi
    ;;
  4)
    read -p "请输入新版本号 (例如 1.0.0 或 1.0.0-beta.0): " input_version
    new_version="v$input_version"
    npm version $input_version --no-git-tag-version
    ;;
  5)
    new_version="v$current_version"
    ;;
  *)
    handle_error "无效的选择"
    ;;
esac

# 清理和构建
echo -e "\n${YELLOW}清理旧文件并重新构建...${NC}"
if ! npm run clean; then
  rollback_version $choice $current_version
  handle_error "清理失败"
fi

if ! npm run build; then
  rollback_version $choice $current_version
  handle_error "构建失败"
fi

# 确认发布
echo -e "\n${GREEN}即将发布 $PACKAGE_NAME $new_version${NC}"
if [[ $release_type == 2 ]]; then
  echo -e "${YELLOW}这是一个 Beta 版本，将使用 beta tag 发布${NC}"
fi
read -p "确认发布? (y/N) " confirm
if [[ $confirm != [yY] ]]; then
  echo -e "${YELLOW}发布已取消${NC}"
  rollback_version $choice $current_version
  exit 0
fi

# 发布到 npm
echo -e "\n${YELLOW}发布到 npm...${NC}"
if [[ $release_type == 2 ]]; then
  if ! npm publish --tag beta; then
    rollback_version $choice $current_version
    handle_error "发布失败"
  fi
else
  if ! npm publish; then
    rollback_version $choice $current_version
    handle_error "发布失败"
  fi
fi

# Git 操作
echo -e "\n${YELLOW}创建 Git 提交和标签...${NC}"
if ! git add .; then
  show_warning "Git 暂存失败，但发布已完成"
  exit 0
fi

if ! git commit -m "chore: release $new_version"; then
  show_warning "Git 提交失败，但发布已完成"
  exit 0
fi

if ! git tag -a "$new_version" -m "Release $new_version"; then
  show_warning "创建标签失败，但发布已完成"
  exit 0
fi

read -p "是否现在推送到远程仓库? (y/N) " push_confirm
if [[ $push_confirm == [yY] ]]; then
  # 推送到远程
  echo -e "\n${YELLOW}开始推送到远程仓库...${NC}"
  if ! git push && git push origin "$new_version"; then
    show_warning "推送到远程失败，但发布已完成。请手动执行：git push && git push origin $new_version"
    exit 0
  fi
else
  echo -e "可手动执行命令推送到远程仓库：git push && git push origin $new_version"
fi

echo -e "\n${GREEN}✨ 发布完成!${NC}" 