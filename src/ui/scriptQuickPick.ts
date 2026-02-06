import * as vscode from 'vscode';
import { PackageManager, ScriptDescriptor, RecentScriptEntry } from '../core/types';

interface ScriptQuickPickItem extends vscode.QuickPickItem {
  scriptName: string;
}

export class ScriptQuickPick {
  async show(
    packageManager: PackageManager,
    scripts: ScriptDescriptor[],
    recent: RecentScriptEntry[],
    recentLimit: number,
    showScriptBody: boolean
  ): Promise<string | undefined> {
    const items = this.buildItems(packageManager, scripts, recent, recentLimit, showScriptBody);

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a script to run',
      title: `Run Script (${packageManager})`,
    });

    return selected?.scriptName;
  }

  private buildItems(
    packageManager: PackageManager,
    scripts: ScriptDescriptor[],
    recent: RecentScriptEntry[],
    recentLimit: number,
    showScriptBody: boolean
  ): ScriptQuickPickItem[] {
    const items: ScriptQuickPickItem[] = [];
    const scriptMap = new Map(scripts.map((s) => [s.name, s.script]));

    // 1. Recent section
    const recentEntries = recent.slice(0, recentLimit);
    if (recentEntries.length > 0) {
      items.push({
        label: 'Recently Used',
        kind: vscode.QuickPickItemKind.Separator,
        scriptName: '',
      });

      for (const entry of recentEntries) {
        const script = scriptMap.get(entry.scriptName);
        if (script) {
          items.push({
            label: `$(history) ${this.escapeCodicon(entry.scriptName)}`,
            description: 'recent',
            detail: showScriptBody ? script : undefined,
            scriptName: entry.scriptName,
          });
        }
      }
    }

    // 2. All scripts section
    items.push({
      label: 'Scripts',
      kind: vscode.QuickPickItemKind.Separator,
      scriptName: '',
    });

    // Sort scripts by priority
    const sortedScripts = this.sortScripts(scripts);

    for (const script of sortedScripts) {
      const icon = this.getScriptIcon(script.name);
      items.push({
        label: `${icon} ${this.escapeCodicon(script.name)}`,
        detail: showScriptBody ? script.script : undefined,
        scriptName: script.name,
      });
    }

    return items;
  }

  private sortScripts(scripts: ScriptDescriptor[]): ScriptDescriptor[] {
    const priorityOrder = ['dev', 'start', 'serve', 'build', 'test', 'lint', 'format'];

    return [...scripts].sort((a, b) => {
      const indexA = priorityOrder.indexOf(a.name);
      const indexB = priorityOrder.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) {
        return -1;
      }
      if (indexB !== -1) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private getScriptIcon(scriptName: string): string {
    const name = scriptName.toLowerCase();

    if (name.includes('test') || name.includes('e2e')) {
      return '$(beaker)';
    }
    if (name.includes('build') || name.includes('compile') || name.includes('dist')) {
      return '$(package)';
    }
    if (name.includes('lint') || name.includes('format') || name.includes('check')) {
      return '$(shield)';
    }
    if (name.includes('dev') || name.includes('start') || name.includes('serve')) {
      return '$(rocket)';
    }
    if (name.includes('clean') || name.includes('reset')) {
      return '$(trash)';
    }
    if (name.includes('install') || name.includes('deps')) {
      return '$(cloud-download)';
    }

    return '$(play)';
  }

  /**
   * 转义脚本名中的 codicon 语法，防止 UI 注入
   * $(xxx) 会被 VSCode 解析为图标，需要转义
   */
  private escapeCodicon(scriptName: string): string {
    return scriptName.replace(/\$\(/g, '\\$(');
  }
}
