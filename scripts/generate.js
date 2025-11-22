import { promises as fs } from 'fs';
import path from 'path';

// Función auxiliar para capitalizar la primera letra (ej: 'categorias' -> 'Categorias')
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- 1. DEFINICIÓN DE ARCHIVOS Y CARPETAS ---

const files = [
    {
        dir: 'models', suffix: 'Model', template: (entitySingular, entityPlural) => `
import { baseModel } from '../baseModel.js';

/*
    * Capa de Acceso a Datos (DAL) para la entidad ${entityPlural}.
    * Extiende de baseModel para obtener la conexión Knex y métodos CRUD básicos.
*/

export class ${entitySingular}Model extends baseModel {
    constructor() {
        super('${entityPlural.toLowerCase()}');
        // Define aquí los joins y campos de selección específicos si son necesarios.
        this.joins = [];
        this.selectFields = ['${entityPlural.toLowerCase()}.*'];
        this.searchFields = ['${entityPlural.toLowerCase()}.nombre'];
    }
    
    // NOTA: Los métodos findAll, findById, create, update, y delete de esta clase 
    // se heredan automáticamente de baseModel, o puedes sobrescribirlos aquí.
    
    /**
     * Ejemplo de método adicional, si fuera necesario.
     */
    async findActive() {
        return this.knex(this.tableName).where({ activo: true }).select(this.selectFields.join(', '));
    }
}
export default new ${entitySingular}Model();
`},
    {
        dir: 'services', suffix: 'Service', template: (entitySingular, entityPlural) => `
import ${entitySingular}Model from '../models/${entityPlural}Model.js';

// Lógica de negocio (BLL) para la entidad ${entityPlural}

export const getAll${entityPlural} = async () => {
    try {
        // Llama al método findAll del modelo (heredado o implementado)
        const ${entityPlural.toLowerCase()} = await ${entitySingular}Model.findAll();
        return ${entityPlural.toLowerCase()};
    } catch (error) {
        throw new Error(\`Error al obtener ${entityPlural.toLowerCase()}: \${error.message}\`);
    }
};

export const get${entitySingular}ById = async (id) => {
    try {
        // Llama al método findById del modelo, que ya maneja si no se encuentra
        const ${entitySingular.toLowerCase()} = await ${entitySingular}Model.findById(id);
        return ${entitySingular.toLowerCase()};
    } catch (error) {
        throw new Error(\`Error al obtener la ${entitySingular.toLowerCase()} con ID \${id}: \${error.message}\`);
    }
};

export const create${entitySingular} = async (data) => {
    try {
        // El método create en el modelo devuelve el ID del nuevo registro
        const newId = await ${entitySingular}Model.create(data);
        return { id: newId[0], ...data };
    } catch (error) {
        throw new Error(\`Error al crear el ${entitySingular.toLowerCase()}: \${error.message}\`);
    }
};

export const update${entitySingular} = async (id, data) => {
    try {
        // Asume que update es un método que devuelve el número de filas afectadas (0 o 1)
        const result = await ${entitySingular}Model.update(id, data);
        if (result === 0) {
            throw new Error('${entitySingular} no encontrada para actualizar');
        }
        return { id, ...data };
    } catch (error) {
        throw new Error(\`Error al actualizar la ${entitySingular.toLowerCase()} con ID \${id}: \${error.message}\`);
    }
};

export const delete${entitySingular} = async (id) => {
    try {
        // Asume que delete es un método que devuelve el número de filas afectadas (0 o 1)
        const result = await ${entitySingular}Model.delete(id);
        if (result === 0) {
            throw new Error('${entitySingular} no encontrada para eliminar');
        }
        return { deleted: true, id };
    } catch (error) {
        throw new Error(\`Error al eliminar la ${entitySingular.toLowerCase()} con ID \${id}: \${error.message}\`);
    }
};
`},
    {
        dir: 'controllers', suffix: 'Controller', template: (entitySingular, entityPlural) => `
import * as ${entityPlural.toLowerCase()}Service from '../services/${entityPlural}Service.js';

// Controlador para manejar las solicitudes HTTP de la entidad ${entityPlural}

// GET /api/${entityPlural.toLowerCase()}
export const get${entityPlural} = async (req, res) => {
    try {
        const data = await ${entityPlural.toLowerCase()}Service.getAll${entityPlural}();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/${entityPlural.toLowerCase()}/:id
export const get${entitySingular} = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ${entityPlural.toLowerCase()}Service.get${entitySingular}ById(id);
        res.status(200).json(data);
    } catch (error) {
        // Manejo de errores 404 basados en los mensajes del servicio/modelo
        const status = error.message.includes('no existe') || error.message.includes('no encontrada') ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

// POST /api/${entityPlural.toLowerCase()}
export const create${entitySingular} = async (req, res) => {
    try {
        const data = await ${entityPlural.toLowerCase()}Service.create${entitySingular}(req.body);
        // Respuesta 201 Created y el nuevo recurso
        res.status(201).json(data); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/${entityPlural.toLowerCase()}/:id
export const update${entitySingular} = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ${entityPlural.toLowerCase()}Service.update${entitySingular}(id, req.body);
        // Respuesta 200 OK y los datos actualizados
        res.status(200).json(data);
    } catch (error) {
        const status = error.message.includes('no encontrada') ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

// DELETE /api/${entityPlural.toLowerCase()}/:id
export const delete${entitySingular} = async (req, res) => {
    try {
        const id = req.params.id;
        await ${entityPlural.toLowerCase()}Service.delete${entitySingular}(id);
        // Respuesta 204 No Content
        res.status(204).send();
    } catch (error) {
        const status = error.message.includes('no encontrada') ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};
`},
    {
        dir: 'routes', suffix: 'Route', template: (entitySingular, entityPlural) => `
import { Router } from 'express';
import * as ${entityPlural.toLowerCase()}Controller from '../controllers/${entityPlural}Controller.js';

// Definición de las rutas para la entidad ${entityPlural}
const router = Router();

// Rutas GET y POST (Colección)
router.get('/', ${entityPlural.toLowerCase()}Controller.get${entityPlural});
router.post('/', ${entityPlural.toLowerCase()}Controller.create${entitySingular});

// Rutas GET, PUT y DELETE (Recurso específico por ID)
router.get('/:id', ${entityPlural.toLowerCase()}Controller.get${entitySingular});
router.put('/:id', ${entityPlural.toLowerCase()}Controller.update${entitySingular});
router.delete('/:id', ${entityPlural.toLowerCase()}Controller.delete${entitySingular});

// Exporta el router para ser usado en server.js
export default router;
`},
];

