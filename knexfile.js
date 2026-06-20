// knexfile.js
import 'dotenv/config'; // Importación para cargar variables de entorno en ES Modules

const baseConnection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
};

export default {

    development: {
        client: 'pg',
        connection: {
            ...baseConnection,
            database: process.env.DB_NAME,
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

    // Entorno usado por Vitest (fuerza NODE_ENV=test). Por defecto reutiliza
    // la misma base de datos de desarrollo; define DB_NAME_TEST para aislarla.
    test: {
        client: 'pg',
        connection: {
            ...baseConnection,
            database: process.env.DB_NAME_TEST || process.env.DB_NAME,
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
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 5432,
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