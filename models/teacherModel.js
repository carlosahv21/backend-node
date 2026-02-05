// models/teacherModel.js
import { UserModel } from './userModel.js';

/**
 * DAL para Teacher optimizado para la vista de Dashboard Mobile.
 */
class TeacherModel extends UserModel {
    constructor() {
        super();
    }

    async findByIdDetails(id) {
        const db = this.knex;

        // 1. Datos base del perfil
        const teacher = await db('users as u')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .where('u.id', id)
            .where('u.role_id', 3)
            .select(
                'u.id', 'u.first_name', 'u.last_name', 'u.email', 
                'u.email_verified', 'r.name as role_name'
            )
            .first();

        if (!teacher) return null;

        const [stats, classes, payments] = await Promise.all([
            // Estadísticas (Simuladas según la UI: Clases, Rating, Alumnos)
            this._getTeacherStats(id),
            // Clases de la semana
            db('classes')
                .where('teacher_id', id)
                .select('id', 'name', 'date', 'hour', 'duration', 'genre')
                .orderBy('date', 'asc')
                .limit(5),
            // Resumen de Pagos (Basado en la tabla payments de tu esquema)
            this._getPaymentSummary(id)
        ]);

        return this._transformToDetailedModel(teacher, stats, classes, payments);
    }

    async _getTeacherStats(id) {
        const db = this.knex;
        // Total de clases asignadas
        const classesCount = await db('classes').where('teacher_id', id).count('id as total');
        // Total de alumnos únicos en sus clases (vía user_class)
        const studentsCount = await db('user_class as uc')
            .join('classes as c', 'uc.class_id', 'c.id')
            .where('c.teacher_id', id)
            .countDistinct('uc.user_id as total');

        return {
            classes: classesCount[0].total || 0,
            rating: 4.9, // Valor estático por ahora o de tabla de reviews
            students: studentsCount[0].total || 0
        };
    }

    async _getPaymentSummary(id) {
        const db = this.knex;
        const currentMonth = new Date().getMonth() + 1;
        
        const paidThisMonth = await db('payments')
            .where('user_id', id)
                .andWhereRaw('MONTH(payment_date) = ?', [currentMonth])
            .sum('amount as total');

        return {
            to_pay: 420.00, // Lógica pendiente según tu sistema de nómina
            paid_current_month: parseFloat(paidThisMonth[0].total || 0),
            next_cutoff: '2026-10-30'
        };
    }

    _transformToDetailedModel(teacher, stats, classes, payments) {
        return {
            header: {
                id: teacher.id,
                full_name: `${teacher.first_name} ${teacher.last_name}`,
                role_label: teacher.role_name,
                email: teacher.email
            },
            stats: {
                classes_count: stats.classes,
                rating: stats.rating,
                students_count: stats.students
            },
            payment_summary: {
                pending_amount: payments.to_pay,
                paid_amount: payments.paid_current_month,
                next_cutoff_date: payments.next_cutoff
            },
            weekly_classes: classes.map(c => ({
                id: c.id,
                name: c.name,
                genre: c.genre,
                schedule: `${c.date} • ${c.hour}`,
                duration: `${c.duration} min`,
                location: "Sala A"
            }))
        };
    }
}

export default new TeacherModel();