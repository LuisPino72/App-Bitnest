'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users,
  Eye 
} from 'lucide-react';
import { useReferrals, useSearch, usePagination } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/businessUtils';

export default function ReferralsPage() {
  const { 
    referrals, 
    addReferral, 
    updateReferral, 
    deleteReferral 
  } = useReferrals();

  const [filterGeneration, setFilterGeneration] = useState<'all' | '1' | '2'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<string | null>(null);

  const filteredReferrals = referrals.filter(referral => {
    const generationMatch = filterGeneration === 'all' || 
      referral.generation.toString() === filterGeneration;
    const statusMatch = filterStatus === 'all' || referral.status === filterStatus;
    return generationMatch && statusMatch;
  });

  const { searchTerm, setSearchTerm, filteredItems } = useSearch(filteredReferrals);
  const { currentPage, totalPages, currentItems, nextPage, previousPage, goToPage } = usePagination(filteredItems, 10);

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este referido?')) {
      deleteReferral(id);
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
          <h1 className="text-3xl font-bold text-gray-900">Referidos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu red de referidos y sus inversiones
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Referido
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Referidos</p>
              <p className="text-2xl font-bold">{referrals.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-success-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Primera Gen.</p>
              <p className="text-2xl font-bold">
                {referrals.filter(r => r.generation === 1).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-warning-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Segunda Gen.</p>
              <p className="text-2xl font-bold">
                {referrals.filter(r => r.generation === 2).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-danger-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold">
                {referrals.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterGeneration}
              onChange={(e) => setFilterGeneration(e.target.value as any)}
              className="input w-auto"
            >
              <option value="all">Todas las generaciones</option>
              <option value="1">Primera generación</option>
              <option value="2">Segunda generación</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input w-auto"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Referido</th>
                <th className="table-header-cell">Generación</th>
                <th className="table-header-cell">Inversión</th>
                <th className="table-header-cell">Ganancias</th>
                <th className="table-header-cell">Tu Ingreso</th>
                <th className="table-header-cell">Estado</th>
                <th className="table-header-cell">Vencimiento</th>
                <th className="table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {currentItems.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">{referral.name}</div>
                      <div className="text-sm text-gray-500">{referral.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      referral.generation === 1 ? 'badge-info' : 'badge-warning'
                    }`}>
                      Gen {referral.generation}
                    </span>
                  </td>
                  <td className="table-cell font-medium">
                    {formatCurrency(referral.amount)}
                  </td>
                  <td className="table-cell text-success-600">
                    {formatCurrency(referral.earnings)}
                  </td>
                  <td className="table-cell font-medium text-primary-600">
                    {formatCurrency(referral.userIncome)}
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(referral.status)}
                  </td>
                  <td className="table-cell text-sm">
                    {formatDate(referral.expirationDate)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingReferral(referral.id)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(referral.id)}
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
              Página {currentPage} de {totalPages} • {filteredItems.length} resultados
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

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron referidos</p>
          <p className="text-gray-400 mt-1">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer referido'}
          </p>
        </div>
      )}
    </div>
  );
}