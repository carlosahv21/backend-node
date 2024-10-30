const knex = require('knex');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de la conexión a la base de datos
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // El puerto por defecto es 3306 para MySQL
  },
});

module.exports = db; // Exportar la conexión de Knex