'use client';

import { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { 
  calculatePersonalIncomeProjection, 
  formatCurrency 
} from '@/lib/businessUtils';
import { CalculatorInput } from '@/types';

export default function PersonalIncomeCalculator() {
  const [amount, setAmount] = useState<string>('10000');
  const [cycles, setCycles] = useState<string>('3');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const input: CalculatorInput = {
      amount: parseFloat(amount) || 0,
      cycles: parseInt(cycles) || 1
    };

    if (input.amount > 0 && input.cycles > 0) {
      const calculation = calculatePersonalIncomeProjection(input);
      setResult(calculation);
    }
  };

  const handleReset = () => {
    setAmount('10000');
    setCycles('3');
    setResult(null);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Calculadora de Inversión Personal
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="label">Monto de Inversión (€)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="10000"
              min="100"
              step="100"
            />
          </div>

          <div>
            <label className="label">Número de Ciclos</label>
            <input
              type="number"
              value={cycles}
              onChange={(e) => setCycles(e.target.value)}
              className="input"
              placeholder="3"
              min="1"
              max="20"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              className="btn btn-primary btn-md flex-1"
            >
              Calcular
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary btn-md"
            >
              Limpiar
            </button>
          </div>

          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-800 mb-2">Información del Ciclo</h4>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• Duración: 28 días por ciclo</li>
              <li>• Retorno: 24% sobre inversión</li>
              <li>• Las ganancias se reinvierten automáticamente</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <h3 className="font-semibold text-success-800 mb-3">Resultados de la Proyección</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-success-700">Inversión Inicial:</span>
                    <span className="font-medium">{formatCurrency(result.initialAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-success-700">Ganancias Totales:</span>
                    <span className="font-medium text-success-600">{formatCurrency(result.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between border-t border-success-200 pt-3">
                    <span className="font-semibold text-success-800">Monto Final:</span>
                    <span className="font-bold text-lg">{formatCurrency(result.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-success-700">ROI Total:</span>
                    <span className="font-bold text-success-600">
                      +{((result.totalEarnings / result.initialAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Cycle Breakdown */}
              <div className="overflow-hidden">
                <h4 className="font-medium text-gray-900 mb-3">Desglose por Ciclos</h4>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Ciclo</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">Ganancias</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.breakdown.map((cycle: any) => (
                        <tr key={cycle.cycle} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{cycle.cycle}</td>
                          <td className="px-3 py-2 text-right text-success-600">
                            {formatCurrency(cycle.earnings)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(cycle.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Introduce los valores y haz clic en "Calcular"</p>
                <p className="text-sm mt-1">para ver las proyecciones</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}