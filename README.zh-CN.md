# Node Run Button

[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.node-run-button)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一键运行 Node.js 项目中的 npm/yarn/pnpm/bun 脚本，让开发更高效。

## 功能特点

- **一键执行**：点击播放按钮直接运行最近使用的脚本
- **智能检测**：自动识别项目使用的包管理器（npm/yarn/pnpm/bun）
- **快速选择**：下拉菜单展示所有可用脚本，支持最近使用置顶
- **快捷键支持**：`Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) 快速触发
- **多包管理器支持**：完美适配 npm、yarn、pnpm、bun
- **Monorepo 友好**：支持最近 package.json 解析策略

## 使用方法

### 按钮操作

编辑器右上角会出现两个并排按钮：

| 按钮 | 功能 |
|------|------|
| `▶` (左) | 执行最近使用的脚本（如果没有则打开选择器） |
| `▼` (右) | 打开脚本选择器，选择要运行的脚本 |

### 快捷键

- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

### 脚本选择器

点击下拉按钮或首次使用时会显示 QuickPick 选择器：

- **Recently Used**：最近运行的脚本置顶显示
- **Scripts**：按优先级排序（dev/start/build/test 等）
- **搜索过滤**：输入关键字快速过滤脚本
- **包管理器标识**：显示当前检测到的包管理器

## 配置选项

在 VSCode 设置中搜索 `nodeRunButton`：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `nodeRunButton.packageManager` | string | `auto` | 包管理器选择：`auto`/`npm`/`yarn`/`pnpm`/`bun` |
| `nodeRunButton.packageJsonStrategy` | string | `nearest` | package.json 查找策略：`nearest`/`workspaceRoot` |
| `nodeRunButton.terminal.name` | string | `Node Run` | 终端名称 |
| `nodeRunButton.terminal.reuse` | boolean | `true` | 是否复用终端 |
| `nodeRunButton.quickPick.recentLimit` | number | `5` | 最近使用脚本显示数量 |
| `nodeRunButton.quickPick.showScriptBody` | boolean | `true` | 是否显示脚本内容详情 |

## 包管理器检测优先级

1. 用户配置（`nodeRunButton.packageManager` 非 `auto`）
2. `package.json` 中的 `packageManager` 字段
3. 锁文件检测：
   - `bun.lockb` → bun
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `package-lock.json` → npm
4. 默认回退 → npm

## 安装

### 从 VSCode 市场安装

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 `Node Run Button`
4. 点击安装

### 从 VSIX 安装

```bash
code --install-extension node-run-button-1.0.0.vsix
```

## 系统要求

- VSCode 版本 >= 1.74.0
- Node.js 项目（包含 package.json）

## 已知问题

- 首次安装后需要重启 VSCode 窗口以激活按钮（插件会自动提示）
- 仅支持在包含 package.json 的文件夹/工作区中使用

## 更新日志

### 1.0.0

- 初始版本发布
- 支持一键运行最近脚本
- 支持脚本选择器
- 支持快捷键操作
- 支持多种包管理器自动检测

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 监听模式
npm run watch

# 打包
npm run vscode:prepublish
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)

---

**Enjoy coding!** 🚀
