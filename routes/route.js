const express = require("express");
const { getRoutes } = require("../controllers/routesController");

const router = express.Router();

router.get("/", getRoutes);

module.exports = router;