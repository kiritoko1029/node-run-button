import * as vscode from 'vscode';
import {
  ConfigService,
} from '../core/config';
import { PackageJsonReader } from '../core/packageJsonReader';
import { PackageJsonResolver } from '../core/packageJsonResolver';
import { PackageManagerDetector } from '../core/packageManagerDetector';
import { RunCommandBuilder } from '../core/runCommandBuilder';
import { RecentScriptsStore } from '../core/recentScriptsStore';
import { TerminalRunner } from '../core/terminalRunner';
import { ScriptQuickPick } from '../ui/scriptQuickPick';
import { ScriptDescriptor, ResolvedProject } from '../core/types';

const HAS_LAST_SCRIPT_CONTEXT_KEY = 'nodeRunButton.hasLastScript';

export class NodeRunApp {
  private configService: ConfigService;
  private packageJsonReader: PackageJsonReader;
  private packageJsonResolver: PackageJsonResolver;
  private packageManagerDetector: PackageManagerDetector;
  private runCommandBuilder: RunCommandBuilder;
  private recentScriptsStore: RecentScriptsStore;
  private terminalRunner: TerminalRunner;
  private scriptQuickPick: ScriptQuickPick;

  constructor(context: vscode.ExtensionContext) {
    this.configService = new ConfigService();
    this.packageJsonReader = new PackageJsonReader(vscode.workspace.fs);
    this.packageJsonResolver = new PackageJsonResolver(vscode.workspace.fs);
    this.packageManagerDetector = new PackageManagerDetector(vscode.workspace.fs);
    this.runCommandBuilder = new RunCommandBuilder();
    this.recentScriptsStore = new RecentScriptsStore(context.workspaceState);
    this.terminalRunner = new TerminalRunner();
    this.scriptQuickPick = new ScriptQuickPick();

    // Listen for configuration changes
    context.subscriptions.push(
      this.configService.onDidChange(() => this.refresh())
    );

    // Listen for active editor changes to update context
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(() => this.updateContext())
    );

    // Listen for workspace folder changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => this.refresh())
    );

    // Initial context update
    this.updateContext();
  }

  async pickAndRun(): Promise<void> {
    const project = await this.resolveProject();
    if (!project) {
      vscode.window.showWarningMessage('No package.json found in the current workspace');
      return;
    }

    const packageJson = await this.packageJsonReader.read(project.packageJsonUri);
    if (!packageJson) {
      vscode.window.showWarningMessage('Failed to read package.json');
      return;
    }

    const scripts = this.toScriptDescriptors(packageJson.scripts);
    if (scripts.length === 0) {
      vscode.window.showInformationMessage('No scripts found in package.json');
      return;
    }

    const config = this.configService.get();
    const detected = await this.packageManagerDetector.detect(
      project.workspaceFolder.uri,
      project.packageJsonDirUri,
      packageJson,
      config.packageManager
    );

    const recent = this.recentScriptsStore.getRecent(
      project.packageJsonUri,
      config.quickPick.recentLimit
    );

    const scriptName = await this.scriptQuickPick.show(
      detected.manager,
      scripts,
      recent,
      config.quickPick.recentLimit,
      config.quickPick.showScriptBody
    );

    if (!scriptName) {
      return; // User cancelled
    }

    await this.runScript(project, detected.manager, scriptName);
  }

  async runLast(): Promise<void> {
    const project = await this.resolveProject();
    if (!project) {
      vscode.window.showWarningMessage('No package.json found in the current workspace');
      return;
    }

    const last = this.recentScriptsStore.getLast(project.packageJsonUri);
    if (!last) {
      vscode.window.showInformationMessage('No recent script found. Run a script first.');
      return;
    }

    const packageJson = await this.packageJsonReader.read(project.packageJsonUri);
    if (!packageJson || !packageJson.scripts[last.scriptName]) {
      vscode.window.showWarningMessage(`Script "${last.scriptName}" no longer exists`);
      return;
    }

    const config = this.configService.get();
    const detected = await this.packageManagerDetector.detect(
      project.workspaceFolder.uri,
      project.packageJsonDirUri,
      packageJson,
      config.packageManager
    );

    await this.runScript(project, detected.manager, last.scriptName);
  }

  async refresh(): Promise<void> {
    await this.updateContext();
  }

  async hasLastScript(): Promise<boolean> {
    const project = await this.resolveProject();
    if (!project) {
      return false;
    }
    const last = this.recentScriptsStore.getLast(project.packageJsonUri);
    return Boolean(last);
  }

  private async runScript(
    project: ResolvedProject,
    packageManager: import('../core/types').PackageManager,
    scriptName: string
  ): Promise<void> {
    const config = this.configService.get();
    const commandLine = this.runCommandBuilder.build(packageManager, scriptName);

    // 安全验证失败（脚本名包含危险字符）
    if (!commandLine) {
      vscode.window.showErrorMessage(
        `Script "${scriptName}" contains unsafe characters and cannot be executed.`
      );
      return;
    }

    await this.terminalRunner.run({
      terminalName: config.terminal.name,
      reuse: config.terminal.reuse,
      cwdUri: project.packageJsonDirUri,
      commandLine,
    });

    await this.recentScriptsStore.recordRun(
      {
        packageJsonUri: project.packageJsonUri.toString(),
        scriptName,
        lastRunAt: Date.now(),
      },
      config.quickPick.recentLimit
    );

    await this.updateContext();
  }

  private async resolveProject(): Promise<ResolvedProject | undefined> {
    const workspaceFolder = this.getWorkspaceFolder();
    if (!workspaceFolder) {
      return undefined;
    }

    const activeEditor = vscode.window.activeTextEditor;
    const activeFileUri = activeEditor?.document.uri;

    const config = this.configService.get();

    return this.packageJsonResolver.resolve(
      activeFileUri,
      workspaceFolder,
      config.packageJsonStrategy
    );
  }

  private getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const folder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
      if (folder) {
        return folder;
      }
    }

    return vscode.workspace.workspaceFolders?.[0];
  }

  private async updateContext(): Promise<void> {
    const project = await this.resolveProject();
    if (!project) {
      await vscode.commands.executeCommand('setContext', HAS_LAST_SCRIPT_CONTEXT_KEY, false);
      return;
    }

    const last = this.recentScriptsStore.getLast(project.packageJsonUri);
    await vscode.commands.executeCommand(
      'setContext',
      HAS_LAST_SCRIPT_CONTEXT_KEY,
      Boolean(last)
    );
  }

  private toScriptDescriptors(scripts: Record<string, string>): ScriptDescriptor[] {
    return Object.entries(scripts).map(([name, script]) => ({
      name,
      script,
    }));
  }
}
