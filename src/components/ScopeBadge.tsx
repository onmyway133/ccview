import React from 'react';
import { Text } from 'ink';
import type { Scope } from '../types.js';

export function ScopeBadge({ scope }: { scope: Scope }) {
  return (
    <Text color={scope === 'global' ? 'cyan' : 'yellow'}>[{scope}]</Text>
  );
}
