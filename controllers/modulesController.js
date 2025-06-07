// controllers/ModuleController.js
const BaseController = require("./BaseController");

class ModuleController extends BaseController {
    constructor() {
        super("modules"); // Define la tabla de módulos
    }

    // Activar/Desactivar un módulo
    async toggle(req, res) {
        try {
            const { id } = req.params;
            const module = await this.knex(this.tableName).where({ id }).first();

            if (!module) {
                return res.status(404).json({ message: "Module not found" });
            }

            const newStatus = !module.is_active;
            await this.knex(this.tableName).where({ id }).update({ is_active: newStatus });

            res.json({ success: true, is_active: newStatus });
        } catch (error) {
            console.error("Error toggling module:", error);
            res.status(500).json({ message: "Failed to toggle module", error });
        }
    }
}

module.exports = ModuleController;
