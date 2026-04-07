import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { homedir } from 'os';
import { execSync } from 'child_process';
import type { AnyItem, Skill, Agent, Command, Hook, InstalledPlugin, Marketplace, Rule } from '../types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortPath(p: string) {
  return p.replace(homedir(), '~');
}

function itemPath(item: AnyItem): string | null {
  if ('filePath' in item) return (item as { filePath: string }).filePath;
  if ('installPath' in item) return (item as { installPath: string }).installPath;
  if ('installLocation' in item) return (item as { installLocation: string }).installLocation;
  return null;
}

function itemTitle(item: AnyItem): string {
  if ('name' in item) return (item as { name: string }).name;
  if ('event' in item) return `Hook: ${(item as Hook).event}`;
  return item.id;
}

type KindColor = 'green' | 'blue' | 'yellow' | 'red' | 'magenta' | 'cyan' | 'white';

function kindLabel(item: AnyItem): { label: string; color: KindColor } {
  if ('kind' in item) {
    if ((item as { kind: string }).kind === 'skill')   return { label: 'skill',   color: 'green' };
    if ((item as { kind: string }).kind === 'agent')   return { label: 'agent',   color: 'blue' };
    if ((item as { kind: string }).kind === 'command') return { label: 'command', color: 'yellow' };
  }
  if ('event' in item && !('pluginCount' in item) && !('wordCount' in item)) return { label: 'hook',        color: 'red' };
  if ('marketplace' in item && !('pluginCount' in item))                     return { label: 'plugin',      color: 'magenta' };
  if ('pluginCount' in item)                                                  return { label: 'marketplace', color: 'cyan' };
  if ('wordCount' in item)                                                    return { label: 'rule',        color: 'white' };
  return { label: 'item', color: 'white' };
}

// ─── Layout primitives ────────────────────────────────────────────────────────

// A single label + value row. Value truncates if it overflows.
function Field({ label, value, valueColor }: {
  label: string;
  value: string;
  valueColor?: KindColor | 'cyan' | 'yellow';
}) {
  return (
    <Box paddingX={2}>
      <Text color="gray">{label.padEnd(16)}</Text>
      <Text color={valueColor ?? 'white'} wrap="truncate-end">{value}</Text>
    </Box>
  );
}

// A titled group of fields with a dim heading.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box paddingX={2}>
        <Text color="gray" dimColor>{title}</Text>
      </Box>
      {children}
    </Box>
  );
}

// Description block — prominent, wraps naturally.
function Description({ text }: { text: string }) {
  return (
    <Box paddingX={2} marginTop={1}>
      <Text wrap="wrap" color="white">{text}</Text>
    </Box>
  );
}

// A divider that fills the modal width by overflowing and clipping.
function Divider() {
  return (
    <Box paddingX={2} overflow="hidden">
      <Text color="gray">{'─'.repeat(200)}</Text>
    </Box>
  );
}

// ─── Detail bodies ────────────────────────────────────────────────────────────

function SkillBody({ item }: { item: Skill }) {
  return (
    <>
      {item.description && <Description text={item.description} />}
      <Section title="Details">
        <Field label="scope"  value={item.scope} valueColor={item.scope === 'global' ? 'cyan' : 'yellow'} />
        {item.license      && <Field label="license"    value={item.license} />}
        <Field label="path"   value={shortPath(item.filePath)} />
        {item.pluginSource && <Field label="plugin"     value={item.pluginSource} />}
        {item.references && item.references.length > 0 &&
          <Field label="references" value={item.references.join(', ')} />}
      </Section>
    </>
  );
}

function AgentBody({ item }: { item: Agent }) {
  return (
    <>
      {item.description && <Description text={item.description} />}
      <Section title="Details">
        <Field label="scope" value={item.scope} valueColor={item.scope === 'global' ? 'cyan' : 'yellow'} />
        {item.model      && <Field label="model"  value={item.model} />}
        <Field label="path"  value={shortPath(item.filePath)} />
        {item.pluginSource && <Field label="plugin" value={item.pluginSource} />}
      </Section>
    </>
  );
}

function CommandBody({ item }: { item: Command }) {
  const preview = item.body.replace(/^---[\s\S]*?---\n/, '').trim().slice(0, 600);
  return (
    <>
      {item.description && <Description text={item.description} />}
      <Section title="Details">
        <Field label="scope" value={item.scope} valueColor={item.scope === 'global' ? 'cyan' : 'yellow'} />
        <Field label="path"  value={shortPath(item.filePath)} />
        {item.pluginSource && <Field label="plugin" value={item.pluginSource} />}
      </Section>
      <Section title="Preview">
        <Box paddingX={2} marginTop={1}>
          <Text wrap="wrap" color="gray">{preview}</Text>
        </Box>
      </Section>
    </>
  );
}

function HookBody({ item }: { item: Hook }) {
  return (
    <>
      <Section title="Details">
        <Field label="event"   value={item.event}              valueColor="red" />
        <Field label="matcher" value={item.matcher || '(any)'} />
        <Field label="scope"   value={item.scope}              valueColor={item.scope === 'global' ? 'cyan' : 'yellow'} />
      </Section>
      <Section title="Command">
        <Box paddingX={2} marginTop={1}>
          <Text wrap="wrap" color="white">{item.command}</Text>
        </Box>
      </Section>
    </>
  );
}

