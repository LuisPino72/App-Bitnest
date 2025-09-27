'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, Users, TrendingUp } from 'lucide-react';
import PersonalIncomeCalculator from '@/components/calculators/PersonalIncomeCalculator';
import ReferralIncomeCalculator from '@/components/calculators/ReferralIncomeCalculator';

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'referrals'>('personal');

  const tabs = [
    {
      id: 'personal',
      label: 'Inversión Personal',
      icon: DollarSign,
      description: 'Calcula tus ganancias personales con reinversión'
    },
    {
      id: 'referrals',
      label: 'Ingresos por Referidos',
      icon: Users,
      description: 'Proyecta ingresos de tu red de referidos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calculadoras</h1>
        <p className="text-gray-600 mt-2">
          Herramientas para calcular proyecciones de ingresos y planificar tu crecimiento
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-primary-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">ROI por Ciclo</p>
              <p className="text-2xl font-bold">24%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-success-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Duración Ciclo</p>
              <p className="text-2xl font-bold">28 días</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-warning-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Comisión Gen 1</p>
              <p className="text-2xl font-bold">20%</p>
            </div>
          </div>
        </div>
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
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            {tabs.find(tab => tab.id === activeTab)?.icon && (
              <div className="mr-3">
                {tabs.find(tab => tab.id === activeTab)?.icon && 
                  React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, {
                    className: "h-5 w-5 text-primary-600"
                  })
                }
              </div>
            )}
            <p className="text-gray-700">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="p-6">
          {activeTab === 'personal' && <PersonalIncomeCalculator />}
          {activeTab === 'referrals' && <ReferralIncomeCalculator />}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conceptos Clave
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="font-medium text-gray-900">Ciclo de Inversión</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Período de 28 días donde tu inversión genera un retorno del 24%
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="font-medium text-gray-900">Reinversión Automática</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Las ganancias se reinvierten automáticamente para crear crecimiento compuesto
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-warning-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="font-medium text-gray-900">Sistema de Referidos</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Gana comisiones del 20% (Gen1) y 10% (Gen2) sobre las ganancias de tus referidos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ejemplos de Crecimiento
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <h4 className="font-medium text-primary-800">Inversión Conservadora</h4>
              <p className="text-sm text-primary-700 mt-1">
                €10,000 → 3 ciclos → €18,742 (87% ROI)
              </p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <h4 className="font-medium text-success-800">Inversión Moderada</h4>
              <p className="text-sm text-success-700 mt-1">
                €25,000 → 6 ciclos → €91,135 (264% ROI)
              </p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <h4 className="font-medium text-warning-800">Inversión Agresiva</h4>
              <p className="text-sm text-warning-700 mt-1">
                €50,000 → 12 ciclos → €1,517,624 (2,935% ROI)
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Los resultados son proyecciones basadas en el retorno del 24% por ciclo
          </p>
        </div>
      </div>
    </div>
  );
}