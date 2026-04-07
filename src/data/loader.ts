import type { AppData } from '../types.js';
import { loadSkills } from './skills.js';
import { loadAgents } from './agents.js';
import { loadCommands } from './commands.js';
import { loadHooks } from './hooks.js';
import { loadPlugins } from './plugins.js';
import { loadMarketplaces } from './marketplaces.js';
import { loadRules } from './rules.js';

export async function loadAll(projectRoot?: string): Promise<AppData> {
  // Load plugins first — they provide install paths for other loaders
  const { plugins, installPaths } = loadPlugins();

  const [skills, agents, commands, hooks, marketplaces, rules] = await Promise.all([
    Promise.resolve(loadSkills(installPaths, projectRoot)),
    Promise.resolve(loadAgents(installPaths, projectRoot)),
    Promise.resolve(loadCommands(installPaths, projectRoot)),
    Promise.resolve(loadHooks(projectRoot)),
    Promise.resolve(loadMarketplaces()),
    Promise.resolve(loadRules(projectRoot)),
  ]);

  return { skills, agents, commands, hooks, plugins, marketplaces, rules, projectRoot };
}
