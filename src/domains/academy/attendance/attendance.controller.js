import attendanceService from './attendance.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class AttendanceController {
    async getAll(req, res, next) {
        try {
            const result = await attendanceService.getAllAttendances(req.query);
            ApiResponse.success(res, 200, "Asistencias obtenidas correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const attendance = await attendanceService.getAttendanceById(id);
            ApiResponse.success(res, 200, "Asistencia obtenida correctamente", attendance);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByClass(req, res, next) {
        try {
            const { class_id } = req.params;
            const { date } = req.query;
            const result = await attendanceService.getAttendanceByClass(class_id, date);
            ApiResponse.success(res, 200, "Asistencias de la clase obtenidas correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const result = await attendanceService.createAttendance(req.body);
            ApiResponse.success(res, 201, "Asistencia creada correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bulkCreateOrUpdate(req, res, next) {
        try {
            const { attendance_records } = req.body;
            const result = await attendanceService.bulkCreateOrUpdate(attendance_records);
            ApiResponse.success(res, 200, "Asistencias actualizadas correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await attendanceService.deleteAttendance(req.params.id);
            ApiResponse.success(res, 204, "Asistencia eliminada correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new AttendanceController();