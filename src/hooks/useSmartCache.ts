import { useState, useEffect, useCallback, useRef } from "react";

// ==================== TIPOS DE CACHÉ ====================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  enableLRU?: boolean;
}

export interface SmartCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  invalidate: () => void;
  clear: () => void;
}

// ==================== CLASE DE CACHÉ INTELIGENTE ====================

class SmartCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000,
      maxSize: options.maxSize || 100,
      enableLRU: options.enableLRU !== false,
    };
  }

  // Obtener datos del caché
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar si el caché ha expirado
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  // Guardar datos en el caché
  set(key: string, data: T, customTTL?: number): void {
    const now = Date.now();
    const ttl = customTTL || this.options.ttl;

    // Si el caché está lleno, eliminar entrada menos reciente
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now,
    });
  }

  // Eliminar entrada específica
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpiar todo el caché
  clear(): void {
    this.cache.clear();
  }

  // Invalidar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Obtener estadísticas del caché
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalAccessCount = 0;

    for (const entry of Array.from(this.cache.values())) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
      totalAccessCount += entry.accessCount;
    }

    return {
      size: this.cache.size,
      expiredCount,
      totalAccessCount,
      hitRate: totalAccessCount > 0 ? this.cache.size / totalAccessCount : 0,
    };
  }

  // Eliminar entrada menos reciente (LRU)
  private evictLRU(): void {
    if (!this.options.enableLRU || this.cache.size === 0) {
      return;
    }

    let oldestKey = "";
    let oldestTime = Infinity;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Exponer acceso seguro a una entrada (lectura) para evitar exponer internals
  getEntry(key: string): CacheEntry<T> | undefined {
    return this.cache.get(key);
  }
}

// ==================== HOOK DE CACHÉ INTELIGENTE ====================

export function useSmartCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & {
    enabled?: boolean;
    onError?: (error: Error) => void;
  } = {}
): SmartCacheResult<T> {
  const { enabled = true, onError, ...cacheOptions } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const cacheRef = useRef<SmartCache<T> | null>(null);
  const fetcherRef = useRef(fetcher);

  // Inicializar caché
  useEffect(() => {
    if (!cacheRef.current) {
      cacheRef.current = new SmartCache<T>(cacheOptions);
    }
  }, [cacheOptions]);

  // Actualizar fetcher
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Verificar si los datos están stale
  const isStale = useCallback(() => {
    if (!lastUpdated || !cacheRef.current) {
      return true;
    }

    const entry = cacheRef.current.getEntry(key);
    if (!entry) {
      return true;
    }

    const now = Date.now();
    return now - entry.timestamp > entry.ttl;
  }, [key, lastUpdated]);

  // Función para obtener datos
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled || !cacheRef.current) {
        return;
      }

      // Verificar caché si no es refresh forzado
      if (!forceRefresh) {
        const cachedData = cacheRef.current.get(key);
        if (cachedData) {
          setData(cachedData);
          setError(null);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current();

        // Guardar en caché
        cacheRef.current.set(key, result);

        setData(result);
        setLastUpdated(Date.now());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [key, enabled, onError]
  );

  // Cargar datos iniciales
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [key, enabled, fetchData]);

  // Limpieza periódica del caché
  useEffect(() => {
    if (!cacheRef.current) return;

    const interval = setInterval(() => {
      cacheRef.current?.cleanup();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Función de refresh
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Función de invalidación
  const invalidate = useCallback(() => {
    if (cacheRef.current) {
      cacheRef.current.delete(key);
    }
    setData(null);
    setLastUpdated(null);
    setError(null);
  }, [key]);

  // Función de limpieza
  const clear = useCallback(() => {
    if (cacheRef.current) {
      cacheRef.current.clear();
    }
    setData(null);
    setLastUpdated(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    isStale: isStale(),
    lastUpdated,
    refresh,
    invalidate,
    clear,
  };
}

// ==================== HOOK PARA CACHÉ DE MÚLTIPLES CLAVES ====================

export function useMultiKeyCache<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>,
  options: CacheOptions = {}
): Record<string, SmartCacheResult<T>> {
  const results: Record<string, SmartCacheResult<T>> = {};

  for (const key of keys) {
    results[key] = useSmartCache(key, () => fetcher(key), options);
  }

  return results;
}

// ==================== HOOK PARA CACHÉ DE CONSULTAS FIREBASE ====================

export function useFirebaseCache<T>(
  collectionName: string,
  queryKey: string,
  fetcher: () => Promise<T[]>,
  options: CacheOptions & {
    enabled?: boolean;
  } = {}
): SmartCacheResult<T[]> {
  const cacheKey = `firebase_${collectionName}_${queryKey}`;

  return useSmartCache(cacheKey, fetcher, {
    ttl: 2 * 60 * 1000,
    ...options,
  });
}

// ==================== UTILIDADES DE CACHÉ ====================

export const cacheUtils = {
  // Generar clave de caché para filtros
  generateFilterKey: (filters: Record<string, any>): string => {
    const sortedFilters = Object.keys(filters)
      .sort()
      .map((key) => `${key}:${filters[key]}`)
      .join("|");
    return `filters_${sortedFilters}`;
  },

  // Generar clave de caché para paginación
  generatePaginationKey: (
    collection: string,
    page: number,
    pageSize: number,
    filters?: Record<string, any>
  ): string => {
    const filterKey = filters
      ? cacheUtils.generateFilterKey(filters)
      : "no_filters";
    return `${collection}_page_${page}_size_${pageSize}_${filterKey}`;
  },

  // Generar clave de caché para métricas
  generateMetricsKey: (dateRange?: { start: string; end: string }): string => {
    if (!dateRange) {
      const today = new Date().toISOString().split("T")[0];
      return `metrics_${today}`;
    }
    return `metrics_${dateRange.start}_${dateRange.end}`;
  },
};
