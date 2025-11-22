// services/userService.js
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';

const SALT_ROUNDS = 10;

/**
 * Obtiene todos los usuarios, delegando al modelo.
 */
const getAllUsers = async (queryParams) => {
    // Delega la consulta compleja (con joins y filtro por rol) al modelo
    return userModel.findAllByRole(queryParams);
};


/**
 * Crea un nuevo usuario. (Maneja el HASHING y la ASIGNACIÓN DE ROL)
 */
const createUser = async (data) => {
    const { role, ...userData } = data;

    if (!userData.password) {
        throw new utilsCustomError('La contraseña es requerida', 400);
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    userData.password = await bcrypt.hash(userData.password, salt);

    if (userData.email_verified === undefined) userData.email_verified = false;

    const newUser = await userModel.create(userData);

    if (role) {
        await userModel.updateRole(newUser.id, role);
    }

    return { id: newUser.id, email: newUser.email, role: role || null };
};

/**
 * Actualiza un usuario existente. (Maneja el HASHING condicional y la ASIGNACIÓN DE ROL)
 */
const updateUser = async (id, data) => {
    const { role, ...userData } = data;

    if (userData.password) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        userData.password = await bcrypt.hash(userData.password, salt);
    }

    const updatedUser = await userModel.update(id, userData);

    if (role) {
        await userModel.updateRole(id, role);
    }

    return updatedUser;
};

/**
 * Elimina un usuario por ID.
 */
const deleteUser = async (id) => {
    // Delega la eliminación al modelo
    return userModel.delete(id);
};


export default {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
};