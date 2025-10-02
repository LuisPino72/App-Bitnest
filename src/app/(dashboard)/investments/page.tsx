"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Check,
} from "lucide-react";
import { usePersonalInvestments, usePagination } from "@/hooks";
import {
  formatCurrency,
  formatDate,
  calculateExpirationDate,
  calculatePersonalEarnings,
} from "@/lib/businessUtils";
import { PersonalInvestment } from "@/types";

const AddInvestmentForm = ({
  onSuccess,
  onCancel,
  investment = null,
  onAdd,
  onUpdate,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  investment?: PersonalInvestment | null;
  onAdd: (
    data: Omit<PersonalInvestment, "id" | "earnings" | "totalEarned">
  ) => void;
  onUpdate: (id: string, data: Partial<PersonalInvestment>) => void;
}) => {
  const [formData, setFormData] = useState({
    amount: investment?.amount.toString() || "",
    startDate: investment?.startDate || new Date().toISOString().split("T")[0],
    status:
      investment?.status || ("active" as "active" | "completed" | "expired"),
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, amount: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    const amount = parseFloat(formData.amount);
    const startDate = formData.startDate;
    const expirationDate = calculateExpirationDate(startDate);
    const earnings = calculatePersonalEarnings(amount);
    const totalEarned = earnings;

    const investmentData = {
      amount,
      startDate,
      expirationDate,
      status: "active" as const,
      cycleCount: investment ? investment.cycleCount : 1,
    };

    if (investment) {
      onUpdate(investment.id, {
        ...investmentData,
        earnings,
        totalEarned,
      });
    } else {
      onAdd(investmentData);
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {investment ? "Editar Inversión" : "Nueva Inversión"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto de Inversión *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {investment ? "Guardar Cambios" : "Agregar Inversión"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReinvestModal = ({
  investmentId,
  investments,
  onReinvest,
  onComplete,
  onCancel,
  isLoading = false,
}: {
  investmentId: string;
  investments: PersonalInvestment[];
  onReinvest: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) => {
  const investment = investments.find((i) => i.id === investmentId);

  if (!investment) return null;

  const newAmount = investment.amount + investment.earnings;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            Reinvertir Inversión
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700">¿Qué deseas hacer con esta inversión?</p>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monto actual:</p>
            <p className="font-bold text-green-700">
              {formatCurrency(investment.amount)}
            </p>
            <p className="text-sm text-gray-600 mt-2">+ Ganancias:</p>
            <p className="font-bold text-green-700">
              {formatCurrency(investment.earnings)}
            </p>
            <p className="text-sm text-gray-600 mt-2">= Nuevo monto:</p>
            <p className="font-bold text-green-800">
              {formatCurrency(newAmount)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onReinvest(investmentId)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Reinvertir Ahora
            </button>

            <button
              onClick={() => onComplete(investmentId)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              Completar Inversión
            </button>

            <button
              onClick={onCancel}
              className="mt-2 w-full text-gray-600 hover:text-gray-900 text-sm underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InvestmentsPage() {
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getActiveInvestments,
  } = usePersonalInvestments();
  const sortedInvestments = useMemo(() => {
    return [...investments].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;

      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [investments]);

  const handleCompleteInvestment = async (investmentId: string) => {
    setCycleActionLoading(true);

    updateInvestment(investmentId, {
      status: "completed",
    });

    setCycleActionLoading(false);
    setCycleModalInvestment(null);
    showToast("Inversión marcada como completada", "success");
  };

  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<string | null>(
    null
  );
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);
  const [cycleModalInvestment, setCycleModalInvestment] = useState<
    string | null
  >(null);
  const [cycleActionLoading, setCycleActionLoading] = useState(false);

  const activeInvestments = getActiveInvestments();
  const totalInvested = activeInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const totalEarnings = investments.reduce((sum, inv) => sum + inv.earnings, 0);

  const { currentPage, totalPages, currentItems, nextPage, previousPage } =
    usePagination(sortedInvestments, 10);

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta inversión?")) {
      deleteInvestment(id);
      showToast("Inversión eliminada exitosamente", "success");
    }
  };

  const handleReinvestInvestment = async (investmentId: string) => {
    setCycleActionLoading(true);
    const investment = sortedInvestments.find((inv) => inv.id === investmentId);

    if (!investment) {
      setCycleActionLoading(false);
      return;
    }

    const newAmount = parseFloat(
      (investment.amount + investment.earnings).toFixed(2)
    );
    const newEarnings = parseFloat((newAmount * 0.24).toFixed(2));

    const newStartDate = investment.expirationDate;
    const newExpirationDate = calculateExpirationDate(newStartDate);

    const totalEarned = parseFloat(
      (investment.totalEarned + newEarnings).toFixed(2)
    );

    updateInvestment(investmentId, {
      amount: newAmount,
      startDate: newStartDate,
      expirationDate: newExpirationDate,
      earnings: newEarnings,
      totalEarned,
      cycleCount: investment.cycleCount + 1,
      status: "active",
    });

    setCycleActionLoading(false);
    setCycleModalInvestment(null);
    showToast("Reinversión exitosa. El ciclo ha sido actualizado.", "success");
  };
  const investmentsExpiringToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return activeInvestments.filter((inv) => inv.expirationDate === today)
      .length;
  }, [activeInvestments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completado
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const calculateProjection = (
    initialAmount: number,
    cycles: number
  ): number => {
    if (initialAmount === 0) return 0;

    let amount = initialAmount;
    for (let i = 0; i < cycles; i++) {
      amount = amount * 1.24;
    }
    return parseFloat(amount.toFixed(2));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inversiones Personales
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus inversiones directas y ganancias
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Inversión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center text-center">
            <DollarSign className="h-8 w-8 text-primary-500 mb-2" />
            <p className="text-sm text-gray-600">Total Invertido</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalInvested)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-8 w-8 text-success-500 mb-2" />
            <p className="text-sm text-gray-600">Ganancias Totales</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalEarnings)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center text-center">
            <Calendar className="h-8 w-8 text-warning-500 mb-2" />
            <p className="text-sm text-gray-600">Inversiones Activas</p>
            <p className="text-2xl font-bold">{activeInvestments.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center text-center">
            <Calendar className="h-8 w-8 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600">Vencen Hoy</p>
            <p className="text-2xl font-bold text-center">
              {investmentsExpiringToday > 0
                ? `${investmentsExpiringToday} inversión${
                    investmentsExpiringToday !== 1 ? "es" : ""
                  }`
                : "No finalizan inversiones el dia de hoy"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Inversiones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inversión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganancias (24%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatCurrency(investment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(investment.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(investment.expirationDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                    {formatCurrency(investment.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">
                    {formatCurrency(investment.amount + investment.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ciclo {investment.cycleCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(investment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingInvestment(investment.id);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCycleModalInvestment(investment.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Reinvertir"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
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
              Página {currentPage} de {totalPages} • {sortedInvestments.length}{" "}
              inversiones
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Capital Inicial Total</span>
              <span className="font-medium">
                {formatCurrency(totalInvested)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ganancias Generadas</span>
              <span className="font-medium text-success-600">
                {formatCurrency(totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total Actual</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalInvested + totalEarnings)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ROI Realizado</span>
                <span className="font-bold text-success-600">
                  {totalInvested > 0
                    ? `+${((totalEarnings / totalInvested) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Proyección de Crecimiento
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-sm text-primary-800 font-medium">
                3 Meses (3 ciclos)
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(calculateProjection(totalInvested, 3))}
              </div>
              <div className="text-xs text-primary-600 mt-1">
                Desde {formatCurrency(totalInvested)}
              </div>
            </div>
            <div className="p-4 bg-success-50 rounded-lg">
              <div className="text-sm text-success-800 font-medium">
                6 Meses (6 ciclos)
              </div>
              <div className="text-2xl font-bold text-success-600">
                {formatCurrency(calculateProjection(totalInvested, 6))}
              </div>
              <div className="text-xs text-success-600 mt-1">
                Desde {formatCurrency(totalInvested)}
              </div>
            </div>
            <div className="p-4 bg-warning-50 rounded-lg">
              <div className="text-sm text-warning-800 font-medium">
                9 Meses (9 ciclos)
              </div>
              <div className="text-2xl font-bold text-warning-600">
                {formatCurrency(calculateProjection(totalInvested, 9))}
              </div>
              <div className="text-xs text-warning-600 mt-1">
                Desde {formatCurrency(totalInvested)}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-800 font-medium">
                12 Meses (13 ciclos)
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(calculateProjection(totalInvested, 13))}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Desde {formatCurrency(totalInvested)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {investments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            No hay inversiones registradas
          </p>
          <p className="text-gray-400 mt-1">
            Comienza registrando tu primera inversión
          </p>
        </div>
      )}

      {showForm && (
        <AddInvestmentForm
          onSuccess={() => {
            setShowForm(false);
            setEditingInvestment(null);
            showToast("Inversión guardada exitosamente", "success");
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingInvestment(null);
          }}
          investment={
            editingInvestment
              ? investments.find((i) => i.id === editingInvestment) || null
              : null
          }
          onAdd={addInvestment}
          onUpdate={updateInvestment}
        />
      )}

      {cycleModalInvestment && (
        <ReinvestModal
          investmentId={cycleModalInvestment}
          investments={sortedInvestments}
          onReinvest={handleReinvestInvestment}
          onComplete={handleCompleteInvestment}
          onCancel={() => setCycleModalInvestment(null)}
          isLoading={cycleActionLoading}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
