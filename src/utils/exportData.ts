import { Referral, PersonalInvestment } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function exportReferralsToPDF(referrals: Referral[]) {
  const doc = new jsPDF();
  doc.text("Listado de Referidos", 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [
      [
        "Nombre",
        "Teléfono",
        "Generación",
        "Monto",
        "Estado",
        "Fecha Inicio",
        "Fecha Vencimiento",
      ],
    ],
    body: referrals.map((r) => [
      r.name,
      r.phone || "-",
      r.generation,
      r.amount,
      r.status,
      r.startDate,
      r.expirationDate,
    ]),
  });
  doc.save("referidos.pdf");
}

export function exportInvestmentsToPDF(investments: PersonalInvestment[]) {
  const doc = new jsPDF();
  doc.text("Listado de Inversiones", 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [
      [
        "Monto",
        "Estado",
        "Fecha Inicio",
        "Fecha Vencimiento",
        "Ganancias",
        "Ciclos",
        "Total Ganado",
      ],
    ],
    body: investments.map((i) => [
      i.amount,
      i.status,
      i.startDate,
      i.expirationDate,
      i.earnings,
      i.cycleCount,
      i.totalEarned,
    ]),
  });
  doc.save("inversiones.pdf");
}

export function exportReferralsToExcel(referrals: Referral[]) {
  const ws = XLSX.utils.json_to_sheet(referrals);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Referidos");
  XLSX.writeFile(wb, "referidos.xlsx");
}

export function exportInvestmentsToExcel(investments: PersonalInvestment[]) {
  const ws = XLSX.utils.json_to_sheet(investments);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inversiones");
  XLSX.writeFile(wb, "inversiones.xlsx");
}
