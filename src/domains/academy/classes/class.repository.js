import BaseModel from "../../../shared/models/baseModel.js";

class ClassRepository extends BaseModel {
    constructor() {
        super("classes");
        this.selectFields = ["classes.*"];
        this.searchFields = ["classes.name", "classes.level", "classes.genre", "classes.date", "classes.hour"];

        // Configuración de scope RBAC para 'classes':
        // - teacher (assigned): solo las clases que imparte (classes.teacher_id = él).
        // - student (own): solo las clases en las que está inscrito (vía user_class).
        this.scopeConfig = {
            // assigned → filtra por teacher_id; el resolver devuelve el id del propio teacher.
            assignedColumn: "classes.teacher_id",
            assignedResolver: async (user) => [user.id],

            // own → filtra por classes.id usando los ids resueltos desde user_class.
            ownColumn: "classes.id",
            ownResolver: async (user) => {
                const rows = await this.knex("user_class")
                    .where({ user_id: user.id })
                    .select("class_id");
                return rows.map((r) => r.class_id);
            },
        };
    }

    async findByIdDetails(id) {
        const db = this.knex;

        const classData = await this._applyTenantFilter(db("classes as c"), "c")
            .leftJoin("users as u", "c.teacher_id", "u.id")
            .where("c.id", id)
            .select("c.*", "u.first_name as teacher_name", "u.last_name as teacher_last")
            .first();

        if (!classData) return null;

        const [stats, students] = await Promise.all([
            this._getClassStats(id, classData.capacity),
            this._getEnrolledStudentsDetailed(id),
        ]);

        return this._transformToClassDetailView(classData, stats, students);
    }

    async _getEnrolledStudentsDetailed(classId) {
        const db = this.knex;

        return await this._applyTenantFilter(db("user_class as uc"), "uc")
            .join("users as u", "uc.user_id", "u.id")
            .leftJoin("user_plan as up", (join) => {
                join.on("u.id", "=", "up.user_id").andOn(
                    "up.id", "=",
                    this._applyTenantFilter(db("user_plan").select("id"), "user_plan")
                        .whereRaw("user_id = u.id")
                        .orderBy("created_at", "desc")
                        .limit(1)
                );
            })
            .leftJoin("plans as p", "up.plan_id", "p.id")
            .leftJoin("attendances as a", (join) => {
                join.on("u.id", "=", "a.student_id")
                    .andOn("a.class_id", "=", db.raw("?", [classId]))
                    .andOn("a.id", "=",
                        this._applyTenantFilter(db("attendances").select("id"), "attendances")
                            .whereRaw("student_id = u.id AND class_id = ?", [classId])
                            .orderBy("date", "desc")
                            .limit(1)
                    );
            })
            .where("uc.class_id", classId)
            .select("u.id", "u.first_name", "u.last_name", "p.name as plan_name",
                "up.classes_remaining", "a.date as last_attendance_date", "a.status as last_status")
            .orderBy("u.first_name", "asc");
    }

    async _getClassStats(classId, capacity) {
        const db = this.knex;
        const enrolled = await this._applyTenantFilter(db("user_class"), "user_class")
            .where("class_id", classId)
            .count("user_id as total");
        const totalInscritos = enrolled[0].total || 0;

        const avgAttendance = await this._applyTenantFilter(db("attendances"), "attendances")
            .where("class_id", classId)
            .count("id as total");

        return {
            occupancy_percentage: capacity > 0 ? Math.round((totalInscritos / capacity) * 100) : 0,
            enrolled_count: totalInscritos,
            average_attendance: avgAttendance[0].total || 0,
        };
    }

    _transformToClassDetailView(data, stats, students) {
        return {
            header: {
                id: data.id,
                title: data.name,
                level_tag: `${data.level} • ${data.date}`,
                genre: data.genre,
            },
            stats: [
                { label: "Ocupación", value: `${stats.occupancy_percentage}%` },
                { label: "Inscritos", value: stats.enrolled_count.toString() },
                { label: "Asis. Promedio", value: stats.average_attendance.toString() },
            ],
            session_details: {
                time_range: `${data.hour} - ${this._calculateEndTime(data.hour, data.duration)}`,
                duration_label: `Duración: ${data.duration} minutos`,
                location: "Salón Principal",
                location_detail: `Piso 2 • Capacidad: ${data.capacity}`,
            },
            students: students.map((s) => ({
                id: s.id,
                full_name: `${s.first_name} ${s.last_name}`,
                plan_info: `${s.plan_name || "Sin Plan"} • ${s.classes_remaining ?? 0} clases rest.`,
                last_attendance_date: s.last_attendance_date,
                has_attended: s.last_status === "present",
            })),
        };
    }

    _calculateEndTime(startTime, durationMinutes) {
        if (!startTime) return "";
        const [hours, minutes] = startTime.split(":").map(Number);
        const end = new Date(0, 0, 0, hours, minutes + durationMinutes);
        return end.toTimeString().substring(0, 5);
    }

    async getNextClass() {
        const db = this.knex;
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const now = new Date();
        const currentDayName = daysOfWeek[now.getDay()];
        const currentTime = now.toTimeString().substring(0, 8);

        const nextClass = await this._applyTenantFilter(db("classes as c"), "c")
            .leftJoin("users as u", "c.teacher_id", "u.id")
            .where("c.date", currentDayName)
            .andWhere("c.hour", ">", currentTime)
            .select("c.name", "c.hour", "c.date", "c.duration", "u.first_name as teacher_name", "u.last_name as teacher_last")
            .orderBy("c.hour", "asc")
            .first();

        if (!nextClass) return null;
        return this._transformToNextClassView(nextClass);
    }

    _transformToNextClassView(data) {
        const todayStr = new Date().toISOString().split("T")[0];
        return {
            title: data.name,
            teacher: { name: `${data.teacher_name} ${data.teacher_last}` },
            location: "Studio A",
            startTime: `${todayStr}T${data.hour}:00`,
            rawHour: data.hour,
            dayName: data.date,
        };
    }

    async enrollStudents(classId, studentIds) {
        const inserts = studentIds.map(sid => ({
            class_id: classId,
            user_id: sid,
            created_at: new Date()
        }));
        return this.knex("user_class").insert(inserts).onConflict(['class_id', 'user_id']).ignore();
    }
}

export default new ClassRepository();