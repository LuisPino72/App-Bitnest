"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, Users, TrendingUp } from "lucide-react";
import PersonalIncomeCalculator from "@/components/calculators/PersonalIncomeCalculator";
import ReferralIncomeCalculator from "@/components/calculators/ReferralIncomeCalculator";

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<"personal" | "referrals">(
    "personal"
  );

  const tabs = [
    {
      id: "personal",
      label: "Inversión Personal",
      icon: DollarSign,
      description: "Calcula tus ganancias personales con reinversión",
    },
    {
      id: "referrals",
      label: "Ingresos por Referidos",
      icon: Users,
      description: "Proyecta ingresos de tu red de referidos",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calculadoras</h1>
        <p className="text-gray-600 mt-2">
          Herramientas para calcular proyecciones de ingresos y planificar tu
          crecimiento
        </p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            {tabs.find((tab) => tab.id === activeTab)?.icon && (
              <div className="mr-3">
                {tabs.find((tab) => tab.id === activeTab)?.icon &&
                  React.createElement(
                    tabs.find((tab) => tab.id === activeTab)!.icon,
                    {
                      className: "h-5 w-5 text-primary-600",
                    }
                  )}
              </div>
            )}
            <p className="text-gray-700">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="p-6">
          {activeTab === "personal" && <PersonalIncomeCalculator />}
          {activeTab === "referrals" && <ReferralIncomeCalculator />}
        </div>
      </div>
    </div>
  );
}
