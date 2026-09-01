import { useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

/**
 * Hook for lazy loading with caching to reduce reload times
 */
export function useLazyLoad<T>(
  key: string,
  loader: () => Promise<T>,
  fallback: T
): [T, boolean, Error | null] {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) return;

    const load = async () => {
      // Check cache first
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const result = await loader();
        setData(result);
        cache.set(key, { data: result, timestamp: Date.now() });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error(`Failed to load ${key}:`, err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    load();
  }, [key, loader]);

  return [data, loading, error];
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  cache.delete(key);
}
