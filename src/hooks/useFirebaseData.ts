import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Referral,
  PersonalInvestment,
  Lead,
  DashboardMetrics,
  Generation,
} from "@/types";
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
} from "@/lib/businessUtils";
import { useFirestoreCollection } from "./useFirestoreCollection";

// Hook para referidos
export const useFirebaseReferrals = () => {
  const {
    items: referrals,
    loading,
    error,
    create,
    update,
    remove,
  } = useFirestoreCollection<Referral>(ReferralService as any);

  const addReferral = useCallback(
    async (referralData: Omit<Referral, "id">) => {
      try {
        const cycleDays =
          (referralData as any).cycleDays ??
          referralData.cycle ??
          BUSINESS_CONSTANTS.CYCLE_DAYS;
        const earnings =
          require("@/lib/businessUtils").calculateReferralEarnings(
            referralData.amount,
            cycleDays
          );
        const userIncome = require("@/lib/businessUtils").calculateUserIncome(
          earnings,
          referralData.generation
        );
        const newReferral = {
          ...referralData,
          cycleDays,
          earnings,
          userIncome,
          totalEarned: earnings,
        } as Omit<Referral, "id">;
        return await create(newReferral);
      } catch (err) {
        throw err;
      }
    },
    [create]
  );

  const updateReferral = useCallback(
    async (id: string, updates: Partial<Referral>) => {
      try {
        if (updates.amount !== undefined || updates.generation !== undefined) {
          const current = referrals.find((r) => r.id === id);
          if (current) {
            const newAmount = updates.amount ?? current.amount;
            const newGeneration = updates.generation ?? current.generation;
            const cycleDays =
              (updates as any).cycleDays ??
              current.cycleDays ??
              current.cycle ??
              BUSINESS_CONSTANTS.CYCLE_DAYS;
            const earnings =
              require("@/lib/businessUtils").calculateReferralEarnings(
                newAmount,
                cycleDays
              );
            const userIncome =
              require("@/lib/businessUtils").calculateUserIncome(
                earnings,
                newGeneration
              );
            const totalEarned = earnings;
            await update(id, {
              ...updates,
              cycleDays,
              earnings,
              userIncome,
              totalEarned,
            } as Partial<Referral>);
          } else {
            await update(id, updates as Partial<Referral>);
          }
        } else {
          await update(id, updates as Partial<Referral>);
        }
      } catch (err) {
        throw err;
      }
    },
    [update, referrals]
  );

  const deleteReferral = useCallback(
    async (id: string) => {
      return await remove(id);
    },
    [remove]
  );

  // Agrupar referidos por generación en un Map para consultas rápidas
  const referralsByGeneration = useMemo(() => {
    const map = new Map<Generation, Referral[]>();
    referrals.forEach((r) => {
      const arr = map.get(r.generation as Generation) || [];
      arr.push(r);
      map.set(r.generation as Generation, arr);
    });
    return map;
  }, [referrals]);

  const getReferralsByGeneration = useCallback(
    (generation: Generation) => referralsByGeneration.get(generation) || [],
    [referralsByGeneration]
  );

  return {
    referrals,
    loading,
    error,
    addReferral,
    updateReferral,
    deleteReferral,
    getReferralsByGeneration,
  };
};

// Hook para inversiones personales
export const useFirebasePersonalInvestments = () => {
  const {
    items: investments,
    loading,
    error,
    create,
    update,
    remove,
  } = useFirestoreCollection<PersonalInvestment>(
    PersonalInvestmentService as any
  );

  const addInvestment = useCallback(
    async (investmentData: Omit<PersonalInvestment, "id">) => {
      try {
        const earnings = investmentData.amount * 0.24;
        const newInvestment = {
          ...investmentData,
          earnings,
          totalEarned: earnings,
        } as Omit<PersonalInvestment, "id">;
        return await create(newInvestment);
      } catch (err) {
        throw err;
      }
    },
    [create]
  );

  const updateInvestment = useCallback(
    async (id: string, updates: Partial<PersonalInvestment>) => {
      try {
        await update(id, updates as Partial<PersonalInvestment>);
      } catch (err) {
        throw err;
      }
    },
    [update]
  );

  const deleteInvestment = useCallback(
    async (id: string) => remove(id),
    [remove]
  );

  const getActiveInvestments = useCallback(
    () => investments.filter((i) => i.status === "active"),
    [investments]
  );

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

// Hook para personas contactadas
export const useFirebaseLeads = () => {
  const {
    items: leads,
    loading,
    error,
    create,
    update,
    remove,
  } = useFirestoreCollection<Lead>(LeadService as any);

  const addLead = useCallback(
    async (leadData: Omit<Lead, "id">) => create(leadData),
    [create]
  );
  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => update(id, updates),
    [update]
  );
  const deleteLead = useCallback(async (id: string) => remove(id), [remove]);

  const getLeadsByStatus = useCallback(
    (status: "interested" | "doubtful" | "rejected") =>
      leads.filter((l) => l.status === status),
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

  // useMemo PARA CALCULAR MÉTRICAS SOLO CUANDO LOS DATOS CAMBIEN
  const metrics = useMemo(() => {
    if (loading) {
      return {
        totalInvestments: 0,
        totalReferrals: 0,
        firstGeneration: 0,
        secondGeneration: 0,
        thirdGeneration: 0,
        fourthGeneration: 0,
        fifthGeneration: 0,
        sixthGeneration: 0,
        seventhGeneration: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        expiringToday: 0,
        activeLeads: 0,
      } as DashboardMetrics;
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

  // useMemo PARA TOP REFERRALS Y EXPIRING TODAY
  const topReferrals = useMemo(() => {
    return loading ? [] : getTopReferrals(referrals, 3);
  }, [referrals, loading]);

  const expiringToday = useMemo(() => {
    return loading
      ? { referrals: [], investments: [] }
      : getExpiringToday(referrals, investments);
  }, [referrals, investments, loading]);

  return {
    metrics,
    topReferrals,
    expiringToday,
    loading,
  };
};

// Hook principal que exporta todo (para compatibilidad)
export const useDashboardMetrics = useFirebaseDashboardMetrics;
export const useReferrals = useFirebaseReferrals;
