const express = require("express");
const usersRoutes = require("./users");
const authRoutes = require("./auth");
const settingsRoutes = require("./settings");
const uploadRoute = require('./upload');

const app = express();  // Usa `app` aquí para configurar la aplicación Express

// Aumentar el tamaño del límite de JSON a 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta principal de prueba
app.get("/", (req, res) => {
  res.send("API is working");
});

// Registrar las rutas
app.use("/settings", settingsRoutes);
app.use("/auth", authRoutes);
app.use("/images", uploadRoute); // Ruta para subir logo
app.use("/users", usersRoutes);

module.exports = app;
