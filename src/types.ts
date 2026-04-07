export type Scope = 'global' | 'project';

export type CategoryKind =
  | 'skills'
  | 'agents'
  | 'commands'
  | 'hooks'
  | 'plugins'
  | 'marketplaces'
  | 'rules';

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  scope: Scope;
  filePath: string;
  pluginSource?: string;
}

export interface Skill extends BaseItem {
  kind: 'skill';
  license?: string;
  references?: string[];
}

export interface Agent extends BaseItem {
  kind: 'agent';
  model?: string;
}

export interface Command extends BaseItem {
  kind: 'command';
  body: string;
}

export interface Hook {
  id: string;
  event: string;
  matcher: string;
  command: string;
  scope: Scope;
}

export interface InstalledPlugin {
  id: string;
  name: string;
  marketplace: string;
  description: string;
  version: string;
  scope: Scope;
  installPath: string;
  installedAt: string;
  lastUpdated?: string;
  enabled: boolean;
  blocked: boolean;
  author?: { name: string; email?: string };
  skillCount: number;
  agentCount: number;
  commandCount: number;
}

export interface Marketplace {
  id: string;
  name: string;
  description?: string;
  sourceType: 'github' | 'directory' | 'unknown';
  repo?: string;
  localPath?: string;
  installLocation: string;
  lastUpdated: string;
  pluginCount: number;
  owner?: { name: string; email?: string };
}

export interface Rule {
  id: string;
  scope: Scope;
  filePath: string;
  preview: string;
  wordCount: number;
  lastModified: string;
}

export type AnyItem = Skill | Agent | Command | Hook | InstalledPlugin | Marketplace | Rule;

export interface Category {
  kind: CategoryKind;
  label: string;
  count: number;
}

export interface AppData {
  skills: Skill[];
  agents: Agent[];
  commands: Command[];
  hooks: Hook[];
  plugins: InstalledPlugin[];
  marketplaces: Marketplace[];
  rules: Rule[];
  projectRoot?: string;
}

export type ScopeFilter = 'all' | 'global' | 'project';
export type ActivePanel = 'categories' | 'items';
