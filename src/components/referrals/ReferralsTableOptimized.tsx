import React, { useState, useMemo, useCallback } from "react";
import { Edit, Trash2, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationBadge } from "@/components/ui/GenerationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VirtualizedTable } from "@/components/ui/VirtualizedList";
import { PaginationControls } from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/businessUtils";
import { Referral } from "@/types";

interface ReferralsTableOptimizedProps {
  referrals: Referral[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCycleAction: (id: string) => void;
  loading: boolean;
  enablePagination?: boolean;
  enableVirtualization?: boolean;
  itemsPerPage?: number;
  containerHeight?: number;
}

export const ReferralsTableOptimized = React.memo<ReferralsTableOptimizedProps>(
  ({
    referrals,
    onEdit,
    onDelete,
    onCycleAction,
    loading,
    enablePagination = true,
    enableVirtualization = false,
    itemsPerPage = 20,
    containerHeight = 600,
  }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Calcular datos paginados
    const paginatedData = useMemo(() => {
      if (!enablePagination) return referrals;

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return referrals.slice(startIndex, endIndex);
    }, [referrals, currentPage, itemsPerPage, enablePagination]);

    // Calcular métricas de paginación
    const paginationMetrics = useMemo(() => {
      const totalPages = Math.ceil(referrals.length / itemsPerPage);
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;

      return {
        currentPage,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        totalItems: referrals.length,
        itemsPerPage,
        isLoading: loading || isLoadingMore,
        error: null,
      };
    }, [referrals.length, currentPage, itemsPerPage, loading, isLoadingMore]);

    // Manejar cambio de página
    const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
      // Scroll top cuando cambie de página
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Definir columnas para la tabla virtualizada
    const columns = useMemo(
      () => [
        {
          key: "referral",
          label: "Referido",
          width: 200,
          render: (referral: Referral, _rowIndex?: number) => (
            <div>
              <div className="font-bold text-gray-900">{referral.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {referral.wallet}
              </div>
            </div>
          ),
        },
        {
          key: "generation",
          label: "Generación",
          width: 120,
          render: (referral: Referral, _rowIndex?: number) => (
            <GenerationBadge generation={referral.generation} />
          ),
        },
        {
          key: "investment",
          label: "Inversión",
          width: 120,
          render: (referral: Referral, _rowIndex?: number) => (
            <span className="font-bold">{formatCurrency(referral.amount)}</span>
          ),
        },
        {
          key: "earnings",
          label: "Ganancias",
          width: 120,
          render: (referral: Referral, _rowIndex?: number) => (
            <span className="text-green-600 font-bold">
              {formatCurrency(referral.earnings)}
            </span>
          ),
        },
        {
          key: "userIncome",
          label: "Tu Ingreso",
          width: 120,
          render: (referral: Referral, _rowIndex?: number) => (
            <span className="text-blue-600 font-bold">
              {formatCurrency(referral.userIncome)}
            </span>
          ),
        },
        {
          key: "status",
          label: "Estado",
          width: 100,
          render: (referral: Referral, _rowIndex?: number) => (
            <StatusBadge status={referral.status} />
          ),
        },
        {
          key: "expiration",
          label: "Vencimiento",
          width: 120,
          render: (referral: Referral, _rowIndex?: number) => (
            <span className="text-sm">
              {formatDate(referral.expirationDate)}
            </span>
          ),
        },
        {
          key: "actions",
          label: "Acciones",
          width: 150,
          render: (referral: Referral, _rowIndex?: number) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(referral.id)}
                className="h-8 w-8 p-0"
                aria-label="Editar referido"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCycleAction(referral.id)}
                className="h-8 w-8 p-0"
                aria-label="Acciones de ciclo"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(referral.id)}
                className="h-8 w-8 p-0"
                aria-label="Eliminar referido"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        },
      ],
      [onEdit, onCycleAction, onDelete]
    );

    // Estado de carga
    if (loading && referrals.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-pulse" />
          <p className="text-gray-500 text-lg font-bold">
            Cargando referidos...
          </p>
        </div>
      );
    }

    // Estado vacío
    if (referrals.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-bold">
            No se encontraron referidos
          </p>
          <p className="text-gray-400 mt-1">
            Comienza agregando tu primer referido
          </p>
        </div>
      );
    }

    // Renderizar tabla virtualizada si está habilitada
    if (enableVirtualization && referrals.length > 50) {
      return (
        <div className="space-y-4">
          <VirtualizedTable
            items={referrals}
            rowHeight={60}
            containerHeight={containerHeight}
            columns={columns}
            headerHeight={50}
            stickyHeader
            overscan={10}
            className="rounded-2xl border bg-white shadow-lg"
          />

          {enablePagination && (
            <PaginationControls
              pagination={paginationMetrics}
              onPageChange={handlePageChange}
              showInfo
              size="sm"
            />
          )}
        </div>
      );
    }

    // Renderizar tabla normal con paginación
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase"
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((referral, index) => (
                  <tr
                    key={referral.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-3 py-3 whitespace-nowrap"
                        style={{ width: column.width }}
                      >
                        {column.render(referral)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {enablePagination && (
          <PaginationControls
            pagination={paginationMetrics}
            onPageChange={handlePageChange}
            showInfo
            size="md"
          />
        )}
      </div>
    );
  }
);

ReferralsTableOptimized.displayName = "ReferralsTableOptimized";
