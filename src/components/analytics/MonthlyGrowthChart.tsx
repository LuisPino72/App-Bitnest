"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useFirebaseData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

export function MonthlyGrowthChart() {
  const { metrics } = useDashboardMetrics();

  const chartData = [
    { month: "Ene 24", inversiones: 5000, ingresos: 1200 },
    { month: "Feb 24", inversiones: 7500, ingresos: 1800 },
    { month: "Mar 24", inversiones: 6200, ingresos: 1500 },
    { month: "Abr 24", inversiones: 8900, ingresos: 2100 },
    { month: "May 24", inversiones: 11000, ingresos: 2800 },
    {
      month: "Jun 24",
      inversiones: metrics.totalInvestments,
      ingresos: metrics.totalEarnings,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          Crecimiento Mensual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "",
                ]}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="inversiones"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Inversiones"
              />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#10b981"
                strokeWidth={2}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Inversiones Totales</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Ingresos Totales</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          * Datos de ejemplo. Los últimos meses muestran métricas actuales.
        </p>
      </CardContent>
    </Card>
  );
}
