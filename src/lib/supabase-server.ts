/**
 * Centralized Supabase Server Client
 *
 * Provides a singleton Supabase client instance for server-side operations
 * (API routes, Server Components, Server Actions).
 *
 * **IMPORTANT**: This client uses the SERVICE_ROLE_KEY which bypasses Row Level Security (RLS).
 * Only use this for server-side operations where you've implemented your own
 * authentication and authorization checks.
 *
 * For client-side operations, use the regular Supabase client from '@/lib/supabase'.
 *
 * @module lib/supabase-server
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Singleton Supabase server client instance
 */
let supabaseServerClient: SupabaseClient | null = null;

/**
 * Get or create Supabase server client with service role key
 *
 * This client has elevated permissions and bypasses Row Level Security (RLS).
 * Always pair this with proper authentication/authorization checks in your API routes.
 *
 * @returns Supabase client with service role permissions
 *
 * @example
 * ```typescript
 * import { getSupabaseServerClient } from '@/lib/supabase-server';
 * import { requireRole } from '@/lib/auth-middleware';
 *
 * export async function GET(request: NextRequest) {
 *   // ALWAYS check auth first
 *   const authResult = await requireRole(request, ['admin', 'pm']);
 *   if (authResult instanceof NextResponse) return authResult;
 *
 *   // Now safe to use server client
 *   const supabase = getSupabaseServerClient();
 *   const { data, error } = await supabase.from('equipment').select('*');
 *   // ...
 * }
 * ```
 */
export function getSupabaseServerClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseServerClient) {
    return supabaseServerClient;
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
        'Please check your .env file.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
        'This key is required for server-side operations. ' +
        'Please check your .env file.'
    );
  }

  // Create new client instance with service role key
  supabaseServerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Server doesn't need session persistence
      persistSession: false,

      // Server doesn't need automatic token refresh
      autoRefreshToken: false,

      // Detect session from request headers if needed
      detectSessionInUrl: false,
    },
    db: {
      // Use connection pooling for better performance
      schema: 'public',
    },
  });

  return supabaseServerClient;
}

/**
 * Get Supabase client with anon key (for public operations)
 *
 * Use this when you want RLS policies to apply (e.g., for operations
 * that don't require elevated permissions).
 *
 * @returns Supabase client with anon key permissions
 *
 * @example
 * ```typescript
 * // For public read-only operations where RLS should apply
 * const supabase = getSupabaseAnonClient();
 * const { data } = await supabase
 *   .from('equipment')
 *   .select('id, name, status')
 *   .eq('is_active', true);
 * ```
 */
export function getSupabaseAnonClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables (URL or ANON_KEY). ' +
        'Please check your .env file.'
    );
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Reset the server client instance
 *
 * Useful for testing or when you need to force recreation of the client
 * (e.g., after environment variable changes).
 *
 * @example
 * ```typescript
 * // In tests
 * afterEach(() => {
 *   resetSupabaseServerClient();
 * });
 * ```
 */
export function resetSupabaseServerClient(): void {
  supabaseServerClient = null;
}

/**
 * Check Supabase connection health
 *
 * Performs a simple query to verify database connectivity.
 *
 * @returns True if connection is healthy, false otherwise
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   const isHealthy = await checkSupabaseConnection();
 *   return NextResponse.json({ healthy: isHealthy });
 * }
 * ```
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();

    // Try a simple query
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    // PGRST116 means "not found" which is actually fine - connection works
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase connection check failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return false;
  }
}

/**
 * Execute a database query with automatic error logging
 *
 * Wrapper around Supabase queries that provides consistent error handling
 * and logging.
 *
 * @example
 * ```typescript
 * const result = await executeQuery(
 *   (supabase) => supabase.from('equipment').select('*').eq('status', 'available'),
 *   'fetch available equipment'
 * );
 *
 * if (result.error) {
 *   return NextResponse.json({ error: result.error.message }, { status: 500 });
 * }
 *
 * return NextResponse.json({ data: result.data });
 * ```
 */
export async function executeQuery<T>(
  queryFn: (supabase: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  operation: string
): Promise<{ data: T | null; error: any }> {
  const supabase = getSupabaseServerClient();

  try {
    const result = await queryFn(supabase);

    if (result.error) {
      console.error(`[Supabase Error] ${operation}:`, result.error);
    }

    return result;
  } catch (error) {
    console.error(`[Supabase Exception] ${operation}:`, error);
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXCEPTION',
      },
    };
  }
}
