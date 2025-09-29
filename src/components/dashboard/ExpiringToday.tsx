"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks';
import { formatCurrency } from '@/lib/businessUtils';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function ExpiringToday() {
  const { expiringToday } = useDashboardMetrics();

  const totalExpiring = expiringToday.referrals.length + expiringToday.investments.length;

  return (
    <Card className={`border-l-4 ${
      totalExpiring > 0 ? 'border-l-warning-500 bg-warning-50' : 'border-l-success-500 bg-success-50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {totalExpiring > 0 ? (
            <AlertTriangle className="h-5 w-5 text-warning-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-success-600" />
          )}
          Vencimientos de Hoy ({new Date().toLocaleDateString('es-ES')})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalExpiring > 0 ? (
          <div className="space-y-3">
            <p className="text-warning-800 font-medium">
              {totalExpiring} item{totalExpiring !== 1 ? 's' : ''} vence{totalExpiring === 1 ? '' : 'n'} hoy:
            </p>
            
            {expiringToday.referrals.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Referidos:</p>
                {expiringToday.referrals.map((referral) => (
                  <div key={referral.id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-600">
                        Inversión: {formatCurrency(referral.amount)} | 
                        Gen: {referral.generation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-warning-600 font-medium">
                        Vence hoy
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {expiringToday.investments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Inversiones Personales:</p>
                {expiringToday.investments.map((investment) => (
                  <div key={investment.id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">Inversión Personal</p>
                      <p className="text-sm text-gray-600">
                        Monto: {formatCurrency(investment.amount)} | 
                        Estado: {investment.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-warning-600 font-medium">
                        Vence hoy
                      </p>
                      <p className="text-xs text-gray-500">
                        Iniciada: {new Date(investment.startDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-warning-100 rounded-lg">
              <p className="text-warning-800 text-sm">
                💡 <strong>Recordatorio:</strong> Contacta personalmente a estas personas para recordarles sobre su vencimiento.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-success-800">
            <p className="font-medium">✅ No hay items que venzan hoy</p>
            <p className="text-sm text-success-600 mt-1">
              Todos los referidos e inversiones están al día. ¡Buen trabajo!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}