"use client";

import { useState } from "react";
import { Download, Database, FileText, Users, DollarSign } from "lucide-react";
import { useFirebaseReferrals } from "@/hooks/firebaseHooks";
import { useFirebasePersonalInvestments } from "@/hooks/firebaseHooks";
import { formatCurrency } from "@/lib/businessUtils";
import { Referral, PersonalInvestment } from "@/types";

interface ExportData {
  timestamp: string;
  summary: {
    totalReferrals: number;
    activeReferrals: number;
    totalCommission: number;
    totalInvested: number;
    totalEarnings: number;
    netWorth: number;
  };
  referrals: Array<{
    name: string;
    phone?: string;
    wallet: string;
    status: string;
    generation: number;
    investmentAmount: number;
    commission: number;
    joinDate: string;
    lastCommissionDate: string;
  }>;
  investments: Array<{
    amount: number;
    startDate: string;
    expirationDate: string;
    earnings: number;
    status: string;
    cycleCount: number;
  }>;
}

export default function ExportPage() {
  const { referrals, getActiveReferrals, getTotalCommission } =
    useFirebaseReferrals();
  const { investments, getActiveInvestments } =
    useFirebasePersonalInvestments();
  const [isExporting, setIsExporting] = useState(false);
  const [exportedData, setExportedData] = useState<ExportData | null>(null);

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const activeReferrals = getActiveReferrals();
      const totalCommission = getTotalCommission();
      const activeInvestments = getActiveInvestments();

      const totalInvested = activeInvestments.reduce(
        (sum: number, inv: PersonalInvestment) => sum + inv.amount,
        0
      );

      const totalEarnings = investments.reduce(
        (sum: number, inv: PersonalInvestment) => sum + inv.earnings,
        0
      );

      const exportData: ExportData = {
        timestamp: new Date().toISOString(),
        summary: {
          totalReferrals: referrals.length,
          activeReferrals: activeReferrals.length,
          totalCommission: totalCommission,
          totalInvested: totalInvested,
          totalEarnings: totalEarnings,
          netWorth: totalInvested + totalEarnings,
        },
        referrals: referrals.map((ref: Referral) => ({
          name: ref.name,
          phone: ref.phone,
          wallet: ref.wallet,
          status: ref.status,
          generation: ref.generation,
          investmentAmount: ref.amount,
          commission: ref.userIncome || 0,
          joinDate: ref.startDate,
          lastCommissionDate: ref.expirationDate,
        })),
        investments: investments.map((inv: PersonalInvestment) => ({
          amount: inv.amount,
          startDate: inv.startDate,
          expirationDate: inv.expirationDate,
          earnings: inv.earnings,
          status: inv.status,
          cycleCount: inv.cycleCount,
        })),
      };

      setExportedData(exportData);

      exportDataToCSV(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };

  const exportDataToCSV = (data: ExportData) => {
    let csvContent = "DATOS DE REFERIDOS\n\n";

    csvContent +=
      "Nombre,Email,Teléfono,Wallet,Estado,Generación,Inversión,Comisión,Fecha Ingreso,Última Comisión\n";

    data.referrals.forEach((ref) => {
      csvContent += `"${ref.name}","","${ref.phone || ""}","${ref.wallet}","${
        ref.status
      }","${ref.generation}","${formatCurrency(
        ref.investmentAmount
      )}","${formatCurrency(ref.commission)}","${ref.joinDate}","${
        ref.lastCommissionDate || "N/A"
      }"\n`;
    });

    csvContent += "\n\nDATOS DE INVERSIONES\n\n";

    csvContent +=
      "Monto,Fecha Inicio,Fecha Vencimiento,Ganancias,Estado,Ciclo\n";

    data.investments.forEach((inv) => {
      csvContent += `"${formatCurrency(inv.amount)}","${inv.startDate}","${
        inv.expirationDate
      }","${formatCurrency(inv.earnings)}","${inv.status}","${
        inv.cycleCount
      }"\n`;
    });

    csvContent += `\n\nRESUMEN\n`;
    csvContent += `Total Referidos: ${data.summary.totalReferrals}\n`;
    csvContent += `Referidos Activos: ${data.summary.activeReferrals}\n`;
    csvContent += `Comisión Total: ${formatCurrency(
      data.summary.totalCommission
    )}\n`;
    csvContent += `Total Invertido: ${formatCurrency(
      data.summary.totalInvested
    )}\n`;
    csvContent += `Ganancias Totales: ${formatCurrency(
      data.summary.totalEarnings
    )}\n`;
    csvContent += `Patrimonio Neto: ${formatCurrency(data.summary.netWorth)}\n`;
    csvContent += `Fecha de Exportación: ${new Date().toLocaleString()}\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bitnest_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!exportedData) return;

    const jsonContent = JSON.stringify(exportedData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bitnest_export_${new Date().toISOString().split("T")[0]}.json`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exportar Datos</h1>
          <p className="text-gray-600 mt-2">
            Exporta tus datos actuales de Firebase a diferentes formatos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <Database className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Datos en Firebase</p>
              <p className="text-2xl font-bold">
                {referrals.length + investments.length}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Referidos:</span>
              <span className="font-medium">{referrals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inversiones:</span>
              <span className="font-medium">{investments.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Referidos Activos</p>
              <p className="text-2xl font-bold">
                {getActiveReferrals().length}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Comisión total: {formatCurrency(getTotalCommission())}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Inversiones Activas</p>
              <p className="text-2xl font-bold">
                {getActiveInvestments().length}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total invertido:{" "}
            {formatCurrency(
              getActiveInvestments().reduce(
                (sum: number, inv: PersonalInvestment) => sum + inv.amount,
                0
              )
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Formatos de Exportación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">CSV</h3>
                <p className="text-sm text-gray-600">
                  Formato compatible con Excel
                </p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              disabled={isExporting}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar a CSV"}
            </button>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-4">
              <Database className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">JSON</h3>
                <p className="text-sm text-gray-600">Formato estructurado</p>
              </div>
            </div>
            <button
              onClick={exportToJSON}
              disabled={!exportedData || isExporting}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar a JSON
            </button>
          </div>
        </div>

        {exportedData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">
              Exportación completada
            </h3>
            <p className="text-sm text-green-700">
              Se exportaron {exportedData.referrals.length} referidos y{" "}
              {exportedData.investments.length} inversiones.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">
          Información importante
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Los datos se obtienen directamente de Firebase en tiempo real
          </li>
          <li>
            • La exportación incluye todos los datos actuales de referidos e
            inversiones
          </li>
          <li>• El formato CSV es ideal para abrir en Excel o Google Sheets</li>
          <li>• El formato JSON es útil para análisis de datos o backups</li>
        </ul>
      </div>
    </div>
  );
}
