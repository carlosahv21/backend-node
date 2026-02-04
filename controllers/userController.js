// controllers/userController.js
import userService from "../services/userService.js";
import userModel from "../models/userModel.js";
import ApiResponse from "../utils/apiResponse.js";
import notificationService from "../services/notificationService.js";
import { Expo } from "expo-server-sdk";

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

    /**
     * Guarda el token PUSH de un usuario.
     */
    async savePushToken(req, res, next) {
        try {
            const { userId } = req.params;
            const { pushToken } = req.body;

            console.log(userId, pushToken);


            if (!pushToken) {
                return ApiResponse.error(res, 400, "Token PUSH no proporcionado");
            }

            // Validar que el token sea un formato válido de Expo
            if (!Expo.isExpoPushToken(pushToken)) {
                return ApiResponse.error(res, 400, "Token PUSH no es válido para Expo");
            }

            const updatedUser = await userService.updateUser(userId, { push_token: pushToken });

            ApiResponse.success(res, 200, "Token PUSH guardado correctamente", updatedUser);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene el token PUSH de un usuario.
     */
    async getPushToken(req, res, next) {
        try {
            const { userId } = req.params;

            const user = await userService.getUserById(userId);

            if (!user) {
                return ApiResponse.error(res, 404, "Usuario no encontrado");
            }

            ApiResponse.success(res, 200, "Token PUSH obtenido correctamente", {
                push_token: user.push_token
            });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Envía una notificación push de prueba a un usuario.
     */
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

            console.log('🔔 Enviando notificación al usuario:', userId);
            console.log('  Push Token:', user.push_token);

            const tickets = await notificationService.sendPushNotification(
                user.push_token,
                title,
                body,
                data || {}
            );

            ApiResponse.success(res, 200, "Notificación enviada correctamente", {
                tickets,
                debug: {
                    userId,
                    pushToken: user.push_token,
                    message: 'Para verificar la entrega, usa el endpoint /check-receipts con los IDs de los tickets'
                }
            });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Verifica el estado de entrega de notificaciones enviadas
     */
    async checkNotificationReceipts(req, res, next) {
        try {
            const { ticketIds } = req.body;

            if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
                return ApiResponse.error(res, 400, "Se requiere un array de IDs de tickets");
            }

            const receipts = await notificationService.checkNotificationReceipts(ticketIds);

            ApiResponse.success(res, 200, "Recibos verificados", { receipts });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new UserController();
