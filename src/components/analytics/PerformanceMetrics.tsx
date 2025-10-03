"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useFirebaseData";
import { useFirebaseLeads } from "@/hooks/useFirebaseData";
import { formatCurrency } from "@/lib/businessUtils";
import { Zap, DollarSign, Users, Percent } from "lucide-react";

export function PerformanceMetrics() {
  const { metrics } = useDashboardMetrics();
  const { leads } = useFirebaseLeads();

  // Cálculos reales basados en datos actuales
  const totalReferrals = metrics.totalReferrals;
  const totalInvestment = metrics.totalInvestments;
  const totalMyIncome = metrics.totalEarnings;

  const avgIncomePerReferral =
    totalReferrals > 0 ? totalMyIncome / totalReferrals : 0;
  const roiPercentage =
    totalInvestment > 0 ? (totalMyIncome / totalInvestment) * 100 : 0;

  // Calcular eficiencia de red con datos reales
  const firstGenCount = metrics.firstGeneration || 0;
  const secondGenCount = metrics.secondGeneration || 0;
  const networkEfficiency =
    firstGenCount > 0 ? (secondGenCount / firstGenCount) * 100 : 0;

  // Calcular tasa de conversión real de leads
  const interestedLeads = leads.filter(
    (lead) => lead.status === "interested"
  ).length;
  const totalLeads = leads.length;
  const conversionRate =
    totalLeads > 0 ? (interestedLeads / totalLeads) * 100 : 0;

  const performanceData = [
    {
      title: "ROI Total",
      value: `${roiPercentage.toFixed(1)}%`,
      description: "Retorno sobre inversiones",
      icon: Percent,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Ingreso Promedio/Referido",
      value: formatCurrency(avgIncomePerReferral),
      description: "Ganancia media por referido",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Eficiencia de Red",
      value: `${networkEfficiency.toFixed(1)}%`,
      description: "2da gen vs 1ra gen",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Tasa Conversión Leads",
      value: `${conversionRate.toFixed(1)}%`,
      description: `${interestedLeads} de ${totalLeads} leads`,
      icon: Zap,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Métricas de Rendimiento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 ${metric.bg} rounded-lg mb-4`}
              >
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
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
    </div>
  );
}
