import React from 'react';
import { Box, Text } from 'ink';
import { homedir } from 'os';
import type { AnyItem, Skill, Agent, Command, Hook, InstalledPlugin, Marketplace, Rule } from '../types.js';

function shortPath(p: string) {
  return p.replace(homedir(), '~');
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text color="gray">{label.padEnd(14)}</Text>
      <Text wrap="truncate-end">{value}</Text>
    </Box>
  );
}

function SkillDetail({ item }: { item: Skill }) {
  return (
    <>
      <Text bold>{item.name}</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      {item.description && <Text wrap="wrap">{item.description}</Text>}
      {item.license && <Row label="license" value={item.license} />}
      <Row label="path" value={shortPath(item.filePath)} />
      {item.pluginSource && <Row label="from plugin" value={item.pluginSource} />}
      {item.references && item.references.length > 0 && (
        <Row label="references" value={item.references.join(', ')} />
      )}
    </>
  );
}

function AgentDetail({ item }: { item: Agent }) {
  return (
    <>
      <Text bold>{item.name}</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      {item.description && <Text wrap="wrap">{item.description}</Text>}
      {item.model && <Row label="model" value={item.model} />}
      <Row label="path" value={shortPath(item.filePath)} />
      {item.pluginSource && <Row label="from plugin" value={item.pluginSource} />}
    </>
  );
}

function CommandDetail({ item }: { item: Command }) {
  const preview = item.body.slice(0, 300);
  return (
    <>
      <Text bold>{item.name}</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      {item.description && <Text wrap="wrap">{item.description}</Text>}
      <Row label="path" value={shortPath(item.filePath)} />
      {item.pluginSource && <Row label="from plugin" value={item.pluginSource} />}
      <Text color="gray">preview:</Text>
      <Text wrap="wrap" color="gray">{preview}</Text>
    </>
  );
}

function HookDetail({ item }: { item: Hook }) {
  return (
    <>
      <Text bold>Hook: {item.event}</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      <Row label="event" value={item.event} />
      <Row label="matcher" value={item.matcher || '(any)'} />
      <Row label="command" value={item.command} />
      <Row label="scope" value={item.scope} />
    </>
  );
}

function PluginDetail({ item }: { item: InstalledPlugin }) {
  const status = item.blocked ? '⛔ blocked' : item.enabled ? '✓ enabled' : '○ disabled';
  return (
    <>
      <Text bold>{item.name}</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      {item.description && <Text wrap="wrap">{item.description}</Text>}
      <Row label="version" value={item.version} />
      <Row label="marketplace" value={item.marketplace} />
      <Row label="status" value={status} />
      <Row label="skills" value={String(item.skillCount)} />
      <Row label="agents" value={String(item.agentCount)} />
      <Row label="commands" value={String(item.commandCount)} />
      {item.author && <Row label="author" value={item.author.name} />}
      <Row label="installed" value={new Date(item.installedAt).toLocaleDateString()} />
    </>
  );
}

function MarketplaceDetail({ item }: { item: Marketplace }) {
  return (
    <>
      <Text bold>{item.name}</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      {item.description && <Text wrap="wrap">{item.description}</Text>}
      <Row label="source" value={item.sourceType} />
      {item.repo && <Row label="repo" value={item.repo} />}
      {item.localPath && <Row label="local path" value={item.localPath} />}
      <Row label="plugins" value={String(item.pluginCount)} />
      {item.owner && <Row label="owner" value={item.owner.name} />}
      {item.lastUpdated && <Row label="updated" value={new Date(item.lastUpdated).toLocaleDateString()} />}
    </>
  );
}

function RuleDetail({ item }: { item: Rule }) {
  return (
    <>
      <Text bold>CLAUDE.md</Text>
      <Text color="gray">{'─'.repeat(50)}</Text>
      <Row label="path" value={shortPath(item.filePath)} />
      <Row label="words" value={String(item.wordCount)} />
      <Row label="modified" value={new Date(item.lastModified).toLocaleDateString()} />
      <Text color="gray">preview:</Text>
      <Text wrap="wrap" color="gray">{item.preview.slice(0, 200)}</Text>
    </>
  );
}

export function DetailPanel({ item }: { item: AnyItem | null }) {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      minHeight={8}
      flexDirection="column"
    >
      {!item ? (
        <Text color="gray">  Select an item to see details</Text>
      ) : (
        <>
          {'kind' in item && item.kind === 'skill' && <SkillDetail item={item as Skill} />}
          {'kind' in item && item.kind === 'agent' && <AgentDetail item={item as Agent} />}
          {'kind' in item && item.kind === 'command' && <CommandDetail item={item as Command} />}
          {'event' in item && !('kind' in item) && !('marketplace' in item) && !('pluginCount' in item) && !('wordCount' in item) && (
            <HookDetail item={item as Hook} />
          )}
          {'marketplace' in item && !('pluginCount' in item) && <PluginDetail item={item as InstalledPlugin} />}
          {'pluginCount' in item && <MarketplaceDetail item={item as Marketplace} />}
          {'wordCount' in item && <RuleDetail item={item as Rule} />}
        </>
      )}
    </Box>
  );
}
