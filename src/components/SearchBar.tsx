import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function SearchBar({ value, onChange, onSubmit, onCancel }: Props) {
  return (
    <Box>
      <Text color="yellow">/ </Text>
      <TextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder="type to filter..."
      />
      <Text color="gray">  ESC cancel</Text>
    </Box>
  );
}
