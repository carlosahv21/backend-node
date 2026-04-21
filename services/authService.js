import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import authModel from '../models/authModel.js';
import AppError from "../utils/AppError.js";
import { buildPermissionMap } from "../utils/permissionMapper.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1h";

/**
 * Función común para obtener usuario + rol + permisos + academy + modules
 */
const getUserData = async (userId) => {

    const userRecord = await authModel.knex("users").where({ id: userId }).first();

    if (!userRecord) throw new AppError("User not found", 404);

    const roleData = await authModel.findRoleByUserId(userId);

    let planData = null;
    if (roleData.role_name === "student") {
        planData = await authModel.findPlanByUserId(userId);
    }

    const rawPermissions = await authModel.findPermissions(roleData.role_id);

    // Permisos estructurados jerárquicamente para SaaS
    const permissions = buildPermissionMap(rawPermissions);

    // Extraer nombres de módulos únicos habilitados y distinguir producto de internals
    const allModules = Object.keys(permissions);
    const internalModules = ['roles', 'permissions', 'modules', 'settings'];
    const productModules = allModules.filter(m => !internalModules.includes(m));

    // Resolver academia del tenant al que pertenece el usuario (multi-tenancy)
    let academy = null;
    if (userRecord.academy_id) {
        const academyRecord = await authModel.knex("academies")
            .where({ id: userRecord.academy_id })
            .first();

        if (academyRecord) {
            academy = {
                id: academyRecord.id,
                name: academyRecord.name,
                logo_url: academyRecord.logo_url,
                plan: academyRecord.plan || "free",
                currency: academyRecord.currency || "USD",
                date_format: academyRecord.date_format || "YYYY-MM-DD",
                address: academyRecord.address || null,
            };
        }
    }

    return {
        user: {
            id: userRecord.id,
            email: userRecord.email,
            name: `${userRecord.first_name} ${userRecord.last_name}`.trim(),
            role: roleData.role_name,
            plan: planData,
            theme: userRecord.theme || "light",
            language: userRecord.language || "es",
            hide_tour: userRecord.hide_tour || false,
            tour_completed: userRecord.tour_completed || false,
            needs_password_change: userRecord.needs_password_change || false,
            phone: userRecord.phone || null,
            avatar: userRecord.avatar || null,
            gender: userRecord.gender || null,
            birthdate: userRecord.birthdate || null
        },
        academy,
        modules: productModules, // Solo modulos SaaS exportados al UI
        permissions,
    };
};

/**
 * Lógica de negocio de Login (hashing y JWT)
 */
const authenticateUser = async ({ email, password }) => {
    const user = await authModel.findUserByEmail(email);
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const data = await getUserData(user.id);

    // JWT ultraligero: solo identidad y tenant (academy)
    // academy_id se lee directamente del registro del usuario para garantizar
    // que el valor del token siempre refleje el tenant real del usuario.
    const token = jwt.sign(
        {
            id: user.id,
            role: data.user.role,
            academy_id: user.academy_id ?? data.academy?.id ?? null,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, ...data };
};

/**
 * Refrescar datos de usuario autenticado (/me)
 */
const getAuthenticatedUser = async (userId) => {
    return getUserData(userId);
};

/**
 * Lógica de negocio de Olvido de Contraseña (Generación de Token)
 */
const forgotPassword = async (email) => {
    const user = await authModel.findUserByEmail(email);

    if (!user) {
        throw new AppError("No existe una cuenta con ese correo electrónico", 404);
    }

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash el token para guardarlo en la DB (seguridad extra)
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token expira en 1 hora
    const expires = new Date(Date.now() + 3600000);

    await authModel.updateUser(user.id, {
        reset_password_token: hashedToken,
        reset_password_expires: expires
    });

    // Enviar correo (Simulado por consola)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    console.log("\n--- [EMAIL SIMULADO: RECUPERACIÓN DE CONTRASEÑA] ---");
    console.log(`Para: ${email}`);
    console.log(`Link de recuperación: ${resetUrl}`);
    console.log("----------------------------------------------------\n");

    return { message: "Se ha enviado un correo con las instrucciones para restablecer su contraseña" };
};

/**
 * Lógica de negocio de Reset de Contraseña con Token
 */
const resetPasswordWithToken = async (token, newPassword) => {
    // Hash el token recibido para comparar con la DB
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await authModel.knex("users")
        .where("reset_password_token", hashedToken)
        .andWhere("reset_password_expires", ">", new Date())
        .first();

    if (!user) {
        throw new AppError("El token es inválido o ha expirado", 400);
    }

    // Actualizar contraseña y limpiar campos de reset
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authModel.updateUser(user.id, {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
        needs_password_change: false
    });

    return { message: "Contraseña actualizada correctamente" };
};

/**
 * Verifica si un token de recuperación es válido y no ha expirado
 */
const verifyResetToken = async (token) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await authModel.knex("users")
        .where("reset_password_token", hashedToken)
        .andWhere("reset_password_expires", ">", new Date())
        .first();

    if (!user) {
        throw new AppError("El token es inválido o ha expirado", 400);
    }

    return { valid: true, message: "Token válido" };
};

/**
 * Lógica para cambio de contraseña forzado (dentro de la app)
 */
const changePasswordByEmail = async (email, newPassword) => {
    const user = await authModel.findUserByEmail(email);

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authModel.updateUser(user.id, {
        password: hashedPassword,
        needs_password_change: false
    });

    return { message: "Contraseña actualizada exitosamente" };
};

export default {
    authenticateUser,
    getAuthenticatedUser,
    forgotPassword,
    resetPasswordWithToken,
    verifyResetToken,
    changePasswordByEmail
};