// controllers/settingController.js
import settingService from '../services/settingService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Configuración (Settings). 
 */
class SettingController {

  /**
   * Obtiene la configuración global.
   */
  async getSettings(req, res, next) {
    try {
      const settings = await settingService.getSettings();
      ApiResponse.success(res, 200, "Configuración obtenida correctamente", settings);
    } catch (error) {
      const status = error.statusCode || 500;
      ApiResponse.error(res, status, error.message);
    }
  }

  /**
   * Actualiza la configuración global.
   */
  async updateSettings(req, res, next) {
    try {
      const updatedSettings = await settingService.updateSettings(req.body);
      ApiResponse.success(res, 200, "Configuración actualizada correctamente", updatedSettings);
    } catch (error) {
      const status = error.statusCode || 500;
      ApiResponse.error(res, status, error.message);
    }
  }
}

export default new SettingController();