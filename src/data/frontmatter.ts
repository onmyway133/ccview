import matter from 'gray-matter';
import { readFileSync } from 'fs';

export function parseFrontmatter<T extends Record<string, unknown>>(
  filePath: string
): { data: T; content: string } {
  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { data: data as T, content: content.trim() };
}
