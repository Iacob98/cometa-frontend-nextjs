/**
 * LAZY LOADING UTILITIES
 *
 * React.lazy enhanced utilities with prefetching and error handling
 * Optimized for Next.js applications with code splitting
 */

'use client';

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  className?: string;
}

interface LazyComponentOptions {
  fallback?: ReactNode;
  errorBoundary?: boolean;
  prefetchDelay?: number;
}

// OPTIMIZATION: Enhanced error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode; onRetry: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Lazy component failed to load:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 m-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-red-800 mb-2">Failed to Load Component</h3>
          <p className="text-red-700 mb-4">
            {this.state.error?.message || 'The component could not be loaded. This might be due to a network issue.'}
          </p>
          <Button
            variant="outline"
            onClick={this.handleRetry}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// OPTIMIZATION: Default loading fallbacks
export const LoadingSpinner = React.memo<{ message?: string }>(({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8" data-testid="lazy-loading">
    <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
    <span className="text-muted-foreground">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export const LoadingCard = React.memo<{ title?: string; className?: string }>(
  ({ title = 'Loading Component', className = '' }) => (
    <div className={`border rounded-lg p-6 ${className}`} data-testid="lazy-loading-card">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  )
);

LoadingCard.displayName = 'LoadingCard';

export const LoadingPage = React.memo<{ title?: string }>(({ title = 'Loading Page' }) => (
  <div className="min-h-screen flex items-center justify-center" data-testid="lazy-loading-page">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-muted-foreground">Please wait while we load your content...</p>
    </div>
  </div>
));

LoadingPage.displayName = 'LoadingPage';

// OPTIMIZATION: Prefetch cache to avoid duplicate requests
const prefetchCache = new Set<string>();

// OPTIMIZATION: Prefetch utility with caching
export const prefetchComponent = async (importFn: () => Promise<any>, cacheKey?: string): Promise<void> => {
  const key = cacheKey || importFn.toString();

  if (prefetchCache.has(key)) {
    return;
  }

  try {
    prefetchCache.add(key);
    await importFn();
  } catch (error) {
    prefetchCache.delete(key);
    console.warn('Failed to prefetch component:', error);
  }
};

// OPTIMIZATION: Enhanced lazy component wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);

  const WrappedComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const [retryCount, setRetryCount] = React.useState(0);

    const handleRetry = React.useCallback(() => {
      setRetryCount(prev => prev + 1);
    }, []);

    const fallback = options.fallback || <LoadingSpinner />;

    const content = (
      <Suspense fallback={fallback}>
        <LazyComponent key={retryCount} {...props} ref={ref} />
      </Suspense>
    );

    if (options.errorBoundary !== false) {
      return (
        <LazyErrorBoundary onRetry={handleRetry}>
          {content}
        </LazyErrorBoundary>
      );
    }

    return content;
  });

  WrappedComponent.displayName = `LazyWrapper(${LazyComponent.displayName || 'Component'})`;

  return WrappedComponent;
}

// OPTIMIZATION: Lazy wrapper component
export const LazyWrapper = React.memo<LazyWrapperProps>(({
  children,
  fallback = <LoadingSpinner />,
  errorFallback,
  className = ''
}) => {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  return (
    <div className={className}>
      <LazyErrorBoundary
        fallback={errorFallback}
        onRetry={handleRetry}
      >
        <Suspense fallback={fallback}>
          <div key={retryKey}>{children}</div>
        </Suspense>
      </LazyErrorBoundary>
    </div>
  );
});

LazyWrapper.displayName = 'LazyWrapper';

// OPTIMIZATION: Hook for prefetch on hover/intersection
export function usePrefetch(importFn: () => Promise<any>, enabled: boolean = true) {
  const prefetched = React.useRef(false);

  const prefetch = React.useCallback(() => {
    if (!enabled || prefetched.current) return;

    prefetched.current = true;
    prefetchComponent(importFn).catch(() => {
      prefetched.current = false;
    });
  }, [importFn, enabled]);

  const handleMouseEnter = React.useCallback(() => {
    prefetch();
  }, [prefetch]);

  const handleIntersection = React.useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting) {
      prefetch();
    }
  }, [prefetch]);

  return {
    prefetch,
    onMouseEnter: handleMouseEnter,
    onIntersection: handleIntersection,
    isPrefetched: prefetched.current,
  };
}

// OPTIMIZATION: Route-based lazy loading utility
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = createLazyComponent(importFn, {
    fallback: fallback || <LoadingPage />,
    errorBoundary: true,
  });

  return LazyComponent;
}

// OPTIMIZATION: Tab/Modal lazy loading utility
export function createLazyModal<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = createLazyComponent(importFn, {
    fallback: fallback || <LoadingCard title="Loading Modal" />,
    errorBoundary: true,
  });

  return LazyComponent;
}

// OPTIMIZATION: Prefetch multiple components utility
export function useBatchPrefetch(importFunctions: Record<string, () => Promise<any>>) {
  const prefetchedKeys = React.useRef(new Set<string>());

  const prefetchBatch = React.useCallback((keys: string[]) => {
    keys.forEach(key => {
      if (!prefetchedKeys.current.has(key) && importFunctions[key]) {
        prefetchedKeys.current.add(key);
        prefetchComponent(importFunctions[key], key).catch(() => {
          prefetchedKeys.current.delete(key);
        });
      }
    });
  }, [importFunctions]);

  const prefetchAll = React.useCallback(() => {
    prefetchBatch(Object.keys(importFunctions));
  }, [importFunctions, prefetchBatch]);

  return {
    prefetchBatch,
    prefetchAll,
    isPrefetched: (key: string) => prefetchedKeys.current.has(key),
    getPrefetchedKeys: () => Array.from(prefetchedKeys.current),
  };
}

export type { LazyWrapperProps, LazyComponentOptions };