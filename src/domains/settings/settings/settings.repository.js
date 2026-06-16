import academyRepository from "../../academy/academies/academy.repository.js";

class SettingsRepository {
    async getMyAcademy() {
        return academyRepository.getMyAcademy();
    }

    async getAllAcademies(query) {
        return academyRepository.getAllAcademies(query);
    }

    async getAcademyById(id) {
        return academyRepository.getAcademyById(id);
    }

    async updateAcademy(id, data) {
        return academyRepository.update(id, data);
    }

    async deleteAcademy(id) {
        return academyRepository.delete(id);
    }
}

export default new SettingsRepository();