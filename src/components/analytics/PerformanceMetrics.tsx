"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useFirebaseData";
import { useFirebaseLeads } from "@/hooks/useFirebaseData";
import { formatCurrency } from "@/lib/businessUtils";
import { Zap, DollarSign, Users, Percent, TrendingUp } from "lucide-react";

export function PerformanceMetrics() {
  const { metrics } = useDashboardMetrics();
  const { leads } = useFirebaseLeads();

  // Calcula total de referidos con todas las generaciones
  const totalReferrals =
    metrics.firstGeneration +
    metrics.secondGeneration +
    metrics.thirdGeneration +
    metrics.fourthGeneration +
    metrics.fifthGeneration +
    metrics.sixthGeneration +
    metrics.seventhGeneration;

  const totalInvestment = metrics.totalInvestments;
  const totalMyIncome = metrics.totalEarnings;

  const avgIncomePerReferral =
    totalReferrals > 0 ? totalMyIncome / totalReferrals : 0;
  const roiPercentage =
    totalInvestment > 0 ? (totalMyIncome / totalInvestment) * 100 : 0;

  // Calcula eficiencia de red con todas las generaciones
  const firstGenCount = metrics.firstGeneration || 0;
  const totalDescendants =
    metrics.secondGeneration +
    metrics.thirdGeneration +
    metrics.fourthGeneration +
    metrics.fifthGeneration +
    metrics.sixthGeneration +
    metrics.seventhGeneration;

  const networkEfficiency =
    firstGenCount > 0 ? (totalDescendants / firstGenCount) * 100 : 0;

  // Calcula tasa de conversión real de leads
  const interestedLeads = leads.filter(
    (lead: any) => lead.status === "interested"
  ).length;
  const totalLeads = leads.length;
  const conversionRate =
    totalLeads > 0 ? (interestedLeads / totalLeads) * 100 : 0;

  // Calcula crecimiento mensual basado en todas las generaciones
  const monthlyGrowthRate =
    totalReferrals > 0 ? (metrics.monthlyEarnings / totalMyIncome) * 100 : 0;

  const performanceData = [
    {
      title: "ROI Total",
      value: `${roiPercentage.toFixed(1)}%`,
      description: "Retorno sobre inversiones",
      icon: Percent,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: roiPercentage > 15 ? "positive" : "neutral",
    },
    {
      title: "Ingreso Promedio/Referido",
      value: formatCurrency(avgIncomePerReferral),
      description: "Ganancia media por referido",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: avgIncomePerReferral > 100 ? "positive" : "neutral",
    },
    {
      title: "Eficiencia de Red",
      value: `${networkEfficiency.toFixed(1)}%`,
      description: `${totalDescendants} descendientes de ${firstGenCount} raíz`,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: networkEfficiency > 50 ? "positive" : "neutral",
    },
    {
      title: "Crecimiento Mensual",
      value: `${monthlyGrowthRate.toFixed(1)}%`,
      description: "Tasa de crecimiento mensual",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: monthlyGrowthRate > 10 ? "positive" : "neutral",
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "positive") {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Métricas de Rendimiento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((metric, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${metric.bg} rounded-lg`}
                >
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-600">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ NUEVO: Resumen de Generaciones */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Distribución por Generaciones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            {
              name: "1ra Gen",
              count: metrics.firstGeneration,
              color: "bg-blue-500",
            },
            {
              name: "2da Gen",
              count: metrics.secondGeneration,
              color: "bg-green-500",
            },
            {
              name: "3ra Gen",
              count: metrics.thirdGeneration,
              color: "bg-yellow-500",
            },
            {
              name: "4ta Gen",
              count: metrics.fourthGeneration,
              color: "bg-red-500",
            },
            {
              name: "5ta Gen",
              count: metrics.fifthGeneration,
              color: "bg-purple-500",
            },
            {
              name: "6ta Gen",
              count: metrics.sixthGeneration,
              color: "bg-cyan-500",
            },
            {
              name: "7ma Gen",
              count: metrics.seventhGeneration,
              color: "bg-orange-500",
            },
          ].map((gen, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div
                className={`w-3 h-3 ${gen.color} rounded-full mx-auto mb-2`}
              ></div>
              <div className="text-sm font-medium text-gray-900">
                {gen.name}
              </div>
              <div className="text-lg font-bold text-gray-700">{gen.count}</div>
              <div className="text-xs text-gray-500">referidos</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
