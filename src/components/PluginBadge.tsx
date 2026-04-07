import React from 'react';
import { Text } from 'ink';

export function PluginBadge({ name }: { name: string }) {
  const short = name.length > 16 ? name.slice(0, 14) + '..' : name;
  return <Text color="magenta">[{short}]</Text>;
}
