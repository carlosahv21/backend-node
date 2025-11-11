const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(morgan('dev')); // Logs HTTP
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

// Archivos estáticos
app.use('/storage', express.static('storage'));

// Rutas
app.use('/api', require('./routes'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  const details = err.details || "An unexpected error occurred";

  res.status(status).json({
    success: false,
    message,
    details,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
