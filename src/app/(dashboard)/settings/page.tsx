"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, FileDown, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import type { Referral, PersonalInvestment } from "@/types";
import {
  ReferralService,
  PersonalInvestmentService,
} from "@/lib/firebaseService";
import {
  exportReferralsToPDF,
  exportReferralsToExcel,
  exportInvestmentsToPDF,
  exportInvestmentsToExcel,
} from "@/utils/exportData";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [investments, setInvestments] = useState<PersonalInvestment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ref, inv] = await Promise.all([
          ReferralService.getAll(),
          PersonalInvestmentService.getAll(),
        ]);
        setReferrals(ref);
        setInvestments(inv);
      } catch (e) {
        setError("Error al cargar los datos para exportar.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportPDF = () => {
    exportReferralsToPDF(referrals);
    exportInvestmentsToPDF(investments);
  };

  const handleExportExcel = () => {
    exportReferralsToExcel(referrals);
    exportInvestmentsToExcel(investments);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exportar</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la exportación de tus datos
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Exportar Datos
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Exportar Referidos e Inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
                onClick={handleExportPDF}
                disabled={loading || referrals.length === 0}
              >
                <FileDown className="h-5 w-5 mr-2" />
                Exportar PDF
              </button>
              <button
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-60"
                onClick={handleExportExcel}
                disabled={loading || referrals.length === 0}
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Exportar Excel
              </button>
            </div>
            {loading && (
              <p className="text-xs text-gray-500 mt-2">Cargando datos...</p>
            )}
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">
              Exporta toda la información de tus referidos e inversiones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
