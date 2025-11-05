"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useFirebasePersonalInvestments } from "@/hooks";
import { useFormErrorHandler } from "@/hooks/useErrorHandler";
import { validatePersonalInvestment } from "@/lib/validation";
import { BUSINESS_CONSTANTS } from "@/types/constants";
import { ValidationErrors } from "@/components/ui/ValidationMessage";
import {
  calculateExpirationDate,
  calculatePersonalEarnings,
} from "@/lib/businessUtils";
import { PersonalInvestment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddInvestmentFormProps {
  investment?: PersonalInvestment | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddInvestmentForm({
  investment,
  onSuccess,
  onCancel,
}: AddInvestmentFormProps) {
  const { addInvestment, updateInvestment } = useFirebasePersonalInvestments();
  const { error, setError, clearError, handleAsync } = useFormErrorHandler();
  const isEdit = !!investment;

  const [formData, setFormData] = useState({
    amount: investment?.amount.toString() || "",
    startDate: investment?.startDate || new Date().toISOString().split("T")[0],
    cycle:
      investment?.cycleCount?.toString() ||
      BUSINESS_CONSTANTS.CYCLE_DAYS.toString(),
  });

  useEffect(() => {
    if (investment) {
      setFormData({
        amount: investment.amount.toString(),
        startDate: investment.startDate,
        cycle:
          investment.cycleCount?.toString() ||
          BUSINESS_CONSTANTS.CYCLE_DAYS.toString(),
      });
    }
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const amount = parseFloat(formData.amount);
    const cycleDays =
      parseInt(formData.cycle, 10) || BUSINESS_CONSTANTS.CYCLE_DAYS;
    const investmentData = {
      amount,
      startDate: formData.startDate,
      expirationDate: calculateExpirationDate(formData.startDate, cycleDays),
      cycleCount: cycleDays,
      cycleDays,
    };

    const validation = validatePersonalInvestment(investmentData);
    if (!validation.success) {
      setError({
        message: "Por favor corrige los errores en el formulario",
        code: "VALIDATION_ERROR",
        details: validation.errors,
      } as any);
      return;
    }

    const result = await handleAsync(async () => {
      const completeInvestmentData = {
        ...validation.data,
        status: "active" as const,
        earnings: calculatePersonalEarnings(amount),
        totalEarned: calculatePersonalEarnings(amount),
        cycleCount: investment ? investment.cycleCount : cycleDays,
        cycleDays: cycleDays,
      };

      if (isEdit && investment) {
        await updateInvestment(investment.id, completeInvestmentData);
      } else {
        await addInvestment(completeInvestmentData);
      }
    });

    if (result !== null) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEdit ? "Editar Inversión" : "Nueva Inversión"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mostrar errores de validación */}
          {error && (
            <ValidationErrors
              errors={error.details || [error.message]}
              onClose={clearError}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto de Inversión *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Ciclo
              </label>
              <select
                value={formData.cycle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cycle: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1 día</option>
                <option value="7">7 días</option>
                <option value="14">14 días</option>
                <option value="28">28 días</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {isEdit ? "Guardar Cambios" : "Agregar Inversión"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
