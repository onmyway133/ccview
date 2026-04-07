import React from 'react';
import { Box, Text } from 'ink';
import type { ScopeFilter } from '../types.js';

interface Props {
  searchActive: boolean;
  scopeFilter: ScopeFilter;
  modalOpen?: boolean;
}

function Key({ k, label }: { k: string; label: string }) {
  return (
    <Text color="gray">
      <Text color="white" bold>{k}</Text>:{label}
    </Text>
  );
}

export function StatusBar({ searchActive, modalOpen }: Props) {
  if (modalOpen) {
    return (
      <Box paddingX={1} gap={3}>
        <Key k="Esc" label="close" />
        <Key k="o" label="show in Finder" />
      </Box>
    );
  }

  if (searchActive) {
    return (
      <Box paddingX={1} gap={3}>
        <Text color="gray">Type to filter</Text>
        <Key k="Esc" label="cancel" />
        <Key k="↵" label="confirm" />
      </Box>
    );
  }

  return (
    <Box paddingX={1} gap={3}>
      <Key k="Tab" label="switch panel" />
      <Key k="j/k" label="navigate" />
      <Key k="/" label="search" />
      <Key k="g" label="scope" />
      <Key k="↵" label="detail" />
      <Key k="q" label="quit" />
    </Box>
  );
}
