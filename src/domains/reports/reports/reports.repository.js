import BaseModel from "../../../shared/models/baseModel.js";

class ReportsRepository extends BaseModel {
    constructor() {
        super();
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.start_date = firstDay.toISOString().split("T")[0];
        this.end_date = lastDay.toISOString().split("T")[0];
        this.todayDate = today.toLocaleDateString("en-US", { weekday: "long" });
    }

    async getKpiData(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const activeStudentsResult = await this._applyTenantFilter(this.knex("users as u"), "u")
            .join("user_plan as up", "u.id", "up.user_id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.end_date", ">=", start)
            .count("u.id as active_students");

        const todayClassesResult = await this._applyTenantFilter(this.knex("classes as c"), "c")
            .where("c.date", "=", this.todayDate)
            .count("c.id as today_classes");

        const monthlyRevenueResult = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .join("users as u", "p.user_id", "=", "u.id")
            .whereBetween("p.payment_date", [start, end])
            .select(this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) AS total_revenue"))
            .first();

        const attendanceRateResult = await this._applyTenantFilter(this.knex("attendances as a"), "a")
            .whereBetween("a.date", [start, end])
            .select(this.knex.raw(`
                ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 1) AS attendance_rate_percent
            `))
            .first();

        return {
            activeStudents: parseInt(activeStudentsResult[0]?.active_students || 0),
            todayClasses: parseInt(todayClassesResult[0]?.today_classes || 0),
            monthlyRevenue: parseFloat(monthlyRevenueResult?.total_revenue || 0),
            attendanceRate: parseFloat(attendanceRateResult?.attendance_rate_percent || 0)
        };
    }

    async getClassOccupancy(startDate) {
        const start = startDate || this.start_date;
        return this._applyTenantFilter(this.knex("classes as c"), "c")
            .leftJoin("user_class as cu", "c.id", "cu.class_id")
            .leftJoin("users as u", "cu.user_id", "u.id")
            .leftJoin("user_plan as up", "u.id", "up.user_id")
            .select("c.id", "c.name", "c.genre", "c.capacity",
                this.knex.raw("COUNT(cu.user_id) as enrolled_count"),
                this.knex.raw("ROUND((COUNT(cu.user_id) * 100.0 / NULLIF(c.capacity, 0)), 2) as occupancy_rate"))
            .where("up.status", "active")
            .andWhere("up.end_date", ">=", start)
            .groupBy("c.id", "c.genre", "c.name", "c.capacity")
            .orderBy("c.genre", "asc")
            .orderBy("occupancy_rate", "desc");
    }

