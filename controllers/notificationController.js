// controllers/notificationController.js
import notificationService from '../services/notificationService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 * All routes require authentication (userId extracted from JWT token)
 */
class NotificationController {
    /**
     * Get all notifications for the authenticated user
     * GET /api/notifications?page=1&limit=10&is_read=false&category=CLASS
     */
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role || 'STUDENT'; // Extract role from JWT token

            const result = await notificationService.getUserNotifications(
                userId,
                userRole,
                req.query
            );

            ApiResponse.success(
                res,
                200,
                'Notificaciones obtenidas correctamente',
                result
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Mark notification(s) as read
     * PATCH /api/notifications/read/:id? (id is optional)
     * If id provided: marks single notification as read
     * If no id: marks all user's notifications as read
     */
    async markAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role || 'STUDENT';
            const { id } = req.params;

            if (id) {
                // Mark single notification as read
                const notification = await notificationService.markNotificationAsRead(
                    parseInt(id),
                    userId
                );

                ApiResponse.success(
                    res,
                    200,
                    'Notificación marcada como leída',
                    notification
                );
            } else {
                // Mark all notifications as read
                const count = await notificationService.markAllNotificationsAsRead(
                    userId,
                    userRole
                );

                ApiResponse.success(
                    res,
                    200,
                    `${count} notificaciones marcadas como leídas`,
                    { updated_count: count }
                );
            }
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Delete a notification (soft delete)
     * DELETE /api/notifications/:id
     */
    async deleteNotification(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            if (!id) {
                return ApiResponse.error(
                    res,
                    400,
                    'ID de notificación es requerido'
                );
            }

            const notification = await notificationService.deleteNotification(
                parseInt(id),
                userId
            );

            ApiResponse.success(
                res,
                200,
                'Notificación eliminada correctamente',
                notification
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new NotificationController();
