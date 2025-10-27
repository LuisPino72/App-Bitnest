import { z } from "zod";

// ==================== ESQUEMAS DE VALIDACIÓN ====================

/**
 * Esquema de validación para referidos
 */
export const referralSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios"
    ),

  wallet: z
    .string()
    .min(10, "La billetera debe tener al menos 10 caracteres")
    .max(100, "La billetera no puede exceder 100 caracteres")
    .regex(
      /^[a-zA-Z0-9.]+$/,
      "La billetera solo puede contener letras, números y puntos"
    ),

  amount: z
    .number()
    .min(1, "El monto mínimo es $1")
    .max(100000, "El monto máximo es $100,000"),

  generation: z
    .number()
    .min(1, "La generación mínima es 1")
    .max(17, "La generación máxima es 17"),

  cycle: z
    .number()
    .min(1, "El ciclo mínimo es 1")
    .max(100, "El ciclo máximo es 100"),

  investmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de inversión inválida"),

  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de expiración inválida"),
});

/**
 * Esquema de validación para inversiones personales
 */
export const personalInvestmentSchema = z.object({
  amount: z
    .number()
    .min(1, "El monto mínimo es $1")
    .max(100000, "El monto máximo es $100,000"),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de inicio inválida"),

  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de expiración inválida"),
});

/**
 * Esquema de validación para contactos
 */
export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios"
    ),

  status: z.enum(["activeInvestor", "interested", "doubtful", "rejected"], {
    errorMap: () => ({ message: "Estado inválido" }),
  }),

  contactDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de contacto inválida"),

  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^[+]?[1-9]?[0-9]{7,15}$/.test(phone.replace(/[\s-()]/g, ""));
    }, "Número de teléfono inválido"),

  notes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional(),

  lastContact: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de último contacto inválida")
    .optional(),
});

// ==================== FUNCIONES DE VALIDACIÓN ====================

/**
 * Resultado de validación
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Valida datos de referido
 */
export const validateReferral = (data: unknown): ValidationResult<any> => {
  try {
    const validatedData = referralSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ["Error de validación desconocido"],
    };
  }
};

/**
 * Valida datos de inversión personal
 */
export const validatePersonalInvestment = (
  data: unknown
): ValidationResult<any> => {
  try {
    const validatedData = personalInvestmentSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ["Error de validación desconocido"],
    };
  }
};

/**
 * Valida datos de personas
 */
export const validateLead = (data: unknown): ValidationResult<any> => {
  try {
    const validatedData = leadSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ["Error de validación desconocido"],
    };
  }
};

/**
 * Valida número de teléfono
 */
export const validatePhone = (phone: string): boolean => {
  return /^[+]?[1-9]?[0-9]{7,15}$/.test(phone.replace(/[\s-()]/g, ""));
};

/**
 * Valida formato de fecha
 */
export const validateDate = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

/**
 * Valida monto de inversión
 */
export const validateAmount = (amount: number): boolean => {
  return amount >= 1 && amount <= 100000;
};

/**
 * Valida generación
 */
export const validateGeneration = (generation: number): boolean => {
  return generation >= 1 && generation <= 17;
};

// ==================== UTILIDADES DE VALIDACIÓN ====================

/**
 * Sanitiza string eliminando caracteres peligrosos
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, "").replace(/\s+/g, " ");
};

/**
 * Sanitiza datos de referido
 */
export const sanitizeReferralData = (data: any) => ({
  ...data,
  name: sanitizeString(data.name),
  wallet: sanitizeString(data.wallet),
});

/**
 * Sanitiza datos de personas
 */
export const sanitizeLeadData = (data: any) => ({
  ...data,
  name: sanitizeString(data.name),
  phone: data.phone ? sanitizeString(data.phone) : undefined,
  notes: data.notes ? sanitizeString(data.notes) : undefined,
});

/**
 * Valida y sanitiza datos en un solo paso
 */
export const validateAndSanitize = <T>(
  data: any,
  validator: (data: unknown) => ValidationResult<T>,
  sanitizer?: (data: any) => any
): ValidationResult<T> => {
  const sanitizedData = sanitizer ? sanitizer(data) : data;
  return validator(sanitizedData);
};
