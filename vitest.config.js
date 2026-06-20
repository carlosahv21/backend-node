import { defineConfig } from 'vitest/config';
import 'dotenv/config';

export default defineConfig({
    test: {
        env: { ...process.env },
        // Los tests de integración comparten una única conexión Knex y la
        // cierran en afterAll. Ejecutar los archivos en serie evita que el
        // destroy() de un archivo afecte a otro que aún esté corriendo.
        fileParallelism: false,
        include: ['src/tests/**/*.test.js'],
    },
});
