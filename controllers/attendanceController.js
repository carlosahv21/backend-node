import attendanceService from '../services/attendanceService.js';
import ApiResponse from '../utils/apiResponse.js';

class attendanceController {

    async createAttendance(req, res) {
        try {
            const result = await attendanceService.createAttendance(req.body);
            ApiResponse.success(res, 201, "Asistencia creada correctamente", result);
        } catch (error) {
            const status = error.statusCode || 400;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAllAttendances(req, res) {
        try {
            const result = await attendanceService.getAllAttendances(req.user, req.permission, req.query);
            ApiResponse.success(res, 200, "Asistencias obtenidas correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByClassAndDate(req, res) {
        try {
            const { class_id, date } = req.query;
            if (!class_id || !date) {
                return ApiResponse.error(res, 400, "class_id and date are required");
            }
            const result = await attendanceService.getAttendanceByClassAndDate(class_id, date);
            ApiResponse.success(res, 200, "Asistencias obtenidas correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async updateAttendance(req, res) {
        try {
            const { id } = req.params;
            const result = await attendanceService.updateAttendance(id, req.body);
            ApiResponse.success(res, 200, "Asistencia actualizada correctamente", result);
        } catch (error) {
            const status = error.statusCode || 400;
            ApiResponse.error(res, status, error.message);
        }
    }

    async deleteAttendance(req, res) {
        try {
            const { id } = req.params;
            await attendanceService.deleteAttendance(id);
            ApiResponse.success(res, 204, "Asistencia eliminada correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async binAttendance(req, res) {
        try {
            const { id } = req.params;
            const result = await attendanceService.binAttendance(id);
            ApiResponse.success(res, 200, "Asistencia movida a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restoreAttendance(req, res) {
        try {
            const { id } = req.params;
            const result = await attendanceService.restoreAttendance(id);
            ApiResponse.success(res, 200, "Asistencia restaurada correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new attendanceController();
