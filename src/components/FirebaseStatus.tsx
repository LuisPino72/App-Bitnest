'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Upload, Download } from 'lucide-react';

export default function FirebaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState('');

  useEffect(() => {
    const requiredEnvVars = [
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ];

    const missingVars = requiredEnvVars.some(
      v => !v || v === 'your_api_key_here'
    );

    if (!missingVars) {
      setIsConfigured(true);
      testFirebaseConnection();
    } else {
      setIsConfigured(false);
      setIsConnected(false);
      setLoading(false);
    }
  }, []);

  const testFirebaseConnection = async () => {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');

      const testCollection = collection(db, 'test');
      await getDocs(testCollection);

      setIsConnected(true);
    } catch (error) {
      console.log('Firebase connection test:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const migrateData = async () => {
    setMigrating(true);
    setMigrationStatus('idle');

    try {
      const referralsData = localStorage.getItem('mlm-referrals');
      const investmentsData = localStorage.getItem('mlm-personal-investments');
      const leadsData = localStorage.getItem('mlm-leads');

      let migratedCount = 0;

      const { ReferralService, PersonalInvestmentService, LeadService } = await import('@/lib/firebaseService');

      if (referralsData) {
        const referrals = JSON.parse(referralsData);
        for (const referral of referrals) {
          const { id, ...referralData } = referral;
          await ReferralService.create(referralData);
          migratedCount++;
        }
      }

      if (investmentsData) {
        const investments = JSON.parse(investmentsData);
        for (const investment of investments) {
          const { id, ...investmentData } = investment;
          await PersonalInvestmentService.create(investmentData);
          migratedCount++;
        }
      }

      if (leadsData) {
        const leads = JSON.parse(leadsData);
        for (const lead of leads) {
          const { id, ...leadData } = lead;
          await LeadService.create(leadData);
          migratedCount++;
        }
      }

      setMigrationStatus('success');
      setMigrationMessage(`Migración exitosa: ${migratedCount} registros migrados a Firebase.`);
    } catch (error) {
      setMigrationStatus('error');
      setMigrationMessage(
        `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setMigrating(false);
    }
  };

  const loadMockData = async () => {
    setMigrating(true);
    setMigrationStatus('idle');

    try {
      const { ReferralService, PersonalInvestmentService, LeadService } = await import('@/lib/firebaseService');
      const { mockReferrals, mockPersonalInvestments, mockLeads } = await import('@/data/mockData');

      let loadedCount = 0;

      for (const referral of mockReferrals) {
        const { id, ...referralData } = referral;
        await ReferralService.create(referralData);
        loadedCount++;
      }

      for (const investment of mockPersonalInvestments) {
        const { id, ...investmentData } = investment;
        await PersonalInvestmentService.create(investmentData);
        loadedCount++;
      }

      for (const lead of mockLeads) {
        const { id, ...leadData } = lead;
        await LeadService.create(leadData);
        loadedCount++;
      }

      setMigrationStatus('success');
      setMigrationMessage(`Datos de ejemplo cargados: ${loadedCount} registros creados en Firebase.`);
    } catch (error) {
      setMigrationStatus('error');
      setMigrationMessage(
        `Error cargando datos de ejemplo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2">Verificando configuración...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConfigured) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertCircle className="h-5 w-5 mr-2" />
            Firebase No Configurado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Las variables de entorno de Firebase no están configuradas correctamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className={isConnected ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isConnected ? 'text-green-800' : 'text-yellow-800'}`}>
            {isConnected ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            Firebase {isConnected ? 'Conectado' : 'Configurado pero no conectado'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className={isConnected ? 'text-green-700' : 'text-yellow-700'}>
              {isConnected 
                ? 'Firebase está conectado y listo para usar. Los datos se sincronizarán automáticamente.'
                : 'Firebase está configurado pero no se pudo establecer conexión. Verifica tu conexión a internet.'
              }
            </p>
            <div className="text-sm text-gray-600">
              <p><strong>Proyecto:</strong> bitnest-app</p>
              <p><strong>Base de datos:</strong> Firestore</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Migración de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Migrar desde localStorage</h4>
                <p className="text-sm text-blue-600 mb-3">
                  Transfiere tus datos actuales a Firebase
                </p>
                <Button 
                  onClick={migrateData}
                  disabled={migrating}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Migrar
                </Button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Cargar datos de ejemplo</h4>
                <p className="text-sm text-green-600 mb-3">
                  Carga datos de demostración en Firebase
                </p>
                <Button 
                  onClick={loadMockData}
                  disabled={migrating}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Cargar
                </Button>
              </div>
            </div>

            {migrating && (
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
                <span className="text-gray-600">Procesando...</span>
              </div>
            )}

            {migrationStatus === 'success' && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">{migrationMessage}</span>
              </div>
            )}

            {migrationStatus === 'error' && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{migrationMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}