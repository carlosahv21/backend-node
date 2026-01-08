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
    async getKpiData() {
        // Cantidad de estudiantes activos (el plan termina hoy o después)
        const activeStudentsResult = await this.knex("users as u")
            .join("user_plan as up", "u.id", "up.user_id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.end_date", ">=", this.start_date) // Active in current scope
            .count("u.id as active_students");

        // Cantidad de clases del dia actual
        const todayClassesResult = await this.knex("classes as c")
            .where("c.date", "=", this.todayDate)
            .count("c.id as today_classes");

        // Ingresos mensuales (venta del plan este mes)
        // Usamos la tabla payments para exactitud financiera si existe, o user_plan start_date
        // El requerimiento anterior usaba users.plan_start_date. Ahora usaremos user_plan.
        const monthlyRevenueResult = await this.knex("payments as p")
            .join("users as u", "p.user_id", "=", "u.id")
            .whereBetween("p.payment_date", [this.start_date, this.end_date])
            .select(
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) AS total_revenue")
            );

        // Tasa de asistencia
        const attendanceRateResult = await this.knex("attendance as a")
            .whereBetween("a.date", [this.start_date, this.end_date])
            .select(
                this.knex.raw(`
                ROUND(
                    (SUM(CASE WHEN a.status = "present" THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 
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
    async getClassOccupancy() {
        const report = this.knex("classes as c")
            .leftJoin("user_class as cu", "c.id", "cu.class_id")
            .leftJoin("users as u", "cu.user_id", "u.id")
            .leftJoin("user_plan as up", "u.id", "up.user_id")
            .select(
                "c.name",
                "c.genre",
                "c.capacity",
                this.knex.raw("COUNT(cu.user_id) as enrolled_count"),
                this.knex.raw(
                    "ROUND((COUNT(cu.user_id) * 100.0 / NULLIF(c.capacity, 0)), 2) as occupancy_rate"
                )
            )
            .where("up.status", "active")
            .groupBy("c.genre", "c.name", "c.capacity")
            .orderBy("c.genre", "asc")
            .orderBy("occupancy_rate", "desc");

        return report;
    }

    /**
     * Distribución de Usuarios por Plan
     */
    async getUserDistribution() {
        return this.knex("user_plan as up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("plans as p", "up.plan_id", "p.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select("p.name as plan_name", this.knex.raw("COUNT(u.id) as user_count"))
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.end_date", ">=", this.start_date)
            .groupBy("p.id", "p.name");
    }

    /**
     * Tasa de Asistencia por Clase
     * Porcentaje de estudiantes que asistieron vs. inscritos en cada clase.
     */
    async getAttendanceRate() {
        const report = await this.knex("classes as c")
            .leftJoin("attendance as a", "c.id", "a.class_id")
            .select(
                "c.id",
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
     * Horas o cantidad de clases impartidas por cada teacher.
     */
    async getTeachersParticipation() {
        return this.knex("classes as c")
            .join("users as u", "c.teacher_id", "u.id")
            .select(
                "u.first_name",
                "u.last_name",
                this.knex.raw("COUNT(c.id) as classes_count"),
                this.knex.raw("SUM(CAST(c.duration AS DECIMAL)) as total_minutes")
            )
            .groupBy("u.id", "u.first_name", "u.last_name");
    }

    /**
     * REPORT 1: Retention & Churn Analysis
     * Analiza la retención de usuarios por cohortes y calcula tasas de churn
     */
    async getRetentionChurnAnalysis() {
        // Análisis de cohortes: usuarios agrupados por mes de inicio
        const cohortAnalysis = await this.knex("user_registration_history as urh")
            .join("users as u", "urh.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin("user_plan as up", "u.id", "up.user_id")
            .leftJoin("plans as p", "urh.plan_id", "p.id")
            .select(
                this.knex.raw('DATE_FORMAT(urh.start_date, "%Y-%m") as cohort_month'),
                "p.name as plan_name",
                this.knex.raw("COUNT(DISTINCT urh.user_id) as total_users"),
                this.knex.raw(
                    'COUNT(DISTINCT CASE WHEN up.status = "active" THEN urh.user_id END) as active_users'
                ),
                this.knex.raw(
                    'ROUND((COUNT(DISTINCT CASE WHEN up.status = "active" THEN urh.user_id END) / COUNT(DISTINCT urh.user_id)) * 100, 2) as retention_rate'
                )
            )
            .where("r.name", "student")
            .groupBy("cohort_month", "p.name")
            .orderBy("cohort_month", "desc");

        // Tasa de churn mensual
        const churnRate = await this.knex("user_plan as up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw('DATE_FORMAT(up.end_date, "%Y-%m") as month'),
                this.knex.raw(
                    'COUNT(CASE WHEN up.status = "expired" THEN 1 END) as churned_users'
                ),
                this.knex.raw("COUNT(*) as total_users"),
                this.knex.raw(
                    'ROUND((COUNT(CASE WHEN up.status = "expired" THEN 1 END) / COUNT(*)) * 100, 2) as churn_rate'
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
    async getRevenueOptimization() {
        // ARPU (Average Revenue Per User)
        const arpu = await this.knex("payments as p")
            .join("users as u", "p.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw(
                    "ROUND(SUM(CAST(p.amount AS DECIMAL(10, 2))) / COUNT(DISTINCT p.user_id), 2) as arpu"
                )
            )
            .where("r.name", "student")
            .andWhere("p.status", "completed")
            .first();

        // Impacto de descuentos
        const discountImpact = await this.knex("payments as p")
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
            .groupBy("p.discount_type");

        // Análisis por método de pago
        const paymentMethodAnalysis = await this.knex("payments as p")
            .select(
                "p.payment_method",
                this.knex.raw("COUNT(*) as transaction_count"),
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) as total_revenue"),
                this.knex.raw(
                    "ROUND(AVG(CAST(p.amount AS DECIMAL(10, 2))), 2) as avg_transaction"
                )
            )
            .where("p.status", "completed")
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
    async getStudentEngagement() {
        // Tasa de utilización de clases
        const classUtilization = await this.knex("user_plan as up")
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

        // Usuarios en riesgo (sin asistencia en 15 días)
        const usersAtRisk = await this.knex("users as u")
            .join("user_plan as up", "u.id", "up.user_id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin(
                this.knex("attendance")
                    .select("student_id")
                    .max("date as last_attendance")
                    .groupBy("student_id")
                    .as("last_att"),
                "u.id",
                "last_att.student_id"
            )
            .select(
                "u.id",
                "u.first_name",
                "u.last_name",
                "u.email",
                "last_att.last_attendance",
                this.knex.raw(
                    "DATEDIFF(CURDATE(), last_att.last_attendance) as days_since_attendance"
                )
            )
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhereRaw(
                "(last_att.last_attendance IS NULL OR DATEDIFF(CURDATE(), last_att.last_attendance) > 15)"
            );

        return {
            classUtilization,
            usersAtRisk,
            riskCount: usersAtRisk.length,
        };
    }

    /**
     * REPORT 4: Operational Efficiency
     * Analiza ocupación, rentabilidad y clases "zombie"
     */
    async getOperationalEfficiency() {
        // Fill Rate por clase
        const fillRateByClass = await this.knex("classes as c")
            .leftJoin("attendance as a", "c.id", "a.class_id")
            .select(
                "c.id",
                "c.name",
                "c.genre",
                "c.level",
                "c.capacity",
                this.knex.raw(
                    'COUNT(CASE WHEN LOWER(a.status) = "present" THEN 1 END) as avg_attendance'
                ),
                this.knex.raw(
                    'ROUND((COUNT(CASE WHEN LOWER(a.status) = "present" THEN 1 END) / NULLIF(c.capacity, 0)) * 100, 2) as fill_rate'
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
                this.knex("classes as c")
                    .leftJoin("attendance as a", "c.id", "a.class_id")
                    .select(
                        "c.id",
                        "c.teacher_id",
                        "c.capacity",
                        this.knex.raw(
                            'COUNT(CASE WHEN LOWER(a.status) = "present" THEN 1 END) as attended_count'
                        ),
                        this.knex.raw(
                            "ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) / NULLIF(c.capacity, 0)) * 100, 2) as fill_rate"
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
    async getAdminAudit() {
        // Cambios manuales en user_plan
        const manualPlanChanges = await this.knex("audit_log as al")
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
            .orderBy("al.created_at", "desc")
            .limit(50);

        // Anulaciones de pagos
        const paymentCancellations = await this.knex("payments as p")
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
            .orderBy("p.updated_at", "desc")
            .limit(50);

        // Actividad de administradores
        const adminActivity = await this.knex("audit_log as al")
            .join("users as u", "al.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw('DATE_FORMAT(al.created_at, "%Y-%m-%d") as date'),
                "u.first_name",
                "u.last_name",
                "al.action",
                this.knex.raw("COUNT(*) as action_count")
            )
            .where("r.name", "admin")
            .groupBy("date", "u.id", "u.first_name", "u.last_name", "al.action")
            .orderBy("date", "desc")
            .limit(100);

        return {
            manualPlanChanges,
            paymentCancellations,
            adminActivity,
        };
    }
}

export default new ReportsModel();
