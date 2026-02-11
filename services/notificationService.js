import { Expo } from 'expo-server-sdk';
import notificationModel from '../models/notificationModel.js';

const expo = new Expo();

class NotificationService {
    // ============================================================
    // DATABASE OPERATIONS
    // ============================================================

    /**
     * Creates a notification in the database
     * @param {object} data - Notification data (user_id, role_target, category, title, message, etc.)
     * @returns {Promise<object>} Created notification
     */
    async createNotification(data) {
        const notification = await notificationModel.create(data);

        // TODO: Send push notification via sendPushNotification() if user has token
        // Future enhancement: Look up user's push_token and call:
        // if (data.user_id && userToken) {
        //     await this.sendPushNotification(userToken, data.title, data.message, { notification_id: notification.id });
        // }

        return notification;
    }

    /**
     * Get all notifications for a specific user
     * @param {number} userId - User ID
     * @param {string} userRole - User's role (ADMIN, STUDENT, TEACHER, RECEPTIONIST)
     * @param {object} queryParams - Filters (page, limit, is_read, category)
     * @returns {Promise<object>} Paginated notifications
     */
    async getUserNotifications(userId, userRole, queryParams = {}) {
        return notificationModel.getByUser(userId, userRole, queryParams);
    }

    /**
     * Mark a single notification as read
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {Promise<object>} Updated notification
     */
    async markNotificationAsRead(notificationId, userId) {
        return notificationModel.markAsRead(notificationId, userId);
    }

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     * @param {string} userRole - User's role
     * @returns {Promise<number>} Number of notifications updated
     */
    async markAllNotificationsAsRead(userId, userRole) {
        return notificationModel.markAllAsRead(userId, userRole);
    }

    /**
     * Soft delete a notification
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {Promise<object>} Deleted notification
     */
    async deleteNotification(notificationId, userId) {
        return notificationModel.softDelete(notificationId, userId);
    }

    /**
     * Central method to notify a specific user
     * Creates notification in DB and sends push notification if user has token
     * @param {number} userId - User ID to notify
     * @param {object} options - { title, message, category, related_entity_id, deep_link }
     * @returns {Promise<object>} Created notification
     */
    async notifyUser(userId, { title, message, category, related_entity_id = null, deep_link = null }) {
        try {
            // 1. Create notification in database
            const notificationData = {
                user_id: userId,
                title,
                message,
                category: category.toUpperCase(),
                related_entity_id,
                deep_link
            };

            const notification = await notificationModel.create(notificationData);

            // 2. Try to send push notification
            try {
                // Get user's push token from database
                const user = await notificationModel.knex('users')
                    .where('id', userId)
                    .select('expo_push_token', 'first_name')
                    .first();

                if (user && user.expo_push_token) {
                    // Send push notification asynchronously (don't block on failure)
                    this.sendPushNotification(
                        user.expo_push_token,
                        title,
                        message,
                        {
                            notification_id: notification.id,
                            category,
                            deep_link
                        }
                    ).catch(error => {
                        console.error(`⚠️ Failed to send push notification to user ${userId}:`, error.message);
                        // Don't throw - DB notification was created successfully
                    });
                }
            } catch (pushError) {
                console.error(`⚠️ Error fetching push token for user ${userId}:`, pushError.message);
                // Continue - DB notification was created successfully
            }

            return notification;
        } catch (error) {
            console.error('❌ Error in notifyUser:', error);
            throw error; // Re-throw to let caller handle
        }
    }

