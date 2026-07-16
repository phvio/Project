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

