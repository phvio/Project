# Git

## 安装Git

```shell
xcode-select --install
or
brew install git
brew doctor
```

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
git remote add [alias] [address] # 给远程库奇艺哥别名
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

