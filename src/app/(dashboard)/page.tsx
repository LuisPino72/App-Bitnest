"use client";

import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  Crown,
} from "lucide-react";
import { useFirebaseDashboardMetrics, useFirebaseReferrals } from "@/hooks";
import {
  formatCurrency,
  getUniqueReferrals,
  getActiveReferralPersons,
} from "@/lib/businessUtils";
import MetricCard from "@/components/ui/MetricCard";
import { DashboardMetrics } from "@/types"; 

export default function DashboardPage() {
  const {
    metrics: rawMetrics,
    topReferrals,
    expiringToday,
    loading,
  } = useFirebaseDashboardMetrics();
  const { referrals } = useFirebaseReferrals();

  const metrics = rawMetrics as DashboardMetrics;
  // Lógica de referidos únicos y activos por wallet
  const totalUniqueReferrals = getUniqueReferrals(referrals).length;
  const activeReferralPersons = getActiveReferralPersons(referrals).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
            Dashboard
          </h1>
          <p className="text-gray-500 text-base mt-2 animate-pulse">
            Cargando datos...
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
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
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          Dashboard
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Resumen general de tus referidos e inversiones
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
        <MetricCard
          title="Inversiones Totales"
          value={formatCurrency(metrics.totalInvestments)}
          icon={<DollarSign className="h-6 w-6" />}
          changeType="positive"
          centered
        />
        <MetricCard
          title="Referidos Activos"
          value={activeReferralPersons.toString()}
          icon={<Users className="h-6 w-6" />}
          centered
        />
        <MetricCard
          title="Ganancias Totales"
          value={formatCurrency(metrics.totalEarnings)}
          icon={<TrendingUp className="h-6 w-6" />}
          changeType="positive"
          centered
        />
        <MetricCard
          title="Ganancias Mensuales"
          value={formatCurrency(metrics.monthlyEarnings)}
          icon={<TrendingUp className="h-6 w-6" />}
          changeType="positive"
          centered
        />
      </div>

      {/* Top Referidos y Vencimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto mb-8">
        {/* Top Referidos */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Top 3 Mejores Referidos
            </h2>
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {topReferrals.length > 0 ? (
              topReferrals.map((referral, index) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 via-gray-50 to-orange-50 rounded-xl shadow-sm"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-orange-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-semibold text-gray-900">
                        {referral.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Gen {referral.generation} •{" "}
                        {formatCurrency(referral.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-green-600">
                      {formatCurrency(referral.userIncome || 0)}
                    </p>
                    <p className="text-xs text-gray-500">ingreso</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay referidos activos</p>
              </div>
            )}
          </div>
        </div>

        {/* Vencimientos de Hoy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Vencimientos de Hoy
            </h2>
            <AlertCircle
              className={`h-5 w-5 ${
                metrics.expiringToday > 0 ? "text-red-500" : "text-gray-400"
              }`}
            />
          </div>
          <div className="space-y-3">
            {expiringToday.referrals.length === 0 &&
            expiringToday.investments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay vencimientos hoy</p>
                <p className="text-xs mt-1">¡Todo bajo control!</p>
              </div>
            ) : (
              <>
                {expiringToday.referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 via-white to-yellow-50 border border-red-200 rounded-xl shadow-sm"
                  >
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {referral.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Referido Gen {referral.generation} •{" "}
                        {formatCurrency(referral.amount)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shadow">
                      Vence hoy
                    </span>
                  </div>
                ))}
                {expiringToday.investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 via-white to-red-50 border border-yellow-200 rounded-xl shadow-sm"
                  >
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        Inversión Personal
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(investment.amount)} • Ciclo{" "}
                        {investment.cycleCount}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 shadow">
                      Vence hoy
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
        {/* Generaciones */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Inversiones por Generaciones
          </h3>
          <div className="space-y-2">
            {[
              {
                key: "firstGeneration",
                label: "Primera Generación",
                value: metrics.firstGeneration,
              },
              {
                key: "secondGeneration",
                label: "Segunda Generación",
                value: metrics.secondGeneration,
              },
              {
                key: "thirdGeneration",
                label: "Tercera Generación",
                value: metrics.thirdGeneration,
              },
              {
                key: "fourthGeneration",
                label: "Cuarta Generación",
                value: metrics.fourthGeneration,
              },
              {
                key: "fifthGeneration",
                label: "Quinta Generación",
                value: metrics.fifthGeneration,
              },
              {
                key: "sixthGeneration",
                label: "Sexta Generación",
                value: metrics.sixthGeneration,
              },
              {
                key: "seventhGeneration",
                label: "Séptima Generación",
                value: metrics.seventhGeneration,
              },
            ]
              .filter((item) => item.value > 0)
              .map((item) => (
                <div key={item.key} className="flex justify-between text-base">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-bold">{item.value} inversiones</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Personas interesadas
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Interesados</span>
              <span className="font-bold text-green-600">
                {metrics.activeLeads}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>En seguimiento</span>
              <span>Para conversión</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Resumen del Mes
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Ingresos Mensuales</span>
              <span className="font-bold text-green-600">
                {formatCurrency(metrics.monthlyEarnings)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
