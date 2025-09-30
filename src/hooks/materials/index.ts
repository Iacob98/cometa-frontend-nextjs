// Re-export all query keys and utility functions
export * from '@/lib/query-keys';

// Re-export material CRUD hooks
export * from './use-materials';

// Re-export unified warehouse hooks
export * from './use-unified-warehouse';

// Re-export material consumption hooks
export * from './use-material-consumption';

// Re-export supplier hooks
export * from './use-supplier-materials';

// Re-export allocation hooks
export * from './use-material-allocations';

// Re-export order hooks
export * from './use-material-orders';

// Re-export project operation hooks and types
export * from './use-material-project-operations';

// Re-export useQueryClient for convenience
import { useQueryClient } from '@tanstack/react-query';
export { useQueryClient };