"use client";

import { useState } from "react";
import { Users, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/businessUtils";

interface ReferralInput {
  generation: 1 | 2;
  amount: number;
  cycles: number;
}

interface CycleDetail {
  cycle: number;
  referralAmount: number;
  referralEarnings: number;
  userEarnings: number;
  cumulativeUserEarnings: number;
}

export default function ReferralIncomeCalculator() {
  const [referralInput, setReferralInput] = useState<ReferralInput>({
    generation: 1,
    amount: 10,
    cycles: 1,
  });
  const [result, setResult] = useState<any>(null);
  const [cycleDetails, setCycleDetails] = useState<CycleDetail[]>([]);

  const calculateExponentialGrowth = () => {
    if (referralInput.amount <= 0 || referralInput.cycles <= 0) return;

    const commissionRate = referralInput.generation === 1 ? 0.2 : 0.1;
    const details: CycleDetail[] = [];
    let currentAmount = referralInput.amount;
    let cumulativeEarnings = 0;

    for (let cycle = 1; cycle <= referralInput.cycles; cycle++) {
      const referralEarnings = currentAmount * 0.24;

      const userEarnings = referralEarnings * commissionRate;

      cumulativeEarnings += userEarnings;

      details.push({
        cycle,
        referralAmount: parseFloat(currentAmount.toFixed(2)),
        referralEarnings: parseFloat(referralEarnings.toFixed(2)),
        userEarnings: parseFloat(userEarnings.toFixed(2)),
        cumulativeUserEarnings: parseFloat(cumulativeEarnings.toFixed(2)),
      });

      currentAmount += referralEarnings;
    }

    const totalResult = {
      totalIncome: cumulativeEarnings,
      cycles: referralInput.cycles,
      initialAmount: referralInput.amount,
      finalAmount: parseFloat(currentAmount.toFixed(2)),
      commissionRate: commissionRate * 100,
      cycleDetails: details,
    };

    setResult(totalResult);
    setCycleDetails(details);
  };

  const handleCalculate = () => {
    calculateExponentialGrowth();
  };

  const handleReset = () => {
    setReferralInput({
      generation: 1,
      amount: 10,
      cycles: 1,
    });
    setResult(null);
    setCycleDetails([]);
  };

  const commissionRate = referralInput.generation === 1 ? 0.2 : 0.1;

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
                value={referralInput.generation}
                onChange={(e) =>
                  setReferralInput({
                    ...referralInput,
                    generation: parseInt(e.target.value) as 1 | 2,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={1}>Primera Generación (20% comisión)</option>
                <option value={2}>Segunda Generación (10% comisión)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto de Inversión Inicial del Referido ($)
              </label>
              <input
                type="number"
                value={referralInput.amount}
                onChange={(e) =>
                  setReferralInput({
                    ...referralInput,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="10"
                step="1"
                placeholder="Ej: 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciclos de Inversión
              </label>
              <input
                type="number"
                value={referralInput.cycles}
                onChange={(e) =>
                  setReferralInput({
                    ...referralInput,
                    cycles: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="36"
                placeholder="Ej: 3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cada ciclo dura 28 días (crecimiento exponencial con
                reinversión)
              </p>
            </div>
          </div>

          {result && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">
                Resumen del Cálculo
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Inversión inicial:</span>
                  <span className="font-medium">
                    {formatCurrency(referralInput.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">
                    Inversión final (ciclo {referralInput.cycles}):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(result.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">
                    Tu comisión ({commissionRate * 100}%):
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(result.totalIncome)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-blue-800 font-medium">
                      Crecimiento total del referido:
                    </span>
                    <span className="font-bold text-purple-700">
                      +
                      {(
                        ((result.finalAmount - referralInput.amount) /
                          referralInput.amount) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Proyección Completa
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">
              Información de Comisiones
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>
                • <strong>Primera Generación:</strong> 20% de las ganancias del
                referido
              </li>
              <li>
                • <strong>Segunda Generación:</strong> 10% de las ganancias del
                referido
              </li>
              <li>
                • <strong>Ganancias del referido:</strong> 24% de su inversión
                por ciclo
              </li>
              <li>
                • <strong>Reinversión automática:</strong> Las ganancias se
                suman al capital cada ciclo
              </li>
              <li>
                • <strong>Duración del ciclo:</strong> 28 días
              </li>
            </ul>
          </div>
        </div>

        <div>
          {result ? (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Ganancias Totales Proyectadas
                </h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(result.totalIncome)}
                  </div>
                  <div className="text-sm text-green-700">
                    Para {referralInput.cycles} ciclo
                    {referralInput.cycles !== 1 ? "s" : ""} con reinversión
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-green-600 font-medium">Comisión</div>
                    <div className="font-bold text-green-700">
                      {result.commissionRate}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-green-600 font-medium">
                      Inversión Final
                    </div>
                    <div className="font-bold text-purple-600">
                      {formatCurrency(result.finalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Desglose por Ciclo (Crecimiento Exponencial)
                </h4>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cycleDetails.map((detail) => (
                    <div
                      key={detail.cycle}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">
                          Ciclo {detail.cycle}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Inversión: {formatCurrency(detail.referralAmount)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">
                            Ganancia referido:
                          </span>
                          <div className="font-medium">
                            {formatCurrency(detail.referralEarnings)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tu ganancia:</span>
                          <div className="font-medium text-green-600">
                            {formatCurrency(detail.userEarnings)}
                          </div>
                        </div>
                      </div>

                      {detail.cycle < referralInput.cycles && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                          Próximo ciclo:{" "}
                          {formatCurrency(
                            detail.referralAmount + detail.referralEarnings
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-medium text-primary-800 mb-3">
                  Proyecciones Equivalentes
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-primary-700">Equivalente mensual:</div>
                    <div className="font-bold text-primary-600">
                      {formatCurrency((result.totalIncome * 13) / 12)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-primary-700">Equivalente anual:</div>
                    <div className="font-bold text-primary-600">
                      {formatCurrency(
                        result.totalIncome * (13 / referralInput.cycles)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600">
                  Configura los datos del referido
                </p>
                <p className="text-sm mt-1 text-gray-500">
                  Selecciona generación, monto y ciclos para ver la proyección
                  exponencial
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
