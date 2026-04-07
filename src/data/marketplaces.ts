import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Marketplace } from '../types.js';

interface MarketplaceSource {
  source: string;
  repo?: string;
  path?: string;
}

interface KnownMarketplacesJson {
  [key: string]: {
    source: { source: MarketplaceSource };
    installLocation?: string;
    lastUpdated?: string;
  };
}

interface MarketplaceJson {
  name?: string;
  metadata?: { description?: string; version?: string };
  owner?: { name: string; email?: string };
  plugins?: unknown[];
}

export function loadMarketplaces(): Marketplace[] {
  const knownPath = join(homedir(), '.claude', 'plugins', 'known_marketplaces.json');
  if (!existsSync(knownPath)) return [];

  let known: KnownMarketplacesJson = {};
  try {
    known = JSON.parse(readFileSync(knownPath, 'utf-8'));
  } catch {
    return [];
  }

  const results: Marketplace[] = [];

  for (const [id, entry] of Object.entries(known)) {
    const src = entry.source?.source as unknown as MarketplaceSource | undefined;
    const installLocation = entry.installLocation ?? '';

    let meta: MarketplaceJson = {};
    if (installLocation) {
      const metaPath = join(installLocation, '.claude-plugin', 'marketplace.json');
      if (existsSync(metaPath)) {
        try {
          meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
        } catch { /* empty */ }
      }
    }

    const sourceType =
      src?.source === 'github' ? 'github' : src?.source === 'directory' ? 'directory' : 'unknown';

    results.push({
      id,
      name: meta.name ?? id,
      description: meta.metadata?.description,
      sourceType,
      repo: src?.repo,
      localPath: src?.path,
      installLocation,
      lastUpdated: entry.lastUpdated ?? '',
      pluginCount: Array.isArray(meta.plugins) ? meta.plugins.length : 0,
      owner: meta.owner,
    });
  }

  return results;
}
