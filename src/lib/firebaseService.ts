import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Referral, PersonalInvestment, Lead } from "@/types";

// ==================== CONFIGURACIÓN ====================
const COLLECTIONS = {
  REFERRALS: "referrals",
  PERSONAL_INVESTMENTS: "personalInvestments",
  LEADS: "leads",
} as const;

type CollectionName = keyof typeof COLLECTIONS;

// ==================== ERROR HANDLING ====================
class FirebaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public collection?: string
  ) {
    super(message);
    this.name = "FirebaseError";
  }
}

const handleFirebaseError = (
  error: unknown,
  operation: string,
  collectionName?: string
): never => {
  console.error(`🔥 Firebase Error [${collectionName}] ${operation}:`, error);

  if (error instanceof Error) {
    throw new FirebaseError(error.message, "FIRESTORE_ERROR", collectionName);
  }

  throw new FirebaseError(
    `Unknown error during ${operation}`,
    "UNKNOWN_ERROR",
    collectionName
  );
};

const mapDocs = <T>(docs: { id: string; data: () => any }[]): T[] =>
  docs.map((d) => ({ id: d.id, ...d.data() })) as T[];

// ==================== SERVICIO BASE GENÉRICO ====================
export class FirebaseService<T extends { id: string }> {
  /**
   * Suscribe a cambios en la colección en tiempo real.
   * @param callback Función que recibe los datos actualizados
   * @param orderByField Campo para ordenar
   * @param orderDirection Dirección de orden
   * @returns Unsubscribe
   */
  subscribe(
    callback: (data: T[]) => void,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "asc"
  ): Unsubscribe {
    const collectionRef = collection(db, this.collectionName);
    let q: import("firebase/firestore").Query = collectionRef;
    if (orderByField) {
      q = query(collectionRef, orderBy(orderByField, orderDirection));
    }
    return onSnapshot(q, (querySnapshot) => {
      const data = mapDocs<T>(querySnapshot.docs as any[]);
      callback(data);
    });
  }
  constructor(private collectionName: string) {}

  async getAll(opts?: {
    limit?: number;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
  }): Promise<T[]> {
    try {
      let q: import("firebase/firestore").Query = collection(
        db,
        this.collectionName
      );
      if (opts?.orderByField) {
        q = query(q, orderBy(opts.orderByField, opts.orderDirection ?? "asc"));
      }
      if (opts?.limit ?? true) {
        const lim = opts?.limit ?? 100;
        q = query(q, limit(lim));
      }
      const querySnapshot = await getDocs(q);
      return mapDocs<T>(querySnapshot.docs as any[]);
    } catch (error) {
      return handleFirebaseError(error, "getAll", this.collectionName);
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists()
        ? ({ id: docSnap.id, ...docSnap.data() } as T)
        : null;
    } catch (error) {
      return handleFirebaseError(error, "getById", this.collectionName);
    }
  }

  async create(data: Omit<T, "id">): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), data);
      return { id: docRef.id, ...data } as T;
    } catch (error) {
      return handleFirebaseError(error, "create", this.collectionName);
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data as any);
    } catch (error) {
      return handleFirebaseError(error, "update", this.collectionName);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      return handleFirebaseError(error, "delete", this.collectionName);
    }
  }

  /**
   * @param opts 
   * @returns { items: T[], nextCursor: any | null }
   */
  async getAllPaginated(opts?: {
    limit?: number;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    startAfter?: any;
  }): Promise<{ items: T[]; nextCursor: any | null }> {
    try {
      let q: import("firebase/firestore").Query = collection(
        db,
        this.collectionName
      );
      if (opts?.orderByField) {
        q = query(q, orderBy(opts.orderByField, opts.orderDirection ?? "asc"));
      }
      if (opts?.startAfter) {
        q = query(q, startAfter(opts.startAfter));
      }
      const lim = opts?.limit ?? 10;
      q = query(q, limit(lim));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs as any[];
      const items = mapDocs<T>(docs);
      const nextCursor = docs.length === lim ? docs[docs.length - 1] : null;
      return { items, nextCursor };
    } catch (error) {
      return { items: [], nextCursor: null };
    }
  }
}

