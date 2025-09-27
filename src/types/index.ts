export interface Referral {
  id: string;
  name: string;
  email: string;
  phone?: string;
  generation: 1 | 2;
  amount: number;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'completed' | 'expired';
  referredBy?: string; 
  earnings: number; 
  userIncome: number; 
  cycleCount: number;
  totalEarned: number;
}

export interface PersonalInvestment {
  id: string;
  amount: number;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'completed' | 'expired';
  earnings: number; 
  cycleCount: number;
  totalEarned: number;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'interested' | 'doubtful' | 'rejected';
  notes?: string;
  contactDate: string;
  lastContact?: string;
  source?: string;
}

export interface DashboardMetrics {
  totalInvestments: number;
  totalReferrals: number;
  firstGeneration: number;
  secondGeneration: number;
  totalEarnings: number;
  monthlyEarnings: number;
  expiringToday: number;
  activeLeads: number;
}

export interface CalculatorInput {
  amount: number;
  cycles: number;
}

export interface CalculatorResult {
  initialAmount: number;
  totalEarnings: number;
  finalAmount: number;
  cycles: number;
  breakdown: {
    cycle: number;
    earnings: number;
    total: number;
  }[];
}

export interface ReferralCalculatorInput {
  referrals: {
    generation: 1 | 2;
    amount: number;
    count: number;
  }[];
}

export interface ReferralCalculatorResult {
  totalIncome: number;
  breakdown: {
    generation: 1 | 2;
    amount: number;
    count: number;
    referralEarnings: number;
    userIncome: number;
  }[];
}


export const BUSINESS_CONSTANTS = {
  REFERRAL_EARNINGS_RATE: 0.24, 
  USER_COMMISSION_RATE: 0.20, 
  CYCLE_DAYS: 28, 
  FIRST_GEN_COMMISSION: 0.20, 
  SECOND_GEN_COMMISSION: 0.10, 
} as const;

export type LeadStatus = 'interested' | 'doubtful' | 'rejected';
export type ReferralStatus = 'active' | 'completed' | 'expired';
export type Generation = 1 | 2;