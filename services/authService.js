// services/authService.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    // Datos de la academia derivados de la tabla settings. 
    // Plan "pro" es un stub temporal por requerimiento SaaS.
    const settings = await authModel.findSettings();
    const academy = settings ? {
        id: settings.id,
        academy_name: settings.academy_name,
        contact_email: settings.contact_email,
        phone_number: settings.phone_number,
        plan: "pro",
        logo_url: settings.logo_url,
        date_format: settings.date_format,
        currency: settings.currency,
        language: settings.language,
        theme: settings.theme,
    } : null;

    return {
        user: {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.first_name + " " + userRecord.last_name,
            role: roleData.role_name,
            plan: planData,
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
    const token = jwt.sign(
        {
            id: user.id,
            role: data.user.role,
            academy_id: data.academy?.id || null
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
 * Lógica de negocio de Reset de Contraseña
 */
const resetPassword = async ({ email, password }) => {
    const user = await authModel.findUserByEmail(email);

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }
    const hashedPassword = await bcrypt.hashSync(password, 10);

    await authModel.updateUser(user.id, { password: hashedPassword });

    return { message: "Contraseña restablecida correctamente" };
};

export default {
    authenticateUser,
    getAuthenticatedUser,
    resetPassword,
};