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
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .where('r.name', 'student')
            .andWhere('u.plan_status', 'active')
            .andWhere('u.plan_end_date', '>=', this.start_date)
            .count('u.id as active_students');

        // Cantidad de clases del dia actual
        const todayClassesResult = await this.knex('classes as c')
            .where('c.date', '=', this.todayDate)
            .count('c.id as today_classes');

        // Ingresos mensuales (venta del plan este mes)
        const monthlyRevenueResult = await this.knex('users as u')
            .join('plans as p', 'u.plan_id', '=', 'p.id')
            .whereBetween('u.plan_start_date', [this.start_date, this.end_date])
            .select(
                this.knex.raw('SUM(CAST(p.price AS DECIMAL(10, 2))) AS total_revenue')
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
            .leftJoin('class_user as cu', 'c.id', 'cu.class_id')
            .leftJoin('users as u', 'cu.user_id', 'u.id')
            .select(
                'c.name',
                'c.genre',
                'c.capacity',
                this.knex.raw('COUNT(cu.user_id) as enrolled_count'),
                this.knex.raw('ROUND((COUNT(cu.user_id) * 100.0 / NULLIF(c.capacity, 0)), 2) as occupancy_rate')
            )
            .where('u.plan_status', 'active')
            .groupBy('c.genre', 'c.name', 'c.capacity')
            .orderBy('c.genre', 'asc')
            .orderBy('occupancy_rate', 'desc');

        return report;
    }

    /**
     * Distribución de Usuarios por Plan
     */
    async getUserDistribution() {
        return this.knex('users as u')
            .leftJoin('plans as p', 'u.plan_id', 'p.id')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .select(
                'p.name as plan_name',
                this.knex.raw('COUNT(u.id) as user_count')
            )
            .where('r.name', 'student')
            .andWhere('u.plan_status', 'active')
            .andWhere('u.plan_end_date', '>=', this.start_date)
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

    /**
     * Análisis de Rentabilidad por Plan
     * Muestra ingresos, usuarios activos, uso promedio y proyección por cada plan
     */
    async getPlanProfitability() {
        // Capturar referencias para usar dentro de las funciones de join
        const knex = this.knex;
        const startDate = this.start_date;
        const endDate = this.end_date;

        const profitabilityData = await knex('plans as p')
            .leftJoin('users as u', function () {
                this.on('p.id', '=', 'u.plan_id')
                    .andOn('u.plan_status', '=', knex.raw('?', ['active']))
                    .andOn('u.plan_end_date', '>=', knex.raw('?', [startDate]));
            })
            .leftJoin('attendance as a', function () {
                this.on('u.id', '=', 'a.student_id')
                    .andOn('a.status', '=', knex.raw('?', ['present']))
                    .andOn('a.date', '>=', knex.raw('?', [startDate]))
                    .andOn('a.date', '<=', knex.raw('?', [endDate]));
            })
            .select(
                'p.id as plan_id',
                'p.name as plan_name',
                'p.type as plan_type',
                'p.price',
                'p.max_sessions',
                // Usuarios activos con este plan
                knex.raw('COUNT(DISTINCT u.id) as active_users'),
                // Ingresos del mes actual (usuarios que iniciaron plan este mes)
                knex.raw(`
                    SUM(CASE 
                        WHEN u.plan_start_date BETWEEN ? AND ? 
                        THEN CAST(p.price AS DECIMAL(10, 2)) 
                        ELSE 0 
                    END) as monthly_revenue
                `, [startDate, endDate]),
                // Total de asistencias en el mes
                knex.raw('COUNT(a.id) as total_attendances'),
                // Ingresos proyectados (usuarios activos * precio del plan)
                knex.raw(`
                    SUM(CASE 
                        WHEN u.plan_status = 'active' AND u.plan_end_date >= ?
                        THEN CAST(p.price AS DECIMAL(10, 2)) 
                        ELSE 0 
                    END) as projected_revenue
                `, [startDate])
            )
            .groupBy('p.id', 'p.name', 'p.type', 'p.price', 'p.max_sessions')
            .orderBy('monthly_revenue', 'desc');

        // Calcular el porcentaje de uso promedio
        const enrichedData = profitabilityData.map(plan => {
            const activeUsers = parseInt(plan.active_users) || 0;
            const totalAttendances = parseInt(plan.total_attendances) || 0;
            const maxSessions = parseInt(plan.max_sessions) || 0;

            let averageUsage = 0;

            // Si max_sessions es 0, significa "ilimitado", no calculamos porcentaje
            if (maxSessions > 0 && activeUsers > 0) {
                const totalAvailableSessions = activeUsers * maxSessions;
                averageUsage = parseFloat(((totalAttendances / totalAvailableSessions) * 100).toFixed(2));
            } else if (maxSessions === 0) {
                // Para planes ilimitados, mostramos las asistencias totales
                averageUsage = null; // Indicador de plan ilimitado
            }

            return {
                plan_id: plan.plan_id,
                plan_name: plan.plan_name,
                plan_type: plan.plan_type,
                price: parseFloat(plan.price) || 0,
                max_sessions: maxSessions === 0 ? 'Ilimitadas' : maxSessions,
                active_users: activeUsers,
                monthly_revenue: parseFloat(plan.monthly_revenue) || 0,
                projected_revenue: parseFloat(plan.projected_revenue) || 0,
                total_attendances: totalAttendances,
                average_usage_percent: averageUsage
            };
        });

        return enrichedData;
    }
}

export default new ReportsModel();
