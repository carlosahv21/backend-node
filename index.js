const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();
const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use("/storage", express.static("storage"));

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/blocks", require("./routes/blocks"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/fields", require("./routes/fields"));
app.use("/api/modules", require("./routes/modules"));
app.use("/api/permissions", require("./routes/permissions"));
app.use("/api/rolePermissions", require("./routes/rolePermissions"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/routes", require("./routes/route"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/users", require("./routes/users"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
