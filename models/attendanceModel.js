import BaseModel from './baseModel.js';

class AttendanceModel extends BaseModel {
    constructor() {
        super('attendance');
        this.softDelete = false;

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

            // Obtener el plan ACTIVO de cada estudiante
            const activePlans = await trx('user_plan')
                .select('user_id', 'id as user_plan_id', 'status', 'classes_remaining', 'classes_used')
                .whereIn('user_id', studentIds)
                .andWhere('status', 'active');

            const studentPlanMap = new Map(activePlans.map(p => [p.user_id, p]));

            // También obtenemos info básica del usuario para mensajes de error si no tiene plan
            const usersInfo = await trx('users').select('id', 'first_name', 'last_name').whereIn('id', studentIds);
            const userMap = new Map(usersInfo.map(u => [u.id, u]));
            // --- Validation Block End ---

            for (const newRecord of attendanceRecords) {
                const { class_id, student_id, date, status } = newRecord;
                const newStatus = status?.toLowerCase();

                // Validate student plan status if trying to mark as present
                if (newStatus === 'present') {
                    const userPlan = studentPlanMap.get(student_id);
                    const user = userMap.get(student_id);

                    if (!userPlan) {
                        throw new Error(`El estudiante ${user ? user.first_name + ' ' + user.last_name : student_id} no tiene un plan activo. No se puede registrar asistencia.`);
                    }

                    // Validar si tiene clases disponibles (si no es ilimitado - asumimos 0 o numero muy alto como ilimitado, 
                    // pero en paymentService guardamos 9999 si era 0. Si classes_remaining es > 0, puede entrar).
                    if (userPlan.classes_remaining <= 0) {
                        throw new Error(`El estudiante ${user.first_name} ${user.last_name} ha agotado sus clases disponibles.`);
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
                        usageChange = -1; // Restar uso (devolver clase)
                    } else if (existingStatus !== 'present' && newStatus === 'present') {
                        usageChange = 1; // Sumar uso (gastar clase)
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

            // Upsert asistencias
            if (recordsToUpdate.length > 0) {
                await trx(this.tableName)
                    .insert(recordsToUpdate)
                    .onConflict(['class_id', 'student_id', 'date'])
                    .merge(['status', 'updated_at']);
            }

            // Actualizar planes de usuario
            for (const [studentId, change] of userUsageUpdates.entries()) {
                if (change !== 0) {
                    const userPlan = studentPlanMap.get(studentId);
                    if (!userPlan) continue; // Should not happen given validation above but safe check

                    // Actualizar contadores
                    await trx("user_plan")
                        .where({ id: userPlan.user_plan_id })
                        .update({
                            classes_used: this.knex.raw(`classes_used + ?`, [change]),
                            classes_remaining: this.knex.raw(`classes_remaining - ?`, [change]), // Si change es 1, resta 1. Si es -1, suma 1.
                            updated_at: new Date()
                        });

                    // Verificar si se agotó el plan despues del update
                    // Volvemos a consultar para tener el valor actualizado exacto o calculamos en memoria
                    const updatedPlan = await trx("user_plan")
                        .select('classes_remaining', 'status', 'max_classes') // max_classes para saber si es ilimitado (aunque remaining alto ya lo cubre)
                        .where({ id: userPlan.user_plan_id })
                        .first();

                    if (updatedPlan) {
                        // Si llego a 0 y NO es ilimitado (asumimos logicamente que si remaining llega a 0 es porque no es ilimitado o se acabaron las 9999)
                        // Logica: si remaining <= 0, plan finished.
                        if (updatedPlan.classes_remaining <= 0 && updatedPlan.status === 'active') {
                            await trx("user_plan")
                                .where({ id: userPlan.user_plan_id })
                                .update({ status: 'expired', updated_at: new Date() }); // 'expired' or 'finished'
                        }
                        // Si devolvimos clases y el plan estaba expired, lo reactivamos?
                        else if (change < 0 && updatedPlan.classes_remaining > 0 && updatedPlan.status === 'expired') {
                            await trx("user_plan")
                                .where({ id: userPlan.user_plan_id })
                                .update({ status: 'active', updated_at: new Date() });
                        }
                    }
                }
            }

            return { success: true, message: "Attendance and plan usage updated successfully." };
        });
    }
}

export default new AttendanceModel();