    async getUserDistribution(startDate) {
        const start = startDate || this.start_date;
        return this._applyTenantFilter(this.knex("user_plan as up"), "up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("plans as p", "up.plan_id", "p.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select("p.id as plan_id", "p.name as plan_name", this.knex.raw("COUNT(u.id) as user_count"))
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.end_date", ">=", start)
            .groupBy("p.id", "p.name");
    }

    async getAttendanceRate(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;
        return this._applyTenantFilter(this.knex("classes as c"), "c")
            .leftJoin("attendances as a", "c.id", "a.class_id")
            .whereBetween("a.date", [start, end])
            .select("c.id", "c.name",
                this.knex.raw("COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) as attended_count"),
                this.knex.raw("COUNT(a.id) as total_records"),
                this.knex.raw("ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2) as attendance_rate"))
            .groupBy("c.id", "c.name")
            .havingRaw("COUNT(a.id) > 0");
    }

    async getTeachersParticipation(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;
        return this._applyTenantFilter(this.knex("classes as c"), "c")
            .join("users as u", "c.teacher_id", "u.id")
            .leftJoin("attendances as att", "c.id", "att.class_id")
            .whereBetween("att.date", [start, end])
            .select("u.id", "u.first_name", "u.last_name",
                this.knex.raw("COUNT(DISTINCT c.id) as classes_count"),
                this.knex.raw("SUM(DISTINCT CAST(c.duration AS DECIMAL)) as total_minutes"))
            .groupBy("u.id", "u.first_name", "u.last_name");
    }

    async getRetentionChurnAnalysis(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const cohortAnalysis = await this._applyTenantFilter(this.knex("user_registration_history as urh"), "urh")
            .join("users as u", "urh.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin("user_plan as up", "u.id", "up.user_id")
            .leftJoin("plans as p", "urh.plan_id", "p.id")
            .select(
                this.knex.raw("TO_CHAR(urh.start_date, 'YYYY-MM') as cohort_month"),
                "p.name as plan_name",
                this.knex.raw("COUNT(DISTINCT urh.user_id) as total_users"),
                this.knex.raw("COUNT(DISTINCT CASE WHEN up.status = 'active' THEN urh.user_id END) as active_users"),
                this.knex.raw("ROUND((COUNT(DISTINCT CASE WHEN up.status = 'active' THEN urh.user_id END) * 100.0 / NULLIF(COUNT(DISTINCT urh.user_id), 0)), 2) as retention_rate"))
            .where("r.name", "student")
            .groupBy("cohort_month", "p.name")
            .orderBy("cohort_month", "desc");

        const churnRate = await this._applyTenantFilter(this.knex("user_plan as up"), "up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw("TO_CHAR(up.end_date, 'YYYY-MM') as month"),
                this.knex.raw("COUNT(CASE WHEN up.status = 'expired' THEN 1 END) as churned_users"),
                this.knex.raw("COUNT(*) as total_users"),
                this.knex.raw("ROUND((COUNT(CASE WHEN up.status = 'expired' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2) as churn_rate"))
            .where("r.name", "student")
            .groupBy("month")
            .orderBy("month", "desc")
            .limit(12);

        return { cohortAnalysis, churnRate };
    }

    async getRevenueOptimization(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const arpu = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .join("users as u", "p.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(this.knex.raw("ROUND(SUM(CAST(p.amount AS DECIMAL(10, 2))) / COUNT(DISTINCT p.user_id), 2) as arpu"))
            .where("r.name", "student")
            .andWhere("p.status", "completed")
            .andWhereBetween("p.payment_date", [start, end])
            .first();

        const discountImpact = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .select("p.discount_type",
                this.knex.raw("COUNT(*) as payment_count"),
                this.knex.raw("SUM(CAST(p.original_amount AS DECIMAL(10, 2))) as total_original"),
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) as total_final"),
                this.knex.raw("ROUND((SUM(CAST(p.original_amount AS DECIMAL(10, 2))) - SUM(CAST(p.amount AS DECIMAL(10, 2)))) / SUM(CAST(p.original_amount AS DECIMAL(10, 2))) * 100, 2) as discount_percentage"))
            .whereNotNull("p.discount_type")
            .andWhere("p.status", "completed")
            .andWhereBetween("p.payment_date", [start, end])
            .groupBy("p.discount_type");

        const paymentMethodAnalysis = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .select("p.payment_method",
                this.knex.raw("COUNT(*) as transaction_count"),
                this.knex.raw("SUM(CAST(p.amount AS DECIMAL(10, 2))) as total_revenue"),
                this.knex.raw("ROUND(AVG(CAST(p.amount AS DECIMAL(10, 2))), 2) as avg_transaction"))
            .where("p.status", "completed")
            .andWhereBetween("p.payment_date", [start, end])
            .groupBy("p.payment_method");

        return {
            arpu: arpu?.arpu || 0,
            discountImpact,
            paymentMethodAnalysis
        };
    }

    async getStudentEngagement(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const classUtilization = await this._applyTenantFilter(this.knex("user_plan as up"), "up")
            .join("users as u", "up.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin("plans as p", "up.plan_id", "p.id")
            .select("u.id as user_id", "u.first_name", "u.last_name", "p.name as plan_name",
                "up.classes_used", "up.max_classes",
                this.knex.raw("ROUND((up.classes_used / NULLIF(up.max_classes, 0)) * 100, 2) as utilization_rate"))
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhere("up.max_classes", ">", 0)
            .orderBy("utilization_rate", "asc");

        const usersAtRisk = await this.getUsersAtRisk();

        return { classUtilization, usersAtRisk, usersAtRiskCount: usersAtRisk.length };
    }

    async getUsersAtRisk() {
        return this._applyTenantFilter(this.knex("users as u"), "u")
            .join("user_plan as up", "u.id", "up.user_id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .leftJoin(
                this._applyTenantFilter(this.knex("attendances"), "attendances")
                    .select("student_id").max("date as last_attendance").groupBy("student_id")
                    .as("last_att"),
                "u.id", "last_att.student_id")
            .select("u.id", "u.first_name", "u.last_name", "u.email",
                "last_att.last_attendance",
                this.knex.raw("CURRENT_DATE - CAST(last_att.last_attendance AS DATE) as days_since_attendance"))
            .where("r.name", "student")
            .andWhere("up.status", "active")
            .andWhereRaw("(last_att.last_attendance IS NULL OR CURRENT_DATE - CAST(last_att.last_attendance AS DATE) > 15)")
            .orderBy("days_since_attendance", "desc");
    }

    async getOperationalEfficiency(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const fillRateByClass = await this._applyTenantFilter(this.knex("classes as c"), "c")
            .leftJoin("attendances as a", "c.id", "a.class_id")
            .whereBetween("a.date", [start, end])
            .select("c.id", "c.name", "c.genre", "c.level", "c.capacity",
                this.knex.raw("COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) as avg_attendance"),
                this.knex.raw("ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) * 100.0 / NULLIF(c.capacity, 0)), 2) as fill_rate"))
            .groupBy("c.id", "c.name", "c.genre", "c.level", "c.capacity")
            .orderBy("fill_rate", "asc");

        const zombieClasses = fillRateByClass.filter(c => parseFloat(c.fill_rate || 0) < 20);

        const teacherEfficiency = await this.knex
            .select("teacher_info.first_name", "teacher_info.last_name",
                this.knex.raw("COUNT(class_fill.id) as classes_taught"),
                this.knex.raw("SUM(class_fill.attended_count) as total_attendance"),
                this.knex.raw("ROUND(AVG(class_fill.fill_rate), 2) as avg_fill_rate"))
            .from(
                this._applyTenantFilter(this.knex("classes as c"), "c")
                    .leftJoin("attendances as a", "c.id", "a.class_id")
                    .whereBetween("a.date", [start, end])
                    .select("c.id", "c.teacher_id", "c.capacity",
                        this.knex.raw("COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) as attended_count"),
                        this.knex.raw("ROUND((COUNT(CASE WHEN LOWER(a.status) = 'present' THEN 1 END) * 100.0 / NULLIF(c.capacity, 0)) * 100, 2) as fill_rate"))
                    .groupBy("c.id", "c.teacher_id", "c.capacity")
                    .as("class_fill"))
            .join("users as teacher_info", "class_fill.teacher_id", "teacher_info.id")
            .groupBy("teacher_info.id", "teacher_info.first_name", "teacher_info.last_name");

        return { fillRateByClass, zombieClasses, teacherEfficiency };
    }

    async getAdminAudit(startDate, endDate) {
        const start = startDate || this.start_date;
        const end = endDate || this.end_date;

        const manualPlanChanges = await this._applyTenantFilter(this.knex("audit_log as al"), "al")
            .join("users as u", "al.user_id", "u.id")
            .select("al.id", "al.action", "al.table_name", "al.record_id",
                "u.first_name", "u.last_name", "al.old_values", "al.new_values", "al.created_at")
            .where("al.table_name", "user_plan")
            .andWhereBetween("al.created_at", [`${start} 00:00:00`, `${end} 23:59:59`])
            .orderBy("al.created_at", "desc")
            .limit(50);

        const paymentCancellations = await this._applyTenantFilter(this.knex("payments as p"), "p")
            .join("users as u", "p.user_id", "u.id")
            .select("p.id", "u.first_name", "u.last_name", "p.amount", "p.status", "p.payment_date", "p.updated_at")
            .whereIn("p.status", ["refunded", "cancelled"])
            .andWhereBetween("p.payment_date", [start, end])
            .orderBy("p.updated_at", "desc")
            .limit(50);

        const adminActivity = await this._applyTenantFilter(this.knex("audit_log as al"), "al")
            .join("users as u", "al.user_id", "u.id")
            .leftJoin("roles as r", "u.role_id", "r.id")
            .select(
                this.knex.raw("TO_CHAR(al.created_at, 'YYYY-MM-DD') as date"),
                "u.first_name", "u.last_name", "al.action",
                this.knex.raw("COUNT(*) as action_count"))
            .where("r.name", "admin")
            .andWhereBetween("al.created_at", [`${start} 00:00:00`, `${end} 23:59:59`])
            .groupBy("date", "u.id", "u.first_name", "u.last_name", "al.action")
            .orderBy("date", "desc")
            .limit(100);

        return { manualPlanChanges, paymentCancellations, adminActivity };
    }

    async getSidebarData(userId, roleId) {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const currentDayName = today.toLocaleDateString("en-US", { weekday: "long" });
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

        const section2 = await this._applyTenantFilter(this.knex("users"), "users")
            .select("users.id", "users.first_name", "users.last_name", "users.email", "roles.name as role_name")
            .leftJoin("roles", "users.role_id", "roles.id")
            .where("users.id", userId)
            .first();

        const roleName = section2?.role_name || '';
        let section1 = [];
        let section3 = {};

        if (roleName === 'admin' || roleName === 'receptionist') {
            section1 = await this._applyTenantFilter(this.knex("classes"), "classes")
                .where("date", currentDayName)
                .select("name", "genre", "hour", "level")
                .orderBy("hour", "asc");

            const todayPayments = await this._applyTenantFilter(this.knex("payments"), "payments")
                .where("payment_date", todayStr)
                .sum("amount as total_amount")
                .first();
            section2.daily_revenue = parseFloat(todayPayments?.total_amount || 0);

            const newStudentsResult = await this._applyTenantFilter(this.knex("users as u"), "u")
                .join("roles as r", "u.role_id", "r.id")
                .where("r.name", "student")
                .andWhere("u.created_at", ">=", startOfWeekStr)
                .count("u.id as new_students")
                .first();
            section3.new_students_this_week = parseInt(newStudentsResult?.new_students || 0);

        } else if (roleName === 'teacher') {
            section1 = await this._applyTenantFilter(this.knex("classes"), "classes")
                .where("teacher_id", userId)
                .andWhere("date", currentDayName)
                .select("name", "genre", "hour", "level")
                .orderBy("hour", "asc");

            const attendanceInfo = await this._applyTenantFilter(this.knex("attendances as a"), "a")
                .join("classes as c", "a.class_id", "c.id")
                .where("c.teacher_id", userId)
                .select(
                    this.knex.raw("SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as attended_count"),
                    this.knex.raw('SUM(c.capacity) as total_capacity'))
                .first();

            let attendanceRate = 0;
            if (attendanceInfo && attendanceInfo.total_capacity > 0) {
                attendanceRate = ((attendanceInfo.attended_count / attendanceInfo.total_capacity) * 100).toFixed(2);
            }
            section2.attendance_ratio = parseFloat(attendanceRate);

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
            section1 = await this._applyTenantFilter(this.knex("classes as c"), "c")
                .join("user_class as uc", "c.id", "uc.class_id")
                .where("uc.user_id", userId)
                .andWhere("c.date", currentDayName)
                .select("c.name", "c.genre", "c.hour", "c.level")
                .orderBy("c.hour", "asc");

            const userPlan = await this._applyTenantFilter(this.knex("user_plan as up"), "up")
                .join("plans as p", "up.plan_id", "p.id")
                .where("up.user_id", userId)
                .andWhere("up.status", "active")
                .select("up.classes_remaining", "up.end_date", "p.name as plan_name")
                .orderBy("up.created_at", "desc")
                .first();

            if (userPlan?.end_date) {
                userPlan.end_date = new Date(userPlan.end_date).toISOString().split("T")[0];
            }
            section2.plan = userPlan || null;

            const weeklyAttendanceCount = await this._applyTenantFilter(this.knex("attendances"), "attendances")
                .where("student_id", userId)
                .andWhere("date", ">=", startOfWeekStr)
                .select(
                    this.knex.raw("SUM(CASE WHEN LOWER(status) = 'present' THEN 1 ELSE 0 END) as attended"),
                    this.knex.raw('COUNT(id) as scheduled'))
                .first();
            section3.weekly_attendance = {
                attended: parseInt(weeklyAttendanceCount?.attended || 0),
                scheduled: parseInt(weeklyAttendanceCount?.scheduled || 0)
            };
        }

        return { section1, section2: section2 || {}, section3 };
    }
}

export default new ReportsRepository();