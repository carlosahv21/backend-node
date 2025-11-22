// config/knex.js
// Inicializador de la conexión a la base de datos para Express.
const knexfile = require('../knexfile'); // Carga la configuración del archivo de la raíz
const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

// Crea y exporta el objeto Knex ya conectado
const knex = require('knex')(config);

module.exports = knex;