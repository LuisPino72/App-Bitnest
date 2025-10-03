import {
  Referral,
  PersonalInvestment,
  Lead,
  DashboardMetrics,
  CalculatorInput,
  CalculatorResult,
  ReferralCalculatorInput,
  ReferralCalculatorResult,
  Generation,
} from "@/types";
import { BUSINESS_CONSTANTS, getCommissionRate } from "@/types/constants";

// ==================== UTILIDADES DE FECHA ====================
export const getTodayISO = (): string => new Date().toISOString().split("T")[0];

export const formatDate = (date: string): string => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export const addDays = (date: string, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
};

export const isToday = (date: string): boolean => date === getTodayISO();

export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ==================== CÁLCULOS DE INVERSIÓN ====================
export const calculateReferralEarnings = (amount: number): number =>
  amount * BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;

export const calculateUserIncome = (
  referralEarnings: number,
  generation: Generation = 1
): number => {
  const commissionRate = getCommissionRate(generation);
  return referralEarnings * commissionRate;
};

export const calculatePersonalEarnings = (amount: number): number =>
  amount * BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;

export const calculateExpirationDate = (startDate: string): string =>
  addDays(startDate, BUSINESS_CONSTANTS.CYCLE_DAYS);

// ==================== FILTROS Y AGRUPACIONES ====================
export const getActiveReferrals = (referrals: Referral[]): Referral[] =>
  referrals.filter((r) => r.status === "active");

export const getActiveInvestments = (
  investments: PersonalInvestment[]
): PersonalInvestment[] => investments.filter((inv) => inv.status === "active");

export const getUniqueReferrals = (referrals: Referral[]): Referral[] => {
  const unique = new Map();
  referrals.forEach((referral) => {
    if (!unique.has(referral.wallet)) {
      unique.set(referral.wallet, referral);
    }
  });
  return Array.from(unique.values());
};

export const getActiveReferralPersons = (referrals: Referral[]): Referral[] => {
  const walletGroups = referrals.reduce((acc, ref) => {
    if (!acc[ref.wallet]) acc[ref.wallet] = [];
    acc[ref.wallet].push(ref);
    return acc;
  }, {} as Record<string, Referral[]>);

  return Object.values(walletGroups)
    .filter((investments) => investments.some((inv) => inv.status === "active"))
    .map((investments) => investments[0]);
};

// ==================== CÁLCULOS DE MÉTRICAS ====================
export const getTotalInvestments = (referrals: Referral[]): number =>
  referrals.reduce((total, referral) => total + referral.amount, 0);

export const getTotalEarnings = (referrals: Referral[]): number =>
  referrals.reduce((total, referral) => total + referral.totalEarned, 0);

export const calculateReferralOnlyEarnings = (referrals: Referral[]): number =>
  getActiveReferrals(referrals).reduce(
    (sum, referral) => sum + (referral.userIncome || 0),
    0
  );

// ==================== DASHBOARD METRICS OPTIMIZADO ====================
export const calculateDashboardMetrics = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[],
  leads: Lead[],
  currentDate?: string
): DashboardMetrics => {
  const today = currentDate || getTodayISO();
  const thirtyDaysAgo = addDays(today, -30);
  const thirtyDaysAgoDate = new Date(thirtyDaysAgo);

  const activeReferrals = getActiveReferrals(referrals);
  const activeInvestments = getActiveInvestments(personalInvestments);
  const activeReferralPersons = getActiveReferralPersons(referrals);

  // ✅ Agrega filtros para todas las generaciones
  const firstGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 1
  );
  const secondGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 2
  );
  const thirdGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 3
  );
  const fourthGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 4
  );
  const fifthGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 5
  );
  const sixthGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 6
  );
  const seventhGenReferrals = activeReferralPersons.filter(
    (r) => r.generation === 7
  );

  const interestedLeads = leads.filter((l) => l.status === "interested");

  // Cálculos de inversiones
  const totalPersonalInvestments = activeInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const totalReferralInvestments = activeReferrals.reduce(
    (sum, r) => sum + r.amount,
    0
  );
  const totalInvestments = totalPersonalInvestments + totalReferralInvestments;

  // Cálculos de ganancias
  const referralIncome = activeReferrals.reduce(
    (sum, r) => sum + (r.userIncome || 0),
    0
  );
  const personalEarnings = activeInvestments.reduce(
    (sum, inv) => sum + (inv.earnings || 0),
    0
  );
  const totalEarnings = referralIncome + personalEarnings + HISTORICAL_EARNINGS;

  // CÁLCULO DE monthlyEarnings:
  const referralMonthlyEarnings = activeReferrals
    .filter((ref) => {
      const refDate = new Date(ref.startDate || ref.investmentDate);
      return refDate >= thirtyDaysAgoDate;
    })
    .reduce((sum, ref) => sum + (ref.userIncome || 0), 0);

  const investmentMonthlyEarnings = activeInvestments
    .filter((inv) => {
      const invDate = new Date(inv.startDate);
      return invDate >= thirtyDaysAgoDate;
    })
    .reduce((sum, inv) => sum + (inv.earnings || 0), 0);

  const monthlyEarnings = referralMonthlyEarnings + investmentMonthlyEarnings;

  // Expirando hoy
  const expiringToday = [
    ...activeReferrals.filter((r) => r.expirationDate === today),
    ...activeInvestments.filter((inv) => inv.expirationDate === today),
  ].length;

  return {
    totalInvestments,
    totalReferrals: activeReferralPersons.length,
    firstGeneration: firstGenReferrals.length,
    secondGeneration: secondGenReferrals.length,
    thirdGeneration: thirdGenReferrals.length,
    fourthGeneration: fourthGenReferrals.length,
    fifthGeneration: fifthGenReferrals.length,
    sixthGeneration: sixthGenReferrals.length,
    seventhGeneration: seventhGenReferrals.length,
    totalEarnings,
    monthlyEarnings,
    expiringToday,
    activeLeads: interestedLeads.length,
  };
};

