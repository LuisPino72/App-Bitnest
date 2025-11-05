"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  isDateInCurrentMonth,
} from "@/lib/businessUtils";
import { VirtualizedList } from "@/components/ui/VirtualizedList";
import {
  ReferralService,
  PersonalInvestmentService,
} from "@/lib/firebaseService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ id: string; name: string; amount: number; date?: string }>;
}

export default function MonthlyEarningsModal({
  isOpen,
  onClose,
  items,
}: Props) {
  const [internalItems, setInternalItems] = useState<Props["items"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCursor, setReferralCursor] = useState<any | null>(null);
  const [investmentCursor, setInvestmentCursor] = useState<any | null>(null);
  const [hasMoreReferrals, setHasMoreReferrals] = useState(true);
  const [hasMoreInvestments, setHasMoreInvestments] = useState(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setInternalItems([]);
    setReferralCursor(null);
    setInvestmentCursor(null);
    setHasMoreReferrals(true);
    setHasMoreInvestments(true);
    loadMore();
  }, [isOpen]);

  const loadMore = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let refResult = { items: [], nextCursor: null } as any;
      if (hasMoreReferrals) {
        refResult = await ReferralService.getAllPaginated({
          startAfter: referralCursor,
        });
      }

      let invResult = { items: [], nextCursor: null } as any;
      if (hasMoreInvestments) {
        invResult = await PersonalInvestmentService.getAllPaginated({
          startAfter: investmentCursor,
        });
      }

      const refItems = (refResult.items || [])
        .filter((r: any) =>
          isDateInCurrentMonth(r.startDate || r.investmentDate)
        )
        .map((r: any) => ({
          id: `ref-${r.id}`,
          name: r.name || r.wallet,
          amount: r.userIncome || 0,
          date: r.startDate || r.investmentDate,
        }));

      const invItems = (invResult.items || [])
        .filter((i: any) => isDateInCurrentMonth(i.startDate))
        .map((i: any) => ({
          id: `inv-${i.id}`,
          name: "Inversión Personal",
          amount: i.userIncome || i.earnings || 0,
          date: i.startDate,
        }));

      setInternalItems((prev) => {
        const map = new Map<
          string,
          { id: string; name: string; amount: number; date?: string }
        >();
        prev.forEach((p) => map.set(p.id, p));
        [...refItems, ...invItems].forEach((it) => map.set(it.id, it));

        const merged = Array.from(map.values());
        merged.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });
        return merged;
      });

      setReferralCursor(refResult.nextCursor ?? null);
      setInvestmentCursor(invResult.nextCursor ?? null);
      setHasMoreReferrals(Boolean(refResult.nextCursor));
      setHasMoreInvestments(Boolean(invResult.nextCursor));
    } catch (err) {
      console.error("Error loading more monthly earnings", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    referralCursor,
    investmentCursor,
    hasMoreReferrals,
    hasMoreInvestments,
  ]);

  useEffect(() => {
    if (items && items.length > 0 && internalItems.length === 0) {
      setInternalItems(items);
    }
  }, [items, internalItems.length]);

  if (!isOpen) return null;

  const anyHasMore = hasMoreReferrals || hasMoreInvestments;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 animate-in fade-in-0 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Detalles de Ingresos del Mes
          </h3>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <VirtualizedList
            items={internalItems}
            itemHeight={72}
            containerHeight={400}
            className="rounded-md border border-gray-100"
            emptyComponent={
              isLoading ? (
                <div className="text-gray-600 p-4 text-center">Cargando...</div>
              ) : (
                <div className="text-gray-600 p-4">
                  No hay ingresos registrados este mes.
                </div>
              )
            }
            loadingComponent={
              <div className="text-gray-600 py-3 text-center">
                Cargando más...
              </div>
            }
            enableLazyLoading={true}
            loadMore={loadMore}
            hasMore={anyHasMore}
            isLoading={isLoading}
            renderItem={(it) => (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded m-2">
                <div>
                  <p className="font-medium text-gray-900">{it.name}</p>
                  {it.date && (
                    <p className="text-xs text-gray-500">
                      {formatDate(it.date)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(it.amount)}
                  </p>
                </div>
              </div>
            )}
          />
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
