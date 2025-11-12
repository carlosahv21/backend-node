const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const usersRoutes = require("./users");
const authRoutes = require("./auth");
const settingsRoutes = require("./settings");
const uploadRoute = require('./upload');
const routesRoute = require('./route');
const classesRoute = require('./classes');
const fieldsRoutes = require('./fields');
const modulesRoute = require('./modules');
const blocksRoute = require('./blocks');
const rolesRoute = require('./roles');

const app = express();

// Configuraciones de seguridad
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

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
app.use("/images", uploadRoute);
app.use("/users", usersRoutes);
app.use("/routes", routesRoute);
app.use("/classes", classesRoute);
app.use("/modules", modulesRoute);
app.use("/fields", fieldsRoutes);
app.use("/blocks", blocksRoute);
app.use("/roles", rolesRoute);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

module.exports = app;
