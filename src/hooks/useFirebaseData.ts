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
import {
  calculateDashboardMetrics,
  getTopReferrals,
  getExpiringToday,
} from "@/lib/businessUtils";

// Hook para referidos
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

  const addReferral = useCallback(
    async (referralData: Omit<Referral, "id">) => {
      try {
        setError(null);
        await ReferralService.create(referralData);
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
        await ReferralService.update(id, updates);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error updating referral"
        );
        throw err;
      }
    },
    []
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

  const getReferralsByGeneration = useCallback(
    (generation: Generation): Referral[] => {
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
    getReferralsByGeneration,
  };
};

// Hook para inversiones personales 
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

  return {
    investments,
    loading,
    error,
  };
};

// Hook para leads 
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

  return {
    leads,
    loading,
    error,
  };
};

// useFirebaseDashboardMetrics
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
