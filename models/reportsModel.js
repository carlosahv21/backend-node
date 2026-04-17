// models/reportsModel.js

import BaseModel from "./baseModel.js";

class ReportsModel extends BaseModel {
    constructor() {
        super();
        const today = new Date();

        // Primer y último día del mes (para MySQL)
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        this.start_date = firstDay.toISOString().split("T")[0];
        this.end_date = lastDay.toISOString().split("T")[0];
        this.todayDate = today.toLocaleDateString("en-US", { weekday: "long" });
    }

    /**
     * Indicadores Clave (KPI)
     */
    async getKpiData(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        // Cantidad de estudiantes activos (el plan termina hoy o después)
        const activeStudentsResult = await this._applyTenantFilter(this.knex("users as u"), "u")
            .join("user_plan as up", "u.id", "up.user_id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.end_date", ">=", start) // Active in current scope
            .count("u.id as active_students");

        // Cantidad de clases del dia actual
        const todayClassesResult = await this._applyTenantFilter(this.knex("classes as c"), "c")
            .where("c.date", "=", this.todayDate)
            .count("c.id as today_classes");

        // Ingresos mensuales (venta del plan este mes)
        // Usamos la tabla payments para exactitud financiera si existe, o user_plan start_date
        // El requerimiento anterior usaba users.plan_start_date. Ahora usaremos user_plan.
        const monthlyRevenueResult = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .join("users as u", "p.user_id", "=", "u.id")
            .whereBetween("p.payment_date", [start, end])
            .select(
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) AS total_revenue")
            );

        // Tasa de asistencia
        const attendanceRateResult = await this._applyTenantFilter(this.knex("attendances as a"), "a")
            .whereBetween("a.date", [start, end])
            .select(
                this.knex.raw(`
                ROUND(
                    (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 
                    1
                ) AS attendance_rate_percent
            `)
            )
            .first();

        const activeStudents = activeStudentsResult[0]?.active_students
            ? parseInt(activeStudentsResult[0].active_students)
            : 0;
        const todayClasses = todayClassesResult[0]?.today_classes
            ? parseInt(todayClassesResult[0].today_classes)
            : 0;
        const monthlyRevenue = monthlyRevenueResult[0]?.total_revenue
            ? parseFloat(monthlyRevenueResult[0].total_revenue)
            : 0.0;
        const attendanceRate = attendanceRateResult?.attendance_rate_percent
            ? parseFloat(attendanceRateResult.attendance_rate_percent)
            : 0.0;