// ==================== FUNCIONES DE PROYECCIÓN ====================
export const calculatePersonalIncomeProjection = (
  input: CalculatorInput
): CalculatorResult => {
  let currentAmount = input.amount;
  const breakdown = Array.from({ length: input.cycles }, (_, cycle) => {
    const earnings = calculatePersonalEarnings(currentAmount);
    currentAmount += earnings;
    return { cycle: cycle + 1, earnings, total: currentAmount };
  });

  const totalEarnings = currentAmount - input.amount;

  return {
    initialAmount: input.amount,
    totalEarnings,
    finalAmount: currentAmount,
    cycles: input.cycles,
    breakdown,
  };
};

// Proyecciones
export const calculateReferralIncomeProjection = (
  input: ReferralCalculatorInput
): ReferralCalculatorResult => {
  const breakdown = input.referrals.map((referralGroup) => {
    const referralEarnings = calculateReferralEarnings(referralGroup.amount);
    const userIncome = calculateUserIncome(
      referralEarnings,
      referralGroup.generation
    );
    const totalUserIncome = userIncome * referralGroup.count;

    return {
      generation: referralGroup.generation,
      amount: referralGroup.amount,
      count: referralGroup.count,
      referralEarnings,
      userIncome: totalUserIncome,
    };
  });

  const totalIncome = breakdown.reduce((sum, item) => sum + item.userIncome, 0);

  return { totalIncome, breakdown };
};

// ==================== UTILIDADES GENERALES ====================
export const getTopReferrals = (
  referrals: Referral[],
  limit: number = 3
): Referral[] =>
  getActiveReferrals(referrals)
    .sort(
      (a, b) =>
        (b.totalEarned || b.userIncome || 0) -
        (a.totalEarned || a.userIncome || 0)
    )
    .slice(0, limit);

export const getExpiringToday = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[]
) => ({
  referrals: getActiveReferrals(referrals).filter((r) =>
    isToday(r.expirationDate)
  ),
  investments: getActiveInvestments(personalInvestments).filter((inv) =>
    isToday(inv.expirationDate)
  ),
});

export const getInvestmentsExpiringToday = (
  investments: PersonalInvestment[]
): number =>
  getActiveInvestments(investments).filter((inv) => isToday(inv.expirationDate))
    .length;

export const calculateProjection = (
  initialAmount: number,
  cycles: number
): number => {
  let amount = initialAmount;
  for (let i = 0; i < cycles; i++) {
    amount *= 1.24;
  }
  return parseFloat(amount.toFixed(2));
};

export const calculateGrowthRate = (
  current: number,
  previous: number
): number =>
  previous === 0
    ? current > 0
      ? 100
      : 0
    : ((current - previous) / previous) * 100;

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatPercentage = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

export const generateId = (prefix: string = ""): string =>
  `${prefix}${prefix ? "-" : ""}${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substr(2, 5)}`;

export const isValidPhone = (phone: string): boolean =>
  /^[+]?[1-9]?[0-9]{7,15}$/.test(phone.replace(/[\s-()]/g, ""));

export const getLeadStats = (leads: Lead[]) => {
  const total = leads.length;
  const interested = leads.filter((l) => l.status === "interested").length;
  const conversionRate = total > 0 ? (interested / total) * 100 : 0;

  return {
    total,
    interested,
    doubtful: leads.filter((l) => l.status === "doubtful").length,
    rejected: leads.filter((l) => l.status === "rejected").length,
    conversionRate,
  };
};

export const filterReferralsByGeneration = (
  referrals: Referral[],
  generation?: Generation
): Referral[] =>
  !generation
    ? referrals
    : referrals.filter((r) => r.generation === generation);

export const filterReferralsByStatus = (
  referrals: Referral[],
  status?: string
): Referral[] =>
  !status ? referrals : referrals.filter((r) => r.status === status);

export const searchItems = <T extends { name: string; phone?: string }>(
  items: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return items;
  const term = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      (item.phone && item.phone.toLowerCase().includes(term))
  );
};

export function calculateGenerationMetrics(referrals: Referral[]) {
  const firstGen = referrals.filter((r) => r.generation === 1);
  const secondGen = referrals.filter((r) => r.generation === 2);
  const thirdGen = referrals.filter((r) => r.generation === 3);
  const fourthGen = referrals.filter((r) => r.generation === 4);
  const fifthGen = referrals.filter((r) => r.generation === 5);
  const sixthGen = referrals.filter((r) => r.generation === 6);
  const seventhGen = referrals.filter((r) => r.generation === 7);

  const calculateMetrics = (genReferrals: Referral[]) => ({
    count: genReferrals.length,
    totalInvestment: genReferrals.reduce((sum, r) => sum + r.amount, 0),
    totalEarned: genReferrals.reduce((sum, r) => sum + (r.totalEarned || 0), 0),
  });

  return {
    firstGeneration: calculateMetrics(firstGen),
    secondGeneration: calculateMetrics(secondGen),
    thirdGeneration: calculateMetrics(thirdGen),
    fourthGeneration: calculateMetrics(fourthGen),
    fifthGeneration: calculateMetrics(fifthGen),
    sixthGeneration: calculateMetrics(sixthGen),
    seventhGeneration: calculateMetrics(seventhGen),
  };
}

export const HISTORICAL_EARNINGS = 433.67;
