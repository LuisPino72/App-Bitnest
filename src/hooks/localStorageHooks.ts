'use client';

import { useState, useEffect, useMemo } from 'react';
import { Referral, PersonalInvestment, Lead, DashboardMetrics } from '@/types';
import { 
  mockReferrals, 
  mockPersonalInvestments, 
  mockLeads 
} from '@/data/mockData';
import { 
  calculateDashboardMetrics, 
  getTopReferrals, 
  getExpiringToday,
  calculateReferralEarnings,
  calculateUserIncome,
  calculatePersonalEarnings,
  calculateExpirationDate,
  generateId
} from '@/lib/businessUtils';


const STORAGE_KEYS = {
  REFERRALS: 'mlm-referrals',
  PERSONAL_INVESTMENTS: 'mlm-personal-investments',
  LEADS: 'mlm-leads',
} as const;


export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  
  useEffect(() => {
    setIsClient(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};


export const useReferrals = () => {
  const [referrals, setReferrals] = useLocalStorage<Referral[]>(
    STORAGE_KEYS.REFERRALS,
    mockReferrals
  );

  const addReferral = (referralData: Omit<Referral, 'id' | 'earnings' | 'userIncome' | 'totalEarned'>) => {
    const earnings = calculateReferralEarnings(referralData.amount);
    const userIncome = calculateUserIncome(earnings, referralData.generation);

    const newReferral: Referral = {
      ...referralData,
      id: generateId('ref'),
      earnings,
      userIncome,
      totalEarned: earnings,
    };

    setReferrals(prev => [...prev, newReferral]);
    return newReferral;
  };

  const updateReferral = (id: string, updates: Partial<Referral>) => {
    setReferrals(prev => 
      prev.map(referral => {
        if (referral.id === id) {
          const updated = { ...referral, ...updates };

          if (updates.amount !== undefined || updates.generation !== undefined) {
            updated.earnings = calculateReferralEarnings(updated.amount);
            updated.userIncome = calculateUserIncome(updated.earnings, updated.generation);
            updated.totalEarned = updated.earnings;
          }

          return updated;
        }
        return referral;
      })
    );
  };

  const deleteReferral = (id: string) => {
    setReferrals(prev => prev.filter(referral => referral.id !== id));
  };

  const getReferralById = (id: string): Referral | undefined => {
    return referrals.find(referral => referral.id === id);
  };

  const getActiveReferrals = (): Referral[] => {
    return referrals.filter(referral => referral.status === 'active');
  };

  const getReferralsByGeneration = (generation: 1 | 2): Referral[] => {
    return referrals.filter(referral => referral.generation === generation);
  };

  return {
    referrals,
    addReferral,
    updateReferral,
    deleteReferral,
    getReferralById,
    getActiveReferrals,
    getReferralsByGeneration,
  };
};


export const usePersonalInvestments = () => {
  const [investments, setInvestments] = useLocalStorage<PersonalInvestment[]>(
    STORAGE_KEYS.PERSONAL_INVESTMENTS,
    mockPersonalInvestments
  );

  const addInvestment = (investmentData: Omit<PersonalInvestment, 'id' | 'earnings' | 'totalEarned'>) => {
    const earnings = calculatePersonalEarnings(investmentData.amount);

    const newInvestment: PersonalInvestment = {
      ...investmentData,
      id: generateId('inv'),
      earnings,
      totalEarned: earnings,
    };

    setInvestments(prev => [...prev, newInvestment]);
    return newInvestment;
  };

  const updateInvestment = (id: string, updates: Partial<PersonalInvestment>) => {
    setInvestments(prev =>
      prev.map(investment => {
        if (investment.id === id) {
          const updated = { ...investment, ...updates };

          if (updates.amount !== undefined) {
            updated.earnings = calculatePersonalEarnings(updated.amount);
            updated.totalEarned = updated.earnings;
          }

          return updated;
        }
        return investment;
      })
    );
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(investment => investment.id !== id));
  };

  const getActiveInvestments = (): PersonalInvestment[] => {
    return investments.filter(investment => investment.status === 'active');
  };

  return {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getActiveInvestments,
  };
};


export const useLeads = () => {
  const [leads, setLeads] = useLocalStorage<Lead[]>(STORAGE_KEYS.LEADS, mockLeads);

  const addLead = (leadData: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...leadData,
      id: generateId('lead'),
    };

    setLeads(prev => [...prev, newLead]);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev =>
      prev.map(lead => (lead.id === id ? { ...lead, ...updates } : lead))
    );
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };

  const getLeadsByStatus = (status: 'interested' | 'doubtful' | 'rejected'): Lead[] => {
    return leads.filter(lead => lead.status === status);
  };

  return {
    leads,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByStatus,
  };
};


export const useDashboardMetrics = () => {
  const { referrals } = useReferrals();
  const { investments } = usePersonalInvestments();
  const { leads } = useLeads();
  const [isClient, setIsClient] = useState(false);

 
  useEffect(() => {
    setIsClient(true);
  }, []);

  const metrics = useMemo(() => {
    
    const currentDate = isClient ? new Date().toISOString().split('T')[0] : undefined;
    return calculateDashboardMetrics(referrals, investments, leads, currentDate);
  }, [referrals, investments, leads, isClient]);

  const topReferrals = useMemo(() => {
    return getTopReferrals(referrals, 3);
  }, [referrals]);

  const expiringToday = useMemo(() => {
    return getExpiringToday(referrals, investments);
  }, [referrals, investments]);

  return {
    metrics,
    topReferrals,
    expiringToday,
  };
};


export const useSearch = <T extends { name: string; email?: string }>(items: T[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      (item.email && item.email.toLowerCase().includes(term))
    );
  }, [items, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
  };
};


export const usePagination = <T>(items: T[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    currentItems,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};


export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };


  const markTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = (): boolean => {
    const newErrors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
    let hasErrors = false;

    Object.keys(validationRules).forEach(field => {
      const key = field as keyof T;
      const error = validationRules[key](values[key]);
      newErrors[key] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
    setTouched({} as Record<keyof T, boolean>);
  };

  return {
    values,
    errors,
    touched,
    setValue,
    markTouched,
    validate,
    reset,
    isValid: Object.values(errors).every(error => error === null),
  };
};


export {
  useFirebaseReferrals,
  useFirebasePersonalInvestments,
  useFirebaseLeads,
  useFirebaseDashboardMetrics
} from './firebaseHooks';

export {
  useDataProvider,
  useSmartReferrals,
  useSmartPersonalInvestments,
  useSmartLeads,
  useSmartDashboardMetrics
} from './useDataProvider';
