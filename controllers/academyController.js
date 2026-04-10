// controllers/academyController.js
import academyService from '../services/academyService.js';
import ApiResponse from '../utils/apiResponse.js';

class AcademyController {
    /**
     * Registro público de academia.
     * No requiere token.
     */
    async registerAcademy(req, res, next) {
        try {
            const result = await academyService.registerAcademy(req.body);
            ApiResponse.success(res, 201, "Academy and Admin user created successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getMyAcademy(req, res, next) {
        try {
            const academy = await academyService.getMyAcademy();
            ApiResponse.success(res, 200, "Academy data retrieved", academy);
        } catch (error) {
            next(error);
        }
    }

    async getAllAcademies(req, res, next) {
        try {
            const academies = await academyService.getAllAcademies(req.query);
            ApiResponse.success(res, 200, "Academies retrieved", academies);
        } catch (error) {
            next(error);
        }
    }

    async getAcademyById(req, res, next) {
        try {
            const academy = await academyService.getAcademyById(req.params.id);
            ApiResponse.success(res, 200, "Academy data retrieved", academy);
        } catch (error) {
            next(error);
        }
    }

    async updateAcademy(req, res, next) {
        try {
            const updated = await academyService.updateAcademy(req.params.id, req.body);
            ApiResponse.success(res, 200, "Academy updated successfully", updated);
        } catch (error) {
            next(error);
        }
    }

    async deleteAcademy(req, res, next) {
        try {
            await academyService.deleteAcademy(req.params.id);
            ApiResponse.success(res, 200, "Academy deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

export default new AcademyController();
