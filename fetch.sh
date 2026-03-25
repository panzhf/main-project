#!/bin/bash
# 确保脚本抛出遇到的错误
set -e

packagesDir="src/packages"

if [ ! -d "$packagesDir" ];then
  mkdir -p $packagesDir
  echo "创建packages组件库目录"
fi

if [ $1 = "local" ];then
cd $packagesDir
  if test -e .git
    then
      git pull origin master
      echo '包仓库拉取完毕'
  else
    # rm -rf .git
    git init
    git remote add origin https://e.coding.net/miduoyanfa/bigdataengine/activity-packages.git

    git pull origin master
    echo '包仓库初始完毕'
  fi
else
curl -fL -u frontend-1628847420517:a86af02e0e3172a7c2ca378168b06a122a87aefc "https://miduoyanfa-generic.pkg.coding.net/bigdataengine/frontend/activity-packages.tar.gz?version=latest" -o activity-packages.tar.gz

tar -zxvf activity-packages.tar.gz -C $packagesDir
echo "解压包仓库成功"
fi
