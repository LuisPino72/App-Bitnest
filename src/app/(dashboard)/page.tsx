'use client';

import React from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Crown, 
  ArrowUpRight 
} from 'lucide-react';
import { useDashboardMetrics } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/businessUtils';
import MetricCard from '@/components/ui/MetricCard';
import ClientOnly from '@/components/ui/ClientOnly';

export default function DashboardPage() {
  const { metrics, topReferrals, expiringToday } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general de tus referidos e inversiones
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClientOnly fallback={<MetricCard title="Inversiones Totales" value="Cargando..." icon={<DollarSign className="h-6 w-6" />} />}>
          <MetricCard
            title="Inversiones Totales"
            value={formatCurrency(metrics.totalInvestments)}
            icon={<DollarSign className="h-6 w-6" />}
            changeType="positive"
          />
        </ClientOnly>
        <ClientOnly fallback={<MetricCard title="Referidos Activos" value="Cargando..." icon={<Users className="h-6 w-6" />} />}>
          <MetricCard
            title="Referidos Activos"
            value={metrics.totalReferrals.toString()}
            change={`${metrics.firstGeneration} Gen1, ${metrics.secondGeneration} Gen2`}
            icon={<Users className="h-6 w-6" />}
          />
        </ClientOnly>
        <ClientOnly fallback={<MetricCard title="Ganancias Totales" value="Cargando..." icon={<TrendingUp className="h-6 w-6" />} />}>
          <MetricCard
            title="Ganancias Totales"
            value={formatCurrency(metrics.totalEarnings)}
            icon={<TrendingUp className="h-6 w-6" />}
            changeType="positive"
          />
        </ClientOnly>
        <ClientOnly fallback={<MetricCard title="Vencen Hoy" value="Cargando..." icon={<Calendar className="h-6 w-6" />} />}>
          <MetricCard
            title="Vencen Hoy"
            value={metrics.expiringToday.toString()}
            icon={<Calendar className="h-6 w-6" />}
            changeType={metrics.expiringToday > 0 ? "negative" : "neutral"}
          />
        </ClientOnly>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrals */}
        <ClientOnly fallback={
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Top 3 Mejores Referidos
              </h2>
              <Crown className="h-5 w-5 text-warning-500" />
            </div>
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Cargando...</p>
            </div>
          </div>
        }>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Top 3 Mejores Referidos
            </h2>
            <Crown className="h-5 w-5 text-warning-500" />
          </div>
          <div className="space-y-4">
            {topReferrals.length > 0 ? (
              topReferrals.map((referral, index) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${{
                        0: 'bg-warning-500',
                        1: 'bg-gray-400', 
                        2: 'bg-orange-400'
                      }[index]}`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {referral.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Gen {referral.generation} • {formatCurrency(referral.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success-600">
                      {formatCurrency(referral.userIncome)}
                    </p>
                    <p className="text-xs text-gray-500">ingreso</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay referidos activos</p>
              </div>
            )}
          </div>
        </div>
        </ClientOnly>

        {/* Expiring Today */}
        <ClientOnly fallback={
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Vencimientos de Hoy
              </h2>
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Cargando...</p>
            </div>
          </div>
        }>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Vencimientos de Hoy
            </h2>
            <AlertCircle className={`h-5 w-5 ${
              metrics.expiringToday > 0 ? 'text-danger-500' : 'text-gray-400'
            }`} />
          </div>
          <div className="space-y-4">
            {expiringToday.referrals.length === 0 && expiringToday.investments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay vencimientos hoy</p>
                <p className="text-xs mt-1">¡Todo bajo control!</p>
              </div>
            ) : (
              <>
                {expiringToday.referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {referral.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Referido Gen {referral.generation} • {formatCurrency(referral.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-danger">Vence hoy</span>
                    </div>
                  </div>
                ))}
                {expiringToday.investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Inversión Personal
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(investment.amount)} • Ciclo {investment.cycleCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-warning">Vence hoy</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        </ClientOnly>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generaciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Primera Generación</span>
              <span className="font-medium">{metrics.firstGeneration} referidos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Segunda Generación</span>
              <span className="font-medium">{metrics.secondGeneration} referidos</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{metrics.totalReferrals} referidos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Activos</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Interesados</span>
              <span className="font-medium text-success-600">{metrics.activeLeads}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>En seguimiento</span>
              <span>Para conversión</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos del Mes</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Este Mes</span>
              <span className="font-medium text-success-600">{formatCurrency(metrics.monthlyEarnings)}</span>
            </div>
            <div className="flex items-center text-sm text-success-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>Últimos 30 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}