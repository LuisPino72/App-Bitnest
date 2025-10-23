import { Generation } from "./index";

export const BUSINESS_CONSTANTS = {
  REFERRAL_EARNINGS_RATE: 0.24,
  USER_COMMISSION_RATE: 0.2,
  CYCLE_DAYS: 28,
  FIRST_GEN_COMMISSION: 0.2,
  SECOND_GEN_COMMISSION: 0.1,
  THIRD_GEN_COMMISSION: 0.05,
  FOURTH_GEN_COMMISSION: 0.05,
  FIFTH_GEN_COMMISSION: 0.05,
  SIXTH_GEN_COMMISSION: 0.05,
  SEVENTH_GEN_COMMISSION: 0.05,
  EIGHTH_TO_TENTH_COMMISSION: 0.03,
  ELEVENTH_TO_SEVENTEENTH_COMMISSION: 0.01,
} as const;

export const getCommissionRate = (generation: Generation): number => {
  switch (generation) {
    case 1:
      return BUSINESS_CONSTANTS.FIRST_GEN_COMMISSION;
    case 2:
      return BUSINESS_CONSTANTS.SECOND_GEN_COMMISSION;
    case 3:
      return BUSINESS_CONSTANTS.THIRD_GEN_COMMISSION;
    case 4:
      return BUSINESS_CONSTANTS.FOURTH_GEN_COMMISSION;
    case 5:
      return BUSINESS_CONSTANTS.FIFTH_GEN_COMMISSION;
    case 6:
      return BUSINESS_CONSTANTS.SIXTH_GEN_COMMISSION;
    case 7:
      return BUSINESS_CONSTANTS.SEVENTH_GEN_COMMISSION;
    case 8:
    case 9:
    case 10:
      return BUSINESS_CONSTANTS.EIGHTH_TO_TENTH_COMMISSION;
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
      return BUSINESS_CONSTANTS.ELEVENTH_TO_SEVENTEENTH_COMMISSION;
    default:
      return 0;
  }
};

// Mapa ciclo (días) => tasa de ganancias para el referido
export const CYCLE_OPTIONS: Record<number, number> = {
  1: 0.004,
  7: 0.04,
  14: 0.095,
  28: 0.24,
};

export const getCycleRateFromDays = (days?: number): number => {
  if (!days) return BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;
  return CYCLE_OPTIONS[days] ?? BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;
};

// Valor histórico
export const HISTORICAL_EARNINGS = 211.3;
export const HISTORICAL_TOTAL_INVESTMENT = 753.77;
