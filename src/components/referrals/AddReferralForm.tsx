"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReferrals } from "@/hooks";
import type { Referral } from "@/types";
import {
  calculateReferralEarnings,
  calculateUserIncome,
  calculateExpirationDate,
  BUSINESS_CONSTANTS,
} from "@/lib/businessUtils";
import { UserPlus, Calculator, X } from "lucide-react";

interface AddReferralFormProps {
  onSuccess?: (msg?: string) => void;
  onCancel?: () => void;
  referral?: Referral | null;
  onUpdate?: (id: string, data: Partial<Referral>) => void;
}

export function AddReferralForm({
  onSuccess,
  onCancel,
  referral,
  onUpdate,
}: AddReferralFormProps) {
  const { addReferral, updateReferral, referrals } = useReferrals();
  const isEdit = !!referral;

  const [formData, setFormData] = useState({
    name: referral?.name || "",
    wallet: referral?.wallet || "",
    amount: referral ? referral.amount.toString() : "",
    cycle: referral ? referral.cycle?.toString() || "1" : "1",
    generation: referral ? referral.generation.toString() : "1",
    investmentDate: referral?.investmentDate || "",
    expirationDate: referral?.expirationDate || "",
  });

  const [calculations, setCalculations] = useState({
    referralEarnings: 0,
    myIncome: 0,
    totalEarned: 0,
  });

  // 🔍 Autocompletado
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filtrar referidos activos al escribir
  useEffect(() => {
    if (!isEdit && formData.name.trim() !== "") {
      const term = formData.name.toLowerCase();
      const activeReferrals = referrals.filter((r) => r.status === "active");
      const matches = activeReferrals.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.wallet.toLowerCase().includes(term)
      );
      setFilteredReferrals(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredReferrals([]);
    }
  }, [formData.name, referrals, isEdit]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resto de useEffects y handlers existentes...
  useEffect(() => {
    if (referral) {
      setFormData({
        name: referral.name,
        wallet: referral.wallet,
        amount: referral.amount.toString(),
        cycle: referral.cycle?.toString() || "1",
        generation: referral.generation.toString(),
        investmentDate: referral.investmentDate,
        expirationDate: referral.expirationDate,
      });
      const numAmount = referral.amount;
      const referralEarnings = calculateReferralEarnings(numAmount);
      const myIncome = calculateUserIncome(
        referralEarnings,
        referral.generation
      );
      setCalculations({
        referralEarnings,
        myIncome,
        totalEarned: referralEarnings + myIncome,
      });
    }
  }, [referral]);

  useEffect(() => {
    if (!isEdit) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        investmentDate: today,
        expirationDate: calculateExpirationDate(today),
      }));
    }
  }, [isEdit]);

  const handleAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const referralEarnings = calculateReferralEarnings(numAmount);
    const myIncome = calculateUserIncome(
      referralEarnings,
      parseInt(formData.generation) as 1 | 2
    );
    setCalculations({
      referralEarnings,
      myIncome,
      totalEarned: referralEarnings + myIncome,
    });
    setFormData((prev) => ({ ...prev, amount }));
  };

  const handleInvestmentDateChange = (date: string) => {
    const expirationDate = calculateExpirationDate(date);
    setFormData((prev) => ({
      ...prev,
      investmentDate: date,
      expirationDate,
    }));
  };

  const handleGenerationChange = (generation: string) => {
    setFormData((prev) => ({ ...prev, generation }));
    if (formData.amount) {
      const numAmount = parseFloat(formData.amount) || 0;
      const referralEarnings = calculateReferralEarnings(numAmount);
      const myIncome = calculateUserIncome(
        referralEarnings,
        parseInt(generation) as 1 | 2
      );
      setCalculations({
        referralEarnings,
        myIncome,
        totalEarned: referralEarnings + myIncome,
      });
    }
  };

  const handleSelectReferral = (ref: Referral) => {
    setFormData((prev) => ({
      ...prev,
      name: ref.name,
      wallet: ref.wallet,
    }));
    setShowSuggestions(false);
  };

  const clearName = () => {
    setFormData((prev) => ({ ...prev, name: "" }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.wallet.trim() || !formData.amount) {
      onSuccess?.("Por favor completa todos los campos obligatorios");
      return;
    }
    const numAmount = parseFloat(formData.amount);
    if (numAmount <= 0) {
      onSuccess?.("El monto de inversión debe ser mayor a 0");
      return;
    }

    if (isEdit && referral) {
      const updates = {
        name: formData.name.trim(),
        wallet: formData.wallet.trim(),
        amount: numAmount,
        cycle: parseInt(formData.cycle),
        generation: parseInt(formData.generation) as 1 | 2,
        investmentDate: formData.investmentDate,
        expirationDate: formData.expirationDate,
        earnings: calculations.referralEarnings,
        userIncome: calculations.myIncome,
      };
      updateReferral(referral.id, updates);
      onUpdate?.(referral.id, updates);
      onSuccess?.("Referido actualizado exitosamente");
      return;
    }

    const referralData = {
      name: formData.name.trim(),
      wallet: formData.wallet.trim(),
      amount: parseFloat(formData.amount),
      cycle: parseInt(formData.cycle),
      generation: parseInt(formData.generation) as 1 | 2,
      status: "active" as const,
      investmentDate: formData.investmentDate,
      expirationDate: formData.expirationDate,
      startDate: new Date().toISOString().split("T")[0],
      cycleCount: 1,
      earnings: calculations.referralEarnings,
      userIncome: calculations.myIncome,
      totalEarned: calculations.totalEarned,
    };

    addReferral(referralData);
    onSuccess?.("Referido agregado exitosamente!");
    if (!isEdit) {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        name: "",
        wallet: "",
        amount: "",
        cycle: "1",
        generation: "1",
        investmentDate: today,
        expirationDate: calculateExpirationDate(today),
      });
      setCalculations({ referralEarnings: 0, myIncome: 0, totalEarned: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {isEdit ? "Editar Referido" : "Agregar Nuevo Referido"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative" ref={suggestionsRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  onFocus={() => {
                    if (!isEdit && formData.name.trim() !== "") {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-8"
                  placeholder="Nombre del referido"
                  required
                />
                {formData.name && !isEdit && (
                  <button
                    type="button"
                    onClick={clearName}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Dropdown de sugerencias */}
              {showSuggestions && filteredReferrals.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredReferrals.map((ref) => (
                    <div
                      key={ref.id}
                      onClick={() => handleSelectReferral(ref)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{ref.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {ref.wallet}
                      </p>
                      <p className="text-xs text-gray-400">
                        Gen {ref.generation} •{" "}
                        {ref.amount.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de Billetera *
              </label>
              <input
                type="text"
                value={formData.wallet}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, wallet: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0x..."
                required
              />
            </div>
          </div>

          {/* Resto del formulario igual... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto de Inversión *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciclo
              </label>
              <input
                type="number"
                min="1"
                value={formData.cycle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cycle: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generación
              </label>
              <select
                value={formData.generation}
                onChange={(e) => handleGenerationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="1">Primera Generación</option>
                <option value="2">Segunda Generación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inversión
              </label>
              <input
                type="date"
                value={formData.investmentDate}
                onChange={(e) => handleInvestmentDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento (Automática)
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Se calcula automáticamente: fecha de inversión +{" "}
              {BUSINESS_CONSTANTS.CYCLE_DAYS} días
            </p>
          </div>

          {parseFloat(formData.amount) > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Proyección de Ganancias
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ganancias del Referido:</p>
                  <p className="font-medium">
                    ${calculations.referralEarnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Mi Ingreso:</p>
                  <p className="font-medium">
                    ${calculations.myIncome.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total:</p>
                  <p className="font-medium">
                    ${calculations.totalEarned.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Cálculos basados en{" "}
                {formData.generation === "1" ? "primera" : "segunda"} generación
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="w-full">
              {isEdit ? "Guardar Cambios" : "Agregar Referido"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
