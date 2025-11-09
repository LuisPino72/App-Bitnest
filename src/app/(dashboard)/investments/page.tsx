"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useFirebasePersonalInvestments } from "@/hooks";
import {
  formatCurrency,
  formatDate,
  calculateExpirationDate,
  calculatePersonalEarnings,
  getTodayISO,
} from "@/lib/businessUtils";
import { PersonalInvestment } from "@/types";
import { BUSINESS_CONSTANTS } from "@/types/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddInvestmentForm from "@/components/investments/AddInvestmentForm";
import ReinvestModal from "@/components/investments/ReinvestModal";

export default function InvestmentsPage() {
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    loading,
  } = useFirebasePersonalInvestments();

  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<string | null>(
    null
  );
  const [cycleModalInvestment, setCycleModalInvestment] = useState<
    string | null
  >(null);
  const [cycleActionLoading, setCycleActionLoading] = useState(false);

  // Calcular métricas usando useMemo para performance
  const metrics = useMemo(() => {
    const activeInvestments = investments.filter(
      (inv) => inv.status === "active"
    );
    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    const totalEarnings = investments.reduce(
      (sum, inv) => sum + inv.earnings,
      0
    );
    const today = new Date().toISOString().split("T")[0];
    const investmentsExpiringToday = activeInvestments.filter(
      (inv) => inv.expirationDate === today
    ).length;

    return {
      activeInvestments,
      totalInvested,
      totalEarnings,
      investmentsExpiringToday,
      netWorth: totalInvested + totalEarnings,
    };
  }, [investments]);

  // Ordenar inversiones
  const sortedInvestments = useMemo(() => {
    return [...investments].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [investments]);

  // Handlers
  const handleReinvestInvestment = async (investmentId: string) => {
    setCycleActionLoading(true);

    try {
      const investment = investments.find((inv) => inv.id === investmentId);
      if (!investment) return;

      await updateInvestment(investmentId, { status: "completed" });

      const newAmount = parseFloat(
        (investment.amount + investment.earnings).toFixed(2)
      );
      const cycleDays =
        (investment as any).cycleDays ||
        investment.cycleCount ||
        BUSINESS_CONSTANTS.CYCLE_DAYS;
      const newEarnings = calculatePersonalEarnings(newAmount, cycleDays);
      const newStartDate = getTodayISO();
      const newExpirationDate = calculateExpirationDate(
        newStartDate,
        cycleDays
      );
      const totalEarned = parseFloat(
        (investment.totalEarned + newEarnings).toFixed(2)
      );

      await addInvestment({
        amount: newAmount,
        startDate: newStartDate,
        expirationDate: newExpirationDate,
        status: "active",
        cycleCount: (investment.cycleCount || 1) + 1,
        ...({ cycleDays } as any),
      } as any);
    } catch (error) {
      console.error("Error reinvesting investment:", error);
    } finally {
      setCycleActionLoading(false);
      setCycleModalInvestment(null);
    }
  };

  const handleCompleteInvestment = async (investmentId: string) => {
    setCycleActionLoading(true);

    try {
      await updateInvestment(investmentId, { status: "completed" });
    } catch (error) {
      console.error("Error completing investment:", error);
    } finally {
      setCycleActionLoading(false);
      setCycleModalInvestment(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta inversión?")) {
      await deleteInvestment(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "active":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Activo
          </span>
        );
      case "completed":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Completado
          </span>
        );
      case "expired":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Expirado
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
            Inversiones Personales
          </h1>
          <p className="text-gray-500 text-base mt-2 animate-pulse">
            Cargando...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 animate-pulse rounded-xl h-28 shadow-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in py-8 px-2 md:px-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          Inversiones Personales
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Gestiona tus inversiones directas y ganancias
        </p>
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setShowForm(true)}
            className="font-bold text-base"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Inversión
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex flex-col items-center text-center">
          <DollarSign className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-sm text-gray-600">Total Invertido</p>
          <p className="text-2xl font-bold">
            {formatCurrency(metrics.totalInvested)}
          </p>
        </div>
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex flex-col items-center text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-sm text-gray-600">Ganancias Totales</p>
          <p className="text-2xl font-bold">
            {formatCurrency(metrics.totalEarnings)}
          </p>
        </div>
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex flex-col items-center text-center">
          <Calendar className="h-8 w-8 text-yellow-500 mb-2" />
          <p className="text-sm text-gray-600">Inversiones Activas</p>
          <p className="text-2xl font-bold">
            {metrics.activeInvestments.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex flex-col items-center text-center">
          <Calendar className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-sm text-gray-600">Vencen Hoy</p>
          <p className="text-2xl font-bold">
            {metrics.investmentsExpiringToday}
          </p>
        </div>
      </div>

      {/* Tabla de Inversiones */}
      <div className="rounded-2xl border bg-white shadow-lg mb-8 max-w-6xl mx-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Historial de Inversiones
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Inversión
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Fecha Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Ganancias
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedInvestments.map((investment) => (
                <tr key={investment.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap font-bold">
                    {formatCurrency(investment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(investment.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(investment.expirationDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                    {formatCurrency(investment.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">
                    {formatCurrency(investment.amount + investment.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      Ciclo {investment.cycleCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(investment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingInvestment(investment.id);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCycleModalInvestment(investment.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(investment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedInvestments.length === 0 && (
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
      </div>

      {/* Resumen y Proyecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mb-8">
        <div className="rounded-2xl border bg-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Resumen de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Capital Inicial Total</span>
              <span className="font-bold">
                {formatCurrency(metrics.totalInvested)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ganancias Generadas</span>
              <span className="font-bold text-green-600">
                {formatCurrency(metrics.totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total Actual</span>
              <span className="font-bold text-lg">
                {formatCurrency(metrics.netWorth)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ROI Realizado</span>
                <span className="font-bold text-green-600">
                  {metrics.totalInvested > 0
                    ? `+${(
                        (metrics.totalEarnings / metrics.totalInvested) *
                        100
                      ).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Proyección de Crecimiento
          </h3>
          <div className="space-y-4">
            {[
              { months: 3, cycles: 3, color: "blue" },
              { months: 6, cycles: 6, color: "green" },
              { months: 9, cycles: 9, color: "yellow" },
              { months: 12, cycles: 13, color: "purple" },
            ].map(({ months, cycles, color }) => (
              <div key={months} className={`p-4 bg-${color}-50 rounded-lg`}>
                <div className={`text-sm text-${color}-800 font-bold`}>
                  {months} Meses ({cycles} ciclos)
                </div>
                <div className={`text-2xl font-bold text-${color}-600`}>
                  {formatCurrency(
                    calculateProjection(metrics.totalInvested, cycles)
                  )}
                </div>
                <div className={`text-xs text-${color}-600 mt-1`}>
                  Desde {formatCurrency(metrics.totalInvested)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showForm && (
        <AddInvestmentForm
          investment={
            editingInvestment
              ? investments.find((i) => i.id === editingInvestment) || null
              : null
          }
          onSuccess={() => {
            setShowForm(false);
            setEditingInvestment(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingInvestment(null);
          }}
        />
      )}

      {cycleModalInvestment && (
        <ReinvestModal
          investmentId={cycleModalInvestment}
          investments={investments}
          onReinvest={handleReinvestInvestment}
          onComplete={handleCompleteInvestment}
          onCancel={() => setCycleModalInvestment(null)}
          isLoading={cycleActionLoading}
        />
      )}
    </div>
  );
}
