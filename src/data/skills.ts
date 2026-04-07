import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Skill } from '../types.js';
import { parseFrontmatter } from './frontmatter.js';

function loadSkillsFromDir(dir: string, scope: 'global' | 'project', pluginSource?: string): Skill[] {
  if (!existsSync(dir)) return [];
  const items: Skill[] = [];

  for (const entry of readdirSync(dir)) {
    const skillDir = join(dir, entry);
    try {
      if (!statSync(skillDir).isDirectory()) continue;
      const skillFile = join(skillDir, 'SKILL.md');
      if (!existsSync(skillFile)) continue;

      const { data } = parseFrontmatter<{ name?: string; description?: string; license?: string }>(skillFile);
      const name = data.name ?? entry;

      // Collect reference files
      const refDir = join(skillDir, 'references');
      const references: string[] = existsSync(refDir)
        ? readdirSync(refDir).filter(f => !statSync(join(refDir, f)).isDirectory())
        : [];

      items.push({
        kind: 'skill',
        id: `${name}#${scope}${pluginSource ? `#${pluginSource}` : ''}`,
        name,
        description: data.description ?? '',
        scope,
        filePath: skillFile,
        pluginSource,
        license: data.license,
        references,
      });
    } catch {
      // skip malformed entries
    }
  }

  return items;
}

export function loadSkills(pluginInstallPaths: string[], projectRoot?: string): Skill[] {
  const globalDir = join(homedir(), '.claude', 'skills');
  const results: Skill[] = [];

  // Global skills
  results.push(...loadSkillsFromDir(globalDir, 'global'));

  // Plugin-contributed skills
  for (const { path, name } of pluginInstallPaths) {
    const pluginSkillDir = join(path, 'skills');
    results.push(...loadSkillsFromDir(pluginSkillDir, 'global', name));
  }

  // Project skills
  if (projectRoot) {
    const projectSkillDir = join(projectRoot, '.claude', 'skills');
    results.push(...loadSkillsFromDir(projectSkillDir, 'project'));
  }

  return results;
}
