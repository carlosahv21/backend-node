// services/userService.js
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import AppError from "../utils/AppError.js";

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
        throw new AppError("La contraseña es requerida", 400);
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
    // Definir campos permitidos explícitamente para evitar inyección de campos inválidos o sobreescritura accidental
    const allowedFields = [
        "first_name",
        "last_name",
        "email",
        "password",
        "email_verified",
        "deleted",
    ];

    // Separar el rol del resto de datos
    const { role, ...restData } = data;

    // Filtrar solo los campos permitidos y que no sean undefined
    const userData = {};
    Object.keys(restData).forEach((key) => {
        if (allowedFields.includes(key) && restData[key] !== undefined) {
            userData[key] = restData[key];
        }
    });

    // Si hay password, hashearlo
    if (userData.password) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        userData.password = await bcrypt.hash(userData.password, salt);
    }

    let updatedUser = null;

    if (Object.keys(userData).length > 0) {
        updatedUser = await userModel.update(id, userData);
    } else {
        updatedUser = await userModel.findById(id);
    }

    if (role) {
        await userModel.updateRole(id, role);
        updatedUser = await userModel.findById(id);
    }

    return updatedUser;
};

// Elimina un usuario por ID.
const binUser = async (id) => {
    return userModel.bin(id);
};

// Restaura un usuario por ID.
const restoreUser = async (id) => {
    return userModel.restore(id);
};

const deleteUser = async (id) => {
    // Delega la eliminación al modelo
    return userModel.delete(id);
};

export default {
    getAllUsers,
    createUser,
    updateUser,
    binUser,
    restoreUser,
    deleteUser,
};
