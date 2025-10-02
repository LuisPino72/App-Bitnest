import {
  Referral,
  PersonalInvestment,
  Lead,
  DashboardMetrics,
  CalculatorInput,
  CalculatorResult,
  ReferralCalculatorInput,
  ReferralCalculatorResult,
  BUSINESS_CONSTANTS,
} from "@/types";

export const formatDate = (date: string): string => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};
export { BUSINESS_CONSTANTS };

export const addDays = (date: string, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
};

export const isToday = (date: string): boolean => {
  const today = new Date().toISOString().split("T")[0];
  return date === today;
};

export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateReferralEarnings = (amount: number): number => {
  return amount * BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;
};

export const calculateUserIncome = (
  referralEarnings: number,
  generation: 1 | 2 = 1
): number => {
  const baseCommission =
    referralEarnings * BUSINESS_CONSTANTS.USER_COMMISSION_RATE;

  if (generation === 1) {
    return baseCommission;
  } else {
    return baseCommission * 0.5;
  }
};

export const calculatePersonalEarnings = (amount: number): number => {
  return amount * BUSINESS_CONSTANTS.REFERRAL_EARNINGS_RATE;
};

export const calculateExpirationDate = (startDate: string): string => {
  return addDays(startDate, BUSINESS_CONSTANTS.CYCLE_DAYS);
};

export const getUniqueReferrals = (referrals: Referral[]) => {
  const unique = new Map();

  referrals.forEach((referral) => {
    if (!unique.has(referral.wallet)) {
      unique.set(referral.wallet, referral);
    }
  });

  return Array.from(unique.values());
};

export const getTotalInvestments = (referrals: Referral[]) => {
  return referrals.reduce((total, referral) => {
    return total + referral.amount;
  }, 0);
};

export const getTotalEarnings = (referrals: Referral[]) => {
  return referrals.reduce((total, referral) => {
    return total + referral.totalEarned;
  }, 0);
};

export const calculateDashboardMetrics = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[],
  leads: Lead[],
  currentDate?: string
): DashboardMetrics => {
  const today = currentDate || new Date().toISOString().split("T")[0];

  const activeReferralPersons = getActiveReferralPersons(referrals);
  const activeReferrals = getActiveReferralPersons(referrals);
  const firstGenReferrals = activeReferrals.filter((r) => r.generation === 1);
  const secondGenReferrals = activeReferrals.filter((r) => r.generation === 2);

  const activeReferralOrders = referrals.filter((r) => r.status === "active");
  const activePersonalInvestments = personalInvestments.filter(
    (inv) => inv.status === "active"
  );

  const interestedLeads = leads.filter((l) => l.status === "interested");

  const totalPersonalInvestments = activePersonalInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const totalReferralInvestments = activeReferralOrders.reduce(
    (sum, r) => sum + r.amount,
    0
  );

  const totalInvestments = totalPersonalInvestments + totalReferralInvestments;

  const referralIncome = activeReferralOrders.reduce(
    (sum, r) => sum + (r.userIncome || 0),
    0
  );
  const personalEarnings = activePersonalInvestments.reduce(
    (sum, inv) => sum + (inv.earnings || 0),
    0
  );
  const totalEarnings = referralIncome + personalEarnings + HISTORICAL_EARNINGS;

  const expiringToday = [
    ...activeReferralOrders,
    ...activePersonalInvestments,
  ].filter((item) => item.expirationDate === today).length;

  const thirtyDaysAgo = addDays(today, -30);
  const thirtyDaysAgoDate = new Date(thirtyDaysAgo);

  const monthlyEarnings =
    activeReferralOrders.reduce((sum, ref) => {
      const refDate = new Date(ref.startDate || ref.investmentDate);
      return refDate >= thirtyDaysAgoDate ? sum + (ref.userIncome || 0) : sum;
    }, 0) +
    activePersonalInvestments.reduce((sum, inv) => {
      const invDate = new Date(inv.startDate);
      return invDate >= thirtyDaysAgoDate ? sum + (inv.earnings || 0) : sum;
    }, 0);

  return {
    totalInvestments,
    totalReferrals: activeReferrals.length,
    firstGeneration: firstGenReferrals.length,
    secondGeneration: secondGenReferrals.length,
    totalEarnings,
    monthlyEarnings,
    expiringToday,
    activeLeads: interestedLeads.length,
  };
};