        return {
            activeStudents,
            todayClasses,
            monthlyRevenue,
            attendanceRate,
        };
    }

    /**
     * Ocupación de Clases (Capacidad)
     * Mide cuántos cupos se usan en relación a la capacidad máxima.
     */
    async getClassOccupancy(startDate, endDate) {
        // En este reporte específico, el rango podría usarse para ver inscritos activos en ese periodo
        const start = startDate || this.start_date;

        const report = this._applyTenantFilter(this.knex("classes as c"), "c")
            .leftJoin("user_class as cu", "c.id", "cu.class_id")
            .leftJoin("users as u", "cu.user_id", "u.id")
            .leftJoin("user_plan as up", "u.id", "up.user_id")
            .select(
                "c.id as id",
                "c.name",
                "c.genre",
                "c.capacity",
                this.knex.raw("COUNT(cu.user_id) as enrolled_count"),
                this.knex.raw(
                    "ROUND((COUNT(cu.user_id) * 100.0 / NULLIF(c.capacity, 0)), 2) as occupancy_rate"
                )
            )
            .where("up.status", "active")
            .andWhere("up.end_date", ">=", start)
            .groupBy("c.id", "c.genre", "c.name", "c.capacity")
            .orderBy("c.genre", "asc")
            .orderBy("occupancy_rate", "desc");

        return report;
    }

    /**
     * Distribución de Usuarios por Plan
     */
    async getUserDistribution(startDate, endDate) {
        const start = startDate || this.start_date;

        const report = this._applyTenantFilter(this.knex("user_plan as up"), "up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("plans as p", "up.plan_id", "p.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select("p.name as plan_name", this.knex.raw("COUNT(u.id) as user_count"))
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.end_date", ">=", start)
            .groupBy("p.id", "p.name");

        return report;
    }

    /**
     * Tasa de Asistencia por Clase
     * Porcentaje de estudiantes que asistieron vs. inscritos en cada clase.
     */
    async getAttendanceRate(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const report = await this._applyTenantFilter(this.knex("classes as c"), "c")
            .leftJoin("attendances as a", "c.id", "a.class_id")
            .whereBetween("a.date", [start, end])
            .select(
                "c.id as id",
                "c.name",
                this.knex.raw(
                    "COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) as attended_count"
                ),
                this.knex.raw("COUNT(a.id) as total_records"),
                this.knex.raw(
                    "ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2) as attendance_rate"
                )
            )
            .groupBy("c.id", "c.name")
            .havingRaw("COUNT(a.id) > 0");

        return report;
    }

    /**
     * Participación del Profesorado
     * Horas o cantidad de clases impartidas por cada teacher en el rango.
     */
    async getTeachersParticipation(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        return await this._applyTenantFilter(this.knex("classes as c"), "c")
            .join("users as u", "c.teacher_id", "u.id")
            .leftJoin("attendances as att", "c.id", "att.class_id")
            .whereBetween("att.date", [start, end])
            .select(
                "u.id as id",
                "u.first_name",
                "u.last_name",
                this.knex.raw("COUNT(DISTINCT c.id) as classes_count"),
                this.knex.raw("SUM(DISTINCT CAST(c.duration AS DECIMAL)) as total_minutes")
            )
            .groupBy("u.id", "u.first_name", "u.last_name");
    }

    /**
     * REPORT 1: Retention & Churn Analysis
     * Analiza la retención de usuarios por cohortes y calcula tasas de churn
     */
    async getRetentionChurnAnalysis(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        // Análisis de cohortes: usuarios agrupados por mes de inicio
        const cohortAnalysis = await this._applyTenantFilter(this.knex("user_registration_history as urh"), "urh")
            .join("users as u", "urh.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin("user_plan as up", "u.id", "up.user_id")
            .leftJoin("plans as p", "urh.plan_id", "p.id")
            .select(
                this.knex.raw("TO_CHAR(urh.start_date, 'YYYY-MM') as cohort_month"),
                "p.name as plan_name",
                this.knex.raw("COUNT(DISTINCT urh.user_id) as total_users"),
                this.knex.raw(
                    "COUNT(DISTINCT CASE WHEN up.status = 'active' THEN urh.user_id END) as active_users"
                ),
                this.knex.raw(
                    "ROUND((COUNT(DISTINCT CASE WHEN up.status = 'active' THEN urh.user_id END) * 100.0 / NULLIF(COUNT(DISTINCT urh.user_id), 0)), 2) as retention_rate"
                )
            )
            .where("r.name", "student")
            .groupBy("cohort_month", "p.name")
            .orderBy("cohort_month", "desc");

        // Tasa de churn mensual
        const churnRate = await this._applyTenantFilter(this.knex("user_plan as up"), "up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw("TO_CHAR(up.end_date, 'YYYY-MM') as month"),
                this.knex.raw(
                    "COUNT(CASE WHEN up.status = 'expired' THEN 1 END) as churned_users"
                ),
                this.knex.raw("COUNT(*) as total_users"),
                this.knex.raw(
                    "ROUND((COUNT(CASE WHEN up.status = 'expired' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2) as churn_rate"
                )
            )
            .where("r.name", "student")
            .groupBy("month")
            .orderBy("month", "desc")
            .limit(12);

        return {
            cohortAnalysis,
            churnRate,
        };
    }

    /**
     * REPORT 2: Revenue Optimization
     * Analiza ingresos, descuentos y métodos de pago
     */
    async getRevenueOptimization(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        // ARPU (Average Revenue Per User)
        const arpu = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .join("users as u", "p.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw(
                    "ROUND(SUM(CAST(p.amount AS DECIMAL(10, 2))) / COUNT(DISTINCT p.user_id), 2) as arpu"
                )
            )
            .where("r.name", "student")
            .andWhere("p.status", "completed")
            .andWhereBetween("p.payment_date", [start, end])
            .first();

        // Impacto de descuentos
        const discountImpact = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .select(
                "p.discount_type",
                this.knex.raw("COUNT(*) as payment_count"),
                this.knex.raw(
                    "SUM(CAST(p.original_amount AS DECIMAL(10, 2))) as total_original"
                ),
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) as total_final"),
                this.knex.raw(
                    "ROUND((SUM(CAST(p.original_amount AS DECIMAL(10, 2))) - SUM(CAST(p.amount AS DECIMAL(10, 2)))) / SUM(CAST(p.original_amount AS DECIMAL(10, 2))) * 100, 2) as discount_percentage"
                )
            )
            .whereNotNull("p.discount_type")
            .andWhere("p.status", "completed")
            .andWhereBetween("p.payment_date", [start, end])
            .groupBy("p.discount_type");

        // Análisis por método de pago
        const paymentMethodAnalysis = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .select(
                "p.payment_method",
                this.knex.raw("COUNT(*) as transaction_count"),
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) as total_revenue"),
                this.knex.raw(
                    "ROUND(AVG(CAST(p.amount AS DECIMAL(10, 2))), 2) as avg_transaction"
                )
            )
            .where("p.status", "completed")
            .andWhereBetween("p.payment_date", [start, end])
            .groupBy("p.payment_method");

        return {
            arpu: arpu?.arpu || 0,
            discountImpact,
            paymentMethodAnalysis,
        };
    }

    /**
     * REPORT 3: Student Engagement
     * Identifica usuarios en riesgo y analiza utilización de clases
     */
    async getStudentEngagement(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        // Tasa de utilización de clases
        const classUtilization = await this._applyTenantFilter(this.knex("user_plan as up"), "up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin("plans as p", "up.plan_id", "p.id")
            .select(
                "u.id as user_id",
                "u.first_name",
                "u.last_name",
                "p.name as plan_name",
                "up.classes_used",
                "up.max_classes",
                this.knex.raw(
                    "ROUND((up.classes_used / NULLIF(up.max_classes, 0)) * 100, 2) as utilization_rate"
                )
            )
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.max_classes", ">", 0)
            .orderBy("utilization_rate", "asc");

        const usersAtRisk = await this.getUsersAtRisk();

        return {
            classUtilization,
            usersAtRisk,
            usersAtRiskCount: usersAtRisk.length,
        };
    }

    async getUsersAtRisk() {
        const usersAtRisk = await this._applyTenantFilter(this.knex("users as u"), "u")
            .join("user_plan as up", "u.id", "up.user_id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin(
                this._applyTenantFilter(this.knex("attendances"), "attendances")
                    .select("student_id")
                    .max("date as last_attendance")
                    .groupBy("student_id")
                    .as("last_att"),
                "u.id",
                "last_att.student_id"
            )
            .select(
                "u.id as id",
                "u.first_name",
                "u.last_name",
                "u.email",
                "last_att.last_attendance",
                this.knex.raw(
                    "CURRENT_DATE - CAST(last_att.last_attendance AS DATE) as days_since_attendance"
                )
            )
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhereRaw(
                "(last_att.last_attendance IS NULL OR CURRENT_DATE - CAST(last_att.last_attendance AS DATE) > 15)"
            )
            .orderBy("days_since_attendance", "desc");

        return usersAtRisk;
    }

    /**
     * REPORT 4: Operational Efficiency
     * Analiza ocupación, rentabilidad y clases "zombie"
     */
    async getOperationalEfficiency(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        // Fill Rate por clase
        const fillRateByClass = await this._applyTenantFilter(this.knex("classes as c"), "c")
            .leftJoin("attendances as a", "c.id", "a.class_id")
            .whereBetween("a.date", [start, end])
            .select(
                "c.id as id",
                "c.name",
                "c.genre",
                "c.level",
                "c.capacity",
                this.knex.raw(
                    "COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) as avg_attendance"
                ),
                this.knex.raw(
                    "ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) * 100.0 / NULLIF(c.capacity, 0)), 2) as fill_rate"
                )
            )
            .groupBy("c.id", "c.name", "c.genre", "c.level", "c.capacity")
            .orderBy("fill_rate", "asc");

        // Clases "Zombie" (ocupación < 20%)
        const zombieClasses = fillRateByClass.filter(
            (c) => parseFloat(c.fill_rate || 0) < 20
        );

        // Participación de profesores (Subconsulta para evitar error de nesting AVG(COUNT))
        const teacherEfficiency = await this.knex
            .select(
                "teacher_info.first_name",
                "teacher_info.last_name",
                this.knex.raw("COUNT(class_fill.id) as classes_taught"),
                this.knex.raw("SUM(class_fill.attended_count) as total_attendance"),
                this.knex.raw("ROUND(AVG(class_fill.fill_rate), 2) as avg_fill_rate")
            )
            .from(
                this._applyTenantFilter(this.knex("classes as c"), "c")
                    .leftJoin("attendances as a", "c.id", "a.class_id")
                    .whereBetween("a.date", [start, end])
                    .select(
                        "c.id",
                        "c.teacher_id",
                        "c.capacity",
                        this.knex.raw(
                            "COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) as attended_count"
                        ),
                        this.knex.raw(
                            "ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) * 100.0 / NULLIF(c.capacity, 0)) * 100, 2) as fill_rate"
                        )
                    )
                    .groupBy("c.id", "c.teacher_id", "c.capacity")
                    .as("class_fill")
            )
            .join("users as teacher_info", "class_fill.teacher_id", "teacher_info.id")
            .groupBy(
                "teacher_info.id",
                "teacher_info.first_name",
                "teacher_info.last_name"
            );

        return {
            fillRateByClass,
            zombieClasses,
            teacherEfficiency,
        };
    }

    /**
     * REPORT 5: Admin Audit
     * Monitorea cambios administrativos y actividad sensible
     */
    async getAdminAudit(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        // Cambios manuales en user_plan
        const manualPlanChanges = await this._applyTenantFilter(this.knex("audit_log as al"), "al")
            .join("users as u", "al.user_id", "u.id")
            .select(
                "al.id",
                "al.action",
                "al.table_name",
                "al.record_id",
                "u.first_name",
                "u.last_name",
                "al.old_values",
                "al.new_values",
                "al.created_at"
            )
            .where("al.table_name", "user_plan")
            .andWhereBetween("al.created_at", [`${start} 00:00:00`, `${end} 23:59:59`])
            .orderBy("al.created_at", "desc")
            .limit(50);

        // Anulaciones de pagos
        const paymentCancellations = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .join("users as u", "p.user_id", "u.id")
            .select(
                "p.id",
                "u.first_name",
                "u.last_name",
                "p.amount",
                "p.status",
                "p.payment_date",
                "p.updated_at"
            )
            .whereIn("p.status", ["refunded", "cancelled"])
            .andWhereBetween("p.payment_date", [start, end])
            .orderBy("p.updated_at", "desc")
            .limit(50);

        // Actividad de administradores
        const adminActivity = await this._applyTenantFilter(this.knex("audit_log as al"), "al")
            .join("users as u", "al.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw("TO_CHAR(al.created_at, 'YYYY-MM-DD') as date"),
                "u.first_name",
                "u.last_name",
                "al.action",
                this.knex.raw("COUNT(*) as action_count")
            )
            .where("r.name", "admin")
            .andWhereBetween("al.created_at", [`${start} 00:00:00`, `${end} 23:59:59`])
            .groupBy("date", "u.id", "u.first_name", "u.last_name", "al.action")
            .orderBy("date", "desc")
            .limit(100);

        return {
            manualPlanChanges,
            paymentCancellations,
            adminActivity,
        };
    }

    /**
     * Obtiene los datos para el sidebar del dashboard de forma centralizada.
     * @param {string} userId ID del usuario autenticado.
     * @param {number} roleId ID del rol del usuario.
     */
    async getSidebarData(userId, roleId) {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const currentDayName = today.toLocaleDateString("en-US", { weekday: "long" });

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // start on monday
        const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

        // Section 2: Perfil del usuario general
        const section2 = await this._applyTenantFilter(this.knex("users"), "users")
            .select(
                "users.id",
                "users.first_name",
                "users.last_name",
                "users.email",
                "roles.name as role_name"
            )
            .leftJoin("roles", "users.role_id", "roles.id")
            .where("users.id", userId)
            .first();

        const roleName = section2?.role_name || '';

        let section1 = [];
        let section3 = {};

        if (roleName === 'admin' || roleName === 'receptionist') {
            // ADMIN / RECEPTIONIST

            // Section 1: Universal - Agenda (Todas las clases de hoy)
            section1 = await this._applyTenantFilter(this.knex("classes"), "classes")
                .where("date", currentDayName)
                .select("name", "genre", "hour", "level")
                .orderBy("hour", "asc");

            // Section 2: Recaudación del día
            const todayPayments = await this._applyTenantFilter(this.knex("payments"), "payments")
                .where("payment_date", todayStr)
                .sum("amount as total_amount")
                .first();

            section2.daily_revenue = parseFloat(todayPayments?.total_amount || 0);

            // Section 3: Nuevos Estudiantes esta semana
            const newStudentsResult = await this._applyTenantFilter(this.knex("users as u"), "u")
                .join("roles as r", "u.role_id", "r.id")
                .where("r.name", "student")
                .andWhere("u.created_at", ">=", startOfWeekStr)
                .count("u.id as new_students")
                .first();

            section3.new_students_this_week = parseInt(newStudentsResult?.new_students || 0);

        } else if (roleName === 'teacher') {
            // PROFESOR

            // Section 1: Universal - Agenda del profesor hoy
            section1 = await this._applyTenantFilter(this.knex("classes"), "classes")
                .where("teacher_id", userId)
                .andWhere("date", currentDayName)
                .select("name", "genre", "hour", "level")
                .orderBy("hour", "asc");

            // Section 2: Ratio de Asistencia
            const attendanceInfo = await this._applyTenantFilter(this.knex("attendances as a"), "a")
                .join("classes as c", "a.class_id", "c.id")
                .where("c.teacher_id", userId)
                .select(
                    this.knex.raw("SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as attended_count"),
                    this.knex.raw('SUM(c.capacity) as total_capacity')
                )
                .first();

            let attendanceRate = 0;
            if (attendanceInfo && attendanceInfo.total_capacity > 0) {
                attendanceRate = ((attendanceInfo.attended_count / attendanceInfo.total_capacity) * 100).toFixed(2);
            }
            section2.attendance_ratio = parseFloat(attendanceRate);

            // Section 3: Clases con Mayor Inscripción
            const topClasses = await this._applyTenantFilter(this.knex("classes as c"), "c")
                .leftJoin("user_class as uc", "c.id", "uc.class_id")
                .where("c.teacher_id", userId)
                .select("c.name", "c.genre")
                .count("uc.user_id as enrollments")
                .groupBy("c.id", "c.name", "c.genre")
                .orderBy("enrollments", "desc")
                .limit(3);

            section3.top_classes = topClasses;

        } else if (roleName === 'student') {
            // ESTUDIANTE

            // Section 1: Universal - Clases donde está inscrito hoy
            section1 = await this._applyTenantFilter(this.knex("classes as c"), "c")
                .join("user_class as uc", "c.id", "uc.class_id")
                .where("uc.user_id", userId)
                .andWhere("c.date", currentDayName)
                .select("c.name", "c.genre", "c.hour", "c.level")
                .orderBy("c.hour", "asc");

            // Section 2: Estado de Cuenta y Plan
            const userPlan = await this._applyTenantFilter(this.knex("user_plan as up"), "up")
                .join("plans as p", "up.plan_id", "p.id")
                .where("up.user_id", userId)
                .andWhere("up.status", "active")
                .select("up.classes_remaining", "up.end_date", "p.name as plan_name")
                .orderBy("up.created_at", "desc")
                .first();

            if (userPlan) {
                // Ensure date formatting is clean
                if (userPlan.end_date) {
                    userPlan.end_date = new Date(userPlan.end_date).toISOString().split("T")[0];
                }
                section2.plan = userPlan;
            } else {
                section2.plan = null;
            }

            // Section 3: Asistencia Semanal
            const weeklyAttendanceCount = await this._applyTenantFilter(this.knex("attendances"), "attendances")
                .where("student_id", userId)
                .andWhere("date", ">=", startOfWeekStr)
                .select(
                    this.knex.raw("SUM(CASE WHEN LOWER(status) = 'present' THEN 1 ELSE 0 END) as attended"),
                    this.knex.raw('COUNT(id) as scheduled')
                )
                .first();

            section3.weekly_attendance = {
                attended: parseInt(weeklyAttendanceCount?.attended || 0),
                scheduled: parseInt(weeklyAttendanceCount?.scheduled || 0)
            };
        }

        return {
            section1,
            section2: section2 || {},
            section3
        };
    }
}

export default new ReportsModel();
