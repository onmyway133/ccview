import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import type { Command } from '../types.js';
import { parseFrontmatter } from './frontmatter.js';

function loadCommandsFromDir(dir: string, scope: 'global' | 'project', pluginSource?: string): Command[] {
  if (!existsSync(dir)) return [];
  const items: Command[] = [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = join(dir, file);
    try {
      const { data, content } = parseFrontmatter<{ name?: string; description?: string }>(filePath);
      const name = data.name ?? basename(file, '.md');
      // If no frontmatter description, try to get first non-empty line of body
      const description = data.description ?? content.split('\n').find(l => l.trim() && !l.startsWith('#'))?.trim() ?? '';
      items.push({
        kind: 'command',
        id: `${name}#${scope}${pluginSource ? `#${pluginSource}` : ''}`,
        name,
        description,
        scope,
        filePath,
        pluginSource,
        body: readFileSync(filePath, 'utf-8'),
      });
    } catch {
      // skip malformed
    }
  }

  return items;
}

export function loadCommands(pluginInstallPaths: { path: string; name: string }[], projectRoot?: string): Command[] {
  const globalDir = join(homedir(), '.claude', 'commands');
  const results: Command[] = [];

  results.push(...loadCommandsFromDir(globalDir, 'global'));

  for (const { path, name } of pluginInstallPaths) {
    results.push(...loadCommandsFromDir(join(path, 'commands'), 'global', name));
  }

  if (projectRoot) {
    results.push(...loadCommandsFromDir(join(projectRoot, '.claude', 'commands'), 'project'));
  }

  return results;
}
