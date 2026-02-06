# Node Run Button - 实施计划文档

## 项目概述
VSCode 插件，为 Node.js 项目提供一键运行 package.json scripts 的功能。

---

## 1. 文件结构

```
.
├── package.json                      # 插件清单
├── tsconfig.json
├── .vscodeignore
├── README.md
├── src/
│   ├── extension.ts                  # 插件入口
│   ├── app/
│   │   └── nodeRunApp.ts             # 编排器
│   ├── core/
│   │   ├── types.ts                  # 类型定义
│   │   ├── config.ts                 # 配置访问
│   │   ├── packageJsonReader.ts      # package.json 读取
│   │   ├── packageJsonResolver.ts    # package.json 定位
│   │   ├── packageManagerDetector.ts # 包管理器检测
│   │   ├── runCommandBuilder.ts      # 命令构建
│   │   ├── recentScriptsStore.ts     # 最近使用存储
│   │   ├── terminalRunner.ts         # 终端执行
│   │   └── workspaceWatcher.ts       # 文件监听
│   ├── ui/
│   │   └── scriptQuickPick.ts        # QuickPick UI
│   └── utils/
│       └── debounce.ts               # 防抖工具
└── resources/
    └── icons/
        ├── npm.svg
        ├── yarn.svg
        ├── pnpm.svg
        └── bun.svg
```

---

## 2. 核心类型定义

```typescript
// src/core/types.ts
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface PackageJsonData {
  name?: string;
  scripts: Record<string, string>;
  packageManager?: string;
}

export interface ScriptDescriptor {
  name: string;
  script: string;
}

export interface DetectedPackageManager {
  manager: PackageManager;
  source: 'config' | 'packageManagerField' | 'lockfile' | 'fallback';
}

export interface RecentScriptEntry {
  packageJsonUri: string;
  scriptName: string;
  lastRunAt: number;
}
```

---

## 3. package.json 配置

### 3.1 contributes 配置

```json
{
  "activationEvents": [
    "workspaceContains:package.json",
    "onCommand:nodeRunButton.pickAndRun",
    "onCommand:nodeRunButton.runLast"
  ],
  "contributes": {
    "commands": [
      {
        "command": "nodeRunButton.pickAndRun",
        "title": "Run Script",
        "icon": "$(play-circle)",
        "category": "Node Run"
      },
      {
        "command": "nodeRunButton.runLast",
        "title": "Run Last Script",
        "icon": "$(debug-restart)",
        "category": "Node Run"
      },
      {
        "command": "nodeRunButton.refresh",
        "title": "Refresh Scripts",
        "category": "Node Run"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "command": "nodeRunButton.pickAndRun",
          "when": "workspaceContains:package.json && !isInDiffEditor",
          "group": "navigation@100"
        },
        {
          "command": "nodeRunButton.runLast",
          "when": "workspaceContains:package.json && nodeRunButton.hasLastScript && !isInDiffEditor",
          "group": "navigation@101"
        }
      ],
      "commandPalette": [
        {
          "command": "nodeRunButton.pickAndRun",
          "when": "workspaceContains:package.json"
        },
        {
          "command": "nodeRunButton.runLast",
          "when": "workspaceContains:package.json && nodeRunButton.hasLastScript"
        }
      ]
    },
    "configuration": {
      "title": "Node Run Button",
      "properties": {
        "nodeRunButton.packageManager": {
          "type": "string",
          "default": "auto",
          "enum": ["auto", "npm", "yarn", "pnpm", "bun"],
          "description": "Package manager to run scripts. 'auto' detects using package.json/packageManager and lockfiles."
        },
        "nodeRunButton.packageJsonStrategy": {
          "type": "string",
          "default": "nearest",
          "enum": ["nearest", "workspaceRoot"],
          "description": "Which package.json to use. 'nearest' finds the closest ancestor package.json for the active file."
        },
        "nodeRunButton.terminal.name": {
          "type": "string",
          "default": "Node Run",
          "description": "Integrated terminal name used by Node Run Button."
        },
        "nodeRunButton.terminal.reuse": {
          "type": "boolean",
          "default": true,
          "description": "Reuse a dedicated terminal instead of creating a new one each run."
        },
        "nodeRunButton.quickPick.recentLimit": {
          "type": "number",
          "default": 5,
          "minimum": 0,
          "maximum": 10,
          "description": "How many recently-run scripts to pin at the top of the list."
        },
        "nodeRunButton.quickPick.showScriptBody": {
          "type": "boolean",
          "default": true,
          "description": "Show the script body as the QuickPick detail line."
        }
      }
    }
  }
}
```

