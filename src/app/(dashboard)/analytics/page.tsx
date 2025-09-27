'use client';

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDashboardMetrics, useReferrals } from '@/hooks';
import { formatCurrency } from '@/lib/businessUtils';
import MetricCard from '@/components/ui/MetricCard';

export default function AnalyticsPage() {
  const { metrics } = useDashboardMetrics();
  const { referrals } = useReferrals();

  const growthProjection = [
    { month: 'Mes 1', referrals: 27, earnings: 45000 },
    { month: 'Mes 2', referrals: 35, earnings: 58000 },
    { month: 'Mes 3', referrals: 45, earnings: 75000 },
    { month: 'Mes 4', referrals: 58, earnings: 96000 },
    { month: 'Mes 5', referrals: 75, earnings: 124000 },
    { month: 'Mes 6', referrals: 97, earnings: 160000 },
  ];

  const generationData = [
    { name: 'Primera Generación', value: metrics.firstGeneration, color: '#0ea5e9' },
    { name: 'Segunda Generación', value: metrics.secondGeneration, color: '#f59e0b' },
  ];

  const earningsTrend = [
    { month: 'Ene', personal: 12000, referrals: 8500 },
    { month: 'Feb', personal: 15000, referrals: 12000 },
    { month: 'Mar', personal: 18000, referrals: 15500 },
    { month: 'Abr', personal: 22000, referrals: 19000 },
    { month: 'May', personal: 28000, referrals: 24000 },
    { month: 'Jun', personal: 35000, referrals: 30000 },
  ];

  const investmentRanges = [
    { range: '5K-10K', count: 8 },
    { range: '10K-20K', count: 15 },
    { range: '20K-30K', count: 12 },
    { range: '30K+', count: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis</h1>
        <p className="text-gray-600 mt-2">
          Visualización de datos y proyecciones de crecimiento
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Crecimiento Mensual"
          value="+23%"
          change="vs. mes anterior"
          changeType="positive"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <MetricCard
          title="Tasa de Conversión"
          value="68.5%"
          change="leads a referidos"
          changeType="positive"
          icon={<Users className="h-6 w-6" />}
        />
        <MetricCard
          title="ROI Promedio"
          value="24%"
          change="por ciclo (28 días)"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <MetricCard
          title="Proyección 6M"
          value={formatCurrency(160000)}
          change="ingresos estimados"
          changeType="positive"
          icon={<Calendar className="h-6 w-6" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Projection */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Proyección de Crecimiento (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthProjection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="referrals" orientation="left" />
              <YAxis yAxisId="earnings" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'referrals' ? value : formatCurrency(Number(value)), 
                  name === 'referrals' ? 'Referidos' : 'Ganancias'
                ]}
              />
              <Legend />
              <Bar yAxisId="referrals" dataKey="referrals" fill="#0ea5e9" name="Referidos" />
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
        </div>

        {/* Generation Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Generaciones
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={generationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {generationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {generationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium">{item.value} referidos</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencia de Ingresos
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

        {/* Investment Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Inversiones
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={investmentRanges} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projections Table */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Proyecciones de Crecimiento
        </h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Período</th>
                <th className="table-header-cell">Referidos Proyectados</th>
                <th className="table-header-cell">Ingresos Estimados</th>
                <th className="table-header-cell">Crecimiento</th>
              </tr>
            </thead>
            <tbody className="table-body">
              <tr>
                <td className="table-cell font-medium">3 meses</td>
                <td className="table-cell">45 referidos</td>
                <td className="table-cell text-success-600">{formatCurrency(75000)}</td>
                <td className="table-cell">
                  <div className="flex items-center text-success-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +67%
                  </div>
                </td>
              </tr>
              <tr>
                <td className="table-cell font-medium">6 meses</td>
                <td className="table-cell">97 referidos</td>
                <td className="table-cell text-success-600">{formatCurrency(160000)}</td>
                <td className="table-cell">
                  <div className="flex items-center text-success-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +259%
                  </div>
                </td>
              </tr>
              <tr>
                <td className="table-cell font-medium">12 meses</td>
                <td className="table-cell">200+ referidos</td>
                <td className="table-cell text-success-600">{formatCurrency(350000)}</td>
                <td className="table-cell">
                  <div className="flex items-center text-success-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +667%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}