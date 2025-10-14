import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// ==================== TIPOS DE PAGINACIÓN ====================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// ==================== COMPONENTE DE PAGINACIÓN ====================

export const Pagination = React.memo<PaginationProps>(({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  isLoading = false,
  onPageChange,
  onNextPage,
  onPreviousPage,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className,
  size = "md",
}) => {
  // Calcular páginas visibles
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Ajustar inicio si estamos cerca del final
    if (end === totalPages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages: (number | string)[] = [];

    // Agregar primera página si no está visible
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("...");
      }
    }

    // Agregar páginas visibles
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Agregar última página si no está visible
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Tamaños de botones
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {/* Botón Primera Página */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={!hasPreviousPage || isLoading}
        className={sizeClasses[size]}
        aria-label="Primera página"
      >
        <ChevronsLeft className={iconSizes[size]} />
      </Button>

      {/* Botón Página Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (onPreviousPage) {
            onPreviousPage();
          } else {
            onPageChange(currentPage - 1);
          }
        }}
        disabled={!hasPreviousPage || isLoading}
        className={sizeClasses[size]}
        aria-label="Página anterior"
      >
        <ChevronLeft className={iconSizes[size]} />
      </Button>

      {/* Números de Página */}
      {showPageNumbers && (
        <>
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={cn(
                    "flex items-center justify-center text-gray-500",
                    sizeClasses[size]
                  )}
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className={cn(
                  sizeClasses[size],
                  isCurrentPage && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                aria-label={`Página ${pageNumber}`}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
        </>
      )}

      {/* Botón Página Siguiente */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (onNextPage) {
            onNextPage();
          } else {
            onPageChange(currentPage + 1);
          }
        }}
        disabled={!hasNextPage || isLoading}
        className={sizeClasses[size]}
        aria-label="Página siguiente"
      >
        <ChevronRight className={iconSizes[size]} />
      </Button>

      {/* Botón Última Página */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={!hasNextPage || isLoading}
        className={sizeClasses[size]}
        aria-label="Última página"
      >
        <ChevronsRight className={iconSizes[size]} />
      </Button>
    </div>
  );
});

Pagination.displayName = "Pagination";

// ==================== COMPONENTE DE INFORMACIÓN DE PAGINACIÓN ====================

export interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading?: boolean;
  className?: string;
}

export const PaginationInfo = React.memo<PaginationInfoProps>(({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  isLoading = false,
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        {isLoading ? "Cargando..." : "No hay elementos para mostrar"}
      </div>
    );
  }

  return (
    <div className={cn("text-sm text-gray-500", className)}>
      {isLoading ? (
        "Cargando..."
      ) : (
        <>
          Mostrando {startItem} - {endItem} de {totalItems} elementos
          {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
        </>
      )}
    </div>
  );
});

PaginationInfo.displayName = "PaginationInfo";

// ==================== COMPONENTE COMPLETO DE PAGINACIÓN ====================

export interface PaginationControlsProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalItems: number;
    itemsPerPage: number;
    isLoading: boolean;
    error: string | null;
  };
  onPageChange: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  showInfo?: boolean;
  showPageNumbers?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PaginationControls = React.memo<PaginationControlsProps>(({
  pagination,
  onPageChange,
  onNextPage,
  onPreviousPage,
  showInfo = true,
  showPageNumbers = true,
  className,
  size = "md",
}) => {
  if (pagination.error) {
    return (
      <div className={cn("text-center text-red-500 py-4", className)}>
        Error: {pagination.error}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4", className)}>
      {showInfo && (
        <PaginationInfo
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          isLoading={pagination.isLoading}
          className="order-2 sm:order-1"
        />
      )}
      
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        isLoading={pagination.isLoading}
        onPageChange={onPageChange}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        showPageNumbers={showPageNumbers}
        className="order-1 sm:order-2"
        size={size}
      />
    </div>
  );
});

PaginationControls.displayName = "PaginationControls";
