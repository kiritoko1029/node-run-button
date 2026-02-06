import * as vscode from 'vscode';
import {
  PackageManager,
  PackageManagerSource,
  DetectedPackageManager,
  PackageJsonData,
} from './types';

interface LockFileCheck {
  file: string;
  manager: PackageManager;
}

export class PackageManagerDetector {
  private readonly lockFiles: LockFileCheck[] = [
    { file: 'bun.lockb', manager: 'bun' },
    { file: 'bun.lock', manager: 'bun' },
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'package-lock.json', manager: 'npm' },
    { file: 'npm-shrinkwrap.json', manager: 'npm' },
  ];

  constructor(private fs: typeof vscode.workspace.fs) {}

  async detect(
    workspaceFolderUri: vscode.Uri,
    packageJsonDirUri: vscode.Uri,
    packageJson: PackageJsonData,
    userOverride: 'auto' | PackageManager
  ): Promise<DetectedPackageManager> {
    // 1. user override
    if (userOverride !== 'auto') {
      return { manager: userOverride, source: 'config' };
    }

    // 2. packageManager field in package.json (e.g., "pnpm@9.0.0")
    const fromPackageManagerField = this.detectFromPackageManagerField(packageJson);
    if (fromPackageManagerField) {
      return { manager: fromPackageManagerField, source: 'packageManagerField' };
    }

    // 3. lockfile detection (prefer packageJsonDir, fallback to workspace root)
    const fromLockfile = await this.detectFromLockfiles(packageJsonDirUri);
    if (fromLockfile) {
      return { manager: fromLockfile, source: 'lockfile' };
    }

    // 4. fallback to npm
    return { manager: 'npm', source: 'fallback' };
  }

  private detectFromPackageManagerField(packageJson: PackageJsonData): PackageManager | undefined {
    if (!packageJson.packageManager) {
      return undefined;
    }

    const manager = packageJson.packageManager.split('@')[0] as PackageManager;
    if (['npm', 'yarn', 'pnpm', 'bun'].includes(manager)) {
      return manager;
    }
    return undefined;
  }

  private async detectFromLockfiles(dirUri: vscode.Uri): Promise<PackageManager | undefined> {
    for (const { file, manager } of this.lockFiles) {
      const lockFileUri = vscode.Uri.joinPath(dirUri, file);
      if (await this.fileExists(lockFileUri)) {
        return manager;
      }
    }
    return undefined;
  }

  private async fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
      await this.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }
}
