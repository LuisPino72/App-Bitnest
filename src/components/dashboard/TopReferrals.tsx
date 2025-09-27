"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks";
import { formatCurrency } from "@/lib/businessUtils";
import { Crown, Medal, Award } from "lucide-react";

export function TopReferrals() {
  const { topReferrals } = useDashboardMetrics();

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return Crown;
      case 1:
        return Medal;
      case 2:
        return Award;
      default:
        return Award;
    }
  };

  const getIconColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary-600" />
          Top 3 Mejores Referidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topReferrals.length > 0 ? (
          <div className="space-y-4">
            {topReferrals.map((referral, index) => {
              const Icon = getIcon(index);
              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${getIconColor(index)}`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {referral.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Gen {referral.generation} • {referral.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      {formatCurrency(referral.amount)}
                    </p>
                    <p className="text-sm text-success-600">
                      Estado: {referral.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay referidos activos aún</p>
            <p className="text-sm">Comienza agregando tu primer referido</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
