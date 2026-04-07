import React, { useState, useMemo, useEffect } from 'react';
import { useInput } from 'ink';
import type {
  AppData,
  AnyItem,
  Category,
  CategoryKind,
  ScopeFilter,
  ActivePanel,
} from './types.js';
import { Layout } from './components/Layout.js';
import { DetailModal } from './components/DetailModal.js';
import { useMouseScroll } from './hooks/useMouseScroll.js';

const CATEGORY_ORDER: CategoryKind[] = [
  'skills', 'agents', 'commands', 'hooks', 'plugins', 'marketplaces', 'rules',
];

function getItemsForCategory(data: AppData, kind: CategoryKind): AnyItem[] {
  switch (kind) {
    case 'skills': return data.skills as AnyItem[];
    case 'agents': return data.agents as AnyItem[];
    case 'commands': return data.commands as AnyItem[];
    case 'hooks': return data.hooks as AnyItem[];
    case 'plugins': return data.plugins as AnyItem[];
    case 'marketplaces': return data.marketplaces as AnyItem[];
    case 'rules': return data.rules as AnyItem[];
  }
}

function filterByScope(items: AnyItem[], scope: ScopeFilter): AnyItem[] {
  if (scope === 'all') return items;
  return items.filter(item => 'scope' in item && (item as { scope: string }).scope === scope);
}

function filterByQuery(items: AnyItem[], query: string): AnyItem[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item => {
    const name = 'name' in item ? (item as { name: string }).name : item.id;
    const desc = typeof (item as { description?: string }).description === 'string'
      ? (item as { description: string }).description
      : '';
    return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });
}

interface Props {
  data: AppData;
}

export default function App({ data }: Props) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('categories');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [modalItem, setModalItem] = useState<AnyItem | null>(null);

  const selectedCategory = CATEGORY_ORDER[selectedCategoryIndex];

  const allItems = useMemo(
    () => getItemsForCategory(data, selectedCategory),
    [data, selectedCategory]
  );

  const filteredItems = useMemo(() => {
    const scoped = filterByScope(allItems, scopeFilter);
    return filterByQuery(scoped, searchQuery);
  }, [allItems, scopeFilter, searchQuery]);

  // Reset item selection when category or filter changes
  useEffect(() => {
    setSelectedItemIndex(0);
  }, [selectedCategory, scopeFilter, searchQuery]);

  const categories: Category[] = CATEGORY_ORDER.map(kind => ({
    kind,
    label: kind,
    count: filterByScope(getItemsForCategory(data, kind), scopeFilter).length,
  }));

  const selectedItem: AnyItem | null = filteredItems[selectedItemIndex] ?? null;

  // Mouse/trackpad scroll — always scrolls the items panel
  useMouseScroll((direction) => {
    if (modalItem) return;
    const delta = direction === 'down' ? 1 : -1;
    setSelectedItemIndex(i =>
      Math.max(0, Math.min(i + delta, filteredItems.length - 1))
    );
  });

  useInput((input, key) => {
    // Modal open: only handle close / Finder
    if (modalItem) {
      if (key.escape || input === 'q') setModalItem(null);
      return;
    }

    // Search active: Escape cancels
    if (key.escape && searchActive) {
      setSearchActive(false);
      setSearchQuery('');
      return;
    }
    if (searchActive) return;

    if (input === 'q' || (key.ctrl && input === 'c')) {
      process.exit(0);
    }

    if (key.tab || key.rightArrow) {
      setActivePanel(p => p === 'categories' ? 'items' : 'categories');
      return;
    }

    if (key.leftArrow) {
      setActivePanel(p => p === 'items' ? 'categories' : 'items');
      return;
    }

    if (input === 'g') {
      setScopeFilter(s => s === 'all' ? 'global' : s === 'global' ? 'project' : 'all');
      return;
    }

    if (input === '/') {
      setSearchActive(true);
      setActivePanel('items');
      return;
    }

    if (activePanel === 'categories') {
      if (input === 'j' || key.downArrow) {
        setSelectedCategoryIndex(i => Math.min(i + 1, CATEGORY_ORDER.length - 1));
      } else if (input === 'k' || key.upArrow) {
        setSelectedCategoryIndex(i => Math.max(i - 1, 0));
      } else if (key.return) {
        setActivePanel('items');
      }
    } else {
      if (input === 'j' || key.downArrow) {
        setSelectedItemIndex(i => Math.min(i + 1, filteredItems.length - 1));
      } else if (input === 'k' || key.upArrow) {
        setSelectedItemIndex(i => Math.max(i - 1, 0));
      } else if (key.return && selectedItem) {
        setModalItem(selectedItem);
      }
    }
  });

  if (modalItem) {
    return (
      <DetailModal
        item={modalItem}
        onClose={() => setModalItem(null)}
      />
    );
  }

  return (
    <Layout
      categories={categories}
      selectedCategoryIndex={selectedCategoryIndex}
      items={filteredItems}
      selectedItemIndex={selectedItemIndex}
      activePanel={activePanel}
      category={selectedCategory}
      searchActive={searchActive}
      searchQuery={searchQuery}
      scopeFilter={scopeFilter}
      projectRoot={data.projectRoot}
      onSearchChange={setSearchQuery}
      onSearchSubmit={() => setSearchActive(false)}
      onSearchCancel={() => { setSearchActive(false); setSearchQuery(''); }}
    />
  );
}
