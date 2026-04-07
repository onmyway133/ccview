import React from 'react';
import { Box, Text } from 'ink';
import type { Category, ScopeFilter } from '../types.js';

interface Props {
  categories: Category[];
  selectedIndex: number;
  active: boolean;
  height: number;
  scopeFilter?: ScopeFilter;
}

const LABELS: Record<string, string> = {
  skills: 'Skills',
  agents: 'Agents',
  commands: 'Commands',
  hooks: 'Hooks',
  plugins: 'Plugins',
  marketplaces: 'Marketplaces',
  rules: 'Rules',
};

export function CategoryPanel({ categories, selectedIndex, active, height }: Props) {
  return (
    <Box
      flexDirection="column"
      width={22}
      height={height}
      borderStyle="single"
      borderColor={active ? 'white' : 'gray'}
      paddingX={1}
      overflow="hidden"
    >
      <Text bold color={active ? 'white' : 'gray'}> CATEGORIES</Text>
      <Text> </Text>
      {categories.map((cat, i) => {
        const isSelected = i === selectedIndex;
        const label = LABELS[cat.kind] ?? cat.kind;
        const count = String(cat.count).padStart(3);
        return (
          <Box key={cat.kind}>
            <Text
              color={isSelected ? 'black' : active ? 'white' : 'gray'}
              backgroundColor={isSelected ? 'blue' : undefined}
              bold={isSelected}
            >
              {isSelected ? '▶ ' : '  '}{label.padEnd(12)}{count}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
