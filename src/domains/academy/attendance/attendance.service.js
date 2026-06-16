import attendanceRepository from './attendance.repository.js';

class AttendanceService {
    async getAllAttendances(queryParams) {
        return attendanceRepository.findAll(queryParams);
    }

    async getAttendanceById(id) {
        return attendanceRepository.findById(id);
    }

    async getAttendanceByClass(class_id, date) {
        return attendanceRepository.getDetails(class_id, date);
    }

    async createAttendance(data) {
        return attendanceRepository.create(data);
    }

    async bulkCreateOrUpdate(attendanceRecords) {
        return attendanceRepository.bulkCreateOrUpdate(attendanceRecords);
    }

    async deleteAttendance(id) {
        return attendanceRepository.delete(id);
    }
}

export default new AttendanceService();