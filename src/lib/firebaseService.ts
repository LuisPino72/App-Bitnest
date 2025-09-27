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


const COLLECTIONS = {
  REFERRALS: "referrals",
  PERSONAL_INVESTMENTS: "personalInvestments",
  LEADS: "leads",
} as const;

export class FirebaseService {
  
  static async getAll<T>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error getting all ${collectionName}:`, error);
      throw error;
    }
  }

  static async getById<T>(
    collectionName: string,
    id: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName} by id:`, error);
      throw error;
    }
  }

  static async create<T>(
    collectionName: string,
    data: Omit<T, "id">
  ): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data } as T;
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      throw error;
    }
  }

  static async update<T>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  }

  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      throw error;
    }
  }

  static subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "asc"
  ): Unsubscribe {
    try {
      const collectionRef = collection(db, collectionName);
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
      console.error(`Error subscribing to ${collectionName}:`, error);
      throw error;
    }
  }
}

export class ReferralService {
  static async getAll(): Promise<Referral[]> {
    return FirebaseService.getAll<Referral>(COLLECTIONS.REFERRALS);
  }

  static async getById(id: string): Promise<Referral | null> {
    return FirebaseService.getById<Referral>(COLLECTIONS.REFERRALS, id);
  }

  static async create(data: Omit<Referral, "id">): Promise<Referral> {
    return FirebaseService.create<Referral>(COLLECTIONS.REFERRALS, data);
  }

  static async update(id: string, data: Partial<Referral>): Promise<void> {
    return FirebaseService.update<Referral>(COLLECTIONS.REFERRALS, id, data);
  }

  static async delete(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.REFERRALS, id);
  }

  static async getByStatus(status: string): Promise<Referral[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REFERRALS),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Referral[];
    } catch (error) {
      console.error("Error getting referrals by status:", error);
      throw error;
    }
  }

  static async getByGeneration(generation: number): Promise<Referral[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REFERRALS),
        where("generation", "==", generation)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Referral[];
    } catch (error) {
      console.error("Error getting referrals by generation:", error);
      throw error;
    }
  }

  static subscribe(callback: (referrals: Referral[]) => void): Unsubscribe {
    return FirebaseService.subscribeToCollection<Referral>(
      COLLECTIONS.REFERRALS,
      callback,
      "startDate",
      "desc"
    );
  }
}

export class PersonalInvestmentService {
  static async getAll(): Promise<PersonalInvestment[]> {
    return FirebaseService.getAll<PersonalInvestment>(
      COLLECTIONS.PERSONAL_INVESTMENTS
    );
  }

  static async getById(id: string): Promise<PersonalInvestment | null> {
    return FirebaseService.getById<PersonalInvestment>(
      COLLECTIONS.PERSONAL_INVESTMENTS,
      id
    );
  }

  static async create(
    data: Omit<PersonalInvestment, "id">
  ): Promise<PersonalInvestment> {
    return FirebaseService.create<PersonalInvestment>(
      COLLECTIONS.PERSONAL_INVESTMENTS,
      data
    );
  }

  static async update(
    id: string,
    data: Partial<PersonalInvestment>
  ): Promise<void> {
    return FirebaseService.update<PersonalInvestment>(
      COLLECTIONS.PERSONAL_INVESTMENTS,
      id,
      data
    );
  }

  static async delete(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.PERSONAL_INVESTMENTS, id);
  }

  static async getByStatus(status: string): Promise<PersonalInvestment[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PERSONAL_INVESTMENTS),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PersonalInvestment[];
    } catch (error) {
      console.error("Error getting investments by status:", error);
      throw error;
    }
  }

  static subscribe(
    callback: (investments: PersonalInvestment[]) => void
  ): Unsubscribe {
    return FirebaseService.subscribeToCollection<PersonalInvestment>(
      COLLECTIONS.PERSONAL_INVESTMENTS,
      callback,
      "startDate",
      "desc"
    );
  }
}

export class LeadService {
  static async getAll(): Promise<Lead[]> {
    return FirebaseService.getAll<Lead>(COLLECTIONS.LEADS);
  }

  static async getById(id: string): Promise<Lead | null> {
    return FirebaseService.getById<Lead>(COLLECTIONS.LEADS, id);
  }

  static async create(data: Omit<Lead, "id">): Promise<Lead> {
    return FirebaseService.create<Lead>(COLLECTIONS.LEADS, data);
  }

  static async update(id: string, data: Partial<Lead>): Promise<void> {
    return FirebaseService.update<Lead>(COLLECTIONS.LEADS, id, data);
  }

  static async delete(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.LEADS, id);
  }

  static async getByStatus(status: string): Promise<Lead[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEADS),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[];
    } catch (error) {
      console.error("Error getting leads by status:", error);
      throw error;
    }
  }

  static subscribe(callback: (leads: Lead[]) => void): Unsubscribe {
    return FirebaseService.subscribeToCollection<Lead>(
      COLLECTIONS.LEADS,
      callback,
      "contactDate",
      "desc"
    );
  }
}
