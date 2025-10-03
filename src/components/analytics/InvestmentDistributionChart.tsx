"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useFirebaseData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/businessUtils";

export function InvestmentDistributionChart() {
  const { metrics } = useDashboardMetrics();

  // Calcula inversión total por generación
  const totalReferrals =
    metrics.firstGeneration +
    metrics.secondGeneration +
    metrics.thirdGeneration +
    metrics.fourthGeneration +
    metrics.fifthGeneration +
    metrics.sixthGeneration +
    metrics.seventhGeneration;

  const averageInvestment =
    totalReferrals > 0 ? metrics.totalInvestments / totalReferrals : 0;

  // Datos para todas las generaciones con inversión estimada
  const data = [
    {
      name: "1ra Generación",
      value: metrics.firstGeneration,
      investment: metrics.firstGeneration * averageInvestment,
      color: "#3b82f6",
      commission: "20%",
    },
    {
      name: "2da Generación",
      value: metrics.secondGeneration,
      investment: metrics.secondGeneration * averageInvestment,
      color: "#10b981",
      commission: "10%",
    },
    {
      name: "3ra Generación",
      value: metrics.thirdGeneration,
      investment: metrics.thirdGeneration * averageInvestment,
      color: "#f59e0b",
      commission: "5%",
    },
    {
      name: "4ta Generación",
      value: metrics.fourthGeneration,
      investment: metrics.fourthGeneration * averageInvestment,
      color: "#ef4444",
      commission: "5%",
    },
    {
      name: "5ta Generación",
      value: metrics.fifthGeneration,
      investment: metrics.fifthGeneration * averageInvestment,
      color: "#8b5cf6",
      commission: "5%",
    },
    {
      name: "6ta Generación",
      value: metrics.sixthGeneration,
      investment: metrics.sixthGeneration * averageInvestment,
      color: "#06b6d4",
      commission: "5%",
    },
    {
      name: "7ma Generación",
      value: metrics.seventhGeneration,
      investment: metrics.seventhGeneration * averageInvestment,
      color: "#f97316",
      commission: "5%",
    },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalInvestment = data.reduce((sum, item) => sum + item.investment, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Referidos: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Inversión estimada:{" "}
            <span className="font-medium">
              {formatCurrency(data.investment)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Tu comisión: <span className="font-medium">{data.commission}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje:{" "}
            <span className="font-medium">
              {((data.value / total) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary-600" />
            Distribución por Generaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay datos de referidos disponibles</p>
              <p className="text-sm mt-1">
                Agrega referidos para ver la distribución
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary-600" />
          Distribución por Generaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ ACTUALIZADO: Lista detallada de generaciones */}
        <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    Comisión: {item.commission}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {item.value} referidos
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(item.investment)}
                </div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ NUEVO: Resumen total */}
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-primary-900">Total General</div>
              <div className="text-sm text-primary-700">{total} referidos</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary-900">
                {formatCurrency(totalInvestment)}
              </div>
              <div className="text-sm text-primary-700">Inversión total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
