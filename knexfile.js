// knexfile.js
// Este archivo SOLO exporta la configuración que la CLI de Knex (npx knex...) necesita.
// La conexión real se inicializa en config/knex.js
require('dotenv').config(); // Aseguramos que se carguen las variables de entorno

module.exports = {

    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './db/migrations', 
            extension: 'js'
        },
        seeds: {
            directory: './db/seeds' 
        }
    },
    
    production: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './db/migrations',
            extension: 'js'
        },
        seeds: {
            directory: './db/seeds'
        }
    }
};