"use client";

import { useState } from "react";
import { DollarSign, Users } from "lucide-react";
import PersonalIncomeCalculator from "@/components/calculators/PersonalIncomeCalculator";
import ReferralIncomeCalculator from "@/components/calculators/ReferralIncomeCalculator";

type CalculatorTab = "personal" | "referrals";

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("personal");

  const tabs = [
    {
      id: "personal" as CalculatorTab,
      label: "Inversión Personal",
      icon: DollarSign,
      description: "Calcula tus ganancias personales con reinversión",
    },
    {
      id: "referrals" as CalculatorTab,
      label: "Ingresos por Referidos",
      icon: Users,
      description: "Proyecta ingresos de tu red de referidos",
    },
  ];

  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in py-8 px-2 md:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          Calculadoras
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Herramientas para calcular proyecciones de ingresos y planificar tu
          crecimiento
        </p>
      </div>

      <div className="max-w-3xl mx-auto rounded-2xl border bg-white shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-bold text-base transition-colors flex items-center ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            {activeTabInfo?.icon && (
              <activeTabInfo.icon className="h-6 w-6 text-primary-600 mr-3" />
            )}
            <p className="text-gray-700 text-base">
              {activeTabInfo?.description}
            </p>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "personal" && <PersonalIncomeCalculator />}
          {activeTab === "referrals" && <ReferralIncomeCalculator />}
        </div>
      </div>
    </div>
  );
}
