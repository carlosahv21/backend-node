// models/reportsModel.js

import BaseModel from './baseModel.js';

class ReportsModel extends BaseModel {

    constructor() {
        super();
        const today = new Date();

        // Primer y último día del mes (para MySQL)
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        this.start_date = firstDay.toISOString().split('T')[0];
        this.end_date = lastDay.toISOString().split('T')[0];
        this.todayDate = today.toLocaleDateString('en-US', { weekday: 'long' });
    }

    /**
     * Indicadores Clave (KPI)
     */
    async getKpiData() {
        // Cantidad de estudiantes activos (el plan termina hoy o después)
        const activeStudentsResult = await this.knex('users as u')
            .join('user_plan as up', 'u.id', 'up.user_id')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .where('r.name', 'student')
            .andWhere('up.status', 'active')
            .andWhere('up.end_date', '>=', this.start_date) // Active in current scope
            .count('u.id as active_students');

        // Cantidad de clases del dia actual
        const todayClassesResult = await this.knex('classes as c')
            .where('c.date', '=', this.todayDate)
            .count('c.id as today_classes');

        // Ingresos mensuales (venta del plan este mes)
        // Usamos la tabla payments para exactitud financiera si existe, o user_plan start_date
        // El requerimiento anterior usaba users.plan_start_date. Ahora usaremos user_plan.
        const monthlyRevenueResult = await this.knex('payments as p')
            .join('users as u', 'p.user_id', '=', 'u.id')
            .whereBetween('p.payment_date', [this.start_date, this.end_date])
            .select(
                this.knex.raw('SUM(CAST(p.amount AS DECIMAL(10, 2))) AS total_revenue')
            );

        // Tasa de asistencia
        const attendanceRateResult = await this.knex('attendance as a')
            .whereBetween('a.date', [this.start_date, this.end_date])
            .select(
                this.knex.raw(`
                ROUND(
                    (SUM(CASE WHEN a.status = "present" THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 
                    1
                ) AS attendance_rate_percent
            `)
            )
            .first();

        const activeStudents = activeStudentsResult[0]?.active_students ? parseInt(activeStudentsResult[0].active_students) : 0;
        const todayClasses = todayClassesResult[0]?.today_classes ? parseInt(todayClassesResult[0].today_classes) : 0;
        const monthlyRevenue = monthlyRevenueResult[0]?.total_revenue ? parseFloat(monthlyRevenueResult[0].total_revenue) : 0.00;
        const attendanceRate = attendanceRateResult?.attendance_rate_percent ? parseFloat(attendanceRateResult.attendance_rate_percent) : 0.0;

        return {
            activeStudents,
            todayClasses,
            monthlyRevenue,
            attendanceRate
        };
    }

    /**
     * Ocupación de Clases (Capacidad)
     * Mide cuántos cupos se usan en relación a la capacidad máxima.
     */
    async getClassOccupancy() {
        const report = this.knex('classes as c')
            .leftJoin('user_class as cu', 'c.id', 'cu.class_id')
            .leftJoin('users as u', 'cu.user_id', 'u.id')
            .leftJoin('user_plan as up', 'u.id', 'up.user_id')
            .select(
                'c.name',
                'c.genre',
                'c.capacity',
                this.knex.raw('COUNT(cu.user_id) as enrolled_count'),
                this.knex.raw('ROUND((COUNT(cu.user_id) * 100.0 / NULLIF(c.capacity, 0)), 2) as occupancy_rate')
            )
            .where('up.status', 'active')
            .groupBy('c.genre', 'c.name', 'c.capacity')
            .orderBy('c.genre', 'asc')
            .orderBy('occupancy_rate', 'desc');

        return report;
    }

    /**
     * Distribución de Usuarios por Plan
     */
    async getUserDistribution() {
        return this.knex('user_plan as up')
            .join('users as u', 'up.user_id', 'u.id')
            .leftJoin('plans as p', 'up.plan_id', 'p.id')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .select(
                'p.name as plan_name',
                this.knex.raw('COUNT(u.id) as user_count')
            )
            .where('r.name', 'student')
            .andWhere('up.status', 'active')
            .andWhere('up.end_date', '>=', this.start_date)
            .groupBy('p.id', 'p.name');
    }

    /**
     * Tasa de Asistencia por Clase
     * Porcentaje de estudiantes que asistieron vs. inscritos en cada clase.
     */
    async getAttendanceRate() {
        const report = await this.knex('classes as c')
            .leftJoin('attendance as a', 'c.id', 'a.class_id')
            .select(
                'c.id',
                'c.name',
                this.knex.raw('COUNT(CASE WHEN LOWER(a.status) = \'present\' THEN 1 END) as attended_count'),
                this.knex.raw('COUNT(a.id) as total_records'),
                this.knex.raw('ROUND((COUNT(CASE WHEN LOWER(a.status) = \'present\' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2) as attendance_rate')
            )
            .groupBy('c.id', 'c.name')
            .havingRaw('COUNT(a.id) > 0');

        return report;
    }

    /**
     * Participación del Profesorado
     * Horas o cantidad de clases impartidas por cada teacher.
     */
    async getTeachersParticipation() {
        return this.knex('classes as c')
            .join('users as u', 'c.teacher_id', 'u.id')
            .select(
                'u.first_name',
                'u.last_name',
                this.knex.raw('COUNT(c.id) as classes_count'),
                this.knex.raw('SUM(CAST(c.duration AS DECIMAL)) as total_minutes')
            )
            .groupBy('u.id', 'u.first_name', 'u.last_name');
    }
}

export default new ReportsModel();
