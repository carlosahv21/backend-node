import teacherReviewsRepository from './teacherReviews.repository.js';

class TeacherReviewsService {
    async getAllTeacherReviews(queryParams) {
        return teacherReviewsRepository.findAll(queryParams);
    }

    async getTeacherReviewById(id) {
        return teacherReviewsRepository.findById(id);
    }

    async getTeacherReviewsByTeacherId(teacherId) {
        return teacherReviewsRepository.findAll({ teacher_id: teacherId });
    }

    async createTeacherReview(data) {
        return teacherReviewsRepository.create(data);
    }

    async updateTeacherReview(id, data) {
        return teacherReviewsRepository.update(id, data);
    }

    async binTeacherReview(id) {
        return teacherReviewsRepository.bin(id);
    }

    async restoreTeacherReview(id) {
        return teacherReviewsRepository.restore(id);
    }

    async deleteTeacherReview(id) {
        return teacherReviewsRepository.delete(id);
    }
}

export default new TeacherReviewsService();