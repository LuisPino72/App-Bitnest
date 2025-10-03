"use client";

import { useState, useMemo } from "react";
import { Download, Database, FileText, Users, DollarSign } from "lucide-react";
import { useFirebaseReferrals, useFirebasePersonalInvestments } from "@/hooks";
import { formatCurrency } from "@/lib/businessUtils";
import { Referral, PersonalInvestment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExportReferral {
  name: string;
  phone?: string | undefined;
  wallet: string;
  status: string;
  generation: number;
  investmentAmount: number;
  commission: number;
  joinDate: string;
  lastCommissionDate: string;
}

interface ExportInvestment {
  amount: number;
  startDate: string;
  expirationDate: string;
  earnings: number;
  status: string;
  cycleCount: number;
}

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
  referrals: ExportReferral[];
  investments: ExportInvestment[];
}

export default function ExportPage() {
  const { referrals, getActiveReferrals, getTotalCommission } =
    useFirebaseReferrals();
  const { investments, getActiveInvestments } =
    useFirebasePersonalInvestments();
  const [isExporting, setIsExporting] = useState(false);

  // Calcular métricas usando useMemo para performance
  const metrics = useMemo(() => {
    const activeReferrals = getActiveReferrals();
    const activeInvestments = getActiveInvestments();
    const totalCommission = getTotalCommission();

    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );

    const totalEarnings = investments.reduce(
      (sum, inv) => sum + inv.earnings,
      0
    );

    return {
      activeReferrals,
      activeInvestments,
      totalCommission,
      totalInvested,
      totalEarnings,
      netWorth: totalInvested + totalEarnings,
    };
  }, [
    referrals,
    investments,
    getActiveReferrals,
    getActiveInvestments,
    getTotalCommission,
  ]);

  const prepareExportData = (): ExportData => {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalReferrals: referrals.length,
        activeReferrals: metrics.activeReferrals.length,
        totalCommission: metrics.totalCommission,
        totalInvested: metrics.totalInvested,
        totalEarnings: metrics.totalEarnings,
        netWorth: metrics.netWorth,
      },
      referrals: referrals.map((ref) => ({
        name: ref.name,
        phone: ref.phone || undefined,
        wallet: ref.wallet,
        status: ref.status,
        generation: ref.generation,
        investmentAmount: ref.amount,
        commission: ref.userIncome || 0,
        joinDate: ref.startDate,
        lastCommissionDate: ref.expirationDate,
      })),
      investments: investments.map((inv) => ({
        amount: inv.amount,
        startDate: inv.startDate,
        expirationDate: inv.expirationDate,
        earnings: inv.earnings,
        status: inv.status,
        cycleCount: inv.cycleCount,
      })),
    };
  };

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const exportData = prepareExportData();

      // Crear CSV para referidos
      let csvContent = "DATOS DE REFERIDOS\n\n";

      // Encabezados de referidos
      csvContent +=
        "Nombre,Email,Teléfono,Wallet,Estado,Generación,Inversión,Comisión,Fecha Ingreso,Última Comisión\n";

      // Datos de referidos
      exportData.referrals.forEach((ref) => {
        csvContent += `"${ref.name}","","${ref.phone || ""}","${ref.wallet}","${
          ref.status
        }","${ref.generation}","${formatCurrency(
          ref.investmentAmount
        )}","${formatCurrency(ref.commission)}","${ref.joinDate}","${
          ref.lastCommissionDate || "N/A"
        }"\n`;
      });

      csvContent += "\n\nDATOS DE INVERSIONES\n\n";

      // Encabezados de inversiones
      csvContent +=
        "Monto,Fecha Inicio,Fecha Vencimiento,Ganancias,Estado,Ciclo\n";

      // Datos de inversiones
      exportData.investments.forEach((inv) => {
        csvContent += `"${formatCurrency(inv.amount)}","${inv.startDate}","${
          inv.expirationDate
        }","${formatCurrency(inv.earnings)}","${inv.status}","${
          inv.cycleCount
        }"\n`;
      });

      csvContent += `\n\nRESUMEN\n`;
      csvContent += `Total Referidos: ${exportData.summary.totalReferrals}\n`;
      csvContent += `Referidos Activos: ${exportData.summary.activeReferrals}\n`;
      csvContent += `Comisión Total: ${formatCurrency(
        exportData.summary.totalCommission
      )}\n`;
      csvContent += `Total Invertido: ${formatCurrency(
        exportData.summary.totalInvested
      )}\n`;
      csvContent += `Ganancias Totales: ${formatCurrency(
        exportData.summary.totalEarnings
      )}\n`;
      csvContent += `Patrimonio Neto: ${formatCurrency(
        exportData.summary.netWorth
      )}\n`;
      csvContent += `Fecha de Exportación: ${new Date().toLocaleString()}\n`;

      // Descargar archivo
      downloadFile(
        csvContent,
        `bitnest_export_${new Date().toISOString().split("T")[0]}.csv`,
        "text/csv"
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);

    try {
      const exportData = prepareExportData();
      const jsonContent = JSON.stringify(exportData, null, 2);
      downloadFile(
        jsonContent,
        `bitnest_export_${new Date().toISOString().split("T")[0]}.json`,
        "application/json"
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);

    try {
      const exportData = prepareExportData();

      // Usar importación dinámica para XLSX (reduce bundle size)
      const XLSX = await import("xlsx");

      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Hoja de referidos
      const referralsWs = XLSX.utils.json_to_sheet(exportData.referrals);
      XLSX.utils.book_append_sheet(wb, referralsWs, "Referidos");

      // Hoja de inversiones
      const investmentsWs = XLSX.utils.json_to_sheet(exportData.investments);
      XLSX.utils.book_append_sheet(wb, investmentsWs, "Inversiones");

      // Hoja de resumen
      const summaryData = [exportData.summary];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");

      // Descargar
      XLSX.writeFile(
        wb,
        `bitnest_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error al exportar a Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exportar Datos</h1>
        <p className="text-gray-600 mt-2">
          Exporta tus datos actuales de Firebase a diferentes formatos
        </p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Datos</p>
                <p className="text-2xl font-bold">
                  {referrals.length + investments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Referidos</p>
                <p className="text-2xl font-bold">{referrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Inversiones</p>
                <p className="text-2xl font-bold">{investments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Comisión Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.totalCommission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opciones de Exportación */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Formatos de Exportación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exportar a CSV */}
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <FileText className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">CSV</h3>
              <p className="text-sm text-gray-600 mb-4">
                Formato compatible con Excel
              </p>
              <Button
                onClick={exportToCSV}
                disabled={isExporting}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exportando..." : "Exportar CSV"}
              </Button>
            </div>

            {/* Exportar a JSON */}
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <Database className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">JSON</h3>
              <p className="text-sm text-gray-600 mb-4">Formato estructurado</p>
              <Button
                onClick={exportToJSON}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>

            {/* Exportar a Excel */}
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <FileText className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Excel</h3>
              <p className="text-sm text-gray-600 mb-4">Formato nativo Excel</p>
              <Button
                onClick={exportToExcel}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Información adicional */}
      <Card>
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-3">
            Información importante
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              • Los datos se obtienen directamente de Firebase en tiempo real
            </li>
            <li>
              • La exportación incluye todos los datos actuales de referidos e
              inversiones
            </li>
            <li>
              • El formato CSV es ideal para abrir en Excel o Google Sheets
            </li>
            <li>• El formato JSON es útil para análisis de datos o backups</li>
            <li>• El formato Excel incluye múltiples hojas de trabajo</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
