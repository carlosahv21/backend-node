import attendanceModel from '../models/attendanceModel.js';
import registrationModel from '../models/registrationModel.js';

class AttendanceService {

    async registerAttendance(data) {
        // data can be a single object or an array
        const records = Array.isArray(data) ? data : [data];

        // Validate that students are registered in the class
        // This is a basic validation, could be optimized for bulk
        for (const record of records) {
            const isRegistered = await registrationModel.isRegistered(record.student_id, record.class_id);
            if (!isRegistered) {
                throw new Error(`El estudiante no esta registrado en la clase ${record.class_id}`);
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
}

export default new AttendanceService();
