import { useState, useCallback } from "react";

// ==================== TIPOS DE ERROR ====================

export interface AppError {
  message: string;
  code: string;
  statusCode?: number;
  details?: any;
}

export interface ErrorState {
  error: AppError | null;
  isLoading: boolean;
}

// ==================== CLASE DE ERROR PERSONALIZADA ====================

export class AppErrorClass extends Error implements AppError {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ==================== MANEJADOR DE ERRORES ====================

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppErrorClass) {
    return error;
  }

  if (error instanceof Error) {
    return new AppErrorClass(error.message, "UNKNOWN_ERROR", 500, {
      originalError: error,
    });
  }

  return new AppErrorClass("Error desconocido", "UNKNOWN_ERROR", 500, {
    originalError: error,
  });
};

// ==================== HOOK PARA MANEJO DE ERRORES ====================

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
  });

  const setError = useCallback((error: AppError | null) => {
    setErrorState((prev) => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setErrorState((prev) => ({ ...prev, isLoading }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: {
        onError?: (error: AppError) => void;
        showLoading?: boolean;
      }
    ): Promise<T | null> => {
      try {
        if (options?.showLoading !== false) {
          setLoading(true);
        }
        clearError();

        const result = await operation();
        return result;
      } catch (err) {
        const appError = handleError(err);
        setError(appError);

        if (options?.onError) {
          options.onError(appError);
        }

        console.error("Error en operación asíncrona:", appError);
        return null;
      } finally {
        if (options?.showLoading !== false) {
          setLoading(false);
        }
      }
    },
    [setError, setLoading, clearError]
  );

  const handleFirebaseError = useCallback(
    (error: unknown, operation: string): AppError => {
      const appError = handleError(error);

      // Personalizar mensajes para errores comunes de Firebase
      if (appError.code === "permission-denied") {
        appError.message = "No tienes permisos para realizar esta acción";
      } else if (appError.code === "unavailable") {
        appError.message =
          "Servicio temporalmente no disponible. Intenta de nuevo.";
      } else if (appError.code === "not-found") {
        appError.message = "El recurso solicitado no fue encontrado";
      } else if (appError.code === "already-exists") {
        appError.message = "Este elemento ya existe";
      }

      setError(appError);
      return appError;
    },
    [setError]
  );

  return {
    error: errorState.error,
    isLoading: errorState.isLoading,
    setError,
    setLoading,
    clearError,
    handleAsync,
    handleFirebaseError,
  };
};

// ==================== HOOK ESPECÍFICO PARA FORMULARIOS ====================

export const useFormErrorHandler = () => {
  const { error, setError, clearError, handleAsync } = useErrorHandler();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const validateField = useCallback(
    (field: string, value: any, validator: (value: any) => string | null) => {
      const error = validator(value);
      if (error) {
        setFieldError(field, error);
        return false;
      } else {
        clearFieldError(field);
        return true;
      }
    },
    [setFieldError, clearFieldError]
  );

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const hasGlobalError = error !== null;

  return {
    // Estado global
    error,
    isLoading: false,

    // Errores de campos
    fieldErrors,
    hasFieldErrors,
    hasGlobalError,

    // Acciones globales
    setError,
    clearError,
    handleAsync,

    // Acciones de campos
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    validateField,
  };
};
