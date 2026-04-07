import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Hook } from '../types.js';

interface HookEntry {
  type: string;
  command: string;
}

interface MatcherGroup {
  matcher: string;
  hooks: HookEntry[];
}

interface SettingsJson {
  hooks?: Record<string, MatcherGroup[]>;
}

function loadHooksFromSettings(filePath: string, scope: 'global' | 'project'): Hook[] {
  if (!existsSync(filePath)) return [];
  const results: Hook[] = [];
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const settings: SettingsJson = JSON.parse(raw);
    if (!settings.hooks) return [];

    for (const [event, groups] of Object.entries(settings.hooks)) {
      if (!Array.isArray(groups)) continue;
      for (const group of groups) {
        if (!Array.isArray(group.hooks)) continue;
        for (let i = 0; i < group.hooks.length; i++) {
          const h = group.hooks[i];
          if (h.type === 'command' && h.command) {
            results.push({
              id: `${scope}#${event}#${i}`,
              event,
              matcher: group.matcher ?? '',
              command: h.command,
              scope,
            });
          }
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return results;
}

export function loadHooks(projectRoot?: string): Hook[] {
  const results: Hook[] = [];
  results.push(...loadHooksFromSettings(join(homedir(), '.claude', 'settings.json'), 'global'));
  if (projectRoot) {
    results.push(...loadHooksFromSettings(join(projectRoot, '.claude', 'settings.json'), 'project'));
  }
  return results;
}
