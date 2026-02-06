import { PackageManager } from './types';

export class RunCommandBuilder {
  // 危险的 shell 元字符
  private static readonly DANGEROUS_CHARS = /[;&|`$(){}[\]<>!\\]/;
  // 控制字符
  private static readonly CONTROL_CHARS = /[\x00-\x1F\x7F]/;

  build(packageManager: PackageManager, scriptName: string): string | undefined {
    // 安全验证：拒绝包含危险字符或控制字符的脚本名
    if (
      RunCommandBuilder.DANGEROUS_CHARS.test(scriptName) ||
      RunCommandBuilder.CONTROL_CHARS.test(scriptName)
    ) {
      return undefined;
    }

    // 对脚本名进行安全转义（处理空格和引号）
    const safeScriptName = this.escapeScriptName(scriptName);

    const commands: Record<PackageManager, string> = {
      npm: `npm run ${safeScriptName}`,
      yarn: `yarn ${safeScriptName}`,
      pnpm: `pnpm ${safeScriptName}`,
      bun: `bun run ${safeScriptName}`,
    };
    return commands[packageManager];
  }

  /**
   * 对脚本名进行 shell 安全转义
   * - 如果包含空格或特殊字符，使用双引号包裹
   * - 双引号内的内容需要转义
   */
  private escapeScriptName(scriptName: string): string {
    // 如果脚本名只包含安全字符（字母、数字、下划线、连字符、点），直接返回
    if (/^[a-zA-Z0-9_.-]+$/.test(scriptName)) {
      return scriptName;
    }

    // 包含空格或其他字符，需要引号包裹
    // 转义双引号和反斜杠
    const escaped = scriptName.replace(/[\\"]/g, '\\$&');
    return `"${escaped}"`;
  }
}
