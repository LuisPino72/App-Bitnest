"use client";

import { DollarSign, Users, TrendingUp, Calendar, AlertCircle, Crown } from "lucide-react";
import { useFirebaseDashboardMetrics } from "@/hooks";
import { formatCurrency } from "@/lib/businessUtils";
import MetricCard from "@/components/ui/MetricCard";

export default function DashboardPage() {
  const { metrics, topReferrals, expiringToday, loading } = useFirebaseDashboardMetrics();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">Cargando datos...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-1">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm">Resumen general de tus referidos e inversiones</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Inversiones Totales"
          value={formatCurrency(metrics.totalInvestments)}
          icon={<DollarSign className="h-5 w-5" />}
          changeType="positive"
          centered
        />
        <MetricCard
          title="Referidos Activos"
          value={metrics.totalReferrals.toString()}
          change={`${metrics.firstGeneration} Gen1, ${metrics.secondGeneration} Gen2`}
          icon={<Users className="h-5 w-5" />}
          centered
        />
        <MetricCard
          title="Ganancias Totales"
          value={formatCurrency(metrics.totalEarnings)}
          icon={<TrendingUp className="h-5 w-5" />}
          changeType="positive"
          centered
        />
        <MetricCard
          title="Ganancias Mensuales"
          value={formatCurrency(metrics.monthlyEarnings)}
          icon={<TrendingUp className="h-5 w-5" />}
          changeType="positive"
          centered
        />
      </div>

      {/* Top Referidos y Vencimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Top Referidos */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Top 3 Mejores Referidos</h2>
            <Crown className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="space-y-2">
            {topReferrals.length > 0 ? (
              topReferrals.map((referral, index) => (
                <div key={referral.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">{referral.name}</p>
                      <p className="text-xs text-gray-600">
                        Gen {referral.generation} • {formatCurrency(referral.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Vencimientos de Hoy</h2>
            <AlertCircle className={`h-4 w-4 ${
              metrics.expiringToday > 0 ? "text-red-500" : "text-gray-400"
            }`} />
          </div>
          <div className="space-y-2">
            {expiringToday.referrals.length === 0 && expiringToday.investments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay vencimientos hoy</p>
                <p className="text-xs mt-1">¡Todo bajo control!</p>
              </div>
            ) : (
              <>
                {expiringToday.referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{referral.name}</p>
                      <p className="text-xs text-gray-600">
                        Referido Gen {referral.generation} • {formatCurrency(referral.amount)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Vence hoy
                    </span>
                  </div>
                ))}
                {expiringToday.investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Inversión Personal</p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(investment.amount)} • Ciclo {investment.cycleCount}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Generaciones</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Primera Generación</span>
              <span className="font-medium">{metrics.firstGeneration} referidos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Segunda Generación</span>
              <span className="font-medium">{metrics.secondGeneration} referidos</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span>{metrics.totalReferrals} referidos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Leads Activos</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interesados</span>
              <span className="font-medium text-green-600">{metrics.activeLeads}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>En seguimiento</span>
              <span>Para conversión</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Resumen del Mes</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ingresos Mensuales</span>
              <span className="font-medium text-green-600">{formatCurrency(metrics.monthlyEarnings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items que Vencen</span>
              <span className="font-medium text-orange-600">{metrics.expiringToday}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}