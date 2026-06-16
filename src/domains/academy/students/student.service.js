import studentRepository from './student.repository.js';

class StudentService {
    async getAllStudents(queryParams) {
        return studentRepository.findAll(queryParams);
    }

    async getStudentById(id) {
        return studentRepository.findById(id);
    }

    async getStudentByIdDetails(id) {
        return studentRepository.findByIdDetails(id);
    }

    async createStudent(data) {
        return studentRepository.create(data);
    }

    async updateStudent(id, data) {
        return studentRepository.update(id, data);
    }

    async deleteStudent(id) {
        return studentRepository.delete(id);
    }

    async binStudent(id, userId) {
        return studentRepository.bin(id, userId);
    }

    async restoreStudent(id) {
        return studentRepository.restore(id);
    }
}

export default new StudentService();