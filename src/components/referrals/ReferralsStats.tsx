import React from "react";
import { Users } from "lucide-react";
import { Referral } from "@/types";
import {
  getActiveReferralPersons,
  getUniqueReferrals,
} from "@/lib/businessUtils";

interface ReferralsStatsProps {
  referrals: Referral[];
}

export const ReferralsStats = React.memo<ReferralsStatsProps>(
  ({ referrals }) => {
    const activeReferralPersons = React.useMemo(
      () => getActiveReferralPersons(referrals),
      [referrals]
    );

    const totalUniqueReferrals = React.useMemo(
      () => getUniqueReferrals(referrals).length,
      [referrals]
    );

    // Contar referidos activos por generación
    const generationStats = React.useMemo(() => {
      const stats = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
        17: 0,
      };

      activeReferralPersons.forEach((referral) => {
        if (stats[referral.generation] !== undefined) {
          stats[referral.generation]++;
        }
      });

      return stats;
    }, [activeReferralPersons]);

    const getGenerationIconColor = (generation: string) => {
      const colorMap: Record<string, string> = {
        "1": "text-green-500",
        "2": "text-yellow-500",
        "3": "text-purple-500",
        "4": "text-pink-500",
        "5": "text-indigo-500",
        "6": "text-orange-500",
        "7": "text-red-500",
      };
      return colorMap[generation] || "text-gray-500";
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
        {/* Tarjeta de Total de Referidos */}
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex items-center">
          <Users className="h-8 w-8 text-blue-500" />
          <div className="ml-3">
            <p className="text-base text-gray-600">Total Referidos</p>
            <p className="text-2xl font-bold">{totalUniqueReferrals}</p>
          </div>
        </div>

        {/* Tarjetas dinámicas por generación */}
        {Object.entries(generationStats)
          .filter(([_, count]) => count > 0)
          .map(([generation, count]) => (
            <div
              key={generation}
              className="rounded-2xl border bg-white shadow-lg p-6 flex items-center"
            >
              <Users
                className={`h-8 w-8 ${getGenerationIconColor(generation)}`}
              />
              <div className="ml-3">
                <p className="text-base text-gray-600">
                  Generación {generation}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </div>
          ))}

        {/* Tarjeta de Total Activos */}
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex items-center">
          <Users className="h-8 w-8 text-red-500" />
          <div className="ml-3">
            <p className="text-base text-gray-600">Activos</p>
            <p className="text-2xl font-bold">{activeReferralPersons.length}</p>
          </div>
        </div>
      </div>
    );
  }
);

ReferralsStats.displayName = "ReferralsStats";
