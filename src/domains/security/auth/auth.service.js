import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import authRepository from "./auth.repository.js";
import AppError from "../../../shared/utils/AppError.js";
import jwtConfig from "../../../config/jwt.js";
import { buildPermissionMap } from "../../../shared/utils/permissionMapper.js";

const JWT_SECRET = jwtConfig.secret;
const JWT_EXPIRES_IN = jwtConfig.expiresIn;

const getUserData = async (userId) => {
    const userRecord = await authRepository.knex("users").where({ id: userId }).first();

    if (!userRecord) throw new AppError("User not found", 404);

    const roleData = await authRepository.findRoleByUserId(userId);

    let planData = null;
    if (roleData.role_name === "student") {
        planData = await authRepository.findPlanByUserId(userId);
    }

    const rawPermissions = await authRepository.findPermissions(roleData.role_id);

    const permissions = buildPermissionMap(rawPermissions);

    const allModules = Object.keys(permissions);
    const internalModules = ['roles', 'permissions', 'modules', 'settings'];
    const productModules = allModules.filter(m => !internalModules.includes(m));

    let academy = null;
    if (userRecord.academy_id) {
        const academyRecord = await authRepository.knex("academies")
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
        modules: productModules,
        permissions,
    };
};

const authenticateUser = async ({ email, password }) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const data = await getUserData(user.id);

    await authRepository.knex("users").where({ id: user.id }).update({ last_seen_at: new Date() });

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

const getAuthenticatedUser = async (userId) => {
    return getUserData(userId);
};

const forgotPassword = async (email) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new AppError("No existe una cuenta con ese correo electrónico", 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const expires = new Date(Date.now() + 3600000);

    await authRepository.updateUser(user.id, {
        reset_password_token: hashedToken,
        reset_password_expires: expires
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    console.log("\n--- [EMAIL SIMULADO: RECUPERACIÓN DE CONTRASEÑA] ---");
    console.log(`Para: ${email}`);
    console.log(`Link de recuperación: ${resetUrl}`);
    console.log("----------------------------------------------------\n");

    return { message: "Se ha enviado un correo con las instrucciones para restablecer su contraseña" };
};

const resetPasswordWithToken = async (token, newPassword) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await authRepository.knex("users")
        .where("reset_password_token", hashedToken)
        .andWhere("reset_password_expires", ">", new Date())
        .first();

    if (!user) {
        throw new AppError("El token es inválido o ha expirado", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepository.updateUser(user.id, {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
        needs_password_change: false
    });

    return { message: "Contraseña actualizada correctamente" };
};

const verifyResetToken = async (token) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await authRepository.knex("users")
        .where("reset_password_token", hashedToken)
        .andWhere("reset_password_expires", ">", new Date())
        .first();

    if (!user) {
        throw new AppError("El token es inválido o ha expirado", 400);
    }

    return { valid: true, message: "Token válido" };
};

/**
 * Cambio de contraseña self-service para un usuario autenticado.
 * Opera siempre sobre el userId del token (nunca sobre un email del body)
 * y exige la contraseña actual para evitar tomas de cuenta.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
        throw new AppError("La contraseña actual es incorrecta", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepository.updateUser(user.id, {
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
    changePassword
};