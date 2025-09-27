import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple in-memory cache for crew validation
// In production, consider using Redis or a more robust caching solution
const crewCache = new Map<string, { exists: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Validates if a crew exists and is active
 * @param crew_id - The UUID of the crew to validate
 * @returns Promise<{ exists: boolean; name?: string; error?: string }>
 */
export async function validateCrewExists(crew_id: string): Promise<{
  exists: boolean;
  name?: string;
  error?: string;
}> {
  try {
    // Input validation
    if (!crew_id || typeof crew_id !== 'string') {
      return { exists: false, error: 'Invalid crew ID format' };
    }

    // Check cache first
    const cacheKey = crew_id;
    const cached = crewCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return { exists: cached.exists };
    }

    // Query database for crew existence and status using Supabase
    const { data: crewData, error: crewError } = await supabase
      .from('crews')
      .select('id, name, status')
      .eq('id', crew_id)
      .eq('status', 'active')
      .single();

    if (crewError) {
      if (crewError.code === 'PGRST116') {
        // Cache negative result
        crewCache.set(cacheKey, { exists: false, timestamp: now });
        return { exists: false, error: 'Crew not found or inactive' };
      }

      console.error('Supabase crew query error:', crewError);
      return {
        exists: false,
        error: 'Database query error during crew validation'
      };
    }

    if (!crewData) {
      // Cache negative result
      crewCache.set(cacheKey, { exists: false, timestamp: now });
      return { exists: false, error: 'Crew not found or inactive' };
    }

    // Cache positive result
    crewCache.set(cacheKey, { exists: true, timestamp: now });

    return {
      exists: true,
      name: crewData.name || 'Unknown'
    };

  } catch (error) {
    console.error('🚫 Crew validation error:', error);
    return {
      exists: false,
      error: 'Database connection error during crew validation'
    };
  }
}

/**
 * Middleware function for API routes that require crew validation
 * @param crew_id - The crew ID to validate
 * @returns NextResponse with error if crew doesn't exist, null if valid
 */
export async function validateCrewMiddleware(crew_id: string): Promise<NextResponse | null> {
  const validation = await validateCrewExists(crew_id);

  if (!validation.exists) {
    console.error('🚫 Crew validation failed:', validation.error);
    return NextResponse.json(
      {
        error: validation.error || 'Crew not found or inactive',
        code: 'CREW_NOT_FOUND'
      },
      { status: 404 }
    );
  }

  return null; // Valid crew, continue with request
}

/**
 * Higher-order function that wraps API handlers with crew validation
 * @param handler - The API handler function
 * @param getCrewId - Function to extract crew_id from request
 * @returns Wrapped handler with crew validation
 */
export function withCrewValidation(
  handler: (request: any, ...args: any[]) => Promise<NextResponse>,
  getCrewId: (request: any, ...args: any[]) => string | undefined
) {
  return async (request: any, ...args: any[]): Promise<NextResponse> => {
    const crew_id = getCrewId(request, ...args);

    if (crew_id) {
      const validationError = await validateCrewMiddleware(crew_id);
      if (validationError) {
        return validationError;
      }
    }

    return handler(request, ...args);
  };
}

/**
 * Clears the crew cache (useful for testing or when crews are updated)
 */
export function clearCrewCache(): void {
  crewCache.clear();
}

/**
 * Gets cache statistics for monitoring
 */
export function getCrewCacheStats(): {
  size: number;
  keys: string[];
  oldestEntry: number | null;
} {
  const now = Date.now();
  const keys = Array.from(crewCache.keys());
  let oldestEntry: number | null = null;

  for (const [, value] of crewCache) {
    if (oldestEntry === null || value.timestamp < oldestEntry) {
      oldestEntry = value.timestamp;
    }
  }

  return {
    size: crewCache.size,
    keys,
    oldestEntry: oldestEntry ? now - oldestEntry : null,
  };
}