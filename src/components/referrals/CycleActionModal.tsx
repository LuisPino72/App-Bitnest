import React from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ValidationMessage } from "@/components/ui/ValidationMessage";

interface CycleActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishCycle: () => void;
  onReinvest: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const CycleActionModal = React.memo<CycleActionModalProps>(
  ({ isOpen, onClose, onFinishCycle, onReinvest, isLoading, error }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Finalizar Ciclo</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {/* Mostrar errores si existen */}
            {error && (
              <ValidationMessage
                message={error}
                type="error"
                onClose={() => {}}
              />
            )}

            <p className="text-gray-700">
              ¿Qué deseas hacer con este referido?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={onFinishCycle}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Finalizar ciclo
              </Button>
              <Button
                variant="outline"
                onClick={onReinvest}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Reinvertir
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CycleActionModal.displayName = "CycleActionModal";
