import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  where,
  WhereFilterOp,
  Query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ==================== TIPOS DE PAGINACIÓN ====================

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
  error: string | null;
}

export interface PaginationOptions {
  itemsPerPage?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  filters?: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }>;
}

export interface UsePaginationResult<T> {
  items: T[];
  pagination: PaginationState;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
  setFilters: (filters: PaginationOptions["filters"]) => void;
}

// ==================== HOOK DE PAGINACIÓN ====================

export function useFirestorePagination<T>(
  collectionName: string,
  options: PaginationOptions = {}
): UsePaginationResult<T> {
  const {
    itemsPerPage = 20,
    orderBy: orderByField = "createdAt",
    orderDirection = "desc",
    filters = [],
  } = options;

  // Estados de paginación
  const [items, setItems] = useState<T[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [documents, setDocuments] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Construir query base
  const buildQuery = useCallback(() => {
    const collectionRef = collection(db, collectionName);
    let q: Query<DocumentData> = query(collectionRef);

    // Aplicar filtros
    filters.forEach((filter) => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });

    // Aplicar ordenamiento
    q = query(q, orderBy(orderByField, orderDirection));

    return q;
  }, [collectionName, filters, orderByField, orderDirection]);

  // Cargar primera página
  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = query(buildQuery(), limit(itemsPerPage));
      const snapshot = await getDocs(q);

      const newItems: T[] = [];
      const newDocuments: QueryDocumentSnapshot<DocumentData>[] = [];

      snapshot.forEach((doc) => {
        newItems.push({ id: doc.id, ...doc.data() } as T);
        newDocuments.push(doc);
      });

      setItems(newItems);
      setDocuments(newDocuments);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setFirstDoc(snapshot.docs[0] || null);
      setCurrentPage(1);

      // Estimar total de items (aproximado para Firestore)
      setTotalItems(snapshot.size === itemsPerPage ? (currentPage + 1) * itemsPerPage : snapshot.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      console.error("Error loading first page:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery, itemsPerPage, currentPage]);

  // Cargar siguiente página
  const loadNextPage = useCallback(async () => {
    if (!lastDoc || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const q = query(
        buildQuery(),
        startAfter(lastDoc),
        limit(itemsPerPage)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setIsLoading(false);
        return;
      }

      const newItems: T[] = [];
      const newDocuments: QueryDocumentSnapshot<DocumentData>[] = [];

      snapshot.forEach((doc) => {
        newItems.push({ id: doc.id, ...doc.data() } as T);
        newDocuments.push(doc);
      });

      setItems((prev) => [...prev, ...newItems]);
      setDocuments((prev) => [...prev, ...newDocuments]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setCurrentPage((prev) => prev + 1);

      // Actualizar estimación de total
      if (snapshot.size === itemsPerPage) {
        setTotalItems((prev) => prev + itemsPerPage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar siguiente página");
      console.error("Error loading next page:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery, itemsPerPage, lastDoc, isLoading]);

  // Cargar página anterior
  const loadPreviousPage = useCallback(async () => {
    if (currentPage <= 1 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const itemsToSkip = (currentPage - 2) * itemsPerPage;
      const q = query(
        buildQuery(),
        limit(itemsToSkip + itemsPerPage)
      );
      const snapshot = await getDocs(q);

      const newItems: T[] = [];
      const newDocuments: QueryDocumentSnapshot<DocumentData>[] = [];

      snapshot.forEach((doc) => {
        newItems.push({ id: doc.id, ...doc.data() } as T);
        newDocuments.push(doc);
      });

      // Tomar solo los últimos itemsPerPage elementos
      const startIndex = Math.max(0, newItems.length - itemsPerPage);
      const pageItems = newItems.slice(startIndex);
      const pageDocs = newDocuments.slice(startIndex);

      setItems(pageItems);
      setDocuments(pageDocs);
      setLastDoc(pageDocs[pageDocs.length - 1] || null);
      setFirstDoc(pageDocs[0] || null);
      setCurrentPage((prev) => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar página anterior");
      console.error("Error loading previous page:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery, itemsPerPage, currentPage, isLoading]);

  // Ir a página específica (implementación básica)
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page === currentPage || isLoading) return;

    if (page > currentPage) {
      // Cargar páginas siguientes hasta llegar a la página deseada
      const pagesToLoad = page - currentPage;
      let loadCount = 0;

      const loadNext = async () => {
        if (loadCount < pagesToLoad) {
          await loadNextPage();
          loadCount++;
          if (loadCount < pagesToLoad) {
            setTimeout(loadNext, 100);
          }
        }
      };

      loadNext();
    } else {
      // Para páginas anteriores, recargar desde el inicio
      loadFirstPage();
    }
  }, [currentPage, isLoading, loadNextPage, loadFirstPage]);

  // Refrescar datos
  const refresh = useCallback(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // Cambiar filtros
  const setFilters = useCallback((newFilters: PaginationOptions["filters"]) => {
    // Reiniciar paginación cuando cambian los filtros
    setCurrentPage(1);
    setLastDoc(null);
    setFirstDoc(null);
    setDocuments([]);
    setItems([]);
    setTotalItems(0);
    
    // Los filtros se actualizarán en el próximo useEffect
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadFirstPage();
  }, [collectionName, itemsPerPage, orderByField, orderDirection]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (filters.length > 0) {
      loadFirstPage();
    }
  }, [filters, loadFirstPage]);

  // Calcular estado de paginación
  const pagination = useMemo<PaginationState>(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages && !isLoading;
    const hasPreviousPage = currentPage > 1;

    return {
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      totalItems,
      itemsPerPage,
      isLoading,
      error,
    };
  }, [currentPage, totalItems, itemsPerPage, isLoading, error]);

  return {
    items,
    pagination,
    nextPage: loadNextPage,
    previousPage: loadPreviousPage,
    goToPage,
    refresh,
    setFilters,
  };
}

// ==================== HOOK ESPECÍFICO PARA REFERIDOS ====================

export function useReferralsPagination(
  options: PaginationOptions & {
    generation?: number;
    status?: string;
    searchTerm?: string;
  } = {}
) {
  const { generation, status, searchTerm, ...paginationOptions } = options;

  // Construir filtros dinámicos
  const filters = useMemo(() => {
    const dynamicFilters: PaginationOptions["filters"] = [];

    if (generation !== undefined) {
      dynamicFilters.push({
        field: "generation",
        operator: "==",
        value: generation,
      });
    }

    if (status && status !== "all") {
      dynamicFilters.push({
        field: "status",
        operator: "==",
        value: status,
      });
    }

    return dynamicFilters;
  }, [generation, status]);

  const pagination = useFirestorePagination("referrals", {
    ...paginationOptions,
    filters,
    orderBy: "expirationDate",
    orderDirection: "asc",
  });

  // Filtrar por término de búsqueda (cliente)
  const filteredItems = useMemo(() => {
    if (!searchTerm) return pagination.items;

    const term = searchTerm.toLowerCase();
    return pagination.items.filter((item: any) =>
      item.name?.toLowerCase().includes(term) ||
      item.wallet?.toLowerCase().includes(term)
    );
  }, [pagination.items, searchTerm]);

  return {
    ...pagination,
    items: filteredItems,
  };
}

// ==================== HOOK ESPECÍFICO PARA INVERSIONES ====================

export function useInvestmentsPagination(
  options: PaginationOptions & {
    status?: string;
  } = {}
) {
  const { status, ...paginationOptions } = options;

  const filters = useMemo(() => {
    const dynamicFilters: PaginationOptions["filters"] = [];

    if (status && status !== "all") {
      dynamicFilters.push({
        field: "status",
        operator: "==",
        value: status,
      });
    }

    return dynamicFilters;
  }, [status]);

  return useFirestorePagination("personalInvestments", {
    ...paginationOptions,
    filters,
    orderBy: "expirationDate",
    orderDirection: "asc",
  });
}

// ==================== HOOK ESPECÍFICO PARA LEADS ====================

export function useLeadsPagination(
  options: PaginationOptions & {
    status?: string;
    searchTerm?: string;
  } = {}
) {
  const { status, searchTerm, ...paginationOptions } = options;

  const filters = useMemo(() => {
    const dynamicFilters: PaginationOptions["filters"] = [];

    if (status && status !== "all") {
      dynamicFilters.push({
        field: "status",
        operator: "==",
        value: status,
      });
    }

    return dynamicFilters;
  }, [status]);

  const pagination = useFirestorePagination("leads", {
    ...paginationOptions,
    filters,
    orderBy: "createdAt",
    orderDirection: "desc",
  });

  // Filtrar por término de búsqueda (cliente)
  const filteredItems = useMemo(() => {
    if (!searchTerm) return pagination.items;

    const term = searchTerm.toLowerCase();
    return pagination.items.filter((item: any) =>
      item.name?.toLowerCase().includes(term) ||
      item.phone?.toLowerCase().includes(term) ||
      item.notes?.toLowerCase().includes(term)
    );
  }, [pagination.items, searchTerm]);

  return {
    ...pagination,
    items: filteredItems,
  };
}
