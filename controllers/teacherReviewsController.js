import teacherReviewsService from '../services/teacherReviewsService.js';
import ApiResponse from '../utils/apiResponse.js';

class TeacherReviewsController {
    async getAll(req, res) {
        try {
            const result = await teacherReviewsService.getAllReviews(req.query);
            ApiResponse.success(res, 200, 'Reseñas obtenidas correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const review = await teacherReviewsService.getReviewById(id);
            ApiResponse.success(res, 200, 'Reseña obtenida correctamente', review);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByTeacher(req, res) {
        try {
            const { teacherId } = req.params;
            const reviews = await teacherReviewsService.getReviewsByTeacher(teacherId);
            ApiResponse.success(res, 200, 'Reseñas obtenidas correctamente', reviews);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res) {
        try {
            const studentId = req.user.id;
            const newReview = await teacherReviewsService.createReview(req.body, studentId);
            ApiResponse.success(res, 201, 'Reseña creada correctamente', { review: newReview });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res) {
        try {
            await teacherReviewsService.updateReview(req.params.id, req.body);
            ApiResponse.success(res, 200, 'Reseña actualizada correctamente');
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await teacherReviewsService.binReview(id, userId);
            ApiResponse.success(res, 200, 'Reseña movida a papelera correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res) {
        try {
            const { id } = req.params;
            const result = await teacherReviewsService.restoreReview(id);
            ApiResponse.success(res, 200, 'Reseña restaurada correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res) {
        try {
            await teacherReviewsService.deleteReview(req.params.id);
            ApiResponse.success(res, 204, 'Reseña eliminada correctamente');
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new TeacherReviewsController();
