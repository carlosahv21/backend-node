// services/paymentService.js
import PaymentModel from '../models/paymentModel.js';
import knex from '../config/knex.js';
import AppError from '../utils/AppError.js';
import notificationService from './notificationService.js';

class PaymentService {
    async getAllPayments(query) {
        return PaymentModel.findAll(query);
    }

    async getPaymentById(id) {
        return PaymentModel.findById(id);
    }

    async getPaymentDetails(id) {
        return PaymentModel.findByIdDetails(id);
    }

    async createPayment(data) {
        return await knex.transaction(async (trx) => {
            try {
                const plan = await trx('plans').where('id', data.plan_id).first();
                if (!plan) throw new AppError("Plan not found");

                // Manejar payment_date si viene como un array [startDate, endDate]
                let manualEndDate = null;
                if (Array.isArray(data.payment_date) && data.payment_date.length >= 2) {
                    manualEndDate = new Date(data.payment_date[1]);
                    data.payment_date = data.payment_date[0]; // Normalizar para la tabla payments
                }

                const [paymentId] = await trx('payments').insert(data);
                const payment = { ...data, id: paymentId };

                //falta condicion de solo insertar plan si el pago fue completado

                const currentPlan = await trx('user_plan')
                    .where('user_id', data.user_id)
                    .orderBy('end_date', 'desc')
                    .first();

                let startDate = new Date();
                if (currentPlan && new Date(currentPlan.end_date) > new Date()) {
                    startDate = new Date(currentPlan.end_date);
                } else if (data.payment_date) {
                    startDate = new Date(data.payment_date);
                }

                let endDate = manualEndDate || new Date(startDate);
                if (!manualEndDate) {
                    endDate.setDate(endDate.getDate() + 30);
                }

                const maxClasses = plan.max_sessions || 0;
                await trx('user_plan').insert({
                    user_id: data.user_id,
                    plan_id: data.plan_id,
                    payment_id: paymentId,
                    status: 'active',
                    start_date: startDate,
                    end_date: endDate,
                    max_classes: maxClasses,
                    classes_used: 0,
                    classes_remaining: maxClasses === 0 ? 9999 : maxClasses,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                await trx('user_registration_history').insert({
                    user_id: data.user_id,
                    plan_id: data.plan_id,
                    payment_id: paymentId,
                    action_type: 'renewal',
                    previous_plan_id: currentPlan ? currentPlan.plan_id : null,
                    classes_purchased: maxClasses,
                    classes_used: 0,
                    start_date: startDate,
                    end_date: endDate,
                    status: 'active',
                    created_at: new Date()
                });

                // NOTIFICATIONS: Notify student and admin/receptionist about payment
                try {
                    const user = await trx('users').where('id', data.user_id).select('first_name', 'last_name').first();
                    const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuario';
                    const endDateStr = endDate.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });

                    // Notify student about payment confirmation
                    await notificationService.notifyUser(data.user_id, {
                        title: '¡Pago Recibido!',
                        message: `Tu acceso a ${plan.name} ha sido renovado. Válido hasta ${endDateStr}.`,
                        category: 'PAYMENT',
                        related_entity_id: paymentId,
                        deep_link: `/payments/${paymentId}`
                    });

                    // Notify admin about revenue
                    await notificationService.notifyRole('ADMIN', {
                        title: 'Pago Registrado',
                        message: `Se ha recibido un pago de $${data.amount || 0} de ${userName}.`,
                        category: 'PAYMENT',
                        related_entity_id: paymentId,
                        deep_link: `/payments/${paymentId}`
                    });

                    // Notify receptionist about revenue
                    await notificationService.notifyRole('RECEPTIONIST', {
                        title: 'Pago Registrado',
                        message: `Se ha recibido un pago de $${data.amount || 0} de ${userName}.`,
                        category: 'PAYMENT',
                        related_entity_id: paymentId,
                        deep_link: `/payments/${paymentId}`
                    });
                } catch (notifError) {
                    console.error('⚠️ Error sending payment notifications:', notifError.message);
                    // Don't block payment if notifications fail
                }

                return payment;
            } catch (error) {
                throw new AppError("Error processing payment", 500);
            }
        });
    }

    async updatePayment(id, data) {
        return PaymentModel.update(id, data);
    }

    async deletePayment(id) {
        return PaymentModel.delete(id);
    }

    async restorePayment(id) {
        return PaymentModel.restore(id);
    }
}

export default new PaymentService();
