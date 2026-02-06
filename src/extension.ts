import * as vscode from 'vscode';
import { NodeRunApp } from './app/nodeRunApp';

const INSTALLED_KEY = 'nodeRunButton.installed';

export function activate(context: vscode.ExtensionContext) {
  console.log('[Node Run Button] Extension activating...');

  // 检查是否是首次安装
  const hasShownInstallNotification = context.globalState.get<boolean>(INSTALLED_KEY);
  if (!hasShownInstallNotification) {
    // 显示安装提示
    vscode.window
      .showInformationMessage(
        'Node Run Button 安装成功！需要重启窗口以激活按钮。',
        '立即重启',
        '稍后手动重启'
      )
      .then((selection) => {
        if (selection === '立即重启') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });

    // 标记已显示通知
    context.globalState.update(INSTALLED_KEY, true);
  }

  const app = new NodeRunApp(context);

  // Register: 左侧按钮 - 执行最近命令，如果没有则打开选择器
  const runRecentOrSelectCommand = vscode.commands.registerCommand(
    'nodeRunButton.runRecentOrSelect',
    async () => {
      try {
        // 如果有最近执行的命令，直接运行；否则打开选择器
        const hasLast = await app.hasLastScript();
        if (hasLast) {
          await app.runLast();
        } else {
          await app.pickAndRun();
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Node Run Button error: ${error}`);
      }
    }
  );

  // Register: 右侧按钮 - 打开脚本选择器
  const pickAndRunCommand = vscode.commands.registerCommand(
    'nodeRunButton.pickAndRun',
    async () => {
      try {
        await app.pickAndRun();
      } catch (error) {
        vscode.window.showErrorMessage(`Node Run Button error: ${error}`);
      }
    }
  );

  // Register: 直接运行上次命令
  const runLastCommand = vscode.commands.registerCommand(
    'nodeRunButton.runLast',
    async () => {
      try {
        await app.runLast();
      } catch (error) {
        vscode.window.showErrorMessage(`Node Run Button error: ${error}`);
      }
    }
  );

  const refreshCommand = vscode.commands.registerCommand(
    'nodeRunButton.refresh',
    async () => {
      try {
        await app.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Node Run Button error: ${error}`);
      }
    }
  );

  context.subscriptions.push(
    runRecentOrSelectCommand,
    pickAndRunCommand,
    runLastCommand,
    refreshCommand
  );

  console.log('[Node Run Button] Extension activated successfully');
}

export function deactivate() {
  console.log('[Node Run Button] Extension deactivated');
}
