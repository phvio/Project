##   Node JS安装

```shell
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 24

# Verify the Node.js version:
node -v # Should print "v24.18.0".

# Verify npm version:
npm -v # Should print "11.16.0".
```

> 参考链接：https://nodejs.org/en/download

## Claude Code安装

```shell
# 如果网络环境不太好可以先执行这条命令
npm config set registry https://registry.npmmirror.com

# 执行如下命令，开始安装claude code
sudo npm install -g @anthropic-ai/claude-code
```



## DeepSeek接入Claude Code

注册Deepseek账号，创建API key（API key 仅在创建时可见可复制，注意保存该API key），充值金额用于调用API服务。

### 配置Claude Code

```shell
cd ~
mkdir .claude
cd .claude
vim settings.json
```

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "[DeepSeek API Key]",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash[1m]",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max"
  }
}
```

### 使用Claude Code

```shell
claude #启动claude code
exit / Ctrl + D（两次）#退出claude
```

> 参考链接：https://www.yuque.com/xxcls/vibecoding（感谢老师的无私奉献！）



## 入门项目

```tex
我需要一款APP，名字叫做生活财务小管家。我不懂编程技术，并且是首次使用Claude Code，请你帮我设计产品文档，并记录到claude.md文件中。

这款APP需要满足以下条件：
1. 可以在Windows和Mac电脑上；
2. APP的主要功能为记录用户的每一笔支出和收入，并且能够记录该笔交易的分类，由你设计交易类别，希望该分类能够满足较为频繁的简单日常交易。
3. 技术栈选型由你决定，请给出多种方案供我选择。

请注意，作为初次使用Claude Code的用户，我并不懂得技术实现，无法提供更多详细细节，所以请你设计多套方案，并提供详细指导说明，最后将该要求详细记录在claude.md文件中，务必在整个项目期内准守该要求。
```

