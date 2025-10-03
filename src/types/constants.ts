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
} as const;

// Función helper para obtener comisión por generación
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
    default:
      return 0;
  }
};
