import userService from "./user.service.js";
import userRepository from "./user.repository.js";
import ApiResponse from "../../../shared/utils/apiResponse.js";

class UserController {
    async getAll(req, res, next) {
        try {
            const result = await userService.getAllUsers(req.query);
            ApiResponse.success(res, 200, "Usuarios obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userRepository.findById(id);
            ApiResponse.success(res, 200, "Usuario obtenido correctamente", user);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { email } = req.body;

            const user = await userRepository.findByEmail(email);
            if (user) {
                return ApiResponse.error(res, 400, "Ya existe un usuario con el correo electrónico proporcionado");
            }

            const newUser = await userService.createUser(req.body);
            ApiResponse.success(res, 201, "Usuario creado correctamente", { user: newUser });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedUser = await userService.updateUser(req.params.id, req.body);
            ApiResponse.success(res, 200, "Usuario actualizado correctamente", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await userService.deleteUser(req.params.id);
            ApiResponse.success(res, 204, "Usuario eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await userService.binUser(req.params.id);
            ApiResponse.success(res, 200, "Usuario movido a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await userService.restoreUser(req.params.id);
            ApiResponse.success(res, 200, "Usuario restaurado correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async savePushToken(req, res, next) {
        try {
            const { userId } = req.params;
            const { pushToken } = req.body;

            if (!pushToken) {
                return ApiResponse.error(res, 400, "Token PUSH no proporcionado");
            }

            const updatedUser = await userService.updateUser(userId, { push_token: pushToken });
            ApiResponse.success(res, 200, "Token PUSH guardado correctamente", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async getPushToken(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await userService.getUserById(userId);

            if (!user) {
                return ApiResponse.error(res, 404, "Usuario no encontrado");
            }

            ApiResponse.success(res, 200, "Token PUSH obtenido correctamente", { push_token: user.push_token });
        } catch (error) {
            next(error);
        }
    }

    async sendPushNotification(req, res, next) {
        try {
            const { userId } = req.params;
            const { title, body, data } = req.body;

            if (!title || !body) {
                return ApiResponse.error(res, 400, "Título y mensaje son requeridos");
            }

            const user = await userService.getUserById(userId);

            if (!user) {
                return ApiResponse.error(res, 404, "Usuario no encontrado");
            }

            if (!user.push_token) {
                return ApiResponse.error(res, 400, "El usuario no tiene un token PUSH registrado");
            }

            ApiResponse.success(res, 200, "Notificación enviada correctamente");
        } catch (error) {
            next(error);
        }
    }

    async checkNotificationReceipts(req, res, next) {
        try {
            const { ticketIds } = req.body;

            if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
                return ApiResponse.error(res, 400, "Se requiere un array de IDs de tickets");
            }

            ApiResponse.success(res, 200, "Recibos verificados", { receipts: [] });
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userRepository.findById(id);
            ApiResponse.success(res, 200, "Usuario obtenido correctamente", user);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();