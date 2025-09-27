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
  return new Date(date).toLocaleDateString("es-ES");
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

export const calculateDashboardMetrics = (
  referrals: Referral[],
  personalInvestments: PersonalInvestment[],
  leads: Lead[],
  currentDate?: string
): DashboardMetrics => {
  
  const today = currentDate || "2024-09-15";

  const activeReferrals = referrals.filter((r) => r.status === "active");
  const activeInvestments = personalInvestments.filter(
    (inv) => inv.status === "active"
  );
  const interestedLeads = leads.filter((l) => l.status === "interested");

  
  const firstGenReferrals = activeReferrals.filter((r) => r.generation === 1);
  const secondGenReferrals = activeReferrals.filter((r) => r.generation === 2);

  
  const totalPersonalInvestments = activeInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const totalReferralInvestments = activeReferrals.reduce(
    (sum, ref) => sum + ref.amount,
    0
  );
  const totalInvestments = totalPersonalInvestments + totalReferralInvestments;

 
  const personalEarnings = activeInvestments.reduce(
    (sum, inv) => sum + inv.earnings,
    0
  );
  const referralIncome = activeReferrals.reduce(
    (sum, ref) => sum + ref.userIncome,
    0
  );
  const totalEarnings = personalEarnings + referralIncome;


  const expiringToday = [...activeReferrals, ...activeInvestments].filter(
    (item) => item.expirationDate === today
  ).length;

 
  const thirtyDaysAgo = addDays(today, -30);
  const recentReferrals = activeReferrals.filter(
    (r) => r.startDate >= thirtyDaysAgo
  );
  const recentInvestments = activeInvestments.filter(
    (inv) => inv.startDate >= thirtyDaysAgo
  );
  const monthlyEarnings =
    recentReferrals.reduce((sum, ref) => sum + ref.userIncome, 0) +
    recentInvestments.reduce((sum, inv) => sum + inv.earnings, 0);

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


export const getTopReferrals = (
  referrals: Referral[],
  limit: number = 3
): Referral[] => {
  return referrals
    .filter((r) => r.status === "active")
    .sort((a, b) => b.userIncome - a.userIncome)
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
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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


export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

export const searchItems = <T extends { name: string; email?: string }>(
  items: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      (item.email && item.email.toLowerCase().includes(term))
  );
};
