import React from 'react';
import { Box, Text } from 'ink';
import type { AnyItem, Category, CategoryKind, ScopeFilter } from '../types.js';
import { CategoryPanel } from './CategoryPanel.js';
import { ItemPanel } from './ItemPanel.js';
import { StatusBar } from './StatusBar.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface Props {
  categories: Category[];
  selectedCategoryIndex: number;
  items: AnyItem[];
  selectedItemIndex: number;
  activePanel: 'categories' | 'items';
  category: CategoryKind;
  searchActive: boolean;
  searchQuery: string;
  scopeFilter: ScopeFilter;
  projectRoot?: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  onSearchCancel: () => void;
}

export function Layout({
  categories,
  selectedCategoryIndex,
  items,
  selectedItemIndex,
  activePanel,
  category,
  searchActive,
  searchQuery,
  scopeFilter,
  projectRoot,
  onSearchChange,
  onSearchSubmit,
  onSearchCancel,
}: Props) {
  const { cols, rows } = useTerminalSize();

  // Layout heights: header(1) + panels + statusbar(1)
  const panelHeight = Math.max(12, rows - 2);
  // Rows consumed by fixed panel chrome:
  //   borders(2) + title(1) + spacer-or-search(1) + scroll-indicator(1) = 5
  const visibleCount = Math.max(4, panelHeight - 5);

  const scopeLabel = scopeFilter === 'all' ? 'all' : scopeFilter;
  const projectName = projectRoot ? projectRoot.split('/').filter(Boolean).pop() : null;

  return (
    <Box flexDirection="column" width={cols}>
      {/* Header */}
      <Box paddingX={1}>
        <Text bold color="cyan">ccview </Text>
        <Text color="gray">Claude Code Browser  </Text>
        {projectName && <Text color="gray">· {projectName}  </Text>}
        <Text color={scopeFilter === 'all' ? 'gray' : 'yellow'}>scope: {scopeLabel}</Text>
      </Box>

      {/* Main panels */}
      <Box flexDirection="row" height={panelHeight}>
        <CategoryPanel
          categories={categories}
          selectedIndex={selectedCategoryIndex}
          active={activePanel === 'categories'}
          height={panelHeight}
        />
        <ItemPanel
          items={items}
          selectedIndex={selectedItemIndex}
          active={activePanel === 'items'}
          category={category}
          searchActive={searchActive}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onSearchCancel={onSearchCancel}
          visibleCount={visibleCount}
          height={panelHeight}
        />
      </Box>

      {/* Status bar */}
      <StatusBar searchActive={searchActive} scopeFilter={scopeFilter} />
    </Box>
  );
}
