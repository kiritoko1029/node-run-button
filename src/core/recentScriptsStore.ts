import * as vscode from 'vscode';
import { RecentScriptEntry } from './types';

const STORAGE_KEY = 'recentScripts';

export class RecentScriptsStore {
  constructor(private workspaceState: vscode.Memento) {}

  getRecent(packageJsonUri: vscode.Uri, limit: number): RecentScriptEntry[] {
    const all = this.getAllEntries();
    const uriString = packageJsonUri.toString();

    return all
      .filter((e) => e.packageJsonUri === uriString)
      .sort((a, b) => b.lastRunAt - a.lastRunAt)
      .slice(0, limit);
  }

  getLast(packageJsonUri: vscode.Uri): RecentScriptEntry | undefined {
    const recent = this.getRecent(packageJsonUri, 1);
    return recent[0];
  }

  async recordRun(entry: RecentScriptEntry, limit: number): Promise<void> {
    const all = this.getAllEntries();
    const uriString = entry.packageJsonUri;

    // Remove existing entry with same script name for this package.json
    const filtered = all.filter(
      (e) => !(e.packageJsonUri === uriString && e.scriptName === entry.scriptName)
    );

    // Add new entry
    filtered.push(entry);

    // Keep only the most recent entries per package.json
    const perPackageLimit = Math.max(limit * 2, 10);
    const uriEntries = filtered
      .filter((e) => e.packageJsonUri === uriString)
      .sort((a, b) => b.lastRunAt - a.lastRunAt)
      .slice(0, perPackageLimit);

    const otherEntries = filtered.filter((e) => e.packageJsonUri !== uriString);

    await this.workspaceState.update(STORAGE_KEY, [...otherEntries, ...uriEntries]);
  }

  private getAllEntries(): RecentScriptEntry[] {
    return this.workspaceState.get<RecentScriptEntry[]>(STORAGE_KEY, []);
  }
}
