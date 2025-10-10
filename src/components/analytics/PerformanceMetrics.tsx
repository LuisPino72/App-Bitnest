"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useFirebaseData";
import { useFirebaseLeads } from "@/hooks/useFirebaseData";
import { formatCurrency } from "@/lib/businessUtils";
import { Zap, DollarSign, Users, Percent, TrendingUp } from "lucide-react";

export function PerformanceMetrics() {
  const { metrics } = useDashboardMetrics();
  const { leads } = useFirebaseLeads();

  // Sumar todas las generaciones 1..17
  const genCounts = [
    metrics.firstGeneration,
    metrics.secondGeneration,
    metrics.thirdGeneration,
    metrics.fourthGeneration,
    metrics.fifthGeneration,
    metrics.sixthGeneration,
    metrics.seventhGeneration,
    metrics.eighthGeneration,
    metrics.ninthGeneration,
    metrics.tenthGeneration,
    metrics.eleventhGeneration,
    metrics.twelfthGeneration,
    metrics.thirteenthGeneration,
    metrics.fourteenthGeneration,
    metrics.fifteenthGeneration,
    metrics.sixteenthGeneration,
    metrics.seventeenthGeneration,
  ];

  const totalReferrals = genCounts.reduce((s, v) => s + (v || 0), 0);

  const totalInvestment = metrics.totalInvestments;
  const totalMyIncome = metrics.totalEarnings;

  const avgIncomePerReferral =
    totalReferrals > 0 ? totalMyIncome / totalReferrals : 0;
  const roiPercentage =
    totalInvestment > 0 ? (totalMyIncome / totalInvestment) * 100 : 0;

  const firstGenCount = metrics.firstGeneration || 0;
  const totalDescendants = genCounts.slice(1).reduce((s, v) => s + (v || 0), 0);
  const networkEfficiency =
    firstGenCount > 0 ? (totalDescendants / firstGenCount) * 100 : 0;

  const interestedLeads = leads.filter(
    (lead: any) => lead.status === "interested"
  ).length;
  const totalLeads = leads.length;
  const conversionRate =
    totalLeads > 0 ? (interestedLeads / totalLeads) * 100 : 0;

  const monthlyGrowthRate =
    totalReferrals > 0
      ? (metrics.monthlyEarnings / (totalMyIncome || 1)) * 100
      : 0;

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
      title: "Ingreso Promedio",
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
    if (trend === "positive")
      return <TrendingUp className="h-4 w-4 text-green-500" />;
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

      {/* Distribución por Generaciones */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Distribución por Generaciones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {genCounts.map((count, idx) => {
            const gen = idx + 1;
            if (!count || count === 0) return null;
            const color =
              idx === 0
                ? "bg-blue-500"
                : idx === 1
                ? "bg-green-500"
                : idx === 2
                ? "bg-yellow-500"
                : idx === 3
                ? "bg-red-500"
                : idx === 4
                ? "bg-purple-500"
                : idx === 5
                ? "bg-cyan-500"
                : idx === 6
                ? "bg-orange-500"
                : "bg-gray-400";

            return (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 ${color} rounded-full mx-auto mb-2`} />
                <div className="text-sm font-medium text-gray-900">{`${gen}ra Gen`}</div>
                <div className="text-lg font-bold text-gray-700">{count}</div>
                <div className="text-xs text-gray-500">referidos</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
