import teacherReviewsModel from '../models/teacherReviewsModel.js';
import AppError from '../utils/AppError.js';

class TeacherReviewsService {
    async getAllReviews(queryParams) {
        return teacherReviewsModel.findAll(queryParams);
    }

    async getReviewById(id) {
        return teacherReviewsModel.findById(id);
    }

    async createReview(data, studentId) {
        const { rating, teacher_id, class_id, comment, is_anonymous } = data;

        if (!rating || rating < 1 || rating > 5) {
            throw new AppError('El rating debe ser un número entre 1 y 5', 400);
        }

        if (!teacher_id) {
            throw new AppError('El campo teacher_id es requerido', 400);
        }

        const reviewData = {
            student_id: studentId,
            teacher_id,
            class_id: class_id || null,
            rating,
            comment: comment || null,
            is_anonymous: is_anonymous || false,
        };

        return teacherReviewsModel.create(reviewData);
    }

    async updateReview(id, data) {
        return teacherReviewsModel.update(id, data);
    }

    async binReview(id, userId) {
        return teacherReviewsModel.bin(id, userId);
    }

    async restoreReview(id) {
        return teacherReviewsModel.restore(id);
    }

    async deleteReview(id) {
        return teacherReviewsModel.delete(id);
    }

    async getReviewsByTeacher(teacherId) {
        const db = teacherReviewsModel.knex;
        const reviews = await db('teacher_reviews as tr')
            .leftJoin('users as u', 'tr.student_id', 'u.id')
            .where('tr.teacher_id', teacherId)
            .whereNull('tr.deleted_at')
            .select(
                'tr.*',
                db.raw('CASE WHEN tr.is_anonymous = true THEN NULL ELSE u.first_name END as student_first_name'),
                db.raw('CASE WHEN tr.is_anonymous = true THEN NULL ELSE u.last_name END as student_last_name'),
            )
            .orderBy('tr.created_at', 'desc');
        return reviews;
    }
}

export default new TeacherReviewsService();
