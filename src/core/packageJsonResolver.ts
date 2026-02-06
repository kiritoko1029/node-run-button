import * as vscode from 'vscode';
import * as path from 'path';
import { PackageJsonStrategy, ResolvedProject } from './types';

export class PackageJsonResolver {
  constructor(private fs: typeof vscode.workspace.fs) {}

  async resolve(
    activeFileUri: vscode.Uri | undefined,
    workspaceFolder: vscode.WorkspaceFolder,
    strategy: PackageJsonStrategy
  ): Promise<ResolvedProject | undefined> {
    if (strategy === 'workspaceRoot') {
      return this.resolveAtWorkspaceRoot(workspaceFolder);
    }

    // nearest strategy
    if (activeFileUri && activeFileUri.fsPath.startsWith(workspaceFolder.uri.fsPath)) {
      const nearest = await this.findNearest(activeFileUri, workspaceFolder);
      if (nearest) {
        return nearest;
      }
    }

    // fallback to workspace root
    return this.resolveAtWorkspaceRoot(workspaceFolder);
  }

  private async resolveAtWorkspaceRoot(
    workspaceFolder: vscode.WorkspaceFolder
  ): Promise<ResolvedProject | undefined> {
    const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
    if (await this.fileExists(packageJsonUri)) {
      return {
        workspaceFolder,
        packageJsonUri,
        packageJsonDirUri: workspaceFolder.uri,
      };
    }
    return undefined;
  }

  private async findNearest(
    fileUri: vscode.Uri,
    workspaceFolder: vscode.WorkspaceFolder
  ): Promise<ResolvedProject | undefined> {
    let currentDir = path.dirname(fileUri.fsPath);
    const rootPath = workspaceFolder.uri.fsPath;

    while (currentDir.startsWith(rootPath) && currentDir !== rootPath) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const packageJsonUri = vscode.Uri.file(packageJsonPath);

      if (await this.fileExists(packageJsonUri)) {
        return {
          workspaceFolder,
          packageJsonUri,
          packageJsonDirUri: vscode.Uri.file(currentDir),
        };
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
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
