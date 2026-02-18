// models/paymentModel.js
import BaseModel from './baseModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Payment.
 */
class PaymentModel extends BaseModel {
    constructor() {
        super('payments');
        this.softDelete = false;

        this.joins = [
            { table: "users", alias: "u", on: ["payments.user_id", "u.id"] },
            { table: "plans", alias: "p", on: ["payments.plan_id", "p.id"] }
        ];

        this.selectFields = [
            "payments.*",
            "p.name as plan_name",
            "u.first_name as user_first_name",
            "u.last_name as user_last_name",
            "u.email as user_email"
        ];

        this.searchFields = ["p.name", "u.first_name", "u.last_name"];

    }

    /**
     * Obtiene los detalles de un pago para el Drawer, transformando los datos.
     */
    async findByIdDetails(id) {
        const payment = await this.knex(this.tableName)
            .select(
                'payments.*',
                'users.first_name',
                'users.last_name',
                'users.email as user_email',
                'plans.name as plan_name',
                'user_plan.start_date as user_plan_start_date',
                'user_plan.end_date as user_plan_end_date'
            )
            .leftJoin('users', 'payments.user_id', 'users.id')
            .leftJoin('plans', 'payments.plan_id', 'plans.id')
            .leftJoin('user_plan', 'payments.id', 'user_plan.payment_id')
            .where('payments.id', id)
            .first();

        if (!payment) return null;

        return this._transformToViewModel(payment);
    }

    _transformToViewModel(data) {
        const toISO = (d) => d ? new Date(d).toISOString() : null;
        const toYMD = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

        return {
            id: data.id,
            amount: parseFloat(data.amount || 0),
            original_amount: parseFloat(data.original_amount || 0),
            payment_method: (data.payment_method || '').toLowerCase(),
            status: (data.status || '').toLowerCase(),
            payment_date: toYMD(data.payment_date),
            notes: data.notes || '',
            created_at: toISO(data.created_at),

            user: {
                id: data.user_id,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.user_email,
                full_name: `${data.first_name} ${data.last_name}`.trim()
            },

            plan: {
                id: data.plan_id,
                name: data.plan_name,
                start_date: toYMD(data.user_plan_start_date),
                end_date: toYMD(data.user_plan_end_date)
            },

            discount: {
                type: data.discount_type,
                value: parseFloat(data.discount_value || 0),
                notes: data.discount_notes
            }
        };
    }
}

export default new PaymentModel();
