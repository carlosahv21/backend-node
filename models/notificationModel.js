// models/notificationModel.js
import BaseModel from './baseModel.js';
import knex from '../config/knex.js';
import AppError from '../utils/AppError.js';

/**
 * Notification Model
 * Handles database operations for notifications with user-specific and role-based targeting
 */
class NotificationModel extends BaseModel {
    constructor() {
        super('notifications');
        this.softDelete = true;
        this.searchFields = ['notifications.title', 'notifications.message'];
    }

    /**
     * Get notifications for a specific user
     * Matches notifications where user_id = userId OR role_target matches user's role
     * @param {number} userId - The user's ID
     * @param {string} userRole - The user's role (ADMIN, STUDENT, TEACHER, RECEPTIONIST)
     * @param {object} queryParams - Filters and pagination (page, limit, is_read, category)
     * @returns {Promise<object>} Paginated notifications
     */
    async getByUser(userId, userRole, queryParams = {}) {
        const { page = 1, limit = 10, is_read, category, ...otherParams } = queryParams;

        // Build base query
        let query = this.knex('notifications')
            .whereNull('deleted_at')
            .where(function () {
                this.where('user_id', userId)
                    .orWhere('role_target', userRole.toUpperCase());
            });

        // Apply filters
        if (is_read !== undefined) {
            const isReadBool = is_read === 'true' || is_read === true;
            query = query.where('is_read', isReadBool);
        }

        if (category) {
            query = query.where('category', category.toUpperCase());
        }

        // Order by newest first
        query = query.orderBy('created_at', 'desc');

        // Get total count
        const totalQuery = query.clone();
        const totalRes = await totalQuery.count('* as count').first();
        const total = parseInt(totalRes.count);

        // Get paginated results
        const results = await query
            .limit(limit)
            .offset((page - 1) * limit)
            .select('*');

        return {
            data: results,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }

    /**
     * Mark a single notification as read
     * Validates that the notification belongs to the user before updating
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID (for validation)
     * @returns {Promise<object>} Updated notification
     */
    async markAsRead(notificationId, userId) {
        // First, verify the notification exists and belongs to the user
        const notification = await this.knex('notifications')
            .where({ id: notificationId })
            .whereNull('deleted_at')
            .first();

        if (!notification) {
            throw new AppError('Notificación no encontrada', 404);
        }

        // Verify ownership (either direct user_id match or role-based)
        const user = await this.knex('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', userId)
            .select('roles.name as role_name')
            .first();

        const canAccess = notification.user_id === userId ||
            notification.role_target === user.role_name.toUpperCase();

        if (!canAccess) {
            throw new AppError('No tienes permiso para acceder a esta notificación', 403);
        }

        // Update to read
        await this.knex('notifications')
            .where({ id: notificationId })
            .update({ is_read: true });

        return this.knex('notifications').where({ id: notificationId }).first();
    }

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     * @param {string} userRole - User's role
     * @returns {Promise<number>} Number of notifications updated
     */
    async markAllAsRead(userId, userRole) {
        const updatedCount = await this.knex('notifications')
            .whereNull('deleted_at')
            .where('is_read', false)
            .where(function () {
                this.where('user_id', userId)
                    .orWhere('role_target', userRole.toUpperCase());
            })
            .update({ is_read: true });

        return updatedCount;
    }

    /**
     * Soft delete a notification
     * Validates ownership before deletion
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID (for validation)
     * @returns {Promise<object>} Deleted notification
     */
    async softDelete(notificationId, userId) {
        // Verify the notification exists and belongs to the user
        const notification = await this.knex('notifications')
            .where({ id: notificationId })
            .whereNull('deleted_at')
            .first();

        if (!notification) {
            throw new AppError('Notificación no encontrada', 404);
        }

        // Verify ownership
        const user = await this.knex('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', userId)
            .select('roles.name as role_name')
            .first();

        const canAccess = notification.user_id === userId ||
            notification.role_target === user.role_name.toUpperCase();

        if (!canAccess) {
            throw new AppError('No tienes permiso para eliminar esta notificación', 403);
        }

        // Soft delete
        await this.knex('notifications')
            .where({ id: notificationId })
            .update({ deleted_at: this.knex.fn.now() });

        return this.knex('notifications').where({ id: notificationId }).first();
    }
}

export default new NotificationModel();
