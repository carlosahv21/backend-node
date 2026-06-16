import registrationRepository from './registration.repository.js';

class RegistrationService {
    async getAllRegistrations(queryParams) {
        return registrationRepository.findAll(queryParams);
    }

    async getRegistrationsGroupedByStudent(queryParams) {
        return registrationRepository.findGroupedByStudent(queryParams);
    }

    async getRegistrationById(id) {
        return registrationRepository.findById(id);
    }

    async createRegistration(data) {
        return registrationRepository.create(data);
    }

    async deleteRegistration(id) {
        return registrationRepository.delete(id);
    }
}

export default new RegistrationService();