# Obsidian Canvas AI

<p align=center>
Obsidian 画板 AI 插件
</p>

<br>

<p align=center>
<a href="https://github.com/HinxCorporation/obsidian-canvas-ai#obsidian-canvas-ai">English</a> • <b>简体中文</b>
</p>

<br>

## 特性

- [x] 在Canvas中，生成包含AI问答卡片
- [x] 配置模型的 API key （目前仅支持DeepSeek）
- [ ] 个性化指令
- [ ] 创建特殊的Canvas卡片作为自定义指令
- [ ] 在Canvas中实现多轮对话
- [ ] 支持更多大语言模型
- [ ] 解释Canvas中的内容及关系
- [ ] 更多...

### 受支持的大语言模型

| 模型     | 是否支持 |
| -------- | ------- |
| Deepseek | ✅      |
| ChatGPT  | ❌      |
| ...      |...      |

## 如何安装

### 1. 从Obsidian插件市场安装(未支持)

### 2. 从Release中下载

- 从release中下载最新版本
- 将三个文件（main.js、manifest.json、styles.css）解压并放置在文件夹 `{{obsidian_vault}}/.obsidian/plugins/obsidian-canvas-ai`中

## 如何使用

## 常见问题

## 如何贡献

### 构建指南

- 进入Obsidian仓库中的插件文件夹

```shell
cd {{obsidian_vault}}/.obsidian/plugins/
```

- 从Github克隆本仓库到当前目录

```shell
git clone https://github.com/HinxCorporation/obsidian-canvas-ai.git
```

- 进入插件目录，安装所需依赖并调试/打包

```shell
cd obsidian-canvas-ai

# 调试
yarn && yarn dev

# 打包
yarn && yarn build
```
