"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useFirebaseReferrals } from "@/hooks";
import { getCommissionRate } from "@/lib/commissionUtils";
import { useConfirmation } from "@/components/ui/ConfirmationModal";
import { ReferralsHeader } from "@/components/referrals/ReferralsHeader";
import { ReferralsStats } from "@/components/referrals/ReferralsStats";
import { ReferralsFilters } from "@/components/referrals/ReferralsFilters";
import { ReferralsTable } from "@/components/referrals/ReferralsTable";
import { AddReferralForm } from "@/components/referrals/AddReferralForm";
import { CycleActionModal } from "@/components/referrals/CycleActionModal";
import { ReferralStatus } from "@/types";

export default function ReferralsPage() {
  const { referrals, addReferral, updateReferral, deleteReferral, loading } =
    useFirebaseReferrals();
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Estados locales
  const [filterGeneration, setFilterGeneration] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<string | null>(null);
  const [cycleModalReferral, setCycleModalReferral] = useState<string | null>(
    null
  );
  const [cycleActionLoading, setCycleActionLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("referralFilters");
    if (saved) {
      const { gen, status, search } = JSON.parse(saved);
      setFilterGeneration(gen);
      setFilterStatus(status);
      setSearchTerm(search);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "referralFilters",
      JSON.stringify({
        gen: filterGeneration,
        status: filterStatus,
        search: searchTerm,
      })
    );
  }, [filterGeneration, filterStatus, searchTerm]);

  const filteredReferrals = useMemo(() => {
    const statusOrder: Record<ReferralStatus, number> = {
      active: 0,
      completed: 1,
      deleted: 2,
    };

    return referrals
      .filter((referral) => {
        const generationMatch =
          filterGeneration === "all" ||
          referral.generation.toString() === filterGeneration;
        const statusMatch =
          filterStatus === "all" || referral.status === filterStatus;
        const searchMatch =
          referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.wallet.toLowerCase().includes(searchTerm.toLowerCase());
        return generationMatch && statusMatch && searchMatch;
      })
      .sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;

        return (
          new Date(a.expirationDate).getTime() -
          new Date(b.expirationDate).getTime()
        );
      });
  }, [referrals, filterGeneration, filterStatus, searchTerm]);

  // Handlers optimizados
  const handleFinishCycle = useCallback(
    async (referralId: string) => {
      setCycleActionLoading(true);
      try {
        await updateReferral(referralId, { status: "completed" });
        setCycleModalReferral(null);
      } catch (error) {
        console.error("Error finishing cycle:", error);
      } finally {
        setCycleActionLoading(false);
      }
    },
    [updateReferral]
  );

  const handleReinvestCycle = useCallback(
    async (referralId: string) => {
      setCycleActionLoading(true);
      try {
        const referral = referrals.find((r) => r.id === referralId);
        if (!referral) return;

        const newCycle = referral.cycle + 1;
        const newAmount = parseFloat(
          (referral.amount + referral.earnings).toFixed(2)
        );
        const newEarnings = parseFloat((newAmount * 0.24).toFixed(2));
        const commissionRate = getCommissionRate(referral.generation);
        const newUserIncome = parseFloat(
          (newEarnings * commissionRate).toFixed(2)
        );

        const today = new Date().toISOString().split("T")[0];
        const expirationDate = new Date(today);
        expirationDate.setDate(expirationDate.getDate() + 28);

        await updateReferral(referralId, {
          amount: newAmount,
          cycle: newCycle,
          investmentDate: today,
          expirationDate: expirationDate.toISOString().split("T")[0],
          earnings: newEarnings,
          userIncome: newUserIncome,
          totalEarned: parseFloat(
            (referral.totalEarned + newEarnings + newUserIncome).toFixed(2)
          ),
          status: "active",
          startDate: today,
          cycleCount: newCycle,
        });

        setCycleModalReferral(null);
      } catch (error) {
        console.error("Error reinvesting cycle:", error);
      } finally {
        setCycleActionLoading(false);
      }
    },
    [referrals, updateReferral]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const referral = referrals.find((r) => r.id === id);
      confirm(
        "Eliminar Referido",
        `¿Estás seguro de que quieres eliminar a ${referral?.name}? Esta acción no se puede deshacer.`,
        async () => {
          await updateReferral(id, { status: "deleted" });
        },
        {
          type: "danger",
          confirmText: "Eliminar",
          cancelText: "Cancelar",
        }
      );
    },
    [referrals, confirm, updateReferral]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
            Referidos
          </h1>
          <p className="text-gray-500 text-base mt-2 animate-pulse">
            Cargando...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 animate-pulse rounded-xl h-28 shadow-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in py-8 px-2 md:px-8 space-y-6">
      <ReferralsHeader onAddReferral={() => setShowForm(true)} />
      <ReferralsStats referrals={referrals} />
      <ReferralsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterGeneration={filterGeneration}
        onGenerationChange={setFilterGeneration}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
      />

      <ReferralsTable
        referrals={filteredReferrals}
        onEdit={setEditingReferral}
        onDelete={handleDelete}
        onCycleAction={setCycleModalReferral}
        loading={false}
      />

      {/* Modales */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddReferralForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {editingReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddReferralForm
              referral={referrals.find((r) => r.id === editingReferral) || null}
              onSuccess={() => setEditingReferral(null)}
              onCancel={() => setEditingReferral(null)}
            />
          </div>
        </div>
      )}

      {cycleModalReferral && (
        <CycleActionModal
          isOpen={!!cycleModalReferral}
          onClose={() => setCycleModalReferral(null)}
          onFinishCycle={() => handleFinishCycle(cycleModalReferral)}
          onReinvest={() => handleReinvestCycle(cycleModalReferral)}
          isLoading={cycleActionLoading}
        />
      )}

      <ConfirmationComponent />
    </div>
  );
}
