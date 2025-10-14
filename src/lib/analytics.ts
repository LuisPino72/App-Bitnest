import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";

// ==================== CONFIGURACIÓN DE ANALYTICS ====================

let analytics: Analytics | null = null;

// Inicializar analytics solo en el cliente
if (typeof window !== "undefined") {
  try {
    const app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });

    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics no disponible:", error);
  }
}

// ==================== TIPOS DE EVENTOS ====================

export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

export interface UserAction {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface PerformanceMetric {
  metricName: string;
  value: number;
  unit?: string;
  customParameters?: Record<string, any>;
}

// ==================== FUNCIONES DE ANALYTICS ====================

/**
 * Registrar evento personalizado
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, {
      timestamp: Date.now(),
      ...parameters,
    });
  } catch (error) {
    console.warn("Error tracking event:", error);
  }
};

/**
 * Registrar acción del usuario
 */
export const trackUserAction = (action: UserAction) => {
  if (!analytics) return;

  const eventName = `${action.category}_${action.action}`;
  const parameters: Record<string, any> = {
    category: action.category,
    action: action.action,
    timestamp: Date.now(),
  };

  if (action.label) parameters.label = action.label;
  if (action.value) parameters.value = action.value;
  if (action.customParameters) {
    Object.assign(parameters, action.customParameters);
  }

  trackEvent(eventName, parameters);
};

/**
 * Registrar métrica de rendimiento
 */
export const trackPerformance = (metric: PerformanceMetric) => {
  if (!analytics) return;

  const eventName = `performance_${metric.metricName}`;
  const parameters: Record<string, any> = {
    value: metric.value,
    timestamp: Date.now(),
  };

  if (metric.unit) parameters.unit = metric.unit;
  if (metric.customParameters) {
    Object.assign(parameters, metric.customParameters);
  }

  trackEvent(eventName, parameters);
};

// ==================== EVENTOS ESPECÍFICOS DE LA APLICACIÓN ====================

/**
 * Registrar creación de referido
 */
export const trackReferralCreated = (referralData: {
  generation: number;
  amount: number;
  cycle: number;
}) => {
  trackUserAction({
    action: "created",
    category: "referral",
    label: `generation_${referralData.generation}`,
    value: referralData.amount,
    customParameters: {
      generation: referralData.generation,
      amount: referralData.amount,
      cycle: referralData.cycle,
    },
  });
};

/**
 * Registrar actualización de referido
 */
export const trackReferralUpdated = (
  referralId: string,
  changes: Record<string, any>
) => {
  trackUserAction({
    action: "updated",
    category: "referral",
    label: referralId,
    customParameters: {
      referralId,
      changes: Object.keys(changes),
    },
  });
};

/**
 * Registrar eliminación de referido
 */
export const trackReferralDeleted = (
  referralId: string,
  generation: number
) => {
  trackUserAction({
    action: "deleted",
    category: "referral",
    label: `generation_${generation}`,
    customParameters: {
      referralId,
      generation,
    },
  });
};

/**
 * Registrar reinversión de ciclo
 */
export const trackCycleReinvestment = (
  referralId: string,
  newAmount: number
) => {
  trackUserAction({
    action: "reinvested",
    category: "cycle",
    value: newAmount,
    customParameters: {
      referralId,
      newAmount,
    },
  });
};

/**
 * Registrar finalización de ciclo
 */
export const trackCycleFinished = (
  referralId: string,
  totalEarnings: number
) => {
  trackUserAction({
    action: "finished",
    category: "cycle",
    value: totalEarnings,
    customParameters: {
      referralId,
      totalEarnings,
    },
  });
};

/**
 * Registrar creación de inversión personal
 */
export const trackInvestmentCreated = (amount: number) => {
  trackUserAction({
    action: "created",
    category: "investment",
    value: amount,
    customParameters: {
      amount,
    },
  });
};

/**
 * Registrar creación de personas contactadas
 */
export const trackLeadCreated = (status: string) => {
  trackUserAction({
    action: "created",
    category: "lead",
    label: status,
    customParameters: {
      status,
    },
  });
};

/**
 * Registrar actualización de contactos
 */
export const trackLeadUpdated = (
  leadId: string,
  oldStatus: string,
  newStatus: string
) => {
  trackUserAction({
    action: "updated",
    category: "lead",
    label: `${oldStatus}_to_${newStatus}`,
    customParameters: {
      leadId,
      oldStatus,
      newStatus,
    },
  });
};

/**
 * Registrar exportación de datos
 */
export const trackDataExport = (exportType: string, recordCount: number) => {
  trackUserAction({
    action: "exported",
    category: "data",
    label: exportType,
    value: recordCount,
    customParameters: {
      exportType,
      recordCount,
    },
  });
};

/**
 * Registrar uso de calculadora
 */
export const trackCalculatorUsed = (
  calculatorType: string,
  inputs: Record<string, any>
) => {
  trackUserAction({
    action: "used",
    category: "calculator",
    label: calculatorType,
    customParameters: {
      calculatorType,
      inputs: Object.keys(inputs),
    },
  });
};

/**
 * Registrar navegación entre páginas
 */
export const trackPageView = (pageName: string, pagePath: string) => {
  trackUserAction({
    action: "viewed",
    category: "page",
    label: pageName,
    customParameters: {
      pagePath,
      timestamp: Date.now(),
    },
  });
};

/**
 * Registrar error de aplicación
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
) => {
  trackEvent("app_error", {
    errorType,
    errorMessage,
    context,
    timestamp: Date.now(),
  });
};

/**
 * Registrar tiempo de carga de página
 */
export const trackPageLoadTime = (pageName: string, loadTime: number) => {
  trackPerformance({
    metricName: "page_load_time",
    value: loadTime,
    unit: "ms",
    customParameters: {
      pageName,
    },
  });
};

/**
 * Registrar tiempo de respuesta de Firebase
 */
export const trackFirebaseResponseTime = (
  operation: string,
  responseTime: number
) => {
  trackPerformance({
    metricName: "firebase_response_time",
    value: responseTime,
    unit: "ms",
    customParameters: {
      operation,
    },
  });
};

/**
 * Registrar uso de filtros
 */
export const trackFilterUsage = (
  filterType: string,
  filterValue: string,
  resultCount: number
) => {
  trackUserAction({
    action: "filtered",
    category: "search",
    label: filterType,
    value: resultCount,
    customParameters: {
      filterType,
      filterValue,
      resultCount,
    },
  });
};

/**
 * Registrar búsqueda
 */
export const trackSearch = (searchTerm: string, resultCount: number) => {
  trackUserAction({
    action: "searched",
    category: "search",
    value: resultCount,
    customParameters: {
      searchTerm,
      resultCount,
    },
  });
};

// ==================== HOOKS DE ANALYTICS ====================

/**
 * Hook para trackear automáticamente el tiempo de carga de componentes
 */
export const usePerformanceTracking = (componentName: string) => {
  const startTime = Date.now();

  const trackRenderTime = () => {
    const renderTime = Date.now() - startTime;
    trackPerformance({
      metricName: "component_render_time",
      value: renderTime,
      unit: "ms",
      customParameters: {
        componentName,
      },
    });
  };

  return { trackRenderTime };
};

/**
 * Hook para trackear errores en componentes
 */
export const useErrorTracking = (componentName: string) => {
  const trackComponentError = (error: Error, context?: Record<string, any>) => {
    trackError("component_error", error.message, {
      componentName,
      stack: error.stack,
      ...context,
    });
  };

  return { trackError: trackComponentError };
};

// ==================== CONFIGURACIÓN DE ANALYTICS ====================

/**
 * Configurar analytics para el usuario actual
 */
export const setAnalyticsUser = (
  userId: string,
  userProperties?: Record<string, any>
) => {
  if (!analytics) return;

  trackEvent("user_identified", {
    userId,
    userProperties,
    timestamp: Date.now(),
  });
};

/**
 * Limpiar datos de analytics al cerrar sesión
 */
export const clearAnalyticsData = () => {
  if (!analytics) return;

  trackEvent("user_logout", {
    timestamp: Date.now(),
  });
};
