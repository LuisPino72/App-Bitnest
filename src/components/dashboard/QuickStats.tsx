"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks";
import { formatCurrency } from "@/lib/businessUtils";
import { DollarSign, Users, TrendingUp, Target } from "lucide-react";

export function QuickStats() {
  const { metrics } = useDashboardMetrics();

  const stats = [
    {
      title: "Inversión Total",
      value: formatCurrency(metrics.totalInvestments),
      icon: DollarSign,
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      title: "Referidos Activos",
      value: metrics.totalReferrals.toString(),
      icon: Users,
      change: "+3 este mes",
      changeType: "positive" as const,
    },
    {
      title: "Ingresos Totales",
      value: formatCurrency(metrics.totalEarnings),
      icon: TrendingUp,
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      title: "Ganancias Mensuales",
      value: formatCurrency(metrics.monthlyEarnings),
      icon: Target,
      change: "+15.3%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.changeType === "positive"
                  ? "text-success-600"
                  : "text-error-600"
              }`}
            >
              {stat.change} desde el mes pasado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
