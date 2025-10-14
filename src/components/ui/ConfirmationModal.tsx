import { useState } from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info" | "success";
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isLoading = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600 bg-yellow-100",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-600 bg-red-100",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600 bg-blue-100",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600 bg-green-100",
      confirmButton: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const { icon: IconComponent, iconColor, confirmButton } = typeStyles[type];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                iconColor
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn("min-w-[100px]", confirmButton)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para usar el modal de confirmación
export const useConfirmation = () => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: ConfirmationModalProps["type"];
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      type?: ConfirmationModalProps["type"];
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm,
      type: options?.type || "warning",
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    });
  };

  const close = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const ConfirmationComponent = () => (
    <ConfirmationModal
      isOpen={modalState.isOpen}
      onClose={close}
      onConfirm={() => {
        modalState.onConfirm();
        close();
      }}
      title={modalState.title}
      message={modalState.message}
      type={modalState.type}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
    />
  );

  return {
    confirm,
    close,
    ConfirmationComponent,
  };
};
