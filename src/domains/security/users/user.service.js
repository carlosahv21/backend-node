import bcrypt from "bcryptjs";
import crypto from "crypto";
import userRepository from "./user.repository.js";
import AppError from "../../../shared/utils/AppError.js";

const SALT_ROUNDS = 10;

class UserService {
    async getAllUsers(queryParams) {
        return userRepository.findAllByRole(queryParams);
    }

    async createUser(data) {
        const { role, ...userData } = data;

        let tempPassword = null;
        if (!userData.password) {
            tempPassword = crypto.randomBytes(4).toString('hex');
            userData.password = tempPassword;
            userData.needs_password_change = true;
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        userData.password = await bcrypt.hash(userData.password, salt);

        if (userData.email_verified === undefined) userData.email_verified = false;

        const newUser = await userRepository.create({ ...userData, role });

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

    async updateUser(id, data) {
        const allowedFields = [
            "first_name", "last_name", "email", "password", "phone", "gender",
            "birthdate", "avatar", "email_verified", "push_token", "theme",
            "language", "tour_completed", "hide_tour", "needs_password_change", "last_login",
        ];

        const { role, ...restData } = data;

        const userData = {}
        Object.keys(restData).forEach((key) => {
            if (allowedFields.includes(key) && restData[key] !== undefined) {
                userData[key] = restData[key];
            }
        });

        if (userData.password) {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        let updatedUser = null;

        if (Object.keys(userData).length > 0) {
            updatedUser = await userRepository.update(id, userData);
        } else {
            updatedUser = await userRepository.findById(id);
        }

        if (role) {
            await userRepository.updateRole(id, role);
            updatedUser = await userRepository.findById(id);
        }

        return updatedUser;
    }

    async binUser(id, userId) {
        return userRepository.bin(id, userId);
    }

    async restoreUser(id) {
        return userRepository.restore(id);
    }

    async getUserById(id) {
        return userRepository.findById(id);
    }

    async deleteUser(id) {
        return userRepository.delete(id);
    }
}

export default new UserService();