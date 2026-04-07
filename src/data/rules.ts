import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Rule } from '../types.js';

function loadRule(filePath: string, scope: 'global' | 'project'): Rule | null {
  if (!existsSync(filePath)) return null;
  try {
    const content = readFileSync(filePath, 'utf-8');
    const stat = statSync(filePath);
    return {
      id: `${scope}#${filePath}`,
      scope,
      filePath,
      preview: content.slice(0, 500),
      wordCount: content.split(/\s+/).filter(Boolean).length,
      lastModified: stat.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

export function loadRules(projectRoot?: string): Rule[] {
  const results: Rule[] = [];

  // Global CLAUDE.md
  const globalRule = loadRule(join(homedir(), '.claude', 'CLAUDE.md'), 'global');
  if (globalRule) results.push(globalRule);

  if (projectRoot) {
    // Project root CLAUDE.md
    const rootRule = loadRule(join(projectRoot, 'CLAUDE.md'), 'project');
    if (rootRule) results.push(rootRule);

    // Project .claude/CLAUDE.md
    const dotClaudeRule = loadRule(join(projectRoot, '.claude', 'CLAUDE.md'), 'project');
    if (dotClaudeRule && dotClaudeRule.filePath !== rootRule?.filePath) {
      results.push(dotClaudeRule);
    }
  }

  return results;
}
