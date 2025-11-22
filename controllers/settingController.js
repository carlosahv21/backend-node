// controllers/settingController.js
import settingService from '../services/settingService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

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
      res.status(200).json(settings);
    } catch (error) {
      next(new utilsCustomError(error.message, error.status || 500));
    }
  }

  /**
   * Actualiza la configuración global.
   */
  async updateSettings(req, res, next) {
    try {
      const updatedSettings = await settingService.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: "Configuración actualizada correctamente",
        data: updatedSettings
      });
    } catch (error) {
      next(new utilsCustomError(error.message, error.status || 500));
    }
  }
}

export default new SettingController();