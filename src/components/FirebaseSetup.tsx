'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ExternalLink, Copy } from 'lucide-react';

export default function FirebaseSetup() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [configStatus, setConfigStatus] = useState<'checking' | 'configured' | 'missing'>('checking');

  useEffect(() => {
    const checkConfiguration = () => {
      const requiredEnvVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
      ];

      const missingVars = requiredEnvVars.filter(varName => 
        !process.env[varName] || process.env[varName] === 'your_api_key_here'
      );

      if (missingVars.length === 0) {
        setConfigStatus('configured');
        setIsConfigured(true);
      } else {
        setConfigStatus('missing');
        setIsConfigured(false);
      }
    };

    checkConfiguration();
  }, []);

  const envTemplate = `# Firebase Configuration
  
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBIzV9aqbhgkw_eOLpDzjcpOJy95TPzTgw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bitnest-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bitnest-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bitnest-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=854583303297
NEXT_PUBLIC_FIREBASE_APP_ID=1:854583303297:web:43d6b8aff7961589f74180`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
  };

  if (configStatus === 'checking') {
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

  if (isConfigured) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-5 w-5 mr-2" />
            Firebase Configurado Correctamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            Tu aplicación está conectada a Firebase. Los datos se sincronizarán automáticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          Configuración de Firebase Requerida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          Para usar Firebase como base de datos, necesitas configurar las variables de entorno.
        </p>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-orange-800">Pasos para configurar:</h4>
          <ol className="list-decimal list-inside space-y-2 text-orange-700">
            <li>
              Ve a{' '}
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Firebase Console
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Crea un nuevo proyecto o selecciona uno existente</li>
            <li>Ve a "Project Settings" → "General"</li>
            <li>Scroll down a "Your apps" y haz clic en "Add app" → Web</li>
            <li>Copia la configuración y crea un archivo <code className="bg-orange-100 px-1 rounded">.env.local</code></li>
          </ol>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-orange-800">Contenido del archivo .env.local:</h4>
            <Button 
              onClick={copyToClipboard}
              size="sm"
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-100"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
          </div>
          <pre className="bg-orange-100 p-3 rounded text-sm text-orange-800 overflow-x-auto">
            {envTemplate}
          </pre>
        </div>

        <div className="bg-orange-100 p-3 rounded">
          <p className="text-sm text-orange-800">
            <strong>Nota:</strong> Reemplaza los valores de ejemplo con tu configuración real de Firebase.
            Después de crear el archivo, reinicia el servidor de desarrollo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
