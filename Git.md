# Git

## 安装Git

```shell
xcode-select --install
or
brew install git
brew doctor
```

> 参考链接：https://git-scm.com/install/mac

## 设置用户签名

```shell
git config --global user.name phvioplie
git config --global user.email phvioplie@163.com
```

## 初始化本地库

```shell
git init
```

## 查看本地库状态

```shell
git status
```

## 添加暂存区

```shell
git add [filename] # 添加到暂存区
git rm --cached [filename] # 从暂存区中删除
```

## 提交本地库

```shell
git commit -m [version message] [filename]
```

## 查看版本信息

```shell
git reflog # 查看日志
git log # 查看详细日志
```

## 版本穿梭

```shell
git reset --hard [version number] # 穿梭到指定版本号
```

# Branch

##  查看分支

```shell
git branch -v
```

## 创建分支

```shell
git branch [branch name]
```

## 切换分支

```shell
git checkout [branch name]
```

## 合并分支

```shell
git merge [branch name] # 将指定分支合并到当前分支下
```

# GitHub

## 创建远程库别名

```shell
git remote -v # 查看远程库
git remote add [alias] [address] # 给远程库取一个别名
```

## 推送本地库到远程库

```shell
git push [alias] [branch name] # branch name是指本地库的分支
```

## 拉取远程库到本地库

```shell
git pull [alias] [branch name] # branch name是指远程库的分支
```

## 克隆远程库到本地库

```shell
git clone [address] 
```

> 以上均为尚硅谷学习视频内容：[尚硅谷Git教程](https://www.bilibili.com/video/BV1vy4y1s7k6/?spm_id_from=333.1387.search.video_card.click&vd_source=c3eabf90f104980ac2380e479493da74)

****

# 常见的场景

## 1. Git删除GitHub上的某个文件/文件夹

```shell
## step1: 删除文件
git rm [filename]/git rm -r [directory name] # 删除文件或文件夹
git rm --cached [filename]/git rm -r -- cached [directory] #需要保留工作区文件时需要加上 --cached参数

## setp2: 提交到本地仓库
git commit -m "delete"

## step3: 推送到远程库
git push Project main
```

> reference：https://www.cnblogs.com/wangwangwangMax/p/16349383.html
