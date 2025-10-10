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
import {
  BUSINESS_CONSTANTS,
  getCommissionRate,
  HISTORICAL_EARNINGS,
  getCycleRateFromDays,
} from "@/types/constants";

// ==================== UTILIDADES DE FECHA ====================

export const getTodayISO = (): string => {
  const now = new Date();
 
  const utcMinus4 = new Date(
    now.getTime() - (now.getTimezoneOffset() + 240) * 60000
  );
  return utcMinus4.toISOString().split("T")[0];
};

export const formatDate = (date: string): string => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export const addDays = (date: string, days: number): string => {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length < 3) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const dt = new Date(year, month - 1, day);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const isToday = (date: string): boolean => date === getTodayISO();

export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ==================== CÁLCULOS DE INVERSIÓN ====================
export const calculateReferralEarnings = (
  amount: number,
  cycleDays?: number
): number => {
  const rate = getCycleRateFromDays(cycleDays);
  return amount * rate;
};

export const calculateUserIncome = (
  referralEarnings: number,
  generation: Generation = 1
): number => {
  const commissionRate = getCommissionRate(generation);
  return referralEarnings * commissionRate;
};

export const calculatePersonalEarnings = (amount: number): number =>
  amount * BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;

export const calculateExpirationDate = (
  startDate: string,
  days: number = BUSINESS_CONSTANTS.CYCLE_DAYS
): string => addDays(startDate, days);

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

  // Reducir en una sola pasada para calcular agregados
  const initial = {
    totalPersonalInvestments: 0,
    totalReferralInvestments: 0,
    referralIncome: 0,
    personalEarnings: 0,
    referralMonthlyEarnings: 0,
    investmentMonthlyEarnings: 0,
    byGeneration: Array.from({ length: 17 }, () => 0) as number[],
    expiringTodayCount: 0,
  };

  // Procesar referridos
  activeReferrals.forEach((r) => {
    initial.totalReferralInvestments += r.amount;
    initial.referralIncome += r.userIncome || 0;

    const genIndex = Math.max(1, Math.min(17, r.generation)) - 1;
    initial.byGeneration[genIndex] = (initial.byGeneration[genIndex] || 0) + 1;

    const refDate = new Date(r.startDate || r.investmentDate);
    if (refDate >= thirtyDaysAgoDate) {
      initial.referralMonthlyEarnings += r.userIncome || 0;
    }

    if (r.expirationDate === today) initial.expiringTodayCount += 1;
  });

  // Procesar inversiones personales
  activeInvestments.forEach((inv) => {
    initial.totalPersonalInvestments += inv.amount;
    initial.personalEarnings += inv.earnings || 0;
    const invDate = new Date(inv.startDate);
    if (invDate >= thirtyDaysAgoDate)
      initial.investmentMonthlyEarnings += inv.earnings || 0;
    if (inv.expirationDate === today) initial.expiringTodayCount += 1;
  });

  const totalInvestments =
    initial.totalPersonalInvestments + initial.totalReferralInvestments;
  const totalEarnings =
    initial.referralIncome + initial.personalEarnings + HISTORICAL_EARNINGS;
  const monthlyEarnings =
    initial.referralMonthlyEarnings + initial.investmentMonthlyEarnings;

  const totalReferrals = initial.byGeneration.reduce((s, v) => s + v, 0);

  return {
    totalInvestments,
    totalReferrals,
    firstGeneration: initial.byGeneration[0] || 0,
    secondGeneration: initial.byGeneration[1] || 0,
    thirdGeneration: initial.byGeneration[2] || 0,
    fourthGeneration: initial.byGeneration[3] || 0,
    fifthGeneration: initial.byGeneration[4] || 0,
    sixthGeneration: initial.byGeneration[5] || 0,
    seventhGeneration: initial.byGeneration[6] || 0,
    eighthGeneration: initial.byGeneration[7] || 0,
    ninthGeneration: initial.byGeneration[8] || 0,
    tenthGeneration: initial.byGeneration[9] || 0,
    eleventhGeneration: initial.byGeneration[10] || 0,
    twelfthGeneration: initial.byGeneration[11] || 0,
    thirteenthGeneration: initial.byGeneration[12] || 0,
    fourteenthGeneration: initial.byGeneration[13] || 0,
    fifteenthGeneration: initial.byGeneration[14] || 0,
    sixteenthGeneration: initial.byGeneration[15] || 0,
    seventeenthGeneration: initial.byGeneration[16] || 0,
    totalEarnings,
    monthlyEarnings,
    expiringToday: initial.expiringTodayCount,
    activeLeads: leads.filter((l) => l.status === "interested").length,
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
    const referralEarnings = calculateReferralEarnings(
      referralGroup.amount,
      (referralGroup as any).cycleDays
    );
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
  const rate = 1 + BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;
  let amount = initialAmount;
  for (let i = 0; i < cycles; i++) {
    amount *= rate;
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
    .slice(2, 7)}`;

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
