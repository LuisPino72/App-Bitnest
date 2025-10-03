"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useFirebasePersonalInvestments } from "@/hooks";
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
  const isEdit = !!investment;

  const [formData, setFormData] = useState({
    amount: investment?.amount.toString() || "",
    startDate: investment?.startDate || new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (investment) {
      setFormData({
        amount: investment.amount.toString(),
        startDate: investment.startDate,
      });
    }
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const startDate = formData.startDate;
      const expirationDate = calculateExpirationDate(startDate);
      const earnings = calculatePersonalEarnings(amount);
      const totalEarned = earnings;

      const investmentData = {
        amount,
        startDate,
        expirationDate,
        status: "active" as const,
        earnings,
        totalEarned,
        cycleCount: investment ? investment.cycleCount : 1,
      };

      if (isEdit && investment) {
        await updateInvestment(investment.id, investmentData);
      } else {
        await addInvestment(investmentData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving investment:", error);
      alert("Error al guardar la inversión");
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
