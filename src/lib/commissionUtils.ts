import { Generation } from "@/types";

// ==================== CONSTANTES DE COMISIONES ====================
export const COMMISSION_RATES: Record<Generation, number> = {
  1: 0.2,
  2: 0.1,
  3: 0.05,
  4: 0.05,
  5: 0.05,
  6: 0.05,
  7: 0.05,
  8: 0.03,
  9: 0.03,
  10: 0.03,
  11: 0.01,
  12: 0.01,
  13: 0.01,
  14: 0.01,
  15: 0.01,
  16: 0.01,
  17: 0.01,
} as const;

// ==================== FUNCIONES DE COMISIONES ====================

/**
 * Obtiene la tasa de comisión para una generación específica
 * @param generation - La generación del referido (1-17)
 * @returns La tasa de comisión como decimal (ej: 0.2 para 20%)
 */
export const getCommissionRate = (generation: Generation): number => {
  return COMMISSION_RATES[generation] || 0;
};

/**
 * Calcula el ingreso del usuario basado en las ganancias del referido y su generación
 * @param referralEarnings - Ganancias del referido
 * @param generation - Generación del referido
 * @returns El ingreso que recibirá el usuario
 */
export const calculateUserIncome = (
  referralEarnings: number,
  generation: Generation
): number => {
  const commissionRate = getCommissionRate(generation);
  return referralEarnings * commissionRate;
};

/**
 * Obtiene la etiqueta formateada para una generación
 * @param generation - La generación
 * @returns Etiqueta formateada (ej: "1ra Gen", "2da Gen", "3ra-7ma Gen")
 */
export const getGenerationLabel = (generation: Generation): string => {
  if (generation === 1) return "1ra Gen";
  if (generation === 2) return "2da Gen";
  if (generation === 3) return "3ra Gen";
  if (generation === 4) return "4ta Gen";
  if (generation === 5) return "5ta Gen";
  if (generation === 6) return "6ta Gen";
  if (generation === 7) return "7ma Gen";
  if (generation === 8) return "8va Gen";
  if (generation === 9) return "9na Gen";
  if (generation === 10) return "10ma Gen";
  if (generation === 11) return "11ra Gen";
  if (generation === 12) return "12da Gen";
  if (generation === 13) return "13ra Gen";
  if (generation === 14) return "14ta Gen";
  if (generation === 15) return "15ta Gen";
  if (generation === 16) return "16ta Gen";
  if (generation === 17) return "17ma Gen";
  return `${generation}va Gen`;
};

/**
 * Obtiene el rango de generaciones para agrupación
 * @param generation - La generación individual
 * @returns El rango de generaciones al que pertenece
 */
export const getGenerationRange = (generation: Generation): string => {
  if (generation === 1) return "1";
  if (generation === 2) return "2";
  if (generation >= 3 && generation <= 7) return "3-7";
  if (generation >= 8 && generation <= 10) return "8-10";
  if (generation >= 11 && generation <= 17) return "11-17";
  return String(generation);
};

/**
 * Obtiene el color asociado a una generación para UI
 * @param generation - La generación
 * @returns Clases de color de Tailwind CSS
 */
export const getGenerationColor = (generation: Generation): string => {
  const colorMap: Record<number, string> = {
    1: "bg-blue-100 text-blue-800",
    2: "bg-yellow-100 text-yellow-800",
    3: "bg-green-100 text-green-800",
    4: "bg-purple-100 text-purple-800",
    5: "bg-pink-100 text-pink-800",
    6: "bg-indigo-100 text-indigo-800",
    7: "bg-orange-100 text-orange-800",
  };

  return colorMap[generation] || "bg-gray-100 text-gray-800";
};

/**
 * Obtiene el icono asociado a una generación
 * @param generation - La generación
 * @returns El color del icono para Tailwind CSS
 */
export const getGenerationIconColor = (generation: Generation): string => {
  const iconColorMap: Record<number, string> = {
    1: "text-green-500",
    2: "text-yellow-500",
    3: "text-purple-500",
    4: "text-pink-500",
    5: "text-indigo-500",
    6: "text-orange-500",
    7: "text-red-500",
  };

  return iconColorMap[generation] || "text-gray-500";
};

/**
 * Calcula las comisiones totales para un conjunto de referidos
 * @param referrals - Array de referidos
 * @returns Objeto con totales por generación
 */
export const calculateTotalCommissions = (
  referrals: Array<{ generation: Generation; userIncome: number }>
) => {
  const totals: Record<Generation, number> = {} as Record<Generation, number>;

  referrals.forEach((referral) => {
    const current = totals[referral.generation] || 0;
    totals[referral.generation] = current + referral.userIncome;
  });

  return totals;
};

/**
 * Obtiene estadísticas de comisiones por generación
 * @param referrals - Array de referidos
 * @returns Estadísticas detalladas por generación
 */
export const getCommissionStats = (
  referrals: Array<{
    generation: Generation;
    userIncome: number;
    amount: number;
  }>
) => {
  const stats: Record<
    Generation,
    {
      count: number;
      totalIncome: number;
      totalInvestment: number;
      avgIncome: number;
    }
  > = {} as any;

  referrals.forEach((referral) => {
    if (!stats[referral.generation]) {
      stats[referral.generation] = {
        count: 0,
        totalIncome: 0,
        totalInvestment: 0,
        avgIncome: 0,
      };
    }

    stats[referral.generation].count += 1;
    stats[referral.generation].totalIncome += referral.userIncome;
    stats[referral.generation].totalInvestment += referral.amount;
  });

  // Calcular promedios
  Object.keys(stats).forEach((gen) => {
    const generation = parseInt(gen) as Generation;
    if (stats[generation].count > 0) {
      stats[generation].avgIncome =
        stats[generation].totalIncome / stats[generation].count;
    }
  });

  return stats;
};
