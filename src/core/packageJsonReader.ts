import * as vscode from 'vscode';
import { PackageJsonData } from './types';

export class PackageJsonReader {
  constructor(private fs: typeof vscode.workspace.fs) {}

  async read(uri: vscode.Uri): Promise<PackageJsonData | undefined> {
    try {
      const content = await this.fs.readFile(uri);
      const text = new TextDecoder().decode(content);
      const parsed = JSON.parse(text) as Partial<PackageJsonData>;

      return {
        name: parsed.name,
        scripts: parsed.scripts || {},
        packageManager: parsed.packageManager,
      };
    } catch {
      return undefined;
    }
  }
}
