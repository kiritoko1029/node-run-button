import * as vscode from 'vscode';
import { NodeRunButtonConfig } from './types';

export class ConfigService {
  private static readonly SECTION = 'nodeRunButton';

  get(): NodeRunButtonConfig {
    const config = vscode.workspace.getConfiguration(ConfigService.SECTION);
    return {
      packageManager: config.get('packageManager', 'auto'),
      packageJsonStrategy: config.get('packageJsonStrategy', 'nearest'),
      terminal: {
        name: config.get('terminal.name', 'Node Run'),
        reuse: config.get('terminal.reuse', true),
      },
      quickPick: {
        recentLimit: config.get('quickPick.recentLimit', 5),
        showScriptBody: config.get('quickPick.showScriptBody', true),
      },
    };
  }

  onDidChange(listener: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ConfigService.SECTION)) {
        listener();
      }
    });
  }
}
