// controllers/userController.js
import userService from "../services/userService.js";
import userModel from "../models/userModel.js";
import ApiResponse from "../utils/apiResponse.js";

/**
 * Clase controladora para Usuarios.
 */
class UserController {
    /**
     * Obtiene todos los usuarios.
     */
    async getAll(req, res, next) {
        try {
            const result = await userService.getAllUsers(req.query);

            ApiResponse.success(res, 200, "Usuarios obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene un usuario por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userModel.findById(id);
            ApiResponse.success(res, 200, "Usuario obtenido correctamente", user);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Crea un nuevo usuario.
     */
    async create(req, res, next) {
        try {
            const { email } = req.body;

            const user = await userModel.findByEmail(email);
            if (user) {
                return ApiResponse.error(
                    res,
                    400,
                    "Ya existe un usuario con el correo electrónico proporcionado"
                );
            }

            const newUser = await userService.createUser(req.body);

            ApiResponse.success(res, 201, "Usuario creado correctamente", {
                user: newUser,
            });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Actualiza un usuario.
     */
    async update(req, res, next) {
        try {
            await userService.updateUser(req.params.id, req.body);

            ApiResponse.success(res, 200, "Usuario actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Elimina un usuario.
     */
    async delete(req, res, next) {
        try {
            await userService.deleteUser(req.params.id);
            ApiResponse.success(res, 204, "Usuario eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Mueve un usuario a la papelera.
     */
    async bin(req, res, next) {
        try {
            const result = await userService.binUser(req.params.id);
            ApiResponse.success(
                res,
                200,
                "Usuario movido a papelera correctamente",
                result
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Restaura un usuario.
     */
    async restore(req, res, next) {
        try {
            const result = await userService.restoreUser(req.params.id);
            ApiResponse.success(res, 200, "Usuario restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new UserController();
