// attendanceService.js
import attendanceModel from '../models/attendanceModel.js';
import registrationModel from '../models/registrationModel.js';
import AppError from '../utils/AppError.js';

class attendanceService {
    async createAttendance(data) {
        const records = Array.isArray(data) ? data : [data];

        for (const record of records) {
            const isRegistered = await registrationModel.isRegistered(record.student_id, record.class_id);
            if (!isRegistered) {
                throw new AppError(`El estudiante no esta registrado en la clase ${record.class_id}`);
            }
        }

        return await attendanceModel.bulkCreateOrUpdate(records);
    }

    async getAttendance(queryParams) {
        return await attendanceModel.findAll(queryParams);
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
