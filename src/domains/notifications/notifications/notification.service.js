import notificationRepository from './notification.repository.js';

class NotificationService {
    async getNotificationsByUser(userId, userRole, queryParams) {
        return notificationRepository.getByUser(userId, userRole, queryParams);
    }

    async markAsRead(notificationId, userId) {
        return notificationRepository.markAsRead(notificationId, userId);
    }

    async markAllAsRead(userId, userRole) {
        return notificationRepository.markAllAsRead(userId, userRole);
    }

    async deleteByUser(notificationId, userId) {
        return notificationRepository.deleteByUser(notificationId, userId);
    }

    async createNotification(data) {
        return notificationRepository.create(data);
    }
}

export default new NotificationService();