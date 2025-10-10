"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Referral, PersonalInvestment, Lead, DashboardMetrics } from "@/types";
import {
  ReferralService,
  PersonalInvestmentService,
  LeadService,
} from "@/lib/firebaseService";
import { BUSINESS_CONSTANTS } from "@/types/constants";
import {
  calculateDashboardMetrics,
  getTopReferrals,
  getExpiringToday,
  calculateReferralEarnings,
  calculateUserIncome,
  calculatePersonalEarnings,
  calculateExpirationDate,
  generateId,
} from "@/lib/businessUtils";

export const useFirebaseReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ReferralService.subscribe((data) => {
      setReferrals(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const getTotalCommission = useCallback((): number => {
    return referrals.reduce((sum: number, referral) => {
      return sum + (referral.userIncome || 0);
    }, 0);
  }, [referrals]);

  const getActiveReferrals = useCallback((): Referral[] => {
    return referrals.filter((referral) => referral.status === "active");
  }, [referrals]);
  const addReferral = useCallback(
    async (
      referralData: Omit<
        Referral,
        "id" | "earnings" | "userIncome" | "totalEarned"
      >
    ) => {
      try {
        setError(null);
        const cycleDays =
          (referralData as any).cycleDays ??
          referralData.cycle ??
          BUSINESS_CONSTANTS.CYCLE_DAYS;
        const earnings = calculateReferralEarnings(
          referralData.amount,
          cycleDays
        );
        const userIncome = calculateUserIncome(
          earnings,
          referralData.generation
        );

        const newReferral: Omit<Referral, "id"> = {
          ...referralData,
          cycleDays,
          earnings,
          userIncome,
          totalEarned: earnings,
        };

        await ReferralService.create(newReferral);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error adding referral");
        throw err;
      }
    },
    []
  );

  const updateReferral = useCallback(
    async (id: string, updates: Partial<Referral>) => {
      try {
        setError(null);

        if (updates.amount !== undefined || updates.generation !== undefined) {
          const currentReferral = referrals.find((r) => r.id === id);
          if (currentReferral) {
            const updatedData = { ...currentReferral, ...updates };
            const cycleDays =
              (updates as any).cycleDays ??
              updatedData.cycleDays ??
              updatedData.cycle ??
              BUSINESS_CONSTANTS.CYCLE_DAYS;
            updatedData.earnings = calculateReferralEarnings(
              updatedData.amount,
              cycleDays
            );
            updatedData.userIncome = calculateUserIncome(
              updatedData.earnings,
              updatedData.generation
            );
            updatedData.totalEarned = updatedData.earnings;
            await ReferralService.update(id, updatedData);
          }
        } else {
          await ReferralService.update(id, updates);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error updating referral"
        );
        throw err;
      }
    },
    [referrals]
  );

  const deleteReferral = useCallback(async (id: string) => {
    try {
      setError(null);
      await ReferralService.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting referral");
      throw err;
    }
  }, []);

  const getReferralById = useCallback(
    (id: string): Referral | undefined => {
      return referrals.find((referral) => referral.id === id);
    },
    [referrals]
  );
  const getReferralsByGeneration = useCallback(
    (generation: 1 | 2): Referral[] => {
      return referrals.filter((referral) => referral.generation === generation);
    },
    [referrals]
  );

  return {
    referrals,
    loading,
    error,
    addReferral,
    updateReferral,
    deleteReferral,
    getReferralById,
    getActiveReferrals,
    getReferralsByGeneration,
    getTotalCommission,
  };
};

export const useFirebasePersonalInvestments = () => {
  const [investments, setInvestments] = useState<PersonalInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = PersonalInvestmentService.subscribe((data) => {
      setInvestments(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addInvestment = useCallback(
    async (
      investmentData: Omit<
        PersonalInvestment,
        "id" | "earnings" | "totalEarned"
      >
    ) => {
      try {
        setError(null);
        const earnings = calculatePersonalEarnings(investmentData.amount);

        const newInvestment: Omit<PersonalInvestment, "id"> = {
          ...investmentData,
          earnings,
          totalEarned: earnings,
        };

        await PersonalInvestmentService.create(newInvestment);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error adding investment"
        );
        throw err;
      }
    },
    []
  );

  const updateInvestment = useCallback(
    async (id: string, updates: Partial<PersonalInvestment>) => {
      try {
        setError(null);

        if (updates.amount !== undefined) {
          const currentInvestment = investments.find((inv) => inv.id === id);
          if (currentInvestment) {
            const updatedData = { ...currentInvestment, ...updates };
            updatedData.earnings = calculatePersonalEarnings(
              updatedData.amount
            );
            updatedData.totalEarned = updatedData.earnings;
            await PersonalInvestmentService.update(id, updatedData);
          }
        } else {
          await PersonalInvestmentService.update(id, updates);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error updating investment"
        );
        throw err;
      }
    },
    [investments]
  );

  const deleteInvestment = useCallback(async (id: string) => {
    try {
      setError(null);
      await PersonalInvestmentService.delete(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error deleting investment"
      );
      throw err;
    }
  }, []);

  const getActiveInvestments = useCallback((): PersonalInvestment[] => {
    return investments.filter((investment) => investment.status === "active");
  }, [investments]);

  return {
    investments,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getActiveInvestments,
  };
};

export const useFirebaseLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = LeadService.subscribe((data) => {
      setLeads(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addLead = useCallback(async (leadData: Omit<Lead, "id">) => {
    try {
      setError(null);
      await LeadService.create(leadData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding lead");
      throw err;
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      setError(null);
      await LeadService.update(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating lead");
      throw err;
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    try {
      setError(null);
      await LeadService.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting lead");
      throw err;
    }
  }, []);

  const getLeadsByStatus = useCallback(
    (status: "interested" | "doubtful" | "rejected"): Lead[] => {
      return leads.filter((lead) => lead.status === status);
    },
    [leads]
  );

  return {
    leads,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByStatus,
  };
};

export const useFirebaseDashboardMetrics = () => {
  const { referrals, loading: referralsLoading } = useFirebaseReferrals();
  const { investments, loading: investmentsLoading } =
    useFirebasePersonalInvestments();
  const { leads, loading: leadsLoading } = useFirebaseLeads();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loading = referralsLoading || investmentsLoading || leadsLoading;

  const metrics = useMemo(() => {
    if (loading) {
      return {
        totalInvestments: 0,
        totalReferrals: 0,
        firstGeneration: 0,
        secondGeneration: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        expiringToday: 0,
        activeLeads: 0,
      };
    }

    const currentDate = isClient
      ? new Date().toISOString().split("T")[0]
      : undefined;
    return calculateDashboardMetrics(
      referrals,
      investments,
      leads,
      currentDate
    );
  }, [referrals, investments, leads, loading, isClient]);

  const topReferrals = useMemo(() => {
    if (loading) return [];
    return getTopReferrals(referrals, 3);
  }, [referrals, loading]);

  const expiringToday = useMemo(() => {
    if (loading) return { referrals: [], investments: [] };
    return getExpiringToday(referrals, investments);
  }, [referrals, investments, loading]);

  return {
    metrics,
    topReferrals,
    expiringToday,
    loading,
  };
};
