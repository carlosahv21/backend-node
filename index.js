const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:3001', // URL de tu frontend en React
  credentials: true,
}));

// Middleware para procesar JSON
app.use(express.json());

// Sirve archivos estáticos desde la carpeta "storage"
app.use('/storage', express.static('storage'));

// Rutas de tu backend
app.use('/api', require('./routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
