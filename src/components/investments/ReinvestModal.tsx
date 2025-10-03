"use client";

import { X, RefreshCw, Check } from "lucide-react";
import { PersonalInvestment } from "@/types";
import { formatCurrency } from "@/lib/businessUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReinvestModalProps {
  investmentId: string;
  investments: PersonalInvestment[];
  onReinvest: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ReinvestModal({
  investmentId,
  investments,
  onReinvest,
  onComplete,
  onCancel,
  isLoading = false,
}: ReinvestModalProps) {
  const investment = investments.find((i) => i.id === investmentId);

  if (!investment) return null;

  const newAmount = investment.amount + investment.earnings;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            Reinvertir Inversión
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">¿Qué deseas hacer con esta inversión?</p>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monto actual:</p>
            <p className="font-bold text-green-700">
              {formatCurrency(investment.amount)}
            </p>
            <p className="text-sm text-gray-600 mt-2">+ Ganancias:</p>
            <p className="font-bold text-green-700">
              {formatCurrency(investment.earnings)}
            </p>
            <p className="text-sm text-gray-600 mt-2">= Nuevo monto:</p>
            <p className="font-bold text-green-800">
              {formatCurrency(newAmount)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => onReinvest(investmentId)}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reinvertir Ahora
            </Button>

            <Button
              variant="outline"
              onClick={() => onComplete(investmentId)}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-2" />
              Completar Inversión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
