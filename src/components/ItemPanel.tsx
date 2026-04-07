import React from 'react';
import { Box, Text } from 'ink';
import type { AnyItem, CategoryKind } from '../types.js';
import { ScopeBadge } from './ScopeBadge.js';
import { PluginBadge } from './PluginBadge.js';
import { SearchBar } from './SearchBar.js';

interface Props {
  items: AnyItem[];
  selectedIndex: number;
  active: boolean;
  category: CategoryKind;
  searchActive: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  onSearchCancel: () => void;
  visibleCount: number;
  height: number;
}

function itemName(item: AnyItem): string {
  if ('name' in item) return (item as { name: string }).name;
  return item.id;
}

function itemScope(item: AnyItem): 'global' | 'project' | null {
  if ('scope' in item) return (item as { scope: 'global' | 'project' }).scope;
  return null;
}

function itemPlugin(item: AnyItem): string | undefined {
  if ('pluginSource' in item) return (item as { pluginSource?: string }).pluginSource;
  return undefined;
}

const CATEGORY_LABELS: Record<CategoryKind, string> = {
  skills: 'SKILLS',
  agents: 'AGENTS',
  commands: 'COMMANDS',
  hooks: 'HOOKS',
  plugins: 'PLUGINS',
  marketplaces: 'MARKETPLACES',
  rules: 'RULES',
};

export function ItemPanel({
  items,
  selectedIndex,
  active,
  category,
  searchActive,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchCancel,
  visibleCount,
  height,
}: Props) {
  // Keep selected item centered in the visible window.
  // visibleCount already accounts for all fixed rows (borders, title, spacer, scroll indicator).
  const scrollOffset = Math.max(
    0,
    Math.min(
      selectedIndex - Math.floor(visibleCount / 2),
      Math.max(0, items.length - visibleCount)
    )
  );
  const visible = items.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      height={height}
      borderStyle="single"
      borderColor={active ? 'white' : 'gray'}
      paddingX={1}
      overflow="hidden"
    >
      {/* Header row: title + search hint */}
      <Box justifyContent="space-between">
        <Text bold color={active ? 'white' : 'gray'}>
          {' '}{CATEGORY_LABELS[category]} ({items.length})
        </Text>
        {!searchActive && (
          <Text color="gray"> /search </Text>
        )}
      </Box>

      {/* Search bar (shown when active) */}
      {searchActive ? (
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          onCancel={onSearchCancel}
        />
      ) : (
        <Text> </Text>
      )}

      {items.length === 0 && (
        <Text color="gray">  (none)</Text>
      )}

      {visible.map((item, visIdx) => {
        const realIdx = visIdx + scrollOffset;
        const isSelected = realIdx === selectedIndex;
        const name = itemName(item);
        const displayName = name.length > 30 ? name.slice(0, 28) + '..' : name;
        const scope = itemScope(item);
        const plugin = itemPlugin(item);

        return (
          <Box key={`${item.id}-${realIdx}`}>
            <Text
              color={isSelected ? 'black' : active ? 'white' : 'gray'}
              backgroundColor={isSelected ? 'blue' : undefined}
              bold={isSelected}
            >
              {isSelected ? '▶ ' : '  '}{displayName.padEnd(31)}
            </Text>
            {scope && <Text> </Text>}
            {scope && <ScopeBadge scope={scope} />}
            {plugin && <Text> </Text>}
            {plugin && <PluginBadge name={plugin} />}
          </Box>
        );
      })}

      {/* Scroll indicator */}
      {items.length > visibleCount && (
        <Text color="gray">
          {' '}↑↓ {scrollOffset + 1}–{Math.min(scrollOffset + visibleCount, items.length)}/{items.length}
        </Text>
      )}
    </Box>
  );
}
