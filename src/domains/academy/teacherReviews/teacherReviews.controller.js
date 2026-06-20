import teacherReviewsService from './teacherReviews.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class TeacherReviewsController {
    async getAll(req, res, next) {
        try {
            const result = await teacherReviewsService.getAllTeacherReviews(req.query);
            ApiResponse.success(res, 200, "Reviews obtenidas correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const review = await teacherReviewsService.getTeacherReviewById(id);
            ApiResponse.success(res, 200, "Review obtenida correctamente", review);
        } catch (error) {
            next(error);
        }
    }

    async getByTeacher(req, res, next) {
        try {
            const { teacherId } = req.params;
            const reviews = await teacherReviewsService.getTeacherReviewsByTeacherId(teacherId);
            ApiResponse.success(res, 200, "Reviews del profesor obtenidas correctamente", reviews);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newReview = await teacherReviewsService.createTeacherReview(req.body);
            ApiResponse.success(res, 201, "Review creada correctamente", newReview);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedReview = await teacherReviewsService.updateTeacherReview(req.params.id, req.body);
            ApiResponse.success(res, 200, "Review actualizada correctamente", updatedReview);
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await teacherReviewsService.binTeacherReview(req.params.id);
            ApiResponse.success(res, 200, "Review movida a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await teacherReviewsService.restoreTeacherReview(req.params.id);
            ApiResponse.success(res, 200, "Review restaurada correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await teacherReviewsService.deleteTeacherReview(req.params.id);
            ApiResponse.success(res, 204, "Review eliminada correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new TeacherReviewsController();