    /**
     * Notify all users with a specific role (broadcast)
     * @param {string} role - Role to notify (ADMIN, STUDENT, TEACHER, RECEPTIONIST)
     * @param {object} options - { title, message, category, related_entity_id, deep_link }
     * @returns {Promise<object>} Created notification
     */
    async notifyRole(role, { title, message, category, related_entity_id = null, deep_link = null }) {
        try {
            // Create a single role-targeted notification
            const notificationData = {
                role_target: role.toUpperCase(),
                title,
                message,
                category: category.toUpperCase(),
                related_entity_id,
                deep_link
            };

            const notification = await notificationModel.create(notificationData);

            // Get all users with this role and send push notifications
            try {
                const users = await notificationModel.knex('users')
                    .join('roles', 'users.role_id', 'roles.id')
                    .where('roles.name', role.toUpperCase())
                    .whereNotNull('users.expo_push_token')
                    .select('users.expo_push_token');

                // Send push to all users with tokens (async, non-blocking)
                users.forEach(user => {
                    this.sendPushNotification(
                        user.expo_push_token,
                        title,
                        message,
                        {
                            notification_id: notification.id,
                            category,
                            deep_link
                        }
                    ).catch(error => {
                        console.error(`⚠️ Failed to send push to role ${role}:`, error.message);
                    });
                });
            } catch (pushError) {
                console.error(`⚠️ Error sending push notifications to role ${role}:`, pushError.message);
                // Continue - DB notification was created successfully
            }

            return notification;
        } catch (error) {
            console.error('❌ Error in notifyRole:', error);
            throw error;
        }
    }

    // ============================================================
    // PUSH NOTIFICATION OPERATIONS (Expo)
    // ============================================================

    /**
     * Envía una notificación push a un token específico
     */
    async sendPushNotification(targetToken, title, body, data = {}) {
        // 1. Validar que el token sea un formato válido de Expo
        if (!Expo.isExpoPushToken(targetToken)) {
            console.error(`❌ Push token ${targetToken} no es válido`);
            return { error: 'Token inválido' };
        }

        console.log('📤 Enviando notificación push:');
        console.log('  Token:', targetToken);
        console.log('  Título:', title);
        console.log('  Mensaje:', body);
        console.log('  Data:', JSON.stringify(data));

        // 2. Crear la estructura del mensaje
        const messages = [{
            to: targetToken,
            sound: 'default',
            title: title,
            body: body,
            data: data, // Metadatos útiles para la app (ej. { screen: 'Clases' })
            priority: 'high',
            channelId: 'default', // Para Android
        }];

        // 3. Expo recomienda enviar los mensajes en "chunks" (trozos) 
        // para optimizar el rendimiento del servidor
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log('✅ Tickets recibidos:', JSON.stringify(ticketChunk, null, 2));
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('❌ Error enviando chunk de notificaciones:', error);
                return { error: error.message };
            }
        }
        return tickets;
    }

    /**
     * Verifica el estado de entrega de las notificaciones usando los IDs de los tickets
     * @param {Array<string>} ticketIds - Array de IDs de tickets obtenidos al enviar notificaciones
     * @returns {Promise} - Recibos con el estado de cada notificación
     */
    async checkNotificationReceipts(ticketIds) {
        try {
            console.log('🔍 Verificando recibos para tickets:', ticketIds);

            const receiptIdChunks = expo.chunkPushNotificationReceiptIds(ticketIds);
            const receipts = [];

            for (const chunk of receiptIdChunks) {
                try {
                    const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
                    console.log('📨 Recibos obtenidos:', JSON.stringify(receiptChunk, null, 2));
                    receipts.push(receiptChunk);

                    // Analizar y loggear errores
                    for (const receiptId in receiptChunk) {
                        const receipt = receiptChunk[receiptId];
                        if (receipt.status === 'error') {
                            console.error(`❌ Error en notificación ${receiptId}:`, receipt.message);
                            if (receipt.details && receipt.details.error) {
                                console.error('   Detalles:', receipt.details.error);
                            }
                        } else if (receipt.status === 'ok') {
                            console.log(`✅ Notificación ${receiptId} entregada exitosamente`);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error obteniendo recibos:', error);
                }
            }

            return receipts;
        } catch (error) {
            console.error('❌ Error verificando recibos:', error);
            return { error: error.message };
        }
    }
}

export default new NotificationService();
