// services/authService.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authModel from '../models/authModel.js';
import utilsCustomError from "../utils/utilsCustomError.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1h";

/**
 * Función común para obtener usuario + rol + permisos + rutas + settings
 */
const getUserData = async (userId) => {

    const userRecord = await authModel.knex("users").where({ id: userId }).first();
    
    if (!userRecord) throw new utilsCustomError("User not found", 404);

    const roleData = await authModel.findRoleByUserId(userId);

    const rawPermissions = await authModel.findPermissions(roleData.role_id);
    
    const permissionsList = [...new Set(rawPermissions.map(p =>
        `${p.moduleName}:${p.action}`
    ))];

    const settings = await authModel.findSettings();

    return {
        user: {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.first_name + " " + userRecord.last_name,
            role: roleData.role_name,
        },
        settings,
        permissions: permissionsList,
    };
};

/**
 * 3. Lógica de negocio de Login (hashing y JWT)
 */
const authenticateUser = async ({ email, password }) => {
    const user = await authModel.findUserByEmail(email);
    if (!user) {
        throw new utilsCustomError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new utilsCustomError("Invalid email or password", 401);
    }

    const data = await getUserData(user.id);

    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, ...data };
};

/**
 * Refrescar datos de usuario
 */
const getAuthenticatedUser = async (userId) => {
    return getUserData(userId);
};


export default {
    authenticateUser,
    getAuthenticatedUser,
};