/**
 * VIRTUALIZED LIST COMPONENT
 *
 * React Performance Optimization:
 * 1. react-window для виртуализации больших списков
 * 2. FixedSizeList и VariableSizeList для разных типов контента
 * 3. React.memo для предотвращения лишних рендеров
 * 4. useCallback для стабильности функций
 */

'use client';

import React, { useMemo, useCallback, forwardRef } from 'react';
import { FixedSizeList as List, VariableSizeList, ListChildComponentProps } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export interface VirtualizedListItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface VirtualizedListProps {
  items: VirtualizedListItem[];
  height: number;
  itemHeight?: number;
  onItemClick?: (item: VirtualizedListItem) => void;
  onItemSelect?: (item: VirtualizedListItem, selected: boolean) => void;
  selectedIds?: Set<string>;
  searchable?: boolean;
  searchPlaceholder?: string;
  renderCustomItem?: (item: VirtualizedListItem, index: number) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

// OPTIMIZATION: Memoized list item component
const VirtualizedListItem = React.memo<{
  item: VirtualizedListItem;
  index: number;
  onItemClick?: (item: VirtualizedListItem) => void;
  onItemSelect?: (item: VirtualizedListItem, selected: boolean) => void;
  selected?: boolean;
  renderCustomItem?: (item: VirtualizedListItem, index: number) => React.ReactNode;
}>(({ item, index, onItemClick, onItemSelect, selected = false, renderCustomItem }) => {
  // OPTIMIZATION: useCallback to prevent function recreation
  const handleClick = useCallback(() => {
    onItemClick?.(item);
  }, [item, onItemClick]);

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onItemSelect?.(item, e.target.checked);
  }, [item, onItemSelect]);

  // Custom rendering if provided
  if (renderCustomItem) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        {renderCustomItem(item, index)}
      </div>
    );
  }

  // Default rendering
  return (
    <Card className={`m-2 transition-colors hover:bg-gray-50 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4" onClick={handleClick}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {onItemSelect && (
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={handleSelectChange}
                  className="mr-2"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>

            {item.subtitle && (
              <p className="text-sm text-gray-600 truncate mt-1">{item.subtitle}</p>
            )}

            {item.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
            )}

            <div className="flex items-center mt-2 space-x-2">
              {item.status && (
                <Badge variant={
                  item.status === 'active' ? 'default' :
                  item.status === 'pending' ? 'secondary' :
                  item.status === 'completed' ? 'outline' : 'destructive'
                }>
                  {item.status}
                </Badge>
              )}

              {item.metadata?.priority && (
                <Badge variant="outline">
                  Priority: {item.metadata.priority}
                </Badge>
              )}
            </div>
          </div>

          {item.metadata?.actions && (
            <div className="flex space-x-1 ml-4">
              {item.metadata.actions.map((action: any, actionIndex: number) => (
                <Button
                  key={actionIndex}
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(item);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

VirtualizedListItem.displayName = 'VirtualizedListItem';

// OPTIMIZATION: Memoized row renderer for react-window
const createRowRenderer = (
  items: VirtualizedListItem[],
  onItemClick?: (item: VirtualizedListItem) => void,
  onItemSelect?: (item: VirtualizedListItem, selected: boolean) => void,
  selectedIds?: Set<string>,
  renderCustomItem?: (item: VirtualizedListItem, index: number) => React.ReactNode
) => {
  return React.memo<ListChildComponentProps>(({ index, style }) => {
    const item = items[index];
    const selected = selectedIds?.has(item.id) || false;

    return (
      <div style={style}>
        <VirtualizedListItem
          item={item}
          index={index}
          onItemClick={onItemClick}
          onItemSelect={onItemSelect}
          selected={selected}
          renderCustomItem={renderCustomItem}
        />
      </div>
    );
  });
};

// OPTIMIZATION: Memoized loading skeleton
const VirtualizedListSkeleton = React.memo<{ height: number; itemCount?: number }>(({ height, itemCount = 10 }) => (
  <div style={{ height }} className="space-y-2 p-2">
    {Array.from({ length: itemCount }, (_, i) => (
      <Card key={i} className="m-2">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-2" />
          <Skeleton className="h-3 w-full mb-2" />
          <div className="flex space-x-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
));

VirtualizedListSkeleton.displayName = 'VirtualizedListSkeleton';

// OPTIMIZATION: Main virtualized list component with React.memo
export const VirtualizedList = React.memo<VirtualizedListProps>(({
  items,
  height,
  itemHeight = 120,
  onItemClick,
  onItemSelect,
  selectedIds,
  searchable = false,
  searchPlaceholder = 'Search items...',
  renderCustomItem,
  emptyMessage = 'No items found',
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  // OPTIMIZATION: Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    return items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // OPTIMIZATION: Memoized search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // OPTIMIZATION: Memoized row renderer
  const RowRenderer = useMemo(() =>
    createRowRenderer(filteredItems, onItemClick, onItemSelect, selectedIds, renderCustomItem),
    [filteredItems, onItemClick, onItemSelect, selectedIds, renderCustomItem]
  );

  // Show loading skeleton
  if (loading) {
    return <VirtualizedListSkeleton height={height} />;
  }

  return (
    <div className={`virtualized-list-container ${className}`}>
      {searchable && (
        <div className="p-4 border-b">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredItems.length} of {items.length} items
            </p>
          )}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: height - (searchable ? 80 : 0) }}>
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">{emptyMessage}</p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            )}
          </div>
        </div>
      ) : (
        <List
          height={height - (searchable ? 80 : 0)}
          itemCount={filteredItems.length}
          itemSize={itemHeight}
          className="virtualized-list"
        >
          {RowRenderer}
        </List>
      )}
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// OPTIMIZATION: Variable size list for items with different heights
export const VariableSizeVirtualizedList = React.memo<VirtualizedListProps & {
  getItemHeight: (index: number) => number;
}>(({
  items,
  height,
  getItemHeight,
  onItemClick,
  onItemSelect,
  selectedIds,
  searchable = false,
  searchPlaceholder = 'Search items...',
  renderCustomItem,
  emptyMessage = 'No items found',
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const listRef = React.useRef<VariableSizeList>(null);

  // OPTIMIZATION: Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    return items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // OPTIMIZATION: Memoized search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset scroll position when search changes
    listRef.current?.scrollToItem(0);
  }, []);

  // OPTIMIZATION: Memoized row renderer
  const RowRenderer = useMemo(() =>
    createRowRenderer(filteredItems, onItemClick, onItemSelect, selectedIds, renderCustomItem),
    [filteredItems, onItemClick, onItemSelect, selectedIds, renderCustomItem]
  );

  // Show loading skeleton
  if (loading) {
    return <VirtualizedListSkeleton height={height} />;
  }

  return (
    <div className={`virtualized-list-container ${className}`}>
      {searchable && (
        <div className="p-4 border-b">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredItems.length} of {items.length} items
            </p>
          )}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: height - (searchable ? 80 : 0) }}>
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">{emptyMessage}</p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            )}
          </div>
        </div>
      ) : (
        <VariableSizeList
          ref={listRef}
          height={height - (searchable ? 80 : 0)}
          itemCount={filteredItems.length}
          itemSize={getItemHeight}
          className="virtualized-list"
        >
          {RowRenderer}
        </VariableSizeList>
      )}
    </div>
  );
});

VariableSizeVirtualizedList.displayName = 'VariableSizeVirtualizedList';

export default VirtualizedList;