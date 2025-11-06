"use client";

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
  calculateReferralEarnings,
  calculateUserIncome,
  calculatePersonalEarnings,
  calculateExpirationDate,
} from "@/lib/businessUtils";
import { useFirestoreCollection } from "./useFirestoreCollection";

// ==================== HOOK OPTIMIZADO PARA REFERIDOS ====================
export const useFirebaseReferrals = () => {
  const {
    items: referrals,
    loading,
    error,
    create,
    update,
    remove,
  } = useFirestoreCollection<Referral>(ReferralService as any);

  // Memoizar cálculos costosos para evitar re-renderizados
  const activeReferrals = useMemo(
    () => referrals.filter((r) => r.status === "active"),
    [referrals]
  );

  const referralsByGeneration = useMemo(() => {
    const map = new Map<Generation, Referral[]>();
    referrals.forEach((r) => {
      const existing = map.get(r.generation as Generation) || [];
      map.set(r.generation as Generation, [...existing, r]);
    });
    return map;
  }, [referrals]);

  const totalCommission = useMemo(
    () => referrals.reduce((sum, r) => sum + (r.userIncome || 0), 0),
    [referrals]
  );

  // Función para agregar referidos
  const addReferral = useCallback(
    async (
      referralData: Omit<
        Referral,
        "id" | "earnings" | "userIncome" | "totalEarned"
      >
    ) => {
      try {
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

        // Asegurar consistencia: usar `startDate` (campo usado en queries/orden)
        const startDate =
          (referralData as any).startDate ||
          referralData.investmentDate ||
          new Date().toISOString().split("T")[0];

        const newReferral = {
          ...referralData,
          startDate,
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

  // Función para actualizar referidos
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
            const earnings = calculateReferralEarnings(newAmount, cycleDays);
            const userIncome = calculateUserIncome(earnings, newGeneration);
            const totalEarned = earnings;

            // Si se actualiza investmentDate también sincronizamos startDate
            const resolvedStartDate =
              (updates as any).investmentDate ||
              (updates as any).startDate ||
              current.startDate ||
              current.investmentDate;

            await update(id, {
              ...updates,
              startDate: resolvedStartDate,
              cycleDays,
              earnings,
              userIncome,
              totalEarned,
            } as Partial<Referral>);
          } else {
            await update(id, updates as Partial<Referral>);
          }
        } else {
          // Si sólo se actualiza fechas u otros campos, mantener startDate si es relevante
          const current = referrals.find((r) => r.id === id);
          const resolvedStartDate =
            (updates as any).investmentDate ||
            (updates as any).startDate ||
            current?.startDate ||
            current?.investmentDate;
          await update(id, {
            ...updates,
            ...(resolvedStartDate ? { startDate: resolvedStartDate } : {}),
          } as Partial<Referral>);
        }
      } catch (err) {
        throw err;
      }
    },
    [update, referrals]
  );

  const deleteReferral = useCallback(
    async (id: string) => await remove(id),
    [remove]
  );

  const getReferralsByGeneration = useCallback(
    (generation: Generation) => referralsByGeneration.get(generation) || [],
    [referralsByGeneration]
  );

  const getReferralById = useCallback(
    (id: string): Referral | undefined => referrals.find((r) => r.id === id),
    [referrals]
  );

  return {
    referrals,
    activeReferrals,
    referralsByGeneration,
    totalCommission,
    loading,
    error,
    addReferral,
    updateReferral,
    deleteReferral,
    getReferralsByGeneration,
    getReferralById,
  };
};

// ==================== HOOK OPTIMIZADO PARA INVERSIONES PERSONALES ====================
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

  const activeInvestments = useMemo(
    () => investments.filter((i) => i.status === "active"),
    [investments]
  );

  const addInvestment = useCallback(
    async (
      investmentData: Omit<
        PersonalInvestment,
        "id" | "earnings" | "totalEarned"
      >
    ) => {
      try {
        const earnings = calculatePersonalEarnings(investmentData.amount);
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
        if (updates.amount !== undefined) {
          const current = investments.find((inv) => inv.id === id);
          if (current) {
            const updatedData = { ...current, ...updates };
            updatedData.earnings = calculatePersonalEarnings(
              updatedData.amount
            );
            updatedData.totalEarned = updatedData.earnings;
            await update(id, updatedData);
          }
        } else {
          await update(id, updates as Partial<PersonalInvestment>);
        }
      } catch (err) {
        throw err;
      }
    },
    [update, investments]
  );

  const deleteInvestment = useCallback(
    async (id: string) => remove(id),
    [remove]
  );

  return {
    investments,
    activeInvestments,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
};

// ==================== HOOK OPTIMIZADO PARA LEADS ====================
export const useFirebaseLeads = () => {
  const {
    items: leads,
    loading,
    error,
    create,
    update,
    remove,
  } = useFirestoreCollection<Lead>(LeadService as any);

  const leadsByStatus = useMemo(() => {
    const map = new Map<string, Lead[]>();
    leads.forEach((lead) => {
      const existing = map.get(lead.status) || [];
      map.set(lead.status, [...existing, lead]);
    });
    return map;
  }, [leads]);

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
    (status: "activeInvestor" | "interested" | "doubtful" | "rejected") =>
      leadsByStatus.get(status) || [],
    [leadsByStatus]
  );

  return {
    leads,
    leadsByStatus,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByStatus,
  };
};

// ==================== HOOK OPTIMIZADO PARA MÉTRICAS DEL DASHBOARD ====================
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

  // Memoizar métricas para evitar recálculos innecesarios
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
        eighthGeneration: 0,
        ninthGeneration: 0,
        tenthGeneration: 0,
        eleventhGeneration: 0,
        twelfthGeneration: 0,
        thirteenthGeneration: 0,
        fourteenthGeneration: 0,
        fifteenthGeneration: 0,
        sixteenthGeneration: 0,
        seventeenthGeneration: 0,
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

  // Memoizar top referrals y expiring today
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

// ==================== EXPORTACIONES PARA COMPATIBILIDAD ====================
export const useDashboardMetrics = useFirebaseDashboardMetrics;
export const useReferrals = useFirebaseReferrals;
