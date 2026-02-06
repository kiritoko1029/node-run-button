# Node Run Button

[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.node-run-button)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[中文文档](README.zh-CN.md)

One-click to run npm/yarn/pnpm/bun scripts in Node.js projects, making development more efficient.

## Features

- **One-click execution**: Click the play button to run the most recently used script
- **Smart detection**: Automatically detects package manager (npm/yarn/pnpm/bun)
- **Quick selection**: Dropdown menu shows all available scripts with recent usage prioritized
- **Keyboard shortcut**: `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) for quick trigger
- **Multi-package-manager support**: Perfectly adapts to npm, yarn, pnpm, bun
- **Monorepo friendly**: Supports nearest package.json resolution strategy

## Usage

### Button Operations

Two side-by-side buttons appear in the top-right corner of the editor:

| Button | Function |
|--------|----------|
| `▶` (Left) | Run the most recently used script (or open selector if none) |
| `▼` (Right) | Open script selector to choose a script |

### Keyboard Shortcuts

- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

### Script Selector

Click the dropdown button or use it for the first time to display the QuickPick selector:

- **Recently Used**: Most recently run scripts appear at the top
- **Scripts**: Sorted by priority (dev/start/build/test, etc.)
- **Search filtering**: Type keywords to quickly filter scripts
- **Package manager indicator**: Shows currently detected package manager

## Configuration

Search `nodeRunButton` in VSCode settings:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `nodeRunButton.packageManager` | string | `auto` | Package manager: `auto`/`npm`/`yarn`/`pnpm`/`bun` |
| `nodeRunButton.packageJsonStrategy` | string | `nearest` | package.json lookup strategy: `nearest`/`workspaceRoot` |
| `nodeRunButton.terminal.name` | string | `Node Run` | Terminal name |
| `nodeRunButton.terminal.reuse` | boolean | `true` | Whether to reuse terminal |
| `nodeRunButton.quickPick.recentLimit` | number | `5` | Number of recent scripts to display |
| `nodeRunButton.quickPick.showScriptBody` | boolean | `true` | Whether to show script content details |

## Package Manager Detection Priority

1. User configuration (`nodeRunButton.packageManager` not `auto`)
2. `packageManager` field in `package.json`
3. Lock file detection:
   - `bun.lockb` → bun
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `package-lock.json` → npm
4. Fallback → npm

## Installation

### Install from VSCode Marketplace

1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions panel
3. Search `Node Run Button`
4. Click Install

### Install from VSIX

```bash
code --install-extension node-run-button-1.0.0.vsix
```

## Requirements

- VSCode version >= 1.74.0
- Node.js project (with package.json)

## Known Issues

- Need to reload VSCode window after first installation to activate buttons (extension will prompt automatically)
- Only works in folders/workspaces containing package.json

## Changelog

### 1.0.0

- Initial release
- Support one-click run recent script
- Support script selector
- Support keyboard shortcuts
- Support multiple package manager auto-detection

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Package
npm run vscode:prepublish
```

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT](LICENSE)

---

**Enjoy coding!** 🚀
