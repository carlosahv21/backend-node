// knexfile.js
import 'dotenv/config'; // Importación para cargar variables de entorno en ES Modules

export default {

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
            directory: './db/migration',
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