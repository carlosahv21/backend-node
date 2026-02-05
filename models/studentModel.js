// models/studentModel.js
import { UserModel } from './userModel.js';

/**
 * Capa de Acceso a Datos (DAL) optimizada para la entidad Student.
 */
class StudentModel extends UserModel {
    constructor() {
        super();
    }

    /**
     * Obtiene los detalles mediante un solo JOIN eficiente.
     */
    async findByIdDetails(id) {
        // Guardamos la referencia a knex para usarla dentro de los callbacks
        const db = this.knex;

        const student = await db('users as u')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .leftJoin('user_plan as up', function() {
                // Seleccionamos solo el plan más reciente para el usuario
                this.on('u.id', '=', 'up.user_id')
                    .andOn('up.id', '=', db.select('id')
                        .from('user_plan')
                        .whereRaw('user_id = u.id')
                        .orderBy('created_at', 'desc')
                        .limit(1)
                    );
            })
            .leftJoin('plans as p', 'up.plan_id', 'p.id')
            .where('u.id', id)
            .select(
                'u.id',
                'u.first_name',
                'u.last_name',
                'u.email',
                'u.email_verified',
                'u.last_login',
                'u.created_at',
                'r.name as role_name',
                'p.id as plan_id',
                'p.name as plan_name',
                'p.description as plan_description',
                'p.price as plan_price',
                'up.status as plan_status',
                'up.classes_used',
                'up.classes_remaining',
                'up.start_date as plan_start_date',
                'up.end_date as plan_end_date'
            )
            .first();
        
        if (!student) return null;

        return this._transformToLeanModel(student);
    }

    /**
     * Transforma los datos crudos a un formato limpio para el frontend.
     */
    _transformToLeanModel(data) {
        const toISO = (d) => d ? new Date(d).toISOString() : null;
        const toYMD = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

        return {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            role: (data.role_name || 'student').toLowerCase(),
            email_verified: Boolean(data.email_verified),
            last_login: toISO(data.last_login),
            created_at: toISO(data.created_at),
            
            plan: data.plan_id ? {
                id: data.plan_id,
                name: data.plan_name,
                description: data.plan_description,
                price: parseFloat(data.plan_price || 0),
                status: data.plan_status?.toLowerCase() || 'inactive',
                classes_used: data.classes_used || 0,
                classes_total: (data.classes_used || 0) + (data.classes_remaining || 0),
                start_date: toYMD(data.plan_start_date),
                end_date: toYMD(data.plan_end_date)
            } : null
        };
    }
}

export default new StudentModel();