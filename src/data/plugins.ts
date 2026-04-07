import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { InstalledPlugin } from '../types.js';

interface PluginEntry {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated?: string;
}

interface InstalledPluginsJson {
  version: number;
  plugins: Record<string, PluginEntry[]>;
}

interface PluginJson {
  name?: string;
  description?: string;
  version?: string;
  author?: { name: string; email?: string };
}

interface SettingsJson {
  enabledPlugins?: Record<string, boolean>;
}

interface BlocklistEntry {
  plugin: string;
}

interface BlocklistJson {
  plugins?: BlocklistEntry[];
}

function countSubdirItems(dir: string): number {
  if (!existsSync(dir)) return 0;
  try {
    return readdirSync(dir).filter(f => {
      const p = join(dir, f);
      return statSync(p).isDirectory() || f.endsWith('.md');
    }).length;
  } catch {
    return 0;
  }
}

export function loadPlugins(): { plugins: InstalledPlugin[]; installPaths: { path: string; name: string }[] } {
  const pluginDir = join(homedir(), '.claude', 'plugins');
  const installedPath = join(pluginDir, 'installed_plugins.json');
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  const blocklistPath = join(pluginDir, 'blocklist.json');

  if (!existsSync(installedPath)) return { plugins: [], installPaths: [] };

  let installedData: InstalledPluginsJson = { version: 2, plugins: {} };
  let enabledPlugins: Record<string, boolean> = {};
  let blockedSet = new Set<string>();

  try {
    installedData = JSON.parse(readFileSync(installedPath, 'utf-8'));
  } catch { /* empty */ }

  try {
    const settings: SettingsJson = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    enabledPlugins = settings.enabledPlugins ?? {};
  } catch { /* empty */ }

  try {
    const blocklist: BlocklistJson = JSON.parse(readFileSync(blocklistPath, 'utf-8'));
    for (const entry of blocklist.plugins ?? []) {
      blockedSet.add(entry.plugin);
    }
  } catch { /* empty */ }

  const plugins: InstalledPlugin[] = [];
  const installPaths: { path: string; name: string }[] = [];

  for (const [pluginKey, entries] of Object.entries(installedData.plugins ?? {})) {
    if (!entries.length) continue;
    const entry = entries[0]; // most recent
    const [pluginName, marketplace] = pluginKey.split('@');

    let pluginMeta: PluginJson = {};
    const metaPath = join(entry.installPath, '.claude-plugin', 'plugin.json');
    if (existsSync(metaPath)) {
      try {
        pluginMeta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      } catch { /* empty */ }
    }

    const enabled = enabledPlugins[pluginKey] !== false; // default enabled
    const blocked = blockedSet.has(pluginKey);

    plugins.push({
      id: pluginKey,
      name: pluginName ?? pluginKey,
      marketplace: marketplace ?? 'unknown',
      description: pluginMeta.description ?? '',
      version: entry.version ?? pluginMeta.version ?? 'unknown',
      scope: entry.scope === 'project' ? 'project' : 'global',
      installPath: entry.installPath,
      installedAt: entry.installedAt,
      lastUpdated: entry.lastUpdated,
      enabled,
      blocked,
      author: pluginMeta.author,
      skillCount: countSubdirItems(join(entry.installPath, 'skills')),
      agentCount: countSubdirItems(join(entry.installPath, 'agents')),
      commandCount: countSubdirItems(join(entry.installPath, 'commands')),
    });

    if (existsSync(entry.installPath)) {
      installPaths.push({ path: entry.installPath, name: pluginName ?? pluginKey });
    }
  }

  return { plugins, installPaths };
}
