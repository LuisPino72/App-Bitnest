"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export function InvestmentDistributionChart() {
  const { metrics } = useDashboardMetrics();

  const firstGenCount = metrics.firstGeneration || 0;
  const secondGenCount = metrics.secondGeneration || 0;
  const totalReferrals = firstGenCount + secondGenCount;

  const averageInvestment =
    totalReferrals > 0 ? metrics.totalInvestments / totalReferrals : 0;

  const firstGenInvestment = firstGenCount * averageInvestment;
  const secondGenInvestment = secondGenCount * averageInvestment;

  const data = [
    {
      name: "1ra Generación",
      value: firstGenInvestment,
      count: firstGenCount,
      color: "#3b82f6",
    },
    {
      name: "2da Generación",
      value: secondGenInvestment,
      count: secondGenCount,
      color: "#10b981",
    },
  ].filter((item) => item.value > 0); 

  const total =
    data.reduce((sum, item) => sum + item.value, 0) || metrics.totalInvestments;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary-600" />
            Distribución de Inversiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay datos de inversión disponibles</p>
              <p className="text-sm">
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
          Distribución de Inversiones
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
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  const item = data.find((d) => d.value === value);
                  return [
                    `$${Number(value).toFixed(0)} (${
                      item?.count || 0
                    } referidos)`,
                    "Inversión",
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <span className="font-medium">{item.name}</span>
                  <div className="text-sm text-gray-600">
                    {item.count} referidos
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  ${Math.round(item.value).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
            <div className="font-medium text-primary-900">Total</div>
            <div className="text-right">
              <div className="font-bold text-primary-900">
                ${metrics.totalInvestments.toLocaleString()}
              </div>
              <div className="text-sm text-primary-700">
                {totalReferrals} referidos
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
