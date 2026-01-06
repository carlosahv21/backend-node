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