// --- 2. LÓGICA DE GENERACIÓN ---

async function generateModule() {
    // El argumento de la entidad se espera en la posición 2 del array (posición 0 es 'node', 1 es 'generate.js')
    const entityPluralInput = process.argv[2];

    if (!entityPluralInput) {
        console.error('❌ ERROR: Debes proporcionar el nombre de la entidad (en plural) como argumento.');
        console.log('Ejemplo de uso: node scripts/generate.js categorias');
        return;
    }

    // Normalización de nombres
    const entityPlural = entityPluralInput.toLowerCase(); // ej: 'categorias'
    let entitySingular;

    if (entityPlural.endsWith('s')) {
        // Si termina en 's', asume singular sin 's' final, y lo capitaliza. ej: 'categorias' -> 'Categoria'
        entitySingular = capitalize(entityPlural.slice(0, -1));
    } else {
        // Si no termina en 's', lo capitaliza directamente. ej: 'usuario' -> 'Usuario'
        console.warn('⚠️ ADVERTENCIA: Se esperaba nombre de entidad en plural (terminado en "s").');
        entitySingular = capitalize(entityPlural);
    }

    // CORRECCIÓN DE RUTA: Usamos '.' (directorio actual) en lugar de 'src'
    const baseDir = '.';

    console.log(`\n✨ Iniciando generación para la entidad: ${entityPlural}`);
    console.log(`   - Nombre singular (Clase/Modelo): ${entitySingular}\n`);

    for (const fileDef of files) {
        const { dir, suffix, template } = fileDef;

        // Esto creará paths como './models', './services', etc.
        const fullDirPath = path.join(baseDir, dir);
        const fileName = `${entityPlural}${suffix}.js`;
        const fullFilePath = path.join(fullDirPath, fileName);

        try {
            // 1. Crear el directorio si no existe
            await fs.mkdir(fullDirPath, { recursive: true });

            // 2. Generar el contenido del archivo
            const content = template(entitySingular, entityPlural);

            // 3. Escribir el archivo
            await fs.writeFile(fullFilePath, content.trim());
            console.log(`✅ Creado: ${fullFilePath}`);

        } catch (error) {
            console.error(`❌ Error al crear ${fullFilePath}: ${error.message}`);
        }
    }

    console.log('\n🎉 ¡Generación de módulo completa!');
    console.log('💡 Recuerda:');
    console.log('  1. Completar la implementación de la clase Model con los campos de la tabla.');
    console.log('  2. Importar el nuevo router en tu archivo principal (ej. server.js).');
}

generateModule();