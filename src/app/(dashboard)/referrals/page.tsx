"use client";

import { useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  X,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useReferrals, useSearch, usePagination } from "@/hooks";
import {
  formatCurrency,
  formatDate,
  getUniqueReferrals,
} from "@/lib/businessUtils";
import { AddReferralForm } from "@/components/referrals/AddReferralForm";
import { Toast } from "@/components/ui/Toast";

export default function ReferralsPage() {
  const { referrals, addReferral, updateReferral, deleteReferral } =
    useReferrals();

  const [filterGeneration, setFilterGeneration] = useState<"all" | "1" | "2">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed" | "expired"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<string | null>(null);
  const [cycleModalReferral, setCycleModalReferral] = useState<null | string>(
    null
  );
  const [cycleActionLoading, setCycleActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(null), 2500);
    },
    []
  );

  const handleFinishCycle = async (referralId: string) => {
    setCycleActionLoading(true);
    const referral = referrals.find((r) => r.id === referralId);
    if (!referral) return;
    await updateReferral(referralId, { status: "completed" });
    setCycleActionLoading(false);
    setCycleModalReferral(null);
    showToast("Ciclo finalizado. El referido ha sido marcado como inactivo.");
  };

  const handleReinvestCycle = async (referralId: string) => {
    setCycleActionLoading(true);
    const referral = referrals.find((r) => r.id === referralId);
    if (!referral) return;
    const newCycle = referral.cycle + 1;
    const newAmount = parseFloat(
      (referral.amount + referral.earnings).toFixed(2)
    );
    const newEarnings = parseFloat((newAmount * 0.24).toFixed(2));
    const newUserIncome = parseFloat(
      (newEarnings * (referral.generation === 1 ? 0.2 : 0.1)).toFixed(2)
    );
    const today = new Date().toISOString().split("T")[0];
    const expirationDate = (() => {
      const d = new Date(today);
      d.setDate(d.getDate() + 28);
      return d.toISOString().split("T")[0];
    })();
    const totalEarned = parseFloat(
      (referral.totalEarned + newEarnings + newUserIncome).toFixed(2)
    );
    await updateReferral(referralId, {
      amount: newAmount,
      cycle: newCycle,
      investmentDate: today,
      expirationDate,
      earnings: newEarnings,
      userIncome: newUserIncome,
      totalEarned,
      status: "active",
      startDate: today,
      cycleCount: newCycle,
    });
    setCycleActionLoading(false);
    setCycleModalReferral(null);
    showToast("Reinversión exitosa. El ciclo ha sido actualizado.");
  };

  const filteredReferrals = referrals
    .filter((referral) => {
      const generationMatch =
        filterGeneration === "all" ||
        referral.generation.toString() === filterGeneration;
      const statusMatch =
        filterStatus === "all" || referral.status === filterStatus;
      return generationMatch && statusMatch;
    })
    .sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") {
        return 1;
      }
      if (a.status !== "completed" && b.status === "completed") {
        return -1;
      }

      return (
        new Date(a.expirationDate).getTime() -
        new Date(b.expirationDate).getTime()
      );
    });

  const { searchTerm, setSearchTerm, filteredItems } =
    useSearch(filteredReferrals);
  const {
    currentPage,
    totalPages,
    currentItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredItems, 10);

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este referido?")) {
      deleteReferral(id);
      showToast("Referido eliminado exitosamente", "success");
    }
  };

  const handleAddReferralSuccess = (msg?: string) => {
    setShowForm(false);
    showToast(msg || "Referido agregado exitosamente!", "success");
  };

  const handleUpdateReferralSuccess = (msg?: string) => {
    setEditingReferral(null);
    showToast(msg || "Referido actualizado exitosamente", "success");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completado
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const uniqueReferrals = getUniqueReferrals(referrals);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referidos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu red de referidos y sus inversiones
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Referido
        </button>
      </div>

      {/* Modal para Agregar Referido */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Agregar Nuevo Referido
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <AddReferralForm
                onSuccess={handleAddReferralSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Referido */}
      {editingReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Editar Referido
              </h2>
              <button
                onClick={() => setEditingReferral(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <AddReferralForm
                referral={
                  referrals.find((r) => r.id === editingReferral) || null
                }
                onSuccess={handleUpdateReferralSuccess}
                onCancel={() => setEditingReferral(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal para Finalizar Ciclo / Reinvertir */}
      {cycleModalReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                Finalizar Ciclo
              </h2>
              <button
                onClick={() => setCycleModalReferral(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-base mb-2">
                ¿Qué deseas hacer con este referido?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleFinishCycle(cycleModalReferral)}
                  disabled={cycleActionLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  Finalizar ciclo
                </button>
                <button
                  onClick={() => handleReinvestCycle(cycleModalReferral)}
                  disabled={cycleActionLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reinvertir (crear nuevo ciclo)
                </button>
              </div>
              <button
                onClick={() => setCycleModalReferral(null)}
                className="mt-4 w-full text-gray-600 hover:text-gray-900 text-sm underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Referidos</p>
              <p className="text-2xl font-bold">{uniqueReferrals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Primera Gen.</p>
              <p className="text-2xl font-bold">
                {uniqueReferrals.filter((r) => r.generation === 1).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Segunda Gen.</p>
              <p className="text-2xl font-bold">
                {uniqueReferrals.filter((r) => r.generation === 2).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold">
                {uniqueReferrals.filter((r) => r.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterGeneration}
              onChange={(e) => setFilterGeneration(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 rounded-md"
            >
              <option value="all">Todas las generaciones</option>
              <option value="1">Primera generación</option>
              <option value="2">Segunda generación</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Referido
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Generación
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Inversión
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ganancias
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tu Ingreso
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vencimiento
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {referral.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        referral.generation === 1
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      Gen {referral.generation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatCurrency(referral.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    {formatCurrency(referral.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                    {formatCurrency(referral.userIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(referral.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(referral.expirationDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingReferral(referral.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCycleModalReferral(referral.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Finalizar Ciclo / Reinvertir"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(referral.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages} • {filteredItems.length}{" "}
              resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={previousPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza agregando tu primer referido"}
          </p>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
