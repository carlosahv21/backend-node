// services/userService.js
import bcrypt from "bcryptjs";
import crypto from "crypto";

import userModel from "../models/userModel.js";
import AppError from "../utils/AppError.js";

const SALT_ROUNDS = 10;

class UserService {
    /**
     * Obtiene todos los usuarios, delegando al modelo.
     */
    async getAllUsers(queryParams) {
        // Delega la consulta compleja (con joins y filtro por rol) al modelo
        return userModel.findAllByRole(queryParams);
    }

    /**
     * Crea un nuevo usuario. (Maneja el HASHING, la ASIGNACIÓN DE ROL y PASSWORD TEMPORAL)
     */
    async createUser(data) {
        const { role, ...userData } = data;

        let tempPassword = null;
        if (!userData.password) {
            tempPassword = crypto.randomBytes(4).toString('hex'); // 8 caracteres aleatorios
            userData.password = tempPassword;
            userData.needs_password_change = true;
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        userData.password = await bcrypt.hash(userData.password, salt);

        if (userData.email_verified === undefined) userData.email_verified = false;

        // Incluimos el rol en el objeto que enviamos al modelo para que pueda resolver el role_id antes del insert
        const newUser = await userModel.create({ ...userData, role });

        // Simular envío de email con la contraseña temporal
        if (tempPassword) {
            console.log("\n--- [EMAIL SIMULADO: BIENVENIDA Y CONTRASEÑA TEMPORAL] ---");
            console.log(`Para: ${newUser.email}`);
            console.log(`¡Bienvenido! Tu cuenta ha sido creada.`);
            console.log(`Tu contraseña temporal es: ${tempPassword}`);
            console.log(`Por favor, cámbiala al iniciar sesión.`);
            console.log("---------------------------------------------------------\n");
        }

        return { ...newUser, role: role || null, tempPassword };
    }

    /**
     * Actualiza un usuario existente. (Maneja el HASHING condicional y la ASIGNACIÓN DE ROL)
     */
    async updateUser(id, data) {
        // Definir campos permitidos explícitamente para evitar inyección de campos inválidos o sobreescritura accidental
        const allowedFields = [
            "first_name",
            "last_name",
            "email",
            "password",
            "phone",
            "gender",
            "birthdate",
            "avatar",
            "email_verified",
            "push_token",
            "theme",
            "language",
            "tour_completed",
            "hide_tour",
            "needs_password_change",
            "last_login",
        ];

        // Separar el rol del resto de datos
        const { role, ...restData } = data;

        // Filtrar solo los campos permitidos y que no sean undefined
        const userData = {}
        Object.keys(restData).forEach((key) => {
            if (allowedFields.includes(key) && restData[key] !== undefined) {
                userData[key] = restData[key];
            }
        });

        console.log(`[UserService] Actualizando usuario ${id}. Campos detectados:`, Object.keys(userData));

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
    }

    /**
     * Elimina un usuario por ID.
     */
    async binUser(id, userId) {
        return userModel.bin(id, userId);
    }

    /**
     * Restaura un usuario por ID.
     */
    async restoreUser(id) {
        return userModel.restore(id);
    }

    /**
     * Obtiene un usuario por ID.
     */
    async getUserById(id) {
        return userModel.findById(id);
    }

    /**
     * Elimina un usuario por ID.
     */
    async deleteUser(id) {
        // Delega la eliminación al modelo
        return userModel.delete(id);
    }
}

export default new UserService();