function PluginBody({ item }: { item: InstalledPlugin }) {
  const statusColor: KindColor = item.blocked ? 'red' : item.enabled ? 'green' : 'yellow';
  const statusLabel = item.blocked ? 'blocked' : item.enabled ? 'enabled' : 'disabled';
  return (
    <>
      {item.description && <Description text={item.description} />}
      <Section title="Details">
        <Field label="version"     value={item.version} />
        <Field label="marketplace" value={item.marketplace} />
        <Field label="status"      value={statusLabel} valueColor={statusColor} />
        {item.author && <Field label="author"  value={item.author.name} />}
        <Field label="installed"   value={new Date(item.installedAt).toLocaleDateString()} />
        {item.lastUpdated && <Field label="updated" value={new Date(item.lastUpdated).toLocaleDateString()} />}
      </Section>
      <Section title="Contents">
        <Field label="skills"   value={String(item.skillCount)} />
        <Field label="agents"   value={String(item.agentCount)} />
        <Field label="commands" value={String(item.commandCount)} />
        <Field label="path"     value={shortPath(item.installPath)} />
      </Section>
    </>
  );
}

function MarketplaceBody({ item }: { item: Marketplace }) {
  return (
    <>
      {item.description && <Description text={item.description} />}
      <Section title="Details">
        <Field label="source"   value={item.sourceType} />
        {item.repo       && <Field label="repo"     value={item.repo} />}
        {item.localPath  && <Field label="local"    value={item.localPath} />}
        <Field label="plugins"  value={String(item.pluginCount)} />
        {item.owner      && <Field label="owner"    value={item.owner.name} />}
        {item.lastUpdated && <Field label="updated" value={new Date(item.lastUpdated).toLocaleDateString()} />}
        <Field label="location" value={shortPath(item.installLocation)} />
      </Section>
    </>
  );
}

function RuleBody({ item }: { item: Rule }) {
  return (
    <>
      <Section title="Details">
        <Field label="scope"    value={item.scope} valueColor={item.scope === 'global' ? 'cyan' : 'yellow'} />
        <Field label="path"     value={shortPath(item.filePath)} />
        <Field label="words"    value={String(item.wordCount)} />
        <Field label="modified" value={new Date(item.lastModified).toLocaleDateString()} />
      </Section>
      <Section title="Preview">
        <Box paddingX={2} marginTop={1}>
          <Text wrap="wrap" color="gray">{item.preview.slice(0, 600)}</Text>
        </Box>
      </Section>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  item: AnyItem;
  onClose: () => void;
}

export function DetailModal({ item, onClose }: Props) {
  const { cols } = useTerminalSize();
  const path = itemPath(item);
  const { label: typeLabel, color: typeColor } = kindLabel(item);
  const title = itemTitle(item);
  const scope = 'scope' in item ? (item as { scope: string }).scope : null;

  // Cap at 88 cols; always leave at least 2 chars margin on each side
  const modalWidth = Math.min(cols, 88);

  useInput((input, key) => {
    if (key.escape || input === 'q') onClose();
    if ((input === 'o' || input === 'f') && path) {
      try { execSync(`open -R "${path}"`, { stdio: 'ignore' }); } catch { /* ignore */ }
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      width={modalWidth}
      overflow="hidden"
      paddingY={1}
    >
      {/* ── Title bar ── */}
      <Box paddingX={2} gap={2} overflow="hidden">
        <Box borderStyle="single" borderColor={typeColor} paddingX={1}>
          <Text color={typeColor} bold>{typeLabel}</Text>
        </Box>
        <Text bold color="white">{title}</Text>
        {scope && (
          <Text color={scope === 'global' ? 'cyan' : 'yellow'} dimColor>
            [{scope}]
          </Text>
        )}
      </Box>

      {/* ── Divider ── */}
      <Box marginTop={1}>
        <Divider />
      </Box>

      {/* ── Body ── */}
      {'kind' in item && item.kind === 'skill'   && <SkillBody   item={item as Skill} />}
      {'kind' in item && item.kind === 'agent'   && <AgentBody   item={item as Agent} />}
      {'kind' in item && item.kind === 'command' && <CommandBody item={item as Command} />}
      {'event' in item && !('kind' in item) && !('pluginCount' in item) && !('wordCount' in item) && (
        <HookBody item={item as Hook} />
      )}
      {'marketplace' in item && !('pluginCount' in item) && <PluginBody       item={item as InstalledPlugin} />}
      {'pluginCount' in item                             && <MarketplaceBody  item={item as Marketplace} />}
      {'wordCount' in item                               && <RuleBody         item={item as Rule} />}

      {/* ── Actions ── */}
      <Box marginTop={1}>
        <Divider />
      </Box>
      <Box paddingX={2} marginTop={1} gap={3}>
        <Box borderStyle="single" borderColor="gray" paddingX={2}>
          <Text><Text color="yellow" bold>Esc</Text><Text color="gray"> close</Text></Text>
        </Box>
        {path && (
          <Box borderStyle="single" borderColor="gray" paddingX={2}>
            <Text><Text color="yellow" bold>o</Text><Text color="gray"> show in Finder</Text></Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
