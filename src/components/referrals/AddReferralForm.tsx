"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ValidationErrors,
  FormFieldError,
} from "@/components/ui/ValidationMessage";
import { useFirebaseReferrals } from "@/hooks";
import { useFormErrorHandler } from "@/hooks/useErrorHandler";
import { validateReferral, sanitizeReferralData } from "@/lib/validation";
import type { Referral, Generation } from "@/types";
import {
  calculateReferralEarnings,
  calculateUserIncome,
  calculateExpirationDate,
  formatCurrency,
} from "@/lib/businessUtils";
import { UserPlus, Calculator } from "lucide-react";
import { BUSINESS_CONSTANTS } from "@/types/constants";

interface AddReferralFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  referral?: Referral | null;
}

export function AddReferralForm({
  onSuccess,
  onCancel,
  referral,
}: AddReferralFormProps) {
  const { addReferral, updateReferral, referrals } = useFirebaseReferrals();
  const { error, fieldErrors, setError, clearError, handleAsync } =
    useFormErrorHandler();
  const isEdit = !!referral;

  const [formData, setFormData] = useState({
    name: "",
    wallet: "",
    amount: "",
    cycle: "1",
    generation: "1",
    investmentDate: "",
    expirationDate: "",
  });

  const [calculations, setCalculations] = useState({
    referralEarnings: 0,
    myIncome: 0,
    totalEarned: 0,
  });
  const generationOptions = [
    { value: 1, label: "1ra Generación (20%)" },
    { value: 2, label: "2da Generación (10%)" },
    { value: 3, label: "3ra Generación (5%)" },
    { value: 4, label: "4ta Generación (5%)" },
    { value: 5, label: "5ta Generación (5%)" },
    { value: 6, label: "6ta Generación (5%)" },
    { value: 7, label: "7ma Generación (5%)" },
    { value: 8, label: "8va Generación (3%)" },
    { value: 9, label: "9na Generación (3%)" },
    { value: 10, label: "10ma Generación (3%)" },
    { value: 11, label: "11va Generación (1%)" },
    { value: 12, label: "12va Generación (1%)" },
    { value: 13, label: "13va Generación (1%)" },
    { value: 14, label: "14va Generación (1%)" },
    { value: 15, label: "15va Generación (1%)" },
    { value: 16, label: "16va Generación (1%)" },
    { value: 17, label: "17va Generación (1%)" },
  ];

  // Estados para autocompletado
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Iniciar formulario
  useEffect(() => {
    if (referral) {
      setFormData({
        name: referral.name,
        wallet: referral.wallet,
        amount: referral.amount?.toString() || "",
        cycle: (referral.cycle || referral.cycleCount || 1).toString(),
        generation: referral.generation.toString(),
        investmentDate: referral.investmentDate,
        expirationDate: referral.expirationDate,
      });
      const initCycle =
        referral.cycle || referral.cycleCount || BUSINESS_CONSTANTS.CYCLE_DAYS;
      updateCalculations(referral.amount, referral.generation, initCycle);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        investmentDate: today,
        expirationDate: calculateExpirationDate(today),
      }));
    }
  }, [referral]);

  const updateCalculations = useCallback(
    (amount: number, generation: Generation, cycleDaysOverride?: number) => {
      const cycleDaysNum =
        cycleDaysOverride ??
        (parseInt(formData.cycle, 10) || BUSINESS_CONSTANTS.CYCLE_DAYS);
      const referralEarnings = calculateReferralEarnings(amount, cycleDaysNum);
      const myIncome = calculateUserIncome(referralEarnings, generation);
      setCalculations({
        referralEarnings,
        myIncome,
        totalEarned: referralEarnings + myIncome,
      });
    },
    [formData.cycle]
  );

  const handleAmountChange = (amount: string) => {
    if (amount === "") {
      setFormData((prev) => ({ ...prev, amount }));
      const cycleDays =
        parseInt(formData.cycle, 10) || BUSINESS_CONSTANTS.CYCLE_DAYS;
      updateCalculations(
        0,
        parseInt(formData.generation, 10) as Generation,
        cycleDays
      );
      return;
    }

    const numAmount = parseFloat(amount);
    if (Number.isNaN(numAmount)) return;
    setFormData((prev) => ({ ...prev, amount }));
    const cycleDays =
      parseInt(formData.cycle, 10) || BUSINESS_CONSTANTS.CYCLE_DAYS;
    updateCalculations(
      numAmount,
      parseInt(formData.generation, 10) as Generation,
      cycleDays
    );
  };

  const handleGenerationChange = (generation: string) => {
    setFormData((prev) => ({ ...prev, generation }));
    const amt = parseFloat(formData.amount) || 0;
    const cycleDays =
      parseInt(formData.cycle, 10) || BUSINESS_CONSTANTS.CYCLE_DAYS;
    updateCalculations(amt, parseInt(generation, 10) as Generation, cycleDays);
  };

  const handleInvestmentDateChange = (date: string) => {
    const days = parseInt(formData.cycle) || BUSINESS_CONSTANTS.CYCLE_DAYS;
    const expirationDate = calculateExpirationDate(date, days);
    setFormData((prev) => ({ ...prev, investmentDate: date, expirationDate }));
  };

  const filterReferrals = (term: string) => {
    if (!term.trim()) {
      setFilteredReferrals([]);
      setShowSuggestions(false);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const matches = referrals.filter(
      (ref) =>
        ref.name.toLowerCase().includes(lowerTerm) ||
        ref.wallet.toLowerCase().includes(lowerTerm)
    );

    // Para que cada wallet aparezca una sola vez
    const uniqueByWalletMap: Record<string, Referral> = {};
    for (const m of matches) {
      const key = (m.wallet || "").toLowerCase();
      if (!uniqueByWalletMap[key]) {
        uniqueByWalletMap[key] = m;
      }
    }

    const uniqueResults = Object.values(uniqueByWalletMap);
    setFilteredReferrals(uniqueResults.slice(0, 5));
    setShowSuggestions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const numAmount = parseFloat(formData.amount);
    const referralData = {
      name: formData.name.trim(),
      wallet: formData.wallet.trim(),
      amount: numAmount,
      cycle: parseInt(formData.cycle),
      generation: parseInt(formData.generation) as Generation,
      status: "active" as const,
      investmentDate: formData.investmentDate,
      expirationDate: formData.expirationDate,
    };

    const validation = validateReferral(referralData);
    if (!validation.success) {
      setError({
        message: "Por favor corrige los errores en el formulario",
        code: "VALIDATION_ERROR",
        details: validation.errors,
      } as any);
      return;
    }

    // Sanitizar datos antes de enviar
    const sanitizedData = sanitizeReferralData(validation.data);

    const result = await handleAsync(async () => {
      const completeReferralData = {
        ...sanitizedData,
        startDate: new Date().toISOString().split("T")[0],
        cycleCount: 1,
        earnings: calculations.referralEarnings,
        userIncome: calculations.myIncome,
        totalEarned: calculations.totalEarned,
      };

      if (isEdit && referral) {
        await updateReferral(referral.id, completeReferralData);
      } else {
        await addReferral(completeReferralData);
      }
    });

    if (result !== null) {
      onSuccess?.();
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
        {/*  Mostrar errores de validación */}
        {error && (
          <ValidationErrors
            errors={error.details || [error.message]}
            onClose={clearError}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Campo de Nombre con Autocompletado */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, name: value }));
                  setSearchTerm(value);
                  filterReferrals(value);
                }}
                onFocus={() => searchTerm && setShowSuggestions(true)}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del referido"
                required
              />
              {showSuggestions && filteredReferrals.length > 0 && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {filteredReferrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          name: ref.name,
                          wallet: ref.wallet,
                        }));
                        setSearchTerm("");
                        setFilteredReferrals([]);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="font-medium">{ref.name}</div>
                      <div className="text-gray-500 text-xs truncate">
                        {ref.wallet}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Gen {ref.generation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campo de Billetera */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0x..."
                required
              />
            </div>
          </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciclo (días)
              </label>
              <select
                value={formData.cycle}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, cycle: e.target.value }));
                  const newCycle =
                    parseInt(e.target.value, 10) ||
                    BUSINESS_CONSTANTS.CYCLE_DAYS;
                  if (formData.amount) {
                    updateCalculations(
                      parseFloat(formData.amount),
                      parseInt(formData.generation) as Generation,
                      newCycle
                    );
                  }
                  // actualizar vencimiento
                  if (formData.investmentDate) {
                    const expiration = calculateExpirationDate(
                      formData.investmentDate,
                      parseInt(e.target.value)
                    );
                    setFormData((prev) => ({
                      ...prev,
                      expirationDate: expiration,
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={"1"}>1 día (0.4%)</option>
                <option value={"7"}>7 días (4%)</option>
                <option value={"14"}>14 días (9.5%)</option>
                <option value={"28"}>28 días (24%)</option>
              </select>
            </div>

            {/*Selec de generación con todas las opciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generación
              </label>
              <select
                value={formData.generation}
                onChange={(e) => handleGenerationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {generationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              Se calcula automáticamente según el ciclo seleccionado
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
                    {formatCurrency(calculations.referralEarnings)}
                  </p>
                  <p className="text-xs text-gray-500">
                    (Según ciclo seleccionado)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Mi Ingreso:</p>
                  <p className="font-medium">
                    {formatCurrency(calculations.myIncome)}
                  </p>
                  <p className="text-xs text-gray-500">
                    (
                    {
                      generationOptions
                        .find((g) => g.value === parseInt(formData.generation))
                        ?.label.split("(")[1]
                    }
                    )
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total:</p>
                  <p className="font-medium">
                    {formatCurrency(calculations.totalEarned)}
                  </p>
                </div>
              </div>
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
