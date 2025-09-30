// Re-export all query keys and utility functions
export * from './query-keys';

// Re-export material CRUD hooks
export * from './use-materials';

// Re-export unified warehouse hooks
export * from './use-unified-warehouse';

// Temporary re-exports from original file until full migration
// This allows gradual migration while keeping the app functional
import { useQueryClient } from '@tanstack/react-query';
export { useQueryClient };

// Re-export everything else from the original file temporarily
export * from '../use-materials';