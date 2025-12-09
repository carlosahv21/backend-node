import BaseModel from './baseModel.js';

class AttendanceModel extends BaseModel {
    constructor() {
        super('attendance');

        this.joins = [
            { table: "classes", alias: "c", on: ["attendance.class_id", "c.id"] },
            { table: "users", alias: "u", on: ["attendance.student_id", "u.id"] }
        ];

        this.selectFields = [
            "attendance.*",
            "c.name as class_name",
            "c.date as class_date",
            "u.first_name as student_first_name",
            "u.last_name as student_last_name",
            "u.email as student_email"
        ];

        this.searchFields = ["c.name", "u.first_name", "u.last_name"];

        this.filterMapping = {
            'class_id': 'attendance.class_id',
            'student_id': 'attendance.student_id',
            'date': 'attendance.date',
            'status': 'attendance.status'
        };

        this.relationMaps = {
            'default': {
                joins: this.joins,
                column_map: this.filterMapping
            }
        };
    }

    /**
     * Obtiene registros de asistencia detallados por class_id y date
     */
    async getDetails(class_id, date) {
        let query = this.knex(this.tableName)
            .select("attendance.*")
            .where({ 'attendance.class_id': class_id });

        if (date) {
            query = query.whereRaw('DATE(attendance.date) = ?', [date]);
        }

        return query;
    }

    /**
     * Crea o actualiza registros de asistencia de forma masiva y gestiona el uso de planes de usuario,
     * incluyendo la reversión (resta) del uso si se cambia el estado de 'present' a otro.
     */
    async bulkCreateOrUpdate(attendanceRecords) {
        if (!attendanceRecords || attendanceRecords.length === 0) {
            return { success: true, message: "No records provided" };
        }

        return this.knex.transaction(async (trx) => {
            const recordsToUpdate = [];
            const userUsageUpdates = new Map();

            // --- Validation Block Start ---
            const studentIds = [...new Set(attendanceRecords.map(r => r.student_id))];
            const students = await trx('users')
                .select('id', 'first_name', 'last_name', 'plan_status')
                .whereIn('id', studentIds);
            const studentMap = new Map(students.map(s => [s.id, s]));
            // --- Validation Block End ---

            for (const newRecord of attendanceRecords) {
                const { class_id, student_id, date, status } = newRecord;
                const newStatus = status?.toLowerCase();

                // Validate student plan status if trying to mark as present
                if (newStatus === 'present') {
                    const student = studentMap.get(student_id);
                    // Check if student exists and strict check for 'active' status
                    if (student && student.plan_status !== 'active') {
                        throw new Error(`El estudiante ${student.first_name} ${student.last_name} no tiene un plan activo (Estado: ${student.plan_status}). No se puede registrar asistencia.`);
                    }
                }

                const existingRecord = await trx(this.tableName)
                    .where({ class_id, student_id })
                    .whereRaw('DATE(date) = ?', [date])
                    .first();

                let usageChange = 0;

                if (existingRecord) {
                    const existingStatus = existingRecord.status?.toLowerCase();

                    if (existingStatus === 'present' && newStatus !== 'present') {
                        usageChange = -1;
                    } else if (existingStatus !== 'present' && newStatus === 'present') {
                        usageChange = 1;
                    }
                } else if (newStatus === 'present') {
                    usageChange = 1;
                }

                if (usageChange !== 0) {
                    userUsageUpdates.set(student_id, (userUsageUpdates.get(student_id) || 0) + usageChange);
                }

                recordsToUpdate.push({
                    ...newRecord,
                    status: newStatus,
                    updated_at: new Date()
                });
            }

            await trx(this.tableName)
                .insert(recordsToUpdate)
                .onConflict(['class_id', 'student_id', 'date'])
                .merge(['status', 'updated_at']);

            for (const [studentId, change] of userUsageUpdates.entries()) {
                if (change !== 0) {
                    await trx("users")
                        .where({ id: studentId })
                        .update({
                            plan_classes_used: this.knex.raw(`plan_classes_used ${change > 0 ? '+' : '-'} ${Math.abs(change)}`),
                            updated_at: new Date()
                        });

                    const user = await trx("users as u")
                        .leftJoin("plans as p", "u.plan_id", "p.id")
                        .select("u.plan_classes_used", "u.plan_status", "p.max_sessions as plan_limit")
                        .where("u.id", studentId)
                        .first();

                    if (user && user.plan_limit !== null) {
                        if (change > 0 && user.plan_classes_used >= user.plan_limit && user.plan_status !== 'finished') {
                            await trx("users")
                                .where({ id: studentId })
                                .update({
                                    plan_status: 'finished',
                                    updated_at: new Date()
                                });
                        }
                        else if (change < 0 && user.plan_classes_used < user.plan_limit && user.plan_status === 'finished') {
                            await trx("users")
                                .where({ id: studentId })
                                .update({
                                    plan_status: 'active',
                                    updated_at: new Date()
                                });
                        }
                    }
                }
            }

            return { success: true, message: "Attendance and plan usage updated successfully." };
        });
    }
}

export default new AttendanceModel();