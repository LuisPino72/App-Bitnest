"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateReferralEarnings,
  calculateUserIncome,
  formatCurrency,
  BUSINESS_CONSTANTS,
} from "@/lib/businessUtils";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

export function ReferralPreview() {
  const [amount, setAmount] = useState(0);
  const [calculations, setCalculations] = useState({
    referralEarnings: 0,
    myIncome: 0,
  });

  useEffect(() => {
    if (amount > 0) {
      const referralEarnings = calculateReferralEarnings(amount);
      const myIncome = calculateUserIncome(referralEarnings, 1);

      setCalculations({
        referralEarnings,
        myIncome,
      });
    } else {
      setCalculations({ referralEarnings: 0, myIncome: 0 });
    }
  }, [amount]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a calcular
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ingresa el monto"
              />
            </div>

            {amount > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Cálculos Automáticos:
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto del referido:</span>
                    <span className="font-semibold">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Ganancias del referido (
                      {BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE * 100}%):
                    </span>
                    <span className="font-semibold text-success-600">
                      {formatCurrency(calculations.referralEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Mis ingresos (
                      {BUSINESS_CONSTANTS.USER_COMMISSION_RATE * 100}% de sus
                      ganancias):
                    </span>
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(calculations.myIncome)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Información del Protocolo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success-600" />
                  <span className="font-medium text-gray-900">
                    Ganancias del Referido
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Cada referido gana{" "}
                  <strong>
                    {(BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE * 100).toFixed(
                      0
                    )}
                    %
                  </strong>{" "}
                  sobre su inversión inicial en cada ciclo de{" "}
                  {BUSINESS_CONSTANTS.CYCLE_DAYS} días.
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary-600" />
                  <span className="font-medium text-gray-900">
                    Mis Ingresos
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Tú ganas{" "}
                  <strong>
                    {(BUSINESS_CONSTANTS.USER_COMMISSION_RATE * 100).toFixed(0)}
                    %
                  </strong>{" "}
                  sobre las ganancias de tu referido, no sobre su inversión
                  inicial.
                </p>
              </div>

              <div className="p-3 border rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Ejemplo Práctico:
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Referido invierte: {formatCurrency(1000)}</p>
                  <p>
                    • Ganancias del referido:{" "}
                    {formatCurrency(
                      1000 * BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE
                    )}{" "}
                    (
                    {(BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE * 100).toFixed(
                      0
                    )}
                    %)
                  </p>
                  <p>
                    • Tus ingresos:{" "}
                    {formatCurrency(
                      1000 *
                        BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE *
                        BUSINESS_CONSTANTS.USER_COMMISSION_RATE
                    )}{" "}
                    (
                    {(BUSINESS_CONSTANTS.USER_COMMISSION_RATE * 100).toFixed(0)}
                    % de sus ganancias)
                  </p>
                  <p>
                    • Duración del ciclo: {BUSINESS_CONSTANTS.CYCLE_DAYS} días
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips y Recordatorios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Recuerda:</strong> Verificar la dirección de billetera
                antes de confirmar.
              </p>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <strong>Seguimiento:</strong> Agenda recordatorios para
                contactar a tus referidos antes del vencimiento.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Organización:</strong> Mantén actualizada la información
                de tus contactos en la sección de Leads.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
