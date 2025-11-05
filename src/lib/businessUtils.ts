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
  getCommissionRate as getLegacyCommissionRate,
  HISTORICAL_EARNINGS,
  HISTORICAL_TOTAL_INVESTMENT,
  getCycleRateFromDays,
} from "@/types/constants";
import {
  getCommissionRate,
  calculateUserIncome as calculateUserIncomeNew,
} from "./commissionUtils";

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

// ==================== NUEVAS UTILIDADES PARA MES ACTUAL ====================

export const getCurrentMonthRange = (): { start: string; end: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Convertir a formato YYYY-MM-DD
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

export const isDateInCurrentMonth = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

export const getCurrentMonthName = (): string => {
  const now = new Date();
  return now.toLocaleString("es-ES", { month: "long" });
};

export const getCurrentMonthAndYear = (): string => {
  const now = new Date();
  return now.toLocaleString("es-ES", { month: "long", year: "numeric" });
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
  return calculateUserIncomeNew(referralEarnings, generation);
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

// ==================== CÁLCULOS DE MÉTRICAS ====================

export const getTotalEarnings = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[],
  historicalEarnings = 0
): number =>
  referrals.reduce((total, r) => total + (r.userIncome || 0), 0) +
  personalInvestments.reduce(
    (total, inv) => total + (inv.totalEarned || inv.earnings || 0),
    0
  ) +
  (historicalEarnings || 0);

// ==================== DASHBOARD METRICS ====================
export const calculateDashboardMetrics = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[],
  leads: Lead[],
  currentDate?: string
): DashboardMetrics => {
  const today = currentDate || getTodayISO();
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
  const monthStartDate = new Date(monthStart);
  const monthEndDate = new Date(monthEnd);

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

  // Procesar TODOS los referidos activos
  referrals.forEach((r) => {
    if (r.status === "active") {
      initial.totalReferralInvestments += r.amount || 0;
    }
    initial.referralIncome += r.userIncome || 0;

    const refDate = new Date(r.startDate || r.investmentDate);
    if (refDate >= monthStartDate && refDate <= monthEndDate) {
      initial.referralMonthlyEarnings += r.userIncome || 0;
    }

    if (r.expirationDate === today && r.status === "active")
      initial.expiringTodayCount += 1;

    const genIndex = Math.max(1, Math.min(17, r.generation)) - 1;
    initial.byGeneration[genIndex] += 1;
  });

  // Procesar SOLO inversiones personales activas
  personalInvestments.forEach((inv) => {
    if (inv.status === "active") {
      initial.totalPersonalInvestments += inv.amount;
    }
    initial.personalEarnings += inv.totalEarned || inv.earnings || 0;

    const invDate = new Date(inv.startDate);
    if (invDate >= monthStartDate && invDate <= monthEndDate) {
      initial.investmentMonthlyEarnings += inv.userIncome || inv.earnings || 0;
    }

    if (inv.expirationDate === today && inv.status === "active")
      initial.expiringTodayCount += 1;
  });

  const totalInvestments =
    initial.totalPersonalInvestments +
    initial.totalReferralInvestments +
    HISTORICAL_TOTAL_INVESTMENT;
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
): Referral[] => {
  const activeReferrals = getActiveReferrals(referrals);

  // Agrupar por wallet
  const grouped: Record<string, { referral: Referral; totalIncome: number }> =
    {};
  referrals.forEach((r) => {
    // Todos los referidos para suma histórica
    const key = r.wallet.toLowerCase();
    if (!grouped[key]) {
      grouped[key] = { referral: r, totalIncome: 0 };
    }
    grouped[key].totalIncome += r.userIncome || 0;
  });

  // Filtrar solo wallets con al menos un activo
  const activeGroups = activeReferrals.map((r) => r.wallet.toLowerCase());
  const uniqueActiveGroups = Array.from(new Set(activeGroups));
  const topGroups = uniqueActiveGroups
    .map((wallet) => grouped[wallet])
    .filter(Boolean)
    .sort((a, b) => b.totalIncome - a.totalIncome)
    .slice(0, limit);

  // Usar el referral activo más reciente como representante
  return topGroups.map((group) => {
    const activeRef = activeReferrals.find(
      (r) => r.wallet.toLowerCase() === group.referral.wallet.toLowerCase()
    );
    return {
      ...(activeRef || group.referral),
      userIncome: group.totalIncome,
    };
  });
};

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

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-419", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

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
    activeInvestor: leads.filter((l) => l.status === "activeInvestor").length,
    doubtful: leads.filter((l) => l.status === "doubtful").length,
    rejected: leads.filter((l) => l.status === "rejected").length,
    conversionRate,
  };
};

// Devuelve el detalle de ingresos que componen las ganancias mensuales
export const getMonthlyEarningsBreakdown = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[],
  currentDate?: string
): Array<{ id: string; name: string; amount: number; date?: string }> => {
  const today = currentDate || getTodayISO();
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
  const monthStartDate = new Date(monthStart);
  const monthEndDate = new Date(monthEnd);

  const items: Array<{
    id: string;
    name: string;
    amount: number;
    date?: string;
  }> = [];

  referrals.forEach((r) => {
    const refDate = new Date(r.startDate || r.investmentDate || "");
    if (isNaN(refDate.getTime())) return;
    if (refDate >= monthStartDate && refDate <= monthEndDate) {
      items.push({
        id: r.id,
        name: r.name || r.wallet,
        amount: r.userIncome || 0,
        date: r.startDate || r.investmentDate,
      });
    }
  });

  personalInvestments.forEach((inv) => {
    const invDate = new Date(inv.startDate || "");
    if (isNaN(invDate.getTime())) return;
    if (invDate >= monthStartDate && invDate <= monthEndDate) {
      items.push({
        id: inv.id,
        name: "Inversión Personal",
        amount: inv.userIncome || inv.earnings || 0,
        date: inv.startDate,
      });
    }
  });

  // Orden descendente por monto
  items.sort((a, b) => b.amount - a.amount);

  return items;
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
  const generations = Array.from({ length: 17 }, (_, index) => {
    const generationNumber = index + 1;
    const genReferrals = referrals.filter(
      (r) => r.generation === generationNumber
    );

    return {
      count: genReferrals.length,
      totalInvestment: genReferrals.reduce((sum, r) => sum + r.amount, 0),
      totalEarned: genReferrals.reduce(
        (sum, r) => sum + (r.userIncome || 0),
        0
      ),
    };
  });

  return {
    firstGeneration: generations[0],
    secondGeneration: generations[1],
    thirdGeneration: generations[2],
    fourthGeneration: generations[3],
    fifthGeneration: generations[4],
    sixthGeneration: generations[5],
    seventhGeneration: generations[6],
    eighthGeneration: generations[7],
    ninthGeneration: generations[8],
    tenthGeneration: generations[9],
    eleventhGeneration: generations[10],
    twelfthGeneration: generations[11],
    thirteenthGeneration: generations[12],
    fourteenthGeneration: generations[13],
    fifteenthGeneration: generations[14],
    sixteenthGeneration: generations[15],
    seventeenthGeneration: generations[16],
  };
}
