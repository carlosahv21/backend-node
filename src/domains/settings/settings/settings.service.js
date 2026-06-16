import settingsRepository from './settings.repository.js';

class SettingsService {
    async getMySettings() {
        return settingsRepository.getMyAcademy();
    }

    async getAllSettings(query) {
        return settingsRepository.getAllAcademies(query);
    }

    async getSettingsById(id) {
        return settingsRepository.getAcademyById(id);
    }

    async updateSettings(id, data) {
        return settingsRepository.updateAcademy(id, data);
    }

    async deleteSettings(id) {
        return settingsRepository.deleteAcademy(id);
    }
}

export default new SettingsService();