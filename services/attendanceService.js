// attendanceService.js
import attendanceModel from '../models/attendanceModel.js';
import registrationModel from '../models/registrationModel.js';
import AppError from '../utils/AppError.js';
import notificationService from './notificationService.js';
import knex from '../config/knex.js';
import { applyScope } from '../utils/applyScope.js';

class attendanceService {
    async createAttendance(data) {
        const records = Array.isArray(data) ? data : [data];

        for (const record of records) {
            const isRegistered = await registrationModel.isRegistered(record.student_id, record.class_id);
            if (!isRegistered) {
                throw new AppError(`El estudiante no esta registrado en la clase ${record.class_id}`);
            }
        }

        const result = await attendanceModel.bulkCreateOrUpdate(records);

        // NOTIFICATIONS: Check for milestone achievements
        try {
            const milestones = [10, 25, 50];
            const firstDayOfMonth = new Date();
            firstDayOfMonth.setDate(1);
            firstDayOfMonth.setHours(0, 0, 0, 0);

            for (const record of records) {
                if (record.status !== 'present') continue;

                // Count total attendances this month
                const monthCount = await knex('attendances')
                    .where('student_id', record.student_id)
                    .where('status', 'present')
                    .where('date', '>=', firstDayOfMonth)
                    .count('* as count')
                    .first();

                const total = parseInt(monthCount.count);

                // Check if user just hit a milestone
                if (milestones.includes(total)) {
                    await notificationService.notifyUser(record.student_id, {
                        title: '¡Felicidades!',
                        message: `Has completado ${total} clases este mes. ¡Sigue así!`,
                        category: 'ATTENDANCE'
                    });
                }
            }
        } catch (notifError) {
            console.error('⚠️ Error sending attendance milestone notifications:', notifError.message);
            // Don't block attendance creation if notifications fail
        }

        return result;
    }

    async getAllAttendances(user, permission, queryParams) {
        return await attendanceModel.findAll(queryParams, async (query) => {
            await applyScope(query, permission, user, {
                ownColumn: 'attendances.student_id',
                assignedColumn: 'attendances.class_id',
                assignedResolver: async (user) => {
                    return await knex('teacher_classes')
                        .where('teacher_id', user.id)
                        .pluck('class_id');
                }
            });
        });
    }

    async getAttendanceByClassAndDate(class_id, date) {
        return await attendanceModel.getDetails(class_id, date);
    }

    async updateAttendance(id, data) {
        return await attendanceModel.update(id, data);
    }

    async deleteAttendance(id) {
        return await attendanceModel.delete(id);
    }

    async binAttendance(id, userId) {
        return await attendanceModel.bin(id, userId);
    }

    async restoreAttendance(id) {
        return await attendanceModel.restore(id);
    }
}

export default new attendanceService();
