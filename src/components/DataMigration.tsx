"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Database,
} from "lucide-react";
import { useDataProvider } from "@/hooks";
import {
  ReferralService,
  PersonalInvestmentService,
  LeadService,
} from "@/lib/firebaseService";
// import { mockReferrals, mockPersonalInvestments, mockLeads } from '@/data/mockData';

export default function DataMigration() {
  const { provider, isFirebaseConfigured, switchProvider } = useDataProvider();
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [migrationMessage, setMigrationMessage] = useState("");

  const migrateLocalStorageToFirebase = async () => {
    if (!isFirebaseConfigured) {
      setMigrationStatus("error");
      setMigrationMessage(
        "Firebase no está configurado. Por favor, configura las variables de entorno primero."
      );
      return;
    }

    setMigrating(true);
    setMigrationStatus("idle");

    try {
      const referralsData = localStorage.getItem("mlm-referrals");
      const investmentsData = localStorage.getItem("mlm-personal-investments");
      const leadsData = localStorage.getItem("mlm-leads");

      let migratedCount = 0;

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

      setMigrationStatus("success");
      setMigrationMessage(
        `Migración exitosa: ${migratedCount} registros migrados a Firebase.`
      );

      switchProvider("firebase");
    } catch (error) {
      setMigrationStatus("error");
      setMigrationMessage(
        `Error durante la migración: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setMigrating(false);
    }
  };

  // Función de carga de mockData deshabilitada porque el archivo fue eliminado
  const loadMockData = async () => {
    setMigrationStatus("error");
    setMigrationMessage(
      "El archivo de datos de ejemplo (mockData) no está disponible."
    );
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("mlm-referrals");
    localStorage.removeItem("mlm-personal-investments");
    localStorage.removeItem("mlm-leads");
    setMigrationStatus("success");
    setMigrationMessage("Datos del localStorage eliminados correctamente.");
  };

  if (!isFirebaseConfigured) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-600">
            <Database className="h-5 w-5 mr-2" />
            Migración de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Configura Firebase primero para habilitar la migración de datos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Migración de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-blue-800">
                Migrar desde localStorage
              </h4>
              <p className="text-sm text-blue-600">
                Transfiere tus datos actuales a Firebase
              </p>
            </div>
            <Button
              onClick={migrateLocalStorageToFirebase}
              disabled={migrating || provider === "firebase"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Migrar
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-green-800">
                Cargar datos de ejemplo
              </h4>
              <p className="text-sm text-green-600">
                Carga datos de demostración en Firebase
              </p>
            </div>
            <Button
              onClick={loadMockData}
              disabled={migrating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Cargar
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-orange-800">
                Limpiar localStorage
              </h4>
              <p className="text-sm text-orange-600">
                Elimina datos del almacenamiento local
              </p>
            </div>
            <Button
              onClick={clearLocalStorage}
              disabled={migrating}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-100"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {migrating && (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
            <span className="text-gray-600">Procesando...</span>
          </div>
        )}

        {migrationStatus === "success" && (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{migrationMessage}</span>
          </div>
        )}

        {migrationStatus === "error" && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{migrationMessage}</span>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>Proveedor actual:</strong>{" "}
            {provider === "firebase" ? "Firebase" : "localStorage"}
          </p>
          <p>
            <strong>Estado de Firebase:</strong>{" "}
            {isFirebaseConfigured ? "Configurado" : "No configurado"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
