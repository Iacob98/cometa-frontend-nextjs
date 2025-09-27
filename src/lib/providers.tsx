"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { WebSocketProvider } from "@/lib/websocket-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // OPTIMIZATION: Enhanced cache configuration for better performance
            staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better UX
            gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (v5 API)
            refetchOnWindowFocus: false, // Prevent unnecessary refetches on window focus
            refetchOnMount: true, // Ensure fresh data on mount
            refetchOnReconnect: true, // Refetch when network reconnects

            // OPTIMIZATION: Smart retry strategy based on error type
            retry: (failureCount, error) => {
              // Don't retry on 4xx client errors (except 408 timeout)
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) {
                  return status === 408; // Only retry timeouts
                }
                // Don't retry on 5xx for critical operations (auth, payments)
                if (status >= 500 && status < 600) {
                  return failureCount < 2; // Reduced retries for server errors
                }
              }

              // Network errors and other issues - retry with exponential backoff
              return failureCount < 3;
            },

            // OPTIMIZATION: Exponential backoff with jitter
            retryDelay: (attemptIndex) => {
              const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
              const jitter = Math.random() * 0.1 * baseDelay;
              return baseDelay + jitter;
            },

            // OPTIMIZATION: Network-aware configurations
            networkMode: 'online', // Only fetch when online
          },
          mutations: {
            // OPTIMIZATION: Strategic mutation retry for critical operations
            retry: (failureCount, error) => {
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status;
                // Retry mutations only for network/server issues, not client errors
                if (status >= 500 && status < 600) {
                  return failureCount < 2;
                }
                // Retry timeouts
                if (status === 408 || status === 504) {
                  return failureCount < 3;
                }
              }
              return false; // Don't retry other mutation failures
            },
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        {children}
        <Toaster position="bottom-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </WebSocketProvider>
    </QueryClientProvider>
  );
}