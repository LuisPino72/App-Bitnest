'use client';

import { useState, useEffect } from 'react';
import { 
  useReferrals, 
  usePersonalInvestments, 
  useLeads, 
  useDashboardMetrics 
} from './localStorageHooks';
import { 
  useFirebaseReferrals, 
  useFirebasePersonalInvestments, 
  useFirebaseLeads, 
  useFirebaseDashboardMetrics 
} from './firebaseHooks';

type DataProvider = 'localStorage' | 'firebase';

export const useDataProvider = () => {
  const [provider, setProvider] = useState<DataProvider>('localStorage');
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);

  useEffect(() => {
    const checkFirebaseConfig = () => {
      const requiredEnvVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
      ];

      const isConfigured = requiredEnvVars.every(varName => 
        process.env[varName] && process.env[varName] !== 'your_api_key_here'
      );

      setIsFirebaseConfigured(isConfigured);
      
      if (isConfigured) {
        setProvider('firebase');
      }
    };

    checkFirebaseConfig();
  }, []);

  const switchProvider = (newProvider: DataProvider) => {
    if (newProvider === 'firebase' && !isFirebaseConfigured) {
      console.warn('Firebase is not configured. Please set up your environment variables.');
      return;
    }
    setProvider(newProvider);
  };

  return {
    provider,
    isFirebaseConfigured,
    switchProvider,
    canUseFirebase: isFirebaseConfigured
  };
};

export const useSmartReferrals = () => {
  const { provider, isFirebaseConfigured } = useDataProvider();
  const localStorageHooks = useReferrals();
  const firebaseHooks = useFirebaseReferrals();

  if (provider === 'firebase' && isFirebaseConfigured) {
    return firebaseHooks;
  }
  
  return localStorageHooks;
};

export const useSmartPersonalInvestments = () => {
  const { provider, isFirebaseConfigured } = useDataProvider();
  const localStorageHooks = usePersonalInvestments();
  const firebaseHooks = useFirebasePersonalInvestments();

  if (provider === 'firebase' && isFirebaseConfigured) {
    return firebaseHooks;
  }
  
  return localStorageHooks;
};

export const useSmartLeads = () => {
  const { provider, isFirebaseConfigured } = useDataProvider();
  const localStorageHooks = useLeads();
  const firebaseHooks = useFirebaseLeads();

  if (provider === 'firebase' && isFirebaseConfigured) {
    return firebaseHooks;
  }
  
  return localStorageHooks;
};

export const useSmartDashboardMetrics = () => {
  const { provider, isFirebaseConfigured } = useDataProvider();
  const localStorageHooks = useDashboardMetrics();
  const firebaseHooks = useFirebaseDashboardMetrics();

  if (provider === 'firebase' && isFirebaseConfigured) {
    return firebaseHooks;
  }
  
  return localStorageHooks;
};
