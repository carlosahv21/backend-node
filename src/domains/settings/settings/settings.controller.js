import settingsService from './settings.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class SettingsController {
    async getMySettings(req, res, next) {
        try {
            const settings = await settingsService.getMySettings();
            ApiResponse.success(res, 200, "Settings retrieved", settings);
        } catch (error) {
            next(error);
        }
    }

    async getAllSettings(req, res, next) {
        try {
            const settings = await settingsService.getAllSettings(req.query);
            ApiResponse.success(res, 200, "Settings retrieved", settings);
        } catch (error) {
            next(error);
        }
    }

    async getSettingsById(req, res, next) {
        try {
            const settings = await settingsService.getSettingsById(req.params.id);
            ApiResponse.success(res, 200, "Settings retrieved", settings);
        } catch (error) {
            next(error);
        }
    }

    async updateSettings(req, res, next) {
        try {
            const updated = await settingsService.updateSettings(req.params.id, req.body);
            ApiResponse.success(res, 200, "Settings updated successfully", updated);
        } catch (error) {
            next(error);
        }
    }

    async deleteSettings(req, res, next) {
        try {
            await settingsService.deleteSettings(req.params.id);
            ApiResponse.success(res, 200, "Settings deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

export default new SettingsController();