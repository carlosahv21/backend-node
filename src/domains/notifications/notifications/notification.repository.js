import BaseModel from "../../../shared/models/baseModel.js";
import knex from "../../../config/knex.js";
import AppError from "../../../shared/utils/AppError.js";

class NotificationRepository extends BaseModel {
    constructor() {
        super('notifications');
        this.softDelete = true;
        this.searchFields = ['notifications.title', 'notifications.message'];
    }

    async getByUser(userId, userRole, queryParams = {}) {
        const { page = 1, limit = 10, is_read, category, ...otherParams } = queryParams;

        let query = this._applyTenantFilter(this.knex('notifications as n'), 'n')
            .leftJoin('user_notifications_interactions as uni', function () {
                this.on('n.id', '=', 'uni.notification_id').andOn('uni.user_id', '=', knex.raw('?', [userId]));
            })
            .where(function () {
                this.whereNull('uni.is_deleted').orWhere('uni.is_deleted', false);
            })
            .where(function () {
                this.where('n.user_id', userId).orWhere('n.role_target', userRole.toUpperCase());
            });

        if (is_read !== undefined) {
            const isReadBool = is_read === 'true' || is_read === true;
            if (isReadBool) {
                query = query.where('uni.is_read', true);
            } else {
                query = query.where(function () {
                    this.whereNull('uni.is_read').orWhere('uni.is_read', false);
                });
            }
        }

        if (category) {
            query = query.where('n.category', category.toUpperCase());
        }

        query = query.orderBy('n.created_at', 'desc');

        const totalQuery = query.clone();
        totalQuery.clearSelect().clearOrder();
        const totalRes = await totalQuery.count('* as count').first();
        const total = parseInt(totalRes.count || 0);

        const results = await query.limit(limit).offset((page - 1) * limit).select('n.*', knex.raw('COALESCE(uni.is_read, false) as is_read'));

        const formattedResults = results.map(row => ({ ...row, is_read: !!row.is_read }));

        return { data: formattedResults, total, page: parseInt(page), limit: parseInt(limit) };
    }

    async markAsRead(notificationId, userId) {
        await this._verifyAccess(notificationId, userId);

        await this.knex('user_notifications_interactions').insert({
            user_id: userId, notification_id: notificationId, is_read: true, updated_at: this.knex.fn.now()
        }).onConflict(['user_id', 'notification_id']).merge({ is_read: true, updated_at: this.knex.fn.now() });

        const notification = await this._applyTenantFilter(this.knex('notifications')).where({ id: notificationId }).first();
        return { ...notification, is_read: true };
    }

    async markAllAsRead(userId, userRole) {
        const query = `INSERT INTO user_notifications_interactions (user_id, notification_id, is_read, created_at, updated_at)
            SELECT ?, n.id, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM notifications n
            WHERE (n.user_id = ? OR n.role_target = ?) AND n.academy_id = ?
            AND n.id NOT IN (SELECT notification_id FROM user_notifications_interactions WHERE user_id = ? AND is_read = true AND (is_deleted IS NULL OR is_deleted = false))
            ON CONFLICT (user_id, notification_id) DO UPDATE SET is_read = true, updated_at = CURRENT_TIMESTAMP`;

        const tenantId = this._getTenantId();
        const result = await this.knex.raw(query, [userId, userId, userRole.toUpperCase(), tenantId, userId]);
        return result.rowCount || 0;
    }

    async deleteByUser(notificationId, userId) {
        await this._verifyAccess(notificationId, userId);

        await this.knex('user_notifications_interactions').insert({
            user_id: userId, notification_id: notificationId, is_deleted: true, deleted_at: this.knex.fn.now(), updated_at: this.knex.fn.now()
        }).onConflict(['user_id', 'notification_id']).merge({
            is_deleted: true, deleted_at: this.knex.fn.now(), updated_at: this.knex.fn.now()
        });
        return true;
    }

    async createInteraction(userId, notificationId) {
        await this.knex('user_notifications_interactions').insert({
            user_id: userId, notification_id: notificationId, is_read: false, is_deleted: false
        });
    }

    async _verifyAccess(notificationId, userId) {
        const notification = await this._applyTenantFilter(this.knex('notifications')).where({ id: notificationId }).first();
        if (!notification) throw new AppError('Notificación no encontrada', 404);

        const user = await this.knex('users').join('roles', 'users.role_id', 'roles.id').where('users.id', userId).select('roles.name as role_name').first();
        const canAccess = notification.user_id === userId || notification.role_target === user.role_name.toUpperCase();
        if (!canAccess) throw new AppError('No tienes permiso para acceder a esta notificación', 403);
        return notification;
    }
}

export default new NotificationRepository();