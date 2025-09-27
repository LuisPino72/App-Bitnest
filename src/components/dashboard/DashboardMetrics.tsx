"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks';
import { formatCurrency } from '@/lib/businessUtils';
import { Users2, Users, DollarSign, TrendingUp } from 'lucide-react';

export function DashboardMetrics() {
  const { metrics } = useDashboardMetrics();

  const firstGenReferrals = metrics.firstGeneration || 0;
  const secondGenReferrals = metrics.secondGeneration || 0;
  
  const totalFirstGenInvestment = metrics.totalInvestments * (firstGenReferrals / (firstGenReferrals + secondGenReferrals)) || 0;
  const totalSecondGenInvestment = metrics.totalInvestments * (secondGenReferrals / (firstGenReferrals + secondGenReferrals)) || 0;
  
  const totalMyFirstGenIncome = metrics.totalEarnings * 0.7; 
  const totalMySecondGenIncome = metrics.totalEarnings * 0.3; 

  const metricCards = [
    {
      title: 'Primera Generación',
      items: [
        {
          label: 'Referidos Activos',
          value: firstGenReferrals.toString(),
          icon: Users,
          color: 'text-primary-600'
        },
        {
          label: 'Inversión Total',
          value: formatCurrency(totalFirstGenInvestment),
          icon: DollarSign,
          color: 'text-success-600'
        },
        {
          label: 'Mis Ingresos',
          value: formatCurrency(totalMyFirstGenIncome),
          icon: TrendingUp,
          color: 'text-primary-600'
        }
      ]
    },
    {
      title: 'Segunda Generación',
      items: [
        {
          label: 'Referidos Activos',
          value: secondGenReferrals.toString(),
          icon: Users2,
          color: 'text-secondary-600'
        },
        {
          label: 'Inversión Total',
          value: formatCurrency(totalSecondGenInvestment),
          icon: DollarSign,
          color: 'text-success-600'
        },
        {
          label: 'Mis Ingresos',
          value: formatCurrency(totalMySecondGenIncome),
          icon: TrendingUp,
          color: 'text-secondary-600'
        }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas por Generación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metricCards.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
              <div className="grid grid-cols-1 gap-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Resumen total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
              <span className="font-semibold text-primary-900">Total Ingresos</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(metrics.totalEarnings)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}