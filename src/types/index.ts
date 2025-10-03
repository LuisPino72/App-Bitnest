// ==================== TIPOS BASE ====================
export type LeadStatus = "interested" | "doubtful" | "rejected";
export type ReferralStatus = "active" | "completed" | "expired";
export type Generation = 1 | 2;

// ==================== INTERFACES PRINCIPALES ====================
export interface Referral {
  id: string;
  name: string;
  wallet: string;
  generation: Generation;
  amount: number;
  cycle: number;
  investmentDate: string;
  startDate: string;
  expirationDate: string;
  status: ReferralStatus;
  referredBy?: string;
  earnings: number;
  userIncome: number;
  cycleCount: number;
  totalEarned: number;
  phone?: string; 
}

export interface PersonalInvestment {
  id: string;
  amount: number;
  startDate: string;
  expirationDate: string;
  status: ReferralStatus; 
  earnings: number;
  cycleCount: number;
  totalEarned: number;
}

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus; 
  contactDate: string;
  notes?: string;
  phone?: string;
  lastContact?: string;
}

// ==================== DASHBOARD ====================
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

// ==================== CALCULADORAS OPTIMIZADAS ====================
interface CalculatorBreakdown {
  cycle: number;
  earnings: number;
  total: number;
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