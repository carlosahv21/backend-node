// services/paymentService.js
import PaymentModel from '../models/paymentModel.js';
import knex from '../config/knex.js';
import AppError from '../utils/AppError.js';

class PaymentService {
    async getAll(query) {
        return PaymentModel.findAll(query);
    }

    async getById(id) {
        return PaymentModel.findById(id);
    }

    async getDetails(id) {
        return PaymentModel.findByIdDetails(id);
    }

    async create(data) {
        return await knex.transaction(async (trx) => {
            try {
                const plan = await trx('plans').where('id', data.plan_id).first();
                if (!plan) throw new AppError("Plan not found");

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

                let endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 30);

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

                return payment;
            } catch (error) {
                throw new AppError("Error processing payment", 500);
            }
        });
    }

    async update(id, data) {
        return PaymentModel.update(id, data);
    }

    async delete(id) {
        return PaymentModel.delete(id);
    }

    async bin(id) {
        return PaymentModel.bin(id);
    }

    async restore(id) {
        return PaymentModel.restore(id);
    }
}

export default new PaymentService();
