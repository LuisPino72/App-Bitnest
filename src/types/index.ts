// ==================== TIPOS BASE ====================
export type LeadStatus =
  | "activeInvestor"
  | "interested"
  | "doubtful"
  | "rejected";
export type ReferralStatus = "active" | "completed" | "deleted";
export type Generation =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17;

// ==================== INTERFACES PRINCIPALES ====================
export interface Referral {
  id: string;
  name: string;
  wallet: string;
  generation: Generation;
  amount: number;
  cycle: number;
  cycleDays?: number;
  investmentDate: string;
  startDate: string;
  expirationDate: string;
  status: ReferralStatus;
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
  status: ReferralStatus;
  earnings: number;
  cycleCount: number;
  cycleDays?: number;
  totalEarned: number;
  userIncome: number;
  completedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  contactDate: string;
  notes?: string;
  lastContact?: string;
}

// ==================== DASHBOARD ====================
export interface DashboardMetrics {
  totalInvestments: number;
  totalReferrals: number;
  firstGeneration: number;
  secondGeneration: number;
  thirdGeneration: number;
  fourthGeneration: number;
  fifthGeneration: number;
  sixthGeneration: number;
  seventhGeneration: number;
  eighthGeneration: number;
  ninthGeneration: number;
  tenthGeneration: number;
  eleventhGeneration: number;
  twelfthGeneration: number;
  thirteenthGeneration: number;
  fourteenthGeneration: number;
  fifteenthGeneration: number;
  sixteenthGeneration: number;
  seventeenthGeneration: number;
  totalEarnings: number;
  monthlyEarnings: number;
  expiringToday: number;
  activeLeads: number;
}

// ==================== CALCULADORAS OPTIMIZADAS ====================
interface CalculatorBreakdown {
  cycle: number;
  earnings: number;
  total: number;
}

export interface CalculatorInput {
  amount: number;
  cycles: number;
  cycleDays?: number;
}

export interface CalculatorResult {
  initialAmount: number;
  totalEarnings: number;
  finalAmount: number;
  cycles: number;
  breakdown: CalculatorBreakdown[];
}

interface ReferralInputItem {
  generation: Generation;
  amount: number;
  count: number;
}

interface ReferralBreakdownItem extends ReferralInputItem {
  referralEarnings: number;
  userIncome: number;
}

export interface ReferralCalculatorInput {
  referrals: ReferralInputItem[];
}

export interface ReferralCalculatorResult {
  totalIncome: number;
  breakdown: ReferralBreakdownItem[];
}
