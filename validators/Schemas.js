import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email("El formato del email no es válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export const createPlanSchema = z.object({
    name: z.string().min(1, "El campo 'name' es requerido"),
    max_sessions: z.number().min(1, "El campo 'max_sessions' es requerido"),
    price: z.number().min(1, "El campo 'price' es requerido")
});

// Notification Schemas
export const createNotificationSchema = z.object({
    user_id: z.number().int().positive().optional(),
    role_target: z.enum(['ADMIN', 'STUDENT', 'TEACHER', 'RECEPTIONIST']).optional(),
    category: z.enum(['PAYMENT', 'CLASS', 'SYSTEM', 'ATTENDANCE', 'REGISTRATION']),
    title: z.string().min(1, "El título es requerido").max(255, "El título no puede exceder 255 caracteres"),
    message: z.string().min(1, "El mensaje es requerido"),
    related_entity_id: z.number().int().positive().optional(),
    deep_link: z.string().optional()
}).refine(
    (data) => data.user_id || data.role_target,
    { message: "Debe proporcionar user_id o role_target" }
);

export const markAsReadSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID debe ser un número").optional()
});

