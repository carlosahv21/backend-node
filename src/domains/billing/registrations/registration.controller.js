import registrationService from './registration.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class RegistrationController {
    async getAll(req, res, next) {
        try {
            const result = await registrationService.getAllRegistrations(req.query);
            ApiResponse.success(res, 200, "Inscripciones obtenidas correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getGroupedByStudent(req, res, next) {
        try {
            console.log("req.query", req.query);
            const result = await registrationService.getRegistrationsGroupedByStudent(req.query);
            ApiResponse.success(res, 200, "Inscripciones agrupadas por estudiante obtenidas correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const registration = await registrationService.getRegistrationById(id);
            ApiResponse.success(res, 200, "Inscripción obtenida correctamente", registration);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newRegistration = await registrationService.createRegistration(req.body);
            ApiResponse.success(res, 201, "Inscripción creada correctamente", newRegistration);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await registrationService.deleteRegistration(req.params.id);
            ApiResponse.success(res, 204, "Inscripción eliminada correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new RegistrationController();