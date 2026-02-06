import * as vscode from 'vscode';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type PackageManagerSource = 'config' | 'packageManagerField' | 'lockfile' | 'fallback';
export type PackageJsonStrategy = 'nearest' | 'workspaceRoot';

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
  source: PackageManagerSource;
}

export interface ResolvedProject {
  workspaceFolder: vscode.WorkspaceFolder;
  packageJsonUri: vscode.Uri;
  packageJsonDirUri: vscode.Uri;
}

export interface RecentScriptEntry {
  packageJsonUri: string;
  scriptName: string;
  lastRunAt: number;
}

export interface NodeRunButtonConfig {
  packageManager: 'auto' | PackageManager;
  packageJsonStrategy: PackageJsonStrategy;
  terminal: {
    name: string;
    reuse: boolean;
  };
  quickPick: {
    recentLimit: number;
    showScriptBody: boolean;
  };
}
