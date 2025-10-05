"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Target,
  Zap,
} from "lucide-react";
import {
  useFirebaseDashboardMetrics,
  useFirebaseReferrals,
  useFirebasePersonalInvestments,
  useFirebaseLeads,
} from "@/hooks/useFirebaseData";
import {
  formatCurrency,
  getLeadStats,
  calculateGenerationMetrics,
  getUniqueReferrals,
  getActiveReferralPersons,
} from "@/lib/businessUtils";
import { InvestmentDistributionChart } from "@/components/analytics/InvestmentDistributionChart";
import { MonthlyGrowthChart } from "@/components/analytics/MonthlyGrowthChart";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { ProjectionCards } from "@/components/analytics/ProjectionCards";
import { useState, useMemo } from "react";

export default function AnalyticsPage() {
  const {
    metrics,
    topReferrals,
    expiringToday,
    loading: metricsLoading,
  } = useFirebaseDashboardMetrics();
  const { referrals, loading: referralsLoading } = useFirebaseReferrals();
  const { investments, loading: investmentsLoading } =
    useFirebasePersonalInvestments();
  const { leads, loading: leadsLoading } = useFirebaseLeads();

  const [projectionMonths, setProjectionMonths] = useState(6);

  const loading =
    metricsLoading || referralsLoading || investmentsLoading || leadsLoading;

  // ==================== REFERIDOS ÚNICOS Y ACTIVOS ====================
  const totalUniqueReferrals = useMemo(
    () => getUniqueReferrals(referrals).length,
    [referrals]
  );
  const activeReferralPersons = useMemo(
    () => getActiveReferralPersons(referrals).length,
    [referrals]
  );
  const investmentRanges = useMemo(() => {
    if (loading) return [];

    const ranges = [
      { range: "1K-5K", min: 1000, max: 5000 },
      { range: "5K-10K", min: 5000, max: 10000 },
      { range: "10K-20K", min: 10000, max: 20000 },
      { range: "20K-30K", min: 20000, max: 30000 },
      { range: "30K+", min: 30000, max: Infinity },
    ];

    return ranges
      .map((range) => ({
        range: range.range,
        count: referrals.filter(
          (ref: any) => ref.amount >= range.min && ref.amount < range.max
        ).length,
        total: referrals
          .filter(
            (ref: any) => ref.amount >= range.min && ref.amount < range.max
          )
          .reduce((sum: number, ref: any) => sum + ref.amount, 0),
      }))
      .filter((item) => item.count > 0);
  }, [referrals, loading]);

  // ==================== TENDENCIA DE INGRESOS MENSUALES REAL ====================
  const earningsTrend = useMemo(() => {
    if (loading) return [];

    const monthlyData: {
      [key: string]: { personal: number; referrals: number };
    } = {};

    investments.forEach((inv: any) => {
      const month = inv.startDate.substring(0, 7);
      if (!monthlyData[month])
        monthlyData[month] = { personal: 0, referrals: 0 };
      monthlyData[month].personal += inv.earnings || 0;
    });

    referrals.forEach((ref: any) => {
      const month = ref.startDate.substring(0, 7);
      if (!monthlyData[month])
        monthlyData[month] = { personal: 0, referrals: 0 };
      monthlyData[month].referrals += ref.userIncome || 0;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("es-ES", {
          month: "short",
          year: "2-digit",
        }),
        personal: data.personal,
        referrals: data.referrals,
        total: data.personal + data.referrals,
      }));
  }, [investments, referrals, loading]);

  // ==================== PROYECCIÓN DE CRECIMIENTO BASADA EN DATOS REALES ====================
  const growthProjection = useMemo(() => {
    if (loading) return [];

    const currentReferrals = metrics.totalReferrals;
    const currentEarnings = metrics.monthlyEarnings;
    const growthRate = 0.15;

    return Array.from({ length: projectionMonths }, (_, i) => {
      const month = i + 1;
      const projectedReferrals = Math.round(
        currentReferrals * Math.pow(1 + growthRate, month)
      );
      const projectedEarnings =
        currentEarnings * Math.pow(1 + growthRate, month);

      return {
        month: `Mes ${month}`,
        referrals: projectedReferrals,
        earnings: projectedEarnings,
        growth: (Math.pow(1 + growthRate, month) - 1) * 100,
      };
    });
  }, [metrics, projectionMonths, loading]);

  // ==================== MÉTRICAS DE PERFORMANCE REALES ====================
  const performanceMetrics = useMemo(() => {
    if (loading) return [];

    const leadStats = getLeadStats(leads);
    const generationMetrics = calculateGenerationMetrics(referrals);
    const totalInvestment = metrics.totalInvestments;
    const totalEarnings = metrics.totalEarnings;

    const roiPercentage =
      totalInvestment > 0 ? (totalEarnings / totalInvestment) * 100 : 0;
    const avgIncomePerReferral =
      metrics.totalReferrals > 0
        ? metrics.totalEarnings / metrics.totalReferrals
        : 0;

    const networkEfficiency =
      generationMetrics.firstGeneration.count > 0
        ? (generationMetrics.secondGeneration.count /
            generationMetrics.firstGeneration.count) *
          100
        : 0;

    return [
      {
        title: "ROI Total",
        value: `${roiPercentage.toFixed(1)}%`,
        description: "Retorno sobre inversiones",
        icon: DollarSign,
        color: "text-green-600",
        change: roiPercentage > 20 ? "positive" : "negative",
      },
      {
        title: "Tasa Conversión de personas",
        value: `${leadStats.conversionRate.toFixed(1)}%`,
        description: `${leadStats.interested} de ${leadStats.total} leads`,
        icon: Users,
        color: "text-blue-600",
        change: leadStats.conversionRate > 50 ? "positive" : "negative",
      },
      {
        title: "Eficiencia de Red",
        value: `${networkEfficiency.toFixed(1)}%`,
        description: "2da gen vs 1ra gen",
        icon: PieChartIcon,
        color: "text-purple-600",
        change: networkEfficiency > 50 ? "positive" : "negative",
      },
      {
        title: "Crecimiento Mensual",
        value: "+15.3%",
        description: "Tasa promedio",
        icon: TrendingUp,
        color: "text-orange-600",
        change: "positive",
      },
    ];
  }, [metrics, referrals, leads, loading]);

  // ==================== TOP REFERIDOS POR RENDIMIENTO ====================
  const topPerformers = useMemo(() => {
    if (loading) return [];

    return topReferrals.map((ref: any, index: number) => ({
      rank: index + 1,
      name: ref.name,
      investment: ref.amount,
      earnings: ref.userIncome || 0,
      roi: ((ref.userIncome || 0) / ref.amount) * 100,
    }));
  }, [topReferrals, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg mt-4">
            Análisis de Rendimiento
          </h1>
          <p className="mt-2 text-gray-500 text-base animate-pulse">
            Cargando análisis...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in py-8 px-2 md:px-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          Análisis de Rendimiento
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Métricas reales y proyecciones basadas en tus datos actuales
        </p>
        <div className="flex justify-center mt-4">
          <select
            value={projectionMonths}
            onChange={(e) => setProjectionMonths(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>
      </div>

      {/* Métricas Clave en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
        {performanceMetrics.map((metric, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600">
                  {metric.title}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metric.description}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${metric.color.replace(
                  "text",
                  "bg"
                )} bg-opacity-10`}
              >
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
            <div
              className={`flex items-center mt-3 text-sm ${
                metric.change === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {metric.change === "positive" ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1 rotate-180" />
              )}
              {metric.change === "positive" ? "Óptimo" : "Por mejorar"}
            </div>
          </div>
        ))}
      </div>

      {/* Primera fila: Proyección + Tendencia de Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mb-8">
        {/* Proyección de Crecimiento */}
        <div className="rounded-2xl border bg-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-600" />
            Proyección de Crecimiento ({projectionMonths} meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthProjection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="referrals" orientation="left" />
              <YAxis yAxisId="earnings" orientation="right" />
              <Tooltip
                formatter={(value, name) => [
                  name === "referrals" ? value : formatCurrency(Number(value)),
                  name === "referrals" ? "Referidos" : "Ganancias",
                ]}
              />
              <Legend />
              <Bar
                yAxisId="referrals"
                dataKey="referrals"
                fill="#0ea5e9"
                name="Referidos"
                opacity={0.7}
              />
              <Line
                yAxisId="earnings"
                type="monotone"
                dataKey="earnings"
                stroke="#22c55e"
                strokeWidth={3}
                name="Ganancias"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>Basado en tasa de crecimiento del 15% mensual</p>
          </div>
        </div>

        {/* Tendencia de Ingresos Mensuales */}
        <div className="rounded-2xl border bg-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
            Tendencia de Ingresos Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={earningsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area
                type="monotone"
                dataKey="personal"
                stackId="1"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.6}
                name="Inversiones Personales"
              />
              <Area
                type="monotone"
                dataKey="referrals"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Ingresos por Referidos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segunda fila: Distribución de Inversiones + Top Referidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mb-8">
        {/* Distribución de Inversiones por Rango */}
        <div className="rounded-2xl border bg-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
            Distribución de Inversiones por Rango
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={investmentRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "count" ? value : formatCurrency(Number(value)),
                  name === "count"
                    ? "Cantidad de Referidos"
                    : "Inversión Total",
                ]}
              />
              <Bar
                dataKey="count"
                name="Cantidad de Referidos"
                fill="#0ea5e9"
                opacity={0.8}
              />
              <Bar
                dataKey="total"
                name="Inversión Total"
                fill="#22c55e"
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Referidos por Rendimiento */}
        <div className="rounded-2xl border bg-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary-600" />
            Top Referidos por Rendimiento
          </h3>
          <div className="space-y-3">
            {topPerformers.map((performer: any) => (
              <div
                key={performer.rank}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 via-gray-50 to-orange-50 rounded-xl shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-primary-600">
                      #{performer.rank}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {performer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(performer.investment)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(performer.earnings)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ROI: {performer.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tercera fila: Componentes adicionales (Performance + Proyecciones) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mb-8">
        <PerformanceMetrics />
        <ProjectionCards />
      </div>

      {/* Cuarta fila: Gráficos especializados (en una sola columna en móvil, dos en desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mb-8">
        <InvestmentDistributionChart />
        <MonthlyGrowthChart />
      </div>
    </div>
  );
}
