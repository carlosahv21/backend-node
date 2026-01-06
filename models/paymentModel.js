// models/paymentModel.js
import BaseModel from './baseModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Payment.
 */
class PaymentModel extends BaseModel {
    constructor() {
        super('payments');
        
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

    _transformToViewModel(apiData) {
        const capitalize = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';

        const formatCurrency = (value) => {
            return isNaN(parseFloat(value)) ? value : `$${parseFloat(value).toFixed(2)}`;
        };

        const formatDate = (date) => {
            if (!date) return '-';
            return new Date(date).toISOString().split('T')[0];
        };

        return {
            title: `Pago #${apiData.id}`,
            sections: [
                {
                    label: "Información del Usuario",
                    items: [
                        { name: "Nombre", value: `${apiData.first_name} ${apiData.last_name}` },
                        { name: "Email", value: apiData.user_email },
                        { name: "Plan", value: apiData.plan_name },
                    ]
                },
                {
                    label: "Detalles del Pago",
                    items: [
                        { name: "Monto", value: formatCurrency(apiData.amount) },
                        { name: "Método", value: capitalize(apiData.payment_method) },
                        { name: "Estado del Pago", value: capitalize(apiData.status) },
                        { name: "Fecha del Pago", value: formatDate(apiData.payment_date) },
                    ]
                },
                {
                    label: "Información Adicional",
                    items: [
                        { name: "Notas", value: apiData.notes || '-' },
                        { name: "Fecha de Inicio", value: formatDate(apiData.user_plan_start_date) },
                        { name: "Fecha de Finalización", value: formatDate(apiData.user_plan_end_date) },
                    ]
                }
            ]
        };
    }
}

export default new PaymentModel();
