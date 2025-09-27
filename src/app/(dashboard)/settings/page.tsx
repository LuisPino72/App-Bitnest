'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Shield } from 'lucide-react';
import FirebaseStatus from '@/components/FirebaseStatus';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la configuración de tu aplicación y base de datos
        </p>
      </div>

      {/* Firebase Configuration */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Base de Datos
        </h2>
        <FirebaseStatus />
      </div>

      {/* Application Settings */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuración de la Aplicación
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Modo Oscuro</h4>
                  <p className="text-sm text-gray-600">
                    Cambiar entre tema claro y oscuro
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Próximamente
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Notificaciones</h4>
                  <p className="text-sm text-gray-600">
                    Configurar alertas y recordatorios
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Próximamente
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Exportar Datos</h4>
                  <p className="text-sm text-gray-600">
                    Descargar tus datos en formato CSV
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Próximamente
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Seguridad
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Información de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Datos Locales</h4>
                <p className="text-sm text-blue-700">
                  Cuando usas localStorage, tus datos se almacenan solo en tu navegador. 
                  Son privados pero no se sincronizan entre dispositivos.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Firebase</h4>
                <p className="text-sm text-green-700">
                  Con Firebase, tus datos se almacenan de forma segura en la nube y 
                  se sincronizan automáticamente entre todos tus dispositivos.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Privacidad</h4>
                <p className="text-sm text-yellow-700">
                  Todos tus datos son privados. No compartimos información con terceros. 
                  Firebase utiliza encriptación de extremo a extremo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}