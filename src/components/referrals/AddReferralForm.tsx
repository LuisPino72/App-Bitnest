"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirebaseReferrals } from "@/hooks";
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
        amount: referral.amount.toString(),
        cycle: referral.cycle?.toString() || "1",
        generation: referral.generation.toString(),
        investmentDate: referral.investmentDate,
        expirationDate: referral.expirationDate,
      });
      updateCalculations(referral.amount, referral.generation);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        investmentDate: today,
        expirationDate: calculateExpirationDate(today),
      }));
    }
  }, [referral]);

  const updateCalculations = (amount: number, generation: Generation) => {
    const referralEarnings = calculateReferralEarnings(amount);
    const myIncome = calculateUserIncome(referralEarnings, generation);
    setCalculations({
      referralEarnings,
      myIncome,
      totalEarned: referralEarnings + myIncome,
    });
  };

  const handleAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setFormData((prev) => ({ ...prev, amount }));
    updateCalculations(numAmount, parseInt(formData.generation) as Generation);
  };

  const handleGenerationChange = (generation: string) => {
    setFormData((prev) => ({ ...prev, generation }));
    if (formData.amount) {
      updateCalculations(
        parseFloat(formData.amount),
        parseInt(generation) as Generation
      );
    }
  };

  const handleInvestmentDateChange = (date: string) => {
    const expirationDate = calculateExpirationDate(date);
    setFormData((prev) => ({ ...prev, investmentDate: date, expirationDate }));
  };

  const filterReferrals = (term: string) => {
    if (!term.trim()) {
      setFilteredReferrals([]);
      setShowSuggestions(false);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const results = referrals.filter(
      (ref) =>
        ref.name.toLowerCase().includes(lowerTerm) ||
        ref.wallet.toLowerCase().includes(lowerTerm)
    );
    setFilteredReferrals(results.slice(0, 5));
    setShowSuggestions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.wallet.trim() || !formData.amount) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (numAmount <= 0) {
      alert("El monto de inversión debe ser mayor a 0");
      return;
    }

    try {
      const referralData = {
        name: formData.name.trim(),
        wallet: formData.wallet.trim(),
        amount: numAmount,
        cycle: parseInt(formData.cycle),
        generation: parseInt(formData.generation) as Generation,
        status: "active" as const,
        investmentDate: formData.investmentDate,
        expirationDate: formData.expirationDate,
        startDate: new Date().toISOString().split("T")[0],
        cycleCount: 1,
        earnings: calculations.referralEarnings,
        userIncome: calculations.myIncome,
        totalEarned: calculations.totalEarned,
      };

      if (isEdit && referral) {
        await updateReferral(referral.id, referralData);
      } else {
        await addReferral(referralData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error al guardar el referido:", error);
      alert("Error al guardar el referido");
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
                placeholder="Nombre del referido o parte de su billetera"
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
                Ciclo
              </label>
              <input
                type="number"
                min="1"
                value={formData.cycle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cycle: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                    {formatCurrency(calculations.referralEarnings)}
                  </p>
                  <p className="text-xs text-gray-500">(24% del monto)</p>
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
