// models/classModel.js
import BaseModel from "./baseModel.js";

class ClassModel extends BaseModel {
    constructor() {
        super("classes");
        this.selectFields = ["classes.*"];
        this.searchFields = ["classes.name", "classes.level", "classes.genre"];
    }

    async findByIdDetails(id) {
        const db = this.knex;

        const classData = await db("classes as c")
            .leftJoin("users as u", "c.teacher_id", "u.id")
            .where("c.id", id)
            .select(
                "c.*",
                "u.first_name as teacher_name",
                "u.last_name as teacher_last",
            )
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

        return await db("user_class as uc")
            .join("users as u", "uc.user_id", "u.id")
            // JOIN optimizado para traer SOLO el último plan activo
            .leftJoin("user_plan as up", function () {
                this.on("u.id", "=", "up.user_id").andOn(
                    "up.id",
                    "=",
                    db
                        .select("id")
                        .from("user_plan")
                        .whereRaw("user_id = u.id")
                        .orderBy("created_at", "desc")
                        .limit(1),
                );
            })
            .leftJoin("plans as p", "up.plan_id", "p.id")
            // JOIN optimizado para traer SOLO la última asistencia de esta clase específica
            .leftJoin("attendances as a", function () {
                this.on("u.id", "=", "a.student_id")
                    .andOn("a.class_id", "=", db.raw("?", [classId]))
                    .andOn(
                        "a.id",
                        "=",
                        db
                            .select("id")
                            .from("attendances")
                            .whereRaw("student_id = u.id AND class_id = ?", [
                                classId,
                            ])
                            .orderBy("date", "desc") // La fecha más reciente
                            .limit(1),
                    );
            })
            .where("uc.class_id", classId)
            .select(
                "u.id",
                "u.first_name",
                "u.last_name",
                "p.name as plan_name",
                "up.classes_remaining",
                "a.date as last_attendance_date",
                "a.status as last_status",
            )
            .orderBy("u.first_name", "asc");
    }

    // ... (Mantén _getClassStats, _transformToClassDetailView y _calculateEndTime igual)

    async _getClassStats(classId, capacity) {
        const db = this.knex;
        const enrolled = await db("user_class")
            .where("class_id", classId)
            .count("user_id as total");
        const totalInscritos = enrolled[0].total || 0;

        const avgAttendance = await db("attendances")
            .where("class_id", classId)
            .count("id as total");

        return {
            occupancy_percentage:
                capacity > 0
                    ? Math.round((totalInscritos / capacity) * 100)
                    : 0,
            enrolled_count: totalInscritos,
            average_attendance: avgAttendance[0].total || 0,
        };
    }

    _transformToClassDetailView(data, stats, students) {
        return {
            header: {
                title: data.name,
                level_tag: `${data.level} • ${data.date}`,
                genre: data.genre,
            },
            stats: [
                { label: "Ocupación", value: `${stats.occupancy_percentage}%` },
                { label: "Inscritos", value: stats.enrolled_count.toString() },
                {
                    label: "Asis. Promedio",
                    value: stats.average_attendance.toString(),
                },
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

        // 1. Mapeo para obtener el nombre del día actual en inglés (como está en tu DB)
        const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const now = new Date();
        const currentDayName = daysOfWeek[now.getDay()]; // Ej: 'Monday'

        // 2. Obtener hora actual en formato HH:mm:ss o HH:mm
        const currentTime = now.toTimeString().substring(0, 8);

        /**
         * Buscamos la clase más cercana SOLO para el día de hoy
         */
        const nextClass = await db("classes as c")
            .leftJoin("users as u", "c.teacher_id", "u.id")
            .where("c.date", currentDayName) // Comparación de strings: 'Monday' == 'Monday'
            .andWhere("c.hour", ">", currentTime) // La hora aún no ha pasado
            .select(
                "c.name",
                "c.hour",
                "c.date",
                "c.duration",
                "u.first_name as teacher_name",
                "u.last_name as teacher_last",
                // Avatar excluido según tu requerimiento
            )
            .orderBy("c.hour", "asc")
            .first();

        // Si no hay más clases HOY, retornamos null inmediatamente
        if (!nextClass) return null;

        return this._transformToNextClassView(nextClass);
    }

    _transformToNextClassView(data) {
        // Generamos un ISO string con la fecha de hoy para que el frontend calcule el tiempo
        const todayStr = new Date().toISOString().split("T")[0];

        return {
            title: data.name,
            teacher: {
                name: `${data.teacher_name} ${data.teacher_last}`,
            },
            location: "Studio A",
            startTime: `${todayStr}T${data.hour}:00`, // Formato: 2026-02-04T18:00:00
            rawHour: data.hour,
            dayName: data.date,
        };
    }
}

export default new ClassModel();
