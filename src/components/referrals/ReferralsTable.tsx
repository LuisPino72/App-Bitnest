import React from "react";
import { Edit, Trash2, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationBadge } from "@/components/ui/GenerationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/businessUtils";
import { Referral } from "@/types";

interface ReferralsTableProps {
  referrals: Referral[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCycleAction: (id: string) => void;
}

export const ReferralsTable = React.memo<ReferralsTableProps>(
  ({ referrals, onEdit, onDelete, onCycleAction }) => {
    if (referrals.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-bold">
            No se encontraron referidos
          </p>
          <p className="text-gray-400 mt-1">
            Comienza agregando tu primer referido
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border bg-white shadow-lg max-w-6xl mx-auto mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">
                  Referido
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Generación
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Inversión
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Ganancias
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Tu Ingreso
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Vencimiento
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr
                  key={referral.id}
                  className="hover:bg-gray-50 transition-all"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-bold text-gray-900">
                      {referral.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">
                      {referral.wallet}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <GenerationBadge generation={referral.generation} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center font-bold">
                    {formatCurrency(referral.amount)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-green-600 font-bold">
                    {formatCurrency(referral.earnings)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center font-bold text-blue-600">
                    {formatCurrency(referral.userIncome)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <StatusBadge status={referral.status} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {formatDate(referral.expirationDate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(referral.id)}
                        aria-label="Editar referido"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCycleAction(referral.id)}
                        aria-label="Acciones de ciclo"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(referral.id)}
                        aria-label="Eliminar referido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

ReferralsTable.displayName = "ReferralsTable";
