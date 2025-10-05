"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useFirebaseData";
import { formatCurrency } from "@/lib/businessUtils";
import { Calendar, TrendingUp, Target } from "lucide-react";

export function ProjectionCards() {
  const { metrics } = useDashboardMetrics();

  const currentMonthlyIncome = metrics.monthlyEarnings;
  const totalReferrals = metrics.totalReferrals;
  const averageGrowthRate = 0.15;

  const projections = [
    {
      period: "3 Meses",
      income: currentMonthlyIncome * Math.pow(1 + averageGrowthRate, 3),
      referrals: Math.round(
        totalReferrals * Math.pow(1 + averageGrowthRate, 3)
      ),
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      period: "6 Meses",
      income: currentMonthlyIncome * Math.pow(1 + averageGrowthRate, 6),
      referrals: Math.round(
        totalReferrals * Math.pow(1 + averageGrowthRate, 6)
      ),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      period: "1 Año",
      income: currentMonthlyIncome * Math.pow(1 + averageGrowthRate, 12),
      referrals: Math.round(
        totalReferrals * Math.pow(1 + averageGrowthRate, 12)
      ),
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Proyecciones de Crecimiento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projections.map((projection, index) => (
          <Card
            key={index}
            className={`${projection.bg} ${projection.border} border-l-4 hover:shadow-md transition-shadow`}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`flex items-center gap-2 text-lg ${projection.color}`}
              >
                <projection.icon className="h-5 w-5" />
                {projection.period}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Proyectados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(projection.income)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Referidos Estimados</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {projection.referrals} referidos
                  </p>
                </div>
                <div className={`text-sm ${projection.color} font-medium`}>
                  +
                  {(
                    (projection.income / currentMonthlyIncome - 1) *
                    100
                  ).toFixed(1)}
                  % crecimiento
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        * Proyección basada en crecimiento mensual del 15%
      </p>
    </div>
  );
}
