import { existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import type { Agent } from '../types.js';
import { parseFrontmatter } from './frontmatter.js';

function loadAgentsFromDir(dir: string, scope: 'global' | 'project', pluginSource?: string): Agent[] {
  if (!existsSync(dir)) return [];
  const items: Agent[] = [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = join(dir, file);
    try {
      const { data } = parseFrontmatter<{ name?: string; description?: string; model?: string }>(filePath);
      const name = data.name ?? basename(file, '.md');
      items.push({
        kind: 'agent',
        id: `${name}#${scope}${pluginSource ? `#${pluginSource}` : ''}`,
        name,
        description: data.description ?? '',
        scope,
        filePath,
        pluginSource,
        model: data.model,
      });
    } catch {
      // skip malformed
    }
  }

  return items;
}

export function loadAgents(pluginInstallPaths: { path: string; name: string }[], projectRoot?: string): Agent[] {
  const globalDir = join(homedir(), '.claude', 'agents');
  const results: Agent[] = [];

  results.push(...loadAgentsFromDir(globalDir, 'global'));

  for (const { path, name } of pluginInstallPaths) {
    results.push(...loadAgentsFromDir(join(path, 'agents'), 'global', name));
  }

  if (projectRoot) {
    results.push(...loadAgentsFromDir(join(projectRoot, '.claude', 'agents'), 'project'));
  }

  return results;
}
