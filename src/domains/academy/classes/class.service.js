import classRepository from './class.repository.js';

class ClassService {
    async getAllClasses(queryParams) {
        return classRepository.findAll(queryParams);
    }

    async getClassById(id) {
        return classRepository.findById(id);
    }

    async getClassByIdDetails(id) {
        return classRepository.findByIdDetails(id);
    }

    async getNextClass() {
        return classRepository.getNextClass();
    }

    async createClass(data) {
        return classRepository.create(data);
    }

    async updateClass(id, data) {
        return classRepository.update(id, data);
    }

    async deleteClass(id) {
        return classRepository.delete(id);
    }

    async binClass(id, userId) {
        return classRepository.bin(id, userId);
    }

    async restoreClass(id) {
        return classRepository.restore(id);
    }

    async enrollStudents(classId, studentIds) {
        return classRepository.enrollStudents(classId, studentIds);
    }
}

export default new ClassService();