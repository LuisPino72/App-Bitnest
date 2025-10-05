"use client";

import { useState } from "react";
import { Users, Calculator } from "lucide-react";
import {
  calculateReferralIncomeProjection,
  formatCurrency,
} from "@/lib/businessUtils";
import { ReferralCalculatorInput, ReferralCalculatorResult } from "@/types";

interface ReferralInput {
  generation: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  amount: number;
  count: number;
}

export default function ReferralIncomeCalculator() {
  const [input, setInput] = useState<ReferralInput>({
    generation: 1,
    amount: 10,
    count: 1,
  });
  const [result, setResult] = useState<ReferralCalculatorResult | null>(null);

  const handleCalculate = () => {
    if (input.amount > 0 && input.count > 0) {
      const calculationInput: ReferralCalculatorInput = {
        referrals: [input],
      };
      const calculation = calculateReferralIncomeProjection(calculationInput);
      setResult(calculation);
    }
  };

  const handleReset = () => {
    setInput({ generation: 1, amount: 10, count: 1 });
    setResult(null);
  };

  const updateInput = (field: keyof ReferralInput, value: string) => {
    const numValue =
      field === "generation"
        ? (parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7)
        : parseFloat(value) || 0;
    setInput((prev) => ({ ...prev, [field]: numValue }));
  };

  const commissionRate =
    input.generation === 1 ? 0.2 : input.generation === 2 ? 0.1 : 0.05;

  return (
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Calculadora de Ingresos por Referidos
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Configuración del Referido
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generación del Referido
              </label>
              <select
                value={input.generation}
                onChange={(e) => updateInput("generation", e.target.value)}
                className="input"
              >
                <option value={1}>Primera Generación (20% comisión)</option>
                <option value={2}>Segunda Generación (10% comisión)</option>
                <option value={3}>
                  Tercera a séptima generación (5% comisión)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto de Inversión ($)
              </label>
              <input
                type="number"
                value={input.amount}
                onChange={(e) => updateInput("amount", e.target.value)}
                className="input"
                min="10"
                step="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Referidos
              </label>
              <input
                type="number"
                value={input.count}
                onChange={(e) => updateInput("count", e.target.value)}
                className="input"
                min="1"
                max="100"
              />
            </div>
          </div>

          {result && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">Resumen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Inversión por referido:</span>
                  <span className="font-medium">
                    {formatCurrency(input.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Cantidad de referidos:</span>
                  <span className="font-medium">{input.count}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700 font-medium">
                    Tu ingreso total:
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(result.totalIncome)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              className="btn btn-primary btn-md flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular
            </button>
            <button onClick={handleReset} className="btn btn-secondary btn-md">
              Limpiar
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">
              Información de Comisiones
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>
                • <strong>Primera Generación:</strong> 20% de las ganancias
              </li>
              <li>
                • <strong>Segunda Generación:</strong> 10% de las ganancias
              </li>
              <li>
                • <strong>Tercera a Séptima Generación:</strong> 5% de las
                ganancias
              </li>
              <li>
                • <strong>Ganancias del referido:</strong> 24% por ciclo
              </li>
            </ul>
          </div>
        </div>

        <div>
          {result ? (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Ganancias Totales
                </h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(result.totalIncome)}
                  </div>
                  <div className="text-sm text-green-700">
                    Para {input.count} referido{input.count !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-green-600 font-medium">Comisión</div>
                    <div className="font-bold text-green-700">
                      {commissionRate * 100}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-green-600 font-medium">Referidos</div>
                    <div className="font-bold text-purple-600">
                      {input.count}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Desglose por Referido
                </h4>
                {result.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900">
                        Referido {index + 1}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Gen {item.generation >= 3 ? "3-7" : item.generation}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Inversión:</span>
                        <div className="font-medium">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Ganancia referido:
                        </span>
                        <div className="font-medium">
                          {formatCurrency(item.referralEarnings)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Tu ganancia:</span>
                        <div className="font-medium text-green-600 text-lg">
                          {formatCurrency(item.userIncome)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Configura los datos del referido</p>
                <p className="text-sm mt-1 text-gray-500">
                  Selecciona generación, monto y cantidad para ver la proyección
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
