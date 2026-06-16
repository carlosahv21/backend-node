import BaseModel from "../../../shared/models/baseModel.js";

class AttendanceRepository extends BaseModel {
    constructor() {
        super('attendances');
        this.softDelete = false;

        this.joins = [
            { table: "classes", alias: "c", on: ["attendances.class_id", "c.id"] },
            { table: "users", alias: "u", on: ["attendances.student_id", "u.id"] }
        ];

        this.selectFields = [
            "attendances.*", "c.name as class_name", "c.date as class_date",
            "u.first_name as student_first_name", "u.last_name as student_last_name", "u.email as student_email"
        ];

        this.searchFields = ["c.name", "u.first_name", "u.last_name"];

        this.filterMapping = {
            'class_id': 'attendances.class_id',
            'student_id': 'attendances.student_id',
            'date': 'attendances.date',
            'status': 'attendances.status',
            'created_at': 'attendances.date'
        };
    }

    async getDetails(class_id, date) {
        let query = this._applyTenantFilter(this.knex(this.tableName))
            .select("attendances.*")
            .where({ 'attendances.class_id': class_id });

        if (date) {
            query = query.whereRaw('DATE(attendances.date) = ?', [date]);
        }

        return query;
    }

    async bulkCreateOrUpdate(attendanceRecords) {
        if (!attendanceRecords || attendanceRecords.length === 0) {
            return { success: true, message: "No records provided" };
        }

        return this.knex.transaction(async (trx) => {
            const recordsToUpdate = [];
            const userUsageUpdates = new Map();

            const studentIds = [...new Set(attendanceRecords.map(r => r.student_id))];

            const activePlans = await this._applyTenantFilter(trx('user_plan'), 'user_plan')
                .select('user_id', 'id as user_plan_id', 'status', 'classes_remaining', 'classes_used')
                .whereIn('user_id', studentIds)
                .andWhere('status', 'active');

            const studentPlanMap = new Map(activePlans.map(p => [p.user_id, p]));

            const usersInfo = await this._applyTenantFilter(trx('users'), 'users')
                .select('id', 'first_name', 'last_name').whereIn('id', studentIds);
            const userMap = new Map(usersInfo.map(u => [u.id, u]));

            for (const newRecord of attendanceRecords) {
                const { class_id, student_id, date, status } = newRecord;
                const newStatus = status?.toLowerCase();

                if (newStatus === 'present') {
                    const userPlan = studentPlanMap.get(student_id);
                    const user = userMap.get(student_id);

                    if (!userPlan) {
                        throw new Error(`El estudiante ${user ? user.first_name + ' ' + user.last_name : student_id} no tiene un plan activo.`);
                    }

                    if (userPlan.classes_remaining <= 0) {
                        throw new Error(`El estudiante ${user.first_name} ${user.last_name} ha agotado sus clases disponibles.`);
                    }
                }

                const existingRecord = await this._applyTenantFilter(trx(this.tableName))
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

            if (recordsToUpdate.length > 0) {
                const tenantId = this._getTenantId();
                if (tenantId) {
                    recordsToUpdate.forEach(r => r.academy_id = tenantId);
                }

                await trx(this.tableName)
                    .insert(recordsToUpdate)
                    .onConflict(['class_id', 'student_id', 'date'])
                    .merge(['status', 'updated_at']);
            }

            for (const [studentId, change] of userUsageUpdates.entries()) {
                if (change !== 0) {
                    const userPlan = studentPlanMap.get(studentId);
                    if (!userPlan) continue;

                    await this._applyTenantFilter(trx("user_plan"), "user_plan")
                        .where({ id: userPlan.user_plan_id })
                        .update({
                            classes_used: this.knex.raw(`classes_used + ?`, [change]),
                            classes_remaining: this.knex.raw(`classes_remaining - ?`, [change]),
                            updated_at: new Date()
                        });

                    const updatedPlan = await this._applyTenantFilter(trx("user_plan"), "user_plan")
                        .select('classes_remaining', 'status')
                        .where({ id: userPlan.user_plan_id })
                        .first();

                    if (updatedPlan) {
                        if (updatedPlan.classes_remaining <= 0 && updatedPlan.status === 'active') {
                            await this._applyTenantFilter(trx("user_plan"), "user_plan")
                                .where({ id: userPlan.user_plan_id })
                                .update({ status: 'expired', updated_at: new Date() });
                        } else if (change < 0 && updatedPlan.classes_remaining > 0 && updatedPlan.status === 'expired') {
                            await this._applyTenantFilter(trx("user_plan"), "user_plan")
                                .where({ id: userPlan.user_plan_id })
                                .update({ status: 'active', updated_at: new Date() });
                        }
                    }
                }
            }

            return { success: true, message: "Attendances and plan usage updated successfully." };
        });
    }
}

export default new AttendanceRepository();