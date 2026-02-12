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
        // Join with interactions table to get read/deleted status for this specific user
        let query = this.knex('notifications as n')
            .leftJoin('user_notifications_interactions as uni', function () {
                this.on('n.id', '=', 'uni.notification_id')
                    .andOn('uni.user_id', '=', knex.raw('?', [userId]));
            })
            // Filter out deleted notifications for this user
            .where(function () {
                this.whereNull('uni.is_deleted')
                    .orWhere('uni.is_deleted', false);
            })
            // Filter by user ownership or role
            .where(function () {
                this.where('n.user_id', userId)
                    .orWhere('n.role_target', userRole.toUpperCase());
            });

        // Apply filters
        if (is_read !== undefined) {
            const isReadBool = is_read === 'true' || is_read === true;
            if (isReadBool) {
                // Read = has interaction record AND is_read=true
                query = query.where('uni.is_read', true);
            } else {
                // Unread = no interaction record OR is_read=false
                query = query.where(function () {
                    this.whereNull('uni.is_read')
                        .orWhere('uni.is_read', false);
                });
            }
        }

        if (category) {
            query = query.where('n.category', category.toUpperCase());
        }

        // Order by newest first
        query = query.orderBy('n.created_at', 'desc');

        // Get total count
        const totalQuery = query.clone();
        // Clear select and order for count
        totalQuery.clearSelect().clearOrder();
        const totalRes = await totalQuery.count('* as count').first();
        const total = parseInt(totalRes.count || 0);

        // Get paginated results
        // Select logic: n.*, and is_read from interaction (default false)
        const results = await query
            .limit(limit)
            .offset((page - 1) * limit)
            .select('n.*', knex.raw('COALESCE(uni.is_read, 0) as is_read'));

        // Convert is_read to boolean because MySQL returns 0/1
        const formattedResults = results.map(row => ({
            ...row,
            is_read: !!row.is_read
        }));

        return {
            data: formattedResults,
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
        // Verify existence and access rights
        await this._verifyAccess(notificationId, userId);

        // UPSERT into interactions table
        await this.knex('user_notifications_interactions')
            .insert({
                user_id: userId,
                notification_id: notificationId,
                is_read: true,
                updated_at: this.knex.fn.now()
            })
            .onConflict(['user_id', 'notification_id'])
            .merge({
                is_read: true,
                updated_at: this.knex.fn.now()
            });

        // Return updated notification with read status
        const notification = await this.knex('notifications').where({ id: notificationId }).first();
        return { ...notification, is_read: true };
    }

    /**
     * Mark all notifications as read for a user
     * Upserts interaction records for all unread notifications visible to user
     * @param {number} userId - User ID
     * @param {string} userRole - User's role
     * @returns {Promise<number>} Number of notifications updated
     */
    async markAllAsRead(userId, userRole) {
        // We use INSERT INTO ... SELECT ... ON DUPLICATE KEY UPDATE to handle both new and existing interactions efficiently

        // 1. Find all relevant notifications
        // 2. Insert/Update interaction record setting is_read = true

        const query = `
            INSERT INTO user_notifications_interactions (user_id, notification_id, is_read, created_at, updated_at)
            SELECT ?, n.id, true, NOW(), NOW()
            FROM notifications n
            WHERE (n.user_id = ? OR n.role_target = ?)
            AND n.id NOT IN (
                SELECT notification_id FROM user_notifications_interactions 
                WHERE user_id = ? AND is_read = true AND (is_deleted IS NULL OR is_deleted = false)
            )
            ON DUPLICATE KEY UPDATE is_read = true, updated_at = NOW()
        `;

        const result = await this.knex.raw(query, [userId, userId, userRole.toUpperCase(), userId]);

        // result[0].affectedRows typically contains count of affected rows in mysql2
        return result[0] ? result[0].affectedRows : 0;
    }

    /**
     * Soft delete a notification (per user)
     * Creates/Updates interaction record to mark as deleted
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID (for validation)
     * @returns {Promise<boolean>} Success
     */
    async deleteByUser(notificationId, userId) {

        // Verify existence and access rights
        await this._verifyAccess(notificationId, userId);

        // UPSERT into interactions table
        await this.knex('user_notifications_interactions')
            .insert({
                user_id: userId,
                notification_id: notificationId,
                is_deleted: true,
                deleted_at: this.knex.fn.now(),
                updated_at: this.knex.fn.now()
            })
            .onConflict(['user_id', 'notification_id'])
            .merge({
                is_deleted: true,
                deleted_at: this.knex.fn.now(),
                updated_at: this.knex.fn.now()
            });

        return true;
    }

    /**
     * Create an initial interaction record
     * Used when creating a personal notification
     * @param {number} userId
     * @param {number} notificationId
     */
    async createInteraction(userId, notificationId) {
        await this.knex('user_notifications_interactions').insert({
            user_id: userId,
            notification_id: notificationId,
            is_read: false,
            is_deleted: false
        });
    }

    /**
     * Helper to verify if user has access to notification
     * @private
     */
    async _verifyAccess(notificationId, userId) {
        const notification = await this.knex('notifications')
            .where({ id: notificationId })
            .first();

        if (!notification) {
            throw new AppError('Notificación no encontrada', 404);
        }

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

        return notification;
    }
}

export default new NotificationModel();
