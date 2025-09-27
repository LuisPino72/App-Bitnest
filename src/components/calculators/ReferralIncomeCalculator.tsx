'use client';

import { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { 
  calculateReferralIncomeProjection, 
  formatCurrency 
} from '@/lib/businessUtils';
import { ReferralCalculatorInput } from '@/types';

interface ReferralGroup {
  generation: 1 | 2;
  amount: number;
  count: number;
}

export default function ReferralIncomeCalculator() {
  const [referralGroups, setReferralGroups] = useState<ReferralGroup[]>([
    { generation: 1, amount: 15000, count: 5 },
    { generation: 2, amount: 10000, count: 3 }
  ]);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const input: ReferralCalculatorInput = {
      referrals: referralGroups.filter(group => group.count > 0 && group.amount > 0)
    };

    if (input.referrals.length > 0) {
      const calculation = calculateReferralIncomeProjection(input);
      setResult(calculation);
    }
  };

  const addReferralGroup = () => {
    setReferralGroups([...referralGroups, { generation: 1, amount: 10000, count: 1 }]);
  };

  const removeReferralGroup = (index: number) => {
    setReferralGroups(referralGroups.filter((_, i) => i !== index));
  };

  const updateReferralGroup = (index: number, field: keyof ReferralGroup, value: any) => {
    const updated = referralGroups.map((group, i) => 
      i === index ? { ...group, [field]: value } : group
    );
    setReferralGroups(updated);
  };

  const handleReset = () => {
    setReferralGroups([
      { generation: 1, amount: 15000, count: 5 },
      { generation: 2, amount: 10000, count: 3 }
    ]);
    setResult(null);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Calculadora de Ingresos por Referidos
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Grupos de Referidos</h3>
            <button
              onClick={addReferralGroup}
              className="btn btn-secondary btn-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {referralGroups.map((group, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm text-gray-700">
                    Grupo {index + 1}
                  </span>
                  {referralGroups.length > 1 && (
                    <button
                      onClick={() => removeReferralGroup(index)}
                      className="text-danger-500 hover:text-danger-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Generación
                    </label>
                    <select
                      value={group.generation}
                      onChange={(e) => updateReferralGroup(index, 'generation', parseInt(e.target.value) as 1 | 2)}
                      className="input text-sm"
                    >
                      <option value={1}>Primera (20% comisión)</option>
                      <option value={2}>Segunda (10% comisión)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Inversión por Referido (€)
                    </label>
                    <input
                      type="number"
                      value={group.amount}
                      onChange={(e) => updateReferralGroup(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="input text-sm"
                      min="100"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Cantidad de Referidos
                    </label>
                    <input
                      type="number"
                      value={group.count}
                      onChange={(e) => updateReferralGroup(index, 'count', parseInt(e.target.value) || 0)}
                      className="input text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              className="btn btn-primary btn-md flex-1"
            >
              Calcular Ingresos
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary btn-md"
            >
              Limpiar
            </button>
          </div>

          <div className="p-4 bg-warning-50 rounded-lg">
            <h4 className="font-medium text-warning-800 mb-2">Comisiones</h4>
            <ul className="text-sm text-warning-700 space-y-1">
              <li>• Primera Generación: 20% de las ganancias del referido</li>
              <li>• Segunda Generación: 10% de las ganancias del referido</li>
              <li>• Ganancias del referido: 24% de su inversión</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <h3 className="font-semibold text-success-800 mb-4">Ingresos Totales por Ciclo</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">
                    {formatCurrency(result.totalIncome)}
                  </div>
                  <div className="text-sm text-success-700">
                    Por cada ciclo de 28 días
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Desglose por Grupo</h4>
                {result.breakdown.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.generation}ª Generación
                        </span>
                        <div className="text-sm text-gray-600">
                          {item.count} referidos × {formatCurrency(item.amount)}
                        </div>
                      </div>
                      <span className={`badge ${
                        item.generation === 1 ? 'badge-info' : 'badge-warning'
                      }`}>
                        {item.generation === 1 ? '20%' : '10%'} comisión
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ganancias referidos:</span>
                        <div className="font-medium">{formatCurrency(item.referralEarnings * item.count)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Tu ingreso:</span>
                        <div className="font-medium text-success-600">{formatCurrency(item.userIncome)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projections */}
              <div className="p-4 bg-primary-50 rounded-lg">
                <h4 className="font-medium text-primary-800 mb-3">Proyecciones</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-primary-700">3 meses (3 ciclos):</span>
                    <div className="font-bold text-primary-600">
                      {formatCurrency(result.totalIncome * 3)}
                    </div>
                  </div>
                  <div>
                    <span className="text-primary-700">6 meses (6 ciclos):</span>
                    <div className="font-bold text-primary-600">
                      {formatCurrency(result.totalIncome * 6)}
                    </div>
                  </div>
                  <div>
                    <span className="text-primary-700">1 año (13 ciclos):</span>
                    <div className="font-bold text-primary-600">
                      {formatCurrency(result.totalIncome * 13)}
                    </div>
                  </div>
                  <div>
                    <span className="text-primary-700">Ingreso mensual promedio:</span>
                    <div className="font-bold text-primary-600">
                      {formatCurrency((result.totalIncome * 13) / 12)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Configura tus grupos de referidos</p>
                <p className="text-sm mt-1">y haz clic en "Calcular Ingresos"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}