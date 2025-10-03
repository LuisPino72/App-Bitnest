"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Users, X, RefreshCw } from "lucide-react";
import { useFirebaseReferrals } from "@/hooks";
import {
  formatCurrency,
  formatDate,
  getActiveReferralPersons,
} from "@/lib/businessUtils";
import { AddReferralForm } from "@/components/referrals/AddReferralForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ReferralsPage() {
  const { referrals, addReferral, updateReferral, deleteReferral, loading } =
    useFirebaseReferrals();

  // ✅ ACTUALIZADO: Soporte para todas las generaciones
  const [filterGeneration, setFilterGeneration] = useState<
    "all" | "1" | "2" | "3" | "4" | "5" | "6" | "7"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed" | "expired"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<string | null>(null);
  const [cycleModalReferral, setCycleModalReferral] = useState<string | null>(
    null
  );
  const [cycleActionLoading, setCycleActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ ESTADÍSTICAS ACTUALIZADAS: Para todas las generaciones
  const activeReferralPersons = useMemo(
    () => getActiveReferralPersons(referrals),
    [referrals]
  );

  // Contar referidos activos por generación
  const generationStats = useMemo(() => {
    const stats = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    };

    activeReferralPersons.forEach((referral) => {
      if (stats[referral.generation] !== undefined) {
        stats[referral.generation]++;
      }
    });

    return stats;
  }, [activeReferralPersons]);

  const totalUniqueReferrals = new Set(referrals.map((r) => r.wallet)).size;

  // ✅ FILTRADO ACTUALIZADO: Soporta todas las generaciones
  const filteredReferrals = useMemo(() => {
    return referrals
      .filter((referral) => {
        const generationMatch =
          filterGeneration === "all" ||
          referral.generation.toString() === filterGeneration;
        const statusMatch =
          filterStatus === "all" || referral.status === filterStatus;
        const searchMatch =
          referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.wallet.toLowerCase().includes(searchTerm.toLowerCase());

        return generationMatch && statusMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return (
          new Date(a.expirationDate).getTime() -
          new Date(b.expirationDate).getTime()
        );
      });
  }, [referrals, filterGeneration, filterStatus, searchTerm]);

  // ✅ HANDLERS ACTUALIZADOS: Cálculo correcto para todas las generaciones
  const handleFinishCycle = async (referralId: string) => {
    setCycleActionLoading(true);
    await updateReferral(referralId, { status: "completed" });
    setCycleActionLoading(false);
    setCycleModalReferral(null);
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

    // ✅ CÁLCULO CORRECTO PARA TODAS LAS GENERACIONES
    const commissionRates = {
      1: 0.2,
      2: 0.1,
      3: 0.05,
      4: 0.05,
      5: 0.05,
      6: 0.05,
      7: 0.05,
    };
    const commissionRate = commissionRates[referral.generation] || 0;
    const newUserIncome = parseFloat((newEarnings * commissionRate).toFixed(2));

    const today = new Date().toISOString().split("T")[0];
    const expirationDate = new Date(today);
    expirationDate.setDate(expirationDate.getDate() + 28);

    await updateReferral(referralId, {
      amount: newAmount,
      cycle: newCycle,
      investmentDate: today,
      expirationDate: expirationDate.toISOString().split("T")[0],
      earnings: newEarnings,
      userIncome: newUserIncome,
      totalEarned: parseFloat(
        (referral.totalEarned + newEarnings + newUserIncome).toFixed(2)
      ),
      status: "active",
      startDate: today,
      cycleCount: newCycle,
    });

    setCycleActionLoading(false);
    setCycleModalReferral(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este referido?")) {
      await deleteReferral(id);
    }
  };

  // ✅ FUNCIÓN MEJORADA: Badge de generación con colores para todas las generaciones
  const getGenerationBadge = (generation: number) => {
    const baseClasses =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-yellow-100 text-yellow-800",
      3: "bg-green-100 text-green-800",
      4: "bg-purple-100 text-purple-800",
      5: "bg-pink-100 text-pink-800",
      6: "bg-indigo-100 text-indigo-800",
      7: "bg-orange-100 text-orange-800",
    };

    const colorClass =
      colors[generation as keyof typeof colors] || "bg-gray-100 text-gray-800";

    return (
      <span className={`${baseClasses} ${colorClass}`}>Gen {generation}</span>
    );
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referidos</h1>
            <p className="text-gray-600 mt-2">Cargando...</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nueva inversión
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referidos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu red de referidos y sus inversiones
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva inversión
        </Button>
      </div>

      {/* ✅ ESTADÍSTICAS ACTUALIZADAS: Muestra dinámicamente las generaciones que tienen referidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {/* Tarjeta de Total de Referidos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Referidos</p>
                <p className="text-2xl font-bold">{totalUniqueReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ GENERAR TARJETAS DINÁMICAMENTE PARA CADA GENERACIÓN CON REFERIDOS */}
        {Object.entries(generationStats)
          .filter(([_, count]) => count > 0)
          .map(([generation, count]) => (
            <Card key={generation}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users
                    className={`h-8 w-8 ${
                      generation === "1"
                        ? "text-green-500"
                        : generation === "2"
                        ? "text-yellow-500"
                        : generation === "3"
                        ? "text-purple-500"
                        : generation === "4"
                        ? "text-pink-500"
                        : generation === "5"
                        ? "text-indigo-500"
                        : generation === "6"
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Gen {generation}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Tarjeta de Total Activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">
                  {activeReferralPersons.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ FILTROS ACTUALIZADOS: Selector de generación con todas las opciones */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o billetera"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-1 justify-end">
              <select
                value={filterGeneration}
                onChange={(e) => setFilterGeneration(e.target.value as any)}
                className="block w-full max-w-xs pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las generaciones</option>
                <option value="1">Primera generación</option>
                <option value="2">Segunda generación</option>
                <option value="3">Tercera generación</option>
                <option value="4">Cuarta generación</option>
                <option value="5">Quinta generación</option>
                <option value="6">Sexta generación</option>
                <option value="7">Séptima generación</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="block w-full max-w-xs pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Referidos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Referido
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Generación
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Inversión
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Ganancias
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Tu Ingreso
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Vencimiento
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {referral.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">
                      {referral.wallet}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {getGenerationBadge(referral.generation)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center font-medium">
                    {formatCurrency(referral.amount)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-green-600">
                    {formatCurrency(referral.earnings)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center font-medium text-blue-600">
                    {formatCurrency(referral.userIncome)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {getStatusBadge(referral.status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {formatDate(referral.expirationDate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingReferral(referral.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCycleModalReferral(referral.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(referral.id)}
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

        {filteredReferrals.length === 0 && (
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
      </Card>

      {/* Modales */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Agregar Nuevo Referido
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <AddReferralForm
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {editingReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Editar Referido
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingReferral(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <AddReferralForm
                referral={
                  referrals.find((r) => r.id === editingReferral) || null
                }
                onSuccess={() => setEditingReferral(null)}
                onCancel={() => setEditingReferral(null)}
              />
            </div>
          </div>
        </div>
      )}

      {cycleModalReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Finalizar Ciclo
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCycleModalReferral(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                ¿Qué deseas hacer con este referido?
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleFinishCycle(cycleModalReferral)}
                  disabled={cycleActionLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Finalizar ciclo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReinvestCycle(cycleModalReferral)}
                  disabled={cycleActionLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reinvertir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
