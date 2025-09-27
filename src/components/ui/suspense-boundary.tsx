/**
 * REACT 19 SUSPENSE BOUNDARY COMPONENTS
 *
 * Optimized Suspense boundaries with error handling and skeleton loading
 * Provides consistent loading UX across the entire application
 */

'use client';

import React, { Suspense, Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  resetOnPropsChange?: boolean;
}

// OPTIMIZATION: Error boundary with automatic retry capability
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    console.error('ErrorBoundary caught an error:', error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.children !== this.props.children && resetOnPropsChange) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleAutoRetry = () => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ hasError: false, error: undefined });
    }, 3000);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 m-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Something went wrong</h3>
          </div>
          <p className="text-red-700 mb-3">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleAutoRetry}
              className="text-red-600 hover:bg-red-50"
            >
              Auto-retry in 3s
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// OPTIMIZATION: Skeleton components for different content types
interface SkeletonProps {
  className?: string;
}

export const ProjectListSkeleton = React.memo<SkeletonProps>(({ className = '' }) => (
  <div className={`space-y-4 ${className}`} data-testid="project-list-skeleton">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    ))}
  </div>
));

ProjectListSkeleton.displayName = 'ProjectListSkeleton';

export const MaterialListSkeleton = React.memo<SkeletonProps>(({ className = '' }) => (
  <div className={`space-y-3 ${className}`} data-testid="material-list-skeleton">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="border rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    ))}
  </div>
));

MaterialListSkeleton.displayName = 'MaterialListSkeleton';

export const DashboardSkeleton = React.memo<SkeletonProps>(({ className = '' }) => (
  <div className={`space-y-6 ${className}`} data-testid="dashboard-skeleton">
    {/* Header stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>

    {/* Chart area */}
    <div className="border rounded-lg p-6">
      <Skeleton className="h-6 w-1/4 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>

    {/* Recent activity */}
    <div className="border rounded-lg p-4">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

DashboardSkeleton.displayName = 'DashboardSkeleton';

export const TableSkeleton = React.memo<SkeletonProps & { rows?: number; columns?: number }>(
  ({ className = '', rows = 5, columns = 4 }) => (
    <div className={`space-y-3 ${className}`} data-testid="table-skeleton">
      {/* Table header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
);

TableSkeleton.displayName = 'TableSkeleton';

// OPTIMIZATION: Suspense wrapper with loading indicator
interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error) => void;
  className?: string;
}

export const SuspenseBoundary = React.memo<SuspenseBoundaryProps>(({
  children,
  fallback,
  errorFallback,
  onError,
  className = ''
}) => (
  <ErrorBoundary fallback={errorFallback} onError={onError} resetOnPropsChange>
    <div className={className}>
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8" data-testid="suspense-loading">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          )
        }
      >
        {children}
      </Suspense>
    </div>
  </ErrorBoundary>
));

SuspenseBoundary.displayName = 'SuspenseBoundary';

// OPTIMIZATION: Page-level Suspense wrapper
interface PageSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

export const PageSuspense = React.memo<PageSuspenseProps>(({
  children,
  fallback,
  title = 'Loading'
}) => (
  <SuspenseBoundary
    fallback={
      fallback || (
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-muted-foreground">Please wait while we load your content...</p>
            </div>
          </div>
        </div>
      )
    }
    errorFallback={
      <div className="container mx-auto py-8">
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Page Load Error</h3>
          </div>
          <p className="text-red-700">
            Unable to load this page. Please refresh or try again later.
          </p>
        </div>
      </div>
    }
  >
    {children}
  </SuspenseBoundary>
));

PageSuspense.displayName = 'PageSuspense';

export default SuspenseBoundary;