export const getActiveReferralPersons = (referrals: Referral[]): Referral[] => {
  const walletGroups: Record<string, Referral[]> = {};

  referrals.forEach((ref) => {
    if (!walletGroups[ref.wallet]) {
      walletGroups[ref.wallet] = [];
    }
    walletGroups[ref.wallet].push(ref);
  });

  const activePersons: Referral[] = [];

  Object.keys(walletGroups).forEach((wallet) => {
    const investments = walletGroups[wallet];
    const hasActiveInvestment = investments.some(
      (inv: Referral) => inv.status === "active"
    );

    if (hasActiveInvestment) {
      activePersons.push(investments[0]);
    }
  });

  return activePersons;
};
export const getTopReferrals = (
  referrals: Referral[],
  limit: number = 3
): Referral[] => {
  return referrals
    .filter((r) => r.status === "active")
    .sort((a, b) => {
      const aEarnings = a.totalEarned || a.userIncome || 0;
      const bEarnings = b.totalEarned || b.userIncome || 0;
      return bEarnings - aEarnings;
    })
    .slice(0, limit);
};
export const getExpiringToday = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[]
): { referrals: Referral[]; investments: PersonalInvestment[] } => {
  const today = new Date().toISOString().split("T")[0];

  return {
    referrals: referrals.filter(
      (r) => r.expirationDate === today && r.status === "active"
    ),
    investments: personalInvestments.filter(
      (inv) => inv.expirationDate === today && inv.status === "active"
    ),
  };
};

export const calculatePersonalIncomeProjection = (
  input: CalculatorInput
): CalculatorResult => {
  let currentAmount = input.amount;
  const breakdown: { cycle: number; earnings: number; total: number }[] = [];

  for (let cycle = 1; cycle <= input.cycles; cycle++) {
    const earnings = calculatePersonalEarnings(currentAmount);
    currentAmount += earnings;

    breakdown.push({
      cycle,
      earnings,
      total: currentAmount,
    });
  }

  const totalEarnings = currentAmount - input.amount;

  return {
    initialAmount: input.amount,
    totalEarnings,
    finalAmount: currentAmount,
    cycles: input.cycles,
    breakdown,
  };
};
export function calculateGenerationMetrics(referrals: Referral[]) {
  const firstGen = referrals.filter((r) => r.generation === 1);
  const secondGen = referrals.filter((r) => r.generation === 2);

  return {
    firstGeneration: {
      count: firstGen.length,
      totalInvestment: firstGen.reduce((sum, r) => sum + r.amount, 0),
      totalEarned: firstGen.reduce((sum, r) => sum + (r.totalEarned || 0), 0),
    },
    secondGeneration: {
      count: secondGen.length,
      totalInvestment: secondGen.reduce((sum, r) => sum + r.amount, 0),
      totalEarned: secondGen.reduce((sum, r) => sum + (r.totalEarned || 0), 0),
    },
  };
}

export const calculateReferralIncomeProjection = (
  input: ReferralCalculatorInput
): ReferralCalculatorResult => {
  let totalIncome = 0;
  const breakdown = input.referrals.map((referralGroup) => {
    const referralEarnings = calculateReferralEarnings(referralGroup.amount);
    const userIncome = calculateUserIncome(
      referralEarnings,
      referralGroup.generation
    );
    const totalUserIncome = userIncome * referralGroup.count;

    totalIncome += totalUserIncome;

    return {
      generation: referralGroup.generation,
      amount: referralGroup.amount,
      count: referralGroup.count,
      referralEarnings,
      userIncome: totalUserIncome,
    };
  });

  return {
    totalIncome,
    breakdown,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const generateId = (prefix: string = ""): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${prefix ? "-" : ""}${timestamp}-${random}`;
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ""));
};

export const calculateGrowthRate = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getLeadStats = (leads: Lead[]) => {
  const total = leads.length;
  const interested = leads.filter((l) => l.status === "interested").length;
  const doubtful = leads.filter((l) => l.status === "doubtful").length;
  const rejected = leads.filter((l) => l.status === "rejected").length;

  return {
    total,
    interested,
    doubtful,
    rejected,
    conversionRate: total > 0 ? (interested / total) * 100 : 0,
  };
};

export const filterReferralsByGeneration = (
  referrals: Referral[],
  generation?: 1 | 2
): Referral[] => {
  if (!generation) return referrals;
  return referrals.filter((r) => r.generation === generation);
};

export const filterReferralsByStatus = (
  referrals: Referral[],
  status?: string
): Referral[] => {
  if (!status) return referrals;
  return referrals.filter((r) => r.status === status);
};

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
export const HISTORICAL_EARNINGS = 433.67;
export const calculateReferralOnlyEarnings = (
  referrals: Referral[]
): number => {
  return referrals
    .filter((r) => r.status === "active")
    .reduce((sum, referral) => sum + (referral.userIncome || 0), 0);
};

export const getInvestmentsExpiringToday = (
  investments: PersonalInvestment[]
): number => {
  const today = new Date().toISOString().split("T")[0];
  return investments.filter(
    (inv) => inv.status === "active" && inv.expirationDate === today
  ).length;
};

export const calculateProjection = (
  initialAmount: number,
  cycles: number
): number => {
  let amount = initialAmount;
  for (let i = 0; i < cycles; i++) {
    amount = amount * 1.24; 
  }
  return parseFloat(amount.toFixed(2));
};
