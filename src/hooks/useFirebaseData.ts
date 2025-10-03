import { useState, useEffect, useCallback } from "react";
import { Referral, PersonalInvestment, Lead, DashboardMetrics } from "@/types";
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

  return {
    referrals,
    loading,
    error,
    addReferral,
    updateReferral,
    deleteReferral,
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

// Hook para métricas del dashboard
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

  const metrics = calculateDashboardMetrics(
    referrals,
    investments,
    leads,
    isClient ? new Date().toISOString().split("T")[0] : undefined
  );

  const topReferrals = getTopReferrals(referrals, 3);
  const expiringToday = getExpiringToday(referrals, investments);

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
