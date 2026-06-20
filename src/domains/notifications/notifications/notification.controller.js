import notificationService from './notification.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class NotificationController {
    async getByUser(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const result = await notificationService.getNotificationsByUser(userId, userRole, req.query);
            ApiResponse.success(res, 200, "Notificaciones obtenidas correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await notificationService.markAsRead(id, userId);
            ApiResponse.success(res, 200, "Notificación marcada como leída", result);
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const count = await notificationService.markAllAsRead(userId, userRole);
            ApiResponse.success(res, 200, `${count} notificaciones marcadas como leídas`, { count });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await notificationService.deleteByUser(id, userId);
            ApiResponse.success(res, 200, "Notificación eliminada correctamente");
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newNotification = await notificationService.createNotification(req.body);
            ApiResponse.success(res, 201, "Notificación creada correctamente", newNotification);
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();