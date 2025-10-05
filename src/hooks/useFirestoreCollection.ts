"use client";

import { useEffect, useState, useCallback } from "react";
import type { Unsubscribe } from "firebase/firestore";

type FirestoreService<T> = {
  subscribe: (cb: (data: T[]) => void) => Unsubscribe;
  create: (data: Omit<T, "id">) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

export function useFirestoreCollection<T>(service: FirestoreService<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = service.subscribe((data) => {
      setItems(data);
      setLoading(false);
      setError(null);
    });

    return () => unsub();
  }, [service]);

  const create = useCallback(
    async (data: Omit<T, "id">) => {
      try {
        setError(null);
        return await service.create(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      }
    },
    [service]
  );

  const update = useCallback(
    async (id: string, updates: Partial<T>) => {
      try {
        setError(null);
        await service.update(id, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      }
    },
    [service]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await service.delete(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      }
    },
    [service]
  );

  return { items, loading, error, create, update, remove };
}