// ==================== SERVICIOS ESPECÍFICOS ====================
export class ReferralService {
  static subscribe(
    callback: (referrals: Referral[]) => void,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "desc"
  ): Unsubscribe {
    return this.service.subscribe(
      callback,
      orderByField ?? "startDate",
      orderDirection
    );
  }
  /**
   * Obtiene referidos paginados (10 por página)
   */
  static async getAllPaginated(opts?: {
    limit?: number;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    startAfter?: any;
  }): Promise<{ items: Referral[]; nextCursor: any | null }> {
    return this.service.getAllPaginated({
      ...opts,
      limit: 10,
      orderByField: opts?.orderByField ?? "startDate",
      orderDirection: opts?.orderDirection ?? "desc",
    });
  }
  private static service = new FirebaseService<Referral>(COLLECTIONS.REFERRALS);

  static async getAll(): Promise<Referral[]> {
    return this.service.getAll();
  }

  static async getById(id: string): Promise<Referral | null> {
    return this.service.getById(id);
  }

  static async create(data: Omit<Referral, "id">): Promise<Referral> {
    return this.service.create(data);
  }

  static async update(id: string, data: Partial<Referral>): Promise<void> {
    return this.service.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    return this.service.delete(id);
  }

}

export class PersonalInvestmentService {
  static subscribe(
    callback: (investments: PersonalInvestment[]) => void,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "desc"
  ): Unsubscribe {
    return this.service.subscribe(
      callback,
      orderByField ?? "startDate",
      orderDirection
    );
  }
  static async getAllPaginated(opts?: {
    limit?: number;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    startAfter?: any;
  }): Promise<{ items: PersonalInvestment[]; nextCursor: any | null }> {
    return this.service.getAllPaginated({
      ...opts,
      limit: 10,
      orderByField: opts?.orderByField ?? "startDate",
      orderDirection: opts?.orderDirection ?? "desc",
    });
  }
  private static service = new FirebaseService<PersonalInvestment>(
    COLLECTIONS.PERSONAL_INVESTMENTS
  );

  static async getAll(): Promise<PersonalInvestment[]> {
    return this.service.getAll();
  }

  static async getById(id: string): Promise<PersonalInvestment | null> {
    return this.service.getById(id);
  }

  static async create(
    data: Omit<PersonalInvestment, "id">
  ): Promise<PersonalInvestment> {
    return this.service.create(data);
  }

  static async update(
    id: string,
    data: Partial<PersonalInvestment>
  ): Promise<void> {
    return this.service.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    return this.service.delete(id);
  }

}

export class LeadService {
  static subscribe(
    callback: (leads: Lead[]) => void,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "desc"
  ): Unsubscribe {
    return this.service.subscribe(
      callback,
      orderByField ?? "contactDate",
      orderDirection
    );
  }
 
  static async getAllPaginated(opts?: {
    limit?: number;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    startAfter?: any;
  }): Promise<{ items: Lead[]; nextCursor: any | null }> {
    return this.service.getAllPaginated({
      ...opts,
      limit: 10,
      orderByField: opts?.orderByField ?? "contactDate",
      orderDirection: opts?.orderDirection ?? "desc",
    });
  }
  private static service = new FirebaseService<Lead>(COLLECTIONS.LEADS);

  static async getAll(): Promise<Lead[]> {
    return this.service.getAll();
  }

  static async getById(id: string): Promise<Lead | null> {
    return this.service.getById(id);
  }

  static async create(data: Omit<Lead, "id">): Promise<Lead> {
    return this.service.create(data);
  }

  static async update(id: string, data: Partial<Lead>): Promise<void> {
    return this.service.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    return this.service.delete(id);
  }

}

// EXPORTACIÓN PARA USO DIRECTO SI ES NECESARIO
export const createFirebaseService = <T extends { id: string }>(
  collectionName: string
) => new FirebaseService<T>(collectionName);
