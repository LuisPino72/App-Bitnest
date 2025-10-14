import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

// ==================== TIPOS DE VIRTUALIZACIÓN ====================

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  enableLazyLoading?: boolean;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export interface VirtualizedTableProps<T> {
  items: T[];
  rowHeight: number;
  containerHeight: number;
  columns: Array<{
    key: string;
    label: string;
    width?: number;
    render: (item: T, index: number) => React.ReactNode;
  }>;
  overscan?: number;
  className?: string;
  headerHeight?: number;
  stickyHeader?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

// ==================== HOOK DE VIRTUALIZACIÓN ====================

function useVirtualization(
  items: any[],
  containerHeight: number,
  itemHeight: number | ((index: number) => number),
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calcular índices visibles
  const visibleRange = useMemo(() => {
    let start = 0;
    let end = items.length - 1;

    let currentTop = 0;
    for (let i = 0; i < items.length; i++) {
      const height =
        typeof itemHeight === "function" ? itemHeight(i) : itemHeight;
      const itemBottom = currentTop + height;

      if (itemBottom < scrollTop) {
        start = i + 1;
      } else if (currentTop > scrollTop + containerHeight) {
        end = i - 1;
        break;
      }

      currentTop = itemBottom;
    }

    // Aplicar overscan
    start = Math.max(0, start - overscan);
    end = Math.min(items.length - 1, end + overscan);

    return { start, end };
  }, [items.length, scrollTop, containerHeight, itemHeight, overscan]);

  // Calcular altura total
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === "function") {
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += itemHeight(i);
      }
      return total;
    }
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Calcular offset superior
  const offsetTop = useMemo(() => {
    if (typeof itemHeight === "function") {
      let offset = 0;
      for (let i = 0; i < visibleRange.start; i++) {
        offset += itemHeight(i);
      }
      return offset;
    }
    return visibleRange.start * itemHeight;
  }, [visibleRange.start, itemHeight]);

  // Manejar scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    totalHeight,
    offsetTop,
    scrollElementRef,
    handleScroll,
  };
}

// ==================== COMPONENTE DE LISTA VIRTUALIZADA ====================

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  loadingComponent,
  emptyComponent,
  enableLazyLoading = false,
  loadMore,
  hasMore = false,
  isLoading = false,
}: VirtualizedListProps<T>) {
  const {
    visibleRange,
    totalHeight,
    offsetTop,
    scrollElementRef,
    handleScroll,
  } = useVirtualization(items, containerHeight, itemHeight, overscan);

  const [isNearBottom, setIsNearBottom] = useState(false);

  // Detectar cuando estamos cerca del final para lazy loading
  const checkNearBottom = useCallback(() => {
    const element = scrollElementRef.current;
    if (!element) return;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const threshold = 100;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    setIsNearBottom(nearBottom);

    if (nearBottom && !isLoading && hasMore) {
      loadMore?.();
    }
  }, [isLoading, hasMore, loadMore, scrollElementRef]);

  // Detectar cuando estamos cerca del final para lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !loadMore || !hasMore) return;

    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener("scroll", checkNearBottom);
    return () => element.removeEventListener("scroll", checkNearBottom);
  }, [
    enableLazyLoading,
    loadMore,
    hasMore,
    isLoading,
    checkNearBottom,
    scrollElementRef,
  ]);

  // Manejar scroll personalizado
  const handleScrollWithCallback = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleScroll(e);
      onScroll?.(e.currentTarget.scrollTop);
    },
    [handleScroll, onScroll]
  );

  if (items.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height: containerHeight }}
      >
        {emptyComponent || (
          <div className="text-gray-500">No hay elementos para mostrar</div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScrollWithCallback}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          {items
            .slice(visibleRange.start, visibleRange.end + 1)
            .map((item, index) => {
              const actualIndex = visibleRange.start + index;
              return (
                <div
                  key={actualIndex}
                  style={{
                    height:
                      typeof itemHeight === "function"
                        ? itemHeight(actualIndex)
                        : itemHeight,
                  }}
                >
                  {renderItem(item, actualIndex)}
                </div>
              );
            })}
        </div>
      </div>

      {/* Indicador de carga para lazy loading */}
      {enableLazyLoading && isLoading && (
        <div className="flex justify-center py-4">
          {loadingComponent || (
            <div className="text-gray-500">Cargando más elementos...</div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== COMPONENTE DE TABLA VIRTUALIZADA ====================

export function VirtualizedTable<T>({
  items,
  rowHeight,
  containerHeight,
  columns,
  overscan = 5,
  className,
  headerHeight = 40,
  stickyHeader = true,
  loadingComponent,
  emptyComponent,
}: VirtualizedTableProps<T>) {
  const {
    visibleRange,
    totalHeight,
    offsetTop,
    scrollElementRef,
    handleScroll,
  } = useVirtualization(items, containerHeight, rowHeight, overscan);

  // Calcular ancho total de columnas
  const totalWidth = useMemo(() => {
    return columns.reduce((total, col) => total + (col.width || 150), 0);
  }, [columns]);

  if (items.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height: containerHeight }}
      >
        {emptyComponent || (
          <div className="text-gray-500">No hay datos para mostrar</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      {stickyHeader && (
        <div
          className="bg-gray-50 border-b border-gray-200 flex"
          style={{ height: headerHeight }}
        >
          {columns.map((column, index) => (
            <div
              key={column.key}
              className="px-4 py-2 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 flex items-center"
              style={{ width: column.width || 150 }}
            >
              {column.label}
            </div>
          ))}
        </div>
      )}

      {/* Contenido virtualizado */}
      <div
        ref={scrollElementRef}
        className="overflow-auto"
        style={{ height: containerHeight - (stickyHeader ? headerHeight : 0) }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetTop}px)` }}>
            {items
              .slice(visibleRange.start, visibleRange.end + 1)
              .map((item, index) => {
                const actualIndex = visibleRange.start + index;
                return (
                  <div
                    key={actualIndex}
                    className="border-b border-gray-100 hover:bg-gray-50 flex"
                    style={{ height: rowHeight }}
                  >
                    {columns.map((column, colIndex) => (
                      <div
                        key={column.key}
                        className="px-4 py-2 border-r border-gray-100 last:border-r-0 flex items-center"
                        style={{ width: column.width || 150 }}
                      >
                        {column.render(item, actualIndex)}
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HOOK PARA INFINITE SCROLL ====================

export function useInfiniteScroll<T>(
  initialItems: T[] = [],
  loadMore: (page: number) => Promise<T[]>,
  options: {
    pageSize?: number;
    threshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { pageSize = 20, threshold = 100, enabled = true } = options;

  const [items, setItems] = useState<T[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMoreItems = useCallback(async () => {
    if (!enabled || isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await loadMore(currentPage);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar más elementos"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, enabled, isLoading, hasMore, loadMore]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, [initialItems]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore: loadMoreItems,
    reset,
  };
}
