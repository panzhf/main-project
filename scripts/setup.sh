#!/usr/bin/env bash
# 初始化关联的 packages 子库
# 用法：bash scripts/setup.sh

set -e

PACKAGES_DIR="src/packages"
PACKAGES_REPO="https://github.com/panzhf/splice-packages.git"
PACKAGES_BRANCH="cursor/-bc-c20fad45-f811-4690-a6fb-2edb838e5cb7-0ec7"

if [ -d "$PACKAGES_DIR/.git" ]; then
  echo "[setup] src/packages 已存在，拉取最新代码..."
  cd "$PACKAGES_DIR"
  git pull origin "$PACKAGES_BRANCH"
  cd -
else
  echo "[setup] 克隆 splice-packages..."
  git clone -b "$PACKAGES_BRANCH" "$PACKAGES_REPO" "$PACKAGES_DIR"
fi

echo "[setup] 完成！"
