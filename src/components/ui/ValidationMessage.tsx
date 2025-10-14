import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationMessageProps {
  message: string;
  type?: "error" | "warning" | "success" | "info";
  onClose?: () => void;
  className?: string;
}

export const ValidationMessage = ({
  message,
  type = "error",
  onClose,
  className,
}: ValidationMessageProps) => {
  const typeStyles = {
    error: {
      container: "bg-red-50 text-red-700 border border-red-200",
      icon: "text-red-500",
      IconComponent: AlertTriangle,
    },
    warning: {
      container: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      icon: "text-yellow-500",
      IconComponent: AlertTriangle,
    },
    success: {
      container: "bg-green-50 text-green-700 border border-green-200",
      icon: "text-green-500",
      IconComponent: CheckCircle,
    },
    info: {
      container: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: "text-blue-500",
      IconComponent: Info,
    },
  };

  const { container, icon, IconComponent } = typeStyles[type];

  return (
    <div
      className={cn(
        "p-3 rounded-md flex items-start gap-3",
        container,
        className
      )}
    >
      <IconComponent className={cn("h-5 w-5 flex-shrink-0 mt-0.5", icon)} />
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
          aria-label="Cerrar mensaje"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface ValidationErrorsProps {
  errors: string[];
  onClose?: () => void;
  className?: string;
}

export const ValidationErrors = ({
  errors,
  onClose,
  className,
}: ValidationErrorsProps) => {
  if (errors.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <ValidationMessage
        message={`Se encontraron ${errors.length} error${
          errors.length > 1 ? "es" : ""
        }:`}
        type="error"
        onClose={onClose}
      />
      <ul className="ml-4 space-y-1">
        {errors.map((error, index) => (
          <li
            key={index}
            className="text-sm text-red-600 flex items-start gap-2"
          >
            <span className="text-red-500 mt-1">•</span>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export const FormFieldError = ({ error, className }: FormFieldErrorProps) => {
  if (!error) return null;

  return (
    <div
      className={cn(
        "text-sm text-red-600 mt-1 flex items-center gap-1",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      {error}
    </div>
  );
};
