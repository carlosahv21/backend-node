import { Expo } from 'expo-server-sdk';

const expo = new Expo();

class NotificationService {
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