---

## 4. 数据流与调用关系

```
用户点击按钮
  ↓
command: nodeRunButton.pickAndRun
  ↓
NodeRunApp.pickAndRun()
  ↓
PackageJsonResolver.resolve() ──→ 定位 package.json
  ↓
PackageJsonReader.read() ──→ 读取 scripts
  ↓
PackageManagerDetector.detect() ──→ 检测 npm/yarn/pnpm/bun
  ↓
RecentScriptsStore.getRecent() ──→ 获取最近使用
  ↓
ScriptQuickPick.show() ──→ 显示 QuickPick
  ↓ (用户选择)
RunCommandBuilder.build() ──→ 构建命令
  ↓
TerminalRunner.run() ──→ 在终端执行
  ↓
RecentScriptsStore.recordRun() ──→ 记录使用
```

---

## 5. 开发阶段

### Phase 1: 项目脚手架 (预计 30min)
- [ ] 初始化 TypeScript VSCode 插件项目
- [ ] 配置 tsconfig.json
- [ ] 配置 .vscodeignore
- [ ] 创建基础目录结构

### Phase 2: 核心模块 (预计 1.5h)
- [ ] types.ts - 类型定义
- [ ] config.ts - 配置服务
- [ ] packageJsonReader.ts - 读取 package.json
- [ ] packageJsonResolver.ts - 解析 package.json 路径
- [ ] packageManagerDetector.ts - 检测包管理器
- [ ] runCommandBuilder.ts - 构建运行命令
- [ ] terminalRunner.ts - 终端管理
- [ ] recentScriptsStore.ts - 最近使用存储

### Phase 3: UI 层 (预计 1h)
- [ ] scriptQuickPick.ts - QuickPick 实现
- [ ] 图标映射逻辑
- [ ] 最近使用分组显示

### Phase 4: 编排层 (预计 1h)
- [ ] nodeRunApp.ts - 核心编排逻辑
- [ ] extension.ts - 插件入口/命令注册
- [ ] 文件监听/刷新逻辑

### Phase 5: 资源与文档 (预计 30min)
- [ ] 添加包管理器图标资源
- [ ] README.md 文档
- [ ] 测试不同场景

---

## 6. 关键技术点

### 包管理器检测优先级
1. 用户配置 (`nodeRunButton.packageManager` 非 auto)
2. `package.json` 中的 `packageManager` 字段
3. 锁文件检测:
   - `bun.lockb` → bun
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `package-lock.json` → npm
4. 默认回退 → npm

### QuickPick 界面设计
```typescript
// 最近使用分组
--- Recently Used ---
$(play) dev          via pnpm    next dev -p 3000
$(package) build     via pnpm    next build

--- Scripts ---
$(play) dev                      next dev -p 3000
$(package) build                 next build
$(beaker) test                   jest
$(shield) lint                   eslint src
```

### 命令构建规则
- npm: `npm run <script>`
- yarn: `yarn <script>`
- pnpm: `pnpm <script>`
- bun: `bun run <script>`

---

## 7. 验收标准

- [ ] 打开 Node.js 项目时 editor/title 显示运行按钮
- [ ] 正确识别 npm/yarn/pnpm/bun 包管理器
- [ ] QuickPick 显示所有 scripts，最近使用的置顶
- [ ] 点击脚本后在集成终端正确执行
- [ ] 支持搜索过滤 scripts
- [ ] 用户配置项生效
- [ ] 多包仓库(monorepo)支持

---

*计划生成时间: 2026-02-05*
*基于 Codex 后端架构 + Gemini UI 设计综合*
