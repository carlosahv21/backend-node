// controllers/settingController.js
import settingService from '../services/settingService.js';
import ApiResponse from '../utils/apiResponse.js';

class SettingController {

    /**
     * Obtiene la configuración de la academia del tenant actual
     * combinada con las preferencias del usuario autenticado.
     */
    async getSettings(req, res, next) {
        try {
            const settings = await settingService.getSettings(req.user.id);
            ApiResponse.success(res, 200, "Configuración obtenida correctamente", settings);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Actualiza la configuración de la academia y/o las preferencias del usuario.
     * El servicio enruta automáticamente cada campo a la tabla correcta.
     */
    async updateSettings(req, res, next) {
        try {
            const updatedSettings = await settingService.updateSettings(req.user.id, req.body);
            ApiResponse.success(res, 200, "Configuración actualizada correctamente", updatedSettings);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new SettingController();