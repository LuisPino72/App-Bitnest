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

// ==================== SERVICIO BASE GENÉRICO ====================
export class FirebaseService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  async getAll(): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
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

  subscribe(
    callback: (data: T[]) => void,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "asc"
  ): Unsubscribe {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = orderByField
        ? query(collectionRef, orderBy(orderByField, orderDirection))
        : collectionRef;

      return onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        callback(data);
      });
    } catch (error) {
      return handleFirebaseError(error, "subscribe", this.collectionName);
    }
  }

  // ✅ MÉTODOS ESPECÍFICOS CON QUERIES
  async getByField(field: string, value: unknown): Promise<T[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where(field, "==", value)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      return handleFirebaseError(
        error,
        `getByField:${field}`,
        this.collectionName
      );
    }
  }
}

// ==================== SERVICIOS ESPECÍFICOS ====================
export class ReferralService {
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

  static async getByStatus(status: string): Promise<Referral[]> {
    return this.service.getByField("status", status);
  }

  static async getByGeneration(generation: number): Promise<Referral[]> {
    return this.service.getByField("generation", generation);
  }

  static subscribe(callback: (referrals: Referral[]) => void): Unsubscribe {
    return this.service.subscribe(callback, "startDate", "desc");
  }
}

export class PersonalInvestmentService {
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

  static async getByStatus(status: string): Promise<PersonalInvestment[]> {
    return this.service.getByField("status", status);
  }

  static subscribe(
    callback: (investments: PersonalInvestment[]) => void
  ): Unsubscribe {
    return this.service.subscribe(callback, "startDate", "desc");
  }
}

export class LeadService {
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

  static async getByStatus(status: string): Promise<Lead[]> {
    return this.service.getByField("status", status);
  }

  static subscribe(callback: (leads: Lead[]) => void): Unsubscribe {
    return this.service.subscribe(callback, "contactDate", "desc");
  }
}

// ✅ EXPORTACIÓN PARA USO DIRECTO SI ES NECESARIO
export const createFirebaseService = <T extends { id: string }>(
  collectionName: string
) => new FirebaseService<T>(collectionName);
