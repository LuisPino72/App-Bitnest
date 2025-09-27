'use client';

import { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { usePersonalInvestments, usePagination } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/businessUtils';

export default function InvestmentsPage() {
  const { 
    investments, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment, 
    getActiveInvestments 
  } = usePersonalInvestments();

  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null);

  const activeInvestments = getActiveInvestments();
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = investments.reduce((sum, inv) => sum + inv.earnings, 0);

  const { currentPage, totalPages, currentItems, nextPage, previousPage } = usePagination(investments, 10);

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta inversión?')) {
      deleteInvestment(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Activo</span>;
      case 'completed':
        return <span className="badge badge-info">Completado</span>;
      case 'expired':
        return <span className="badge badge-danger">Expirado</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inversiones Personales</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus inversiones directas y ganancias
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Inversión
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-primary-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Invertido</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-success-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Ganancias Totales</p>
              <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-warning-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Inversiones Activas</p>
              <p className="text-2xl font-bold">{activeInvestments.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-success-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">ROI Promedio</p>
              <p className="text-2xl font-bold">24%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Inversiones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Inversión</th>
                <th className="table-header-cell">Fecha Inicio</th>
                <th className="table-header-cell">Fecha Vencimiento</th>
                <th className="table-header-cell">Ganancias (24%)</th>
                <th className="table-header-cell">Total</th>
                <th className="table-header-cell">Ciclo</th>
                <th className="table-header-cell">Estado</th>
                <th className="table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {currentItems.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">
                    {formatCurrency(investment.amount)}
                  </td>
                  <td className="table-cell">
                    {formatDate(investment.startDate)}
                  </td>
                  <td className="table-cell">
                    {formatDate(investment.expirationDate)}
                  </td>
                  <td className="table-cell text-success-600 font-medium">
                    {formatCurrency(investment.earnings)}
                  </td>
                  <td className="table-cell font-bold">
                    {formatCurrency(investment.amount + investment.earnings)}
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-info">
                      Ciclo {investment.cycleCount}
                    </span>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(investment.status)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingInvestment(investment.id)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages} • {investments.length} inversiones
            </div>
            <div className="flex gap-2">
              <button
                onClick={previousPage}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Capital Inicial Total</span>
              <span className="font-medium">{formatCurrency(totalInvested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ganancias Generadas</span>
              <span className="font-medium text-success-600">{formatCurrency(totalEarnings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total Actual</span>
              <span className="font-bold text-lg">{formatCurrency(totalInvested + totalEarnings)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ROI Realizado</span>
                <span className="font-bold text-success-600">
                  {totalInvested > 0 ? `+${((totalEarnings / totalInvested) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Ciclo
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-sm text-primary-800 font-medium">Duración del Ciclo</div>
              <div className="text-2xl font-bold text-primary-600">28 días</div>
              <div className="text-xs text-primary-600 mt-1">Por cada ciclo completado</div>
            </div>
            <div className="p-4 bg-success-50 rounded-lg">
              <div className="text-sm text-success-800 font-medium">Retorno Garantizado</div>
              <div className="text-2xl font-bold text-success-600">24%</div>
              <div className="text-xs text-success-600 mt-1">Sobre el capital invertido</div>
            </div>
            <div className="p-4 bg-warning-50 rounded-lg">
              <div className="text-sm text-warning-800 font-medium">Proyección Anual</div>
              <div className="text-2xl font-bold text-warning-600">~312%</div>
              <div className="text-xs text-warning-600 mt-1">Reinvirtiendo ganancias (13 ciclos)</div>
            </div>
          </div>
        </div>
      </div>

      {investments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No hay inversiones registradas</p>
          <p className="text-gray-400 mt-1">Comienza registrando tu primera inversión</p>
        </div>
      )}
    </div>
  );
}