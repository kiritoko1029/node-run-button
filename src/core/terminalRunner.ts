import * as vscode from 'vscode';
import * as path from 'path';

export interface TerminalRunRequest {
  terminalName: string;
  reuse: boolean;
  cwdUri: vscode.Uri;
  commandLine: string;
}

export class TerminalRunner {
  // 按 cwd 路径缓存终端实例
  private terminalMap = new Map<string, vscode.Terminal>();

  async run(req: TerminalRunRequest): Promise<void> {
    const terminal = this.getOrCreateTerminal(req.terminalName, req.cwdUri, req.reuse);
    terminal.show();
    terminal.sendText(req.commandLine, true);
  }

  private getOrCreateTerminal(
    baseName: string,
    cwdUri: vscode.Uri,
    reuse: boolean
  ): vscode.Terminal {
    // 生成带目录标识的终端名称，避免多项目冲突
    const folderName = path.basename(cwdUri.fsPath);
    const terminalName = `${baseName} (${folderName})`;
    const cwdKey = cwdUri.toString();

    // 检查是否有该 cwd 对应的缓存终端
    if (reuse) {
      const cachedTerminal = this.terminalMap.get(cwdKey);
      if (cachedTerminal) {
        // 验证终端是否仍然存在
        const existing = vscode.window.terminals.find((t) => t === cachedTerminal);
        if (existing) {
          return existing;
        }
        // 终端已被关闭，从缓存移除
        this.terminalMap.delete(cwdKey);
      }

      // 尝试查找同名终端（从其他窗口/会话）
      const existingByName = vscode.window.terminals.find((t) => t.name === terminalName);
      if (existingByName) {
        this.terminalMap.set(cwdKey, existingByName);
        return existingByName;
      }
    }

    // 创建新终端
    const newTerminal = vscode.window.createTerminal({
      name: terminalName,
      cwd: cwdUri.fsPath,
    });

    this.terminalMap.set(cwdKey, newTerminal);

    // 监听终端关闭事件，清理缓存
    const disposable = vscode.window.onDidCloseTerminal((t) => {
      if (t === newTerminal) {
        this.terminalMap.delete(cwdKey);
        disposable.dispose();
      }
    });

    return newTerminal;
  }
}
