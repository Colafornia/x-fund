#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
PUBLIC_URL=/x-fund yarn build

# 进入生成的文件夹
cd bulid

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:colafornia/x-fund.git master:gh-pages

cd -
