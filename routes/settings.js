const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingController");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (err) {
        console.error("Error getting settings:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
    try {
        const settings = await updateSettings(req.body);  // Pasar req.body para la actualización
        res.json(settings);  // Responder con los settings actualizados
    } catch (err) {
        console.error("Error updating settings:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
