import BaseModel from './baseModel.js';

class TeacherReviewsModel extends BaseModel {
    constructor() {
        super('teacher_reviews');
        this.selectFields = [
            'teacher_reviews.*',
            'student.first_name as student_first_name',
            'student.last_name as student_last_name',
            'teacher.first_name as teacher_first_name',
            'teacher.last_name as teacher_last_name',
            'c.name as class_name',
        ];
        this.searchFields = [
            'student.first_name',
            'student.last_name',
            'teacher.first_name',
            'teacher.last_name',
            'teacher_reviews.comment',
        ];
        this.joins = [
            { table: 'users', alias: 'student', on: ['teacher_reviews.student_id', 'student.id'] },
            { table: 'users', alias: 'teacher', on: ['teacher_reviews.teacher_id', 'teacher.id'] },
            { table: 'classes', alias: 'c', on: ['teacher_reviews.class_id', 'c.id'] },
        ];
        this.filterMapping = {
            student_id: 'teacher_reviews.student_id',
            teacher_id: 'teacher_reviews.teacher_id',
            class_id: 'teacher_reviews.class_id',
            rating: 'teacher_reviews.rating',
            is_anonymous: 'teacher_reviews.is_anonymous',
        };
    }
}

export default new TeacherReviewsModel();
