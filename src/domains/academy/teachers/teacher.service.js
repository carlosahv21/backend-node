import teacherRepository from './teacher.repository.js';

class TeacherService {
    async getAllTeachers(queryParams) {
        return teacherRepository.findAll(queryParams);
    }

    async getTeacherById(id) {
        return teacherRepository.findById(id);
    }

    async getTeacherByIdDetails(id) {
        return teacherRepository.findByIdDetails(id);
    }

    async createTeacher(data) {
        return teacherRepository.create(data);
    }

    async updateTeacher(id, data) {
        return teacherRepository.update(id, data);
    }

    async deleteTeacher(id) {
        return teacherRepository.delete(id);
    }

    async binTeacher(id, userId) {
        return teacherRepository.bin(id, userId);
    }

    async restoreTeacher(id) {
        return teacherRepository.restore(id);
    }
}

export default new TeacherService();