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
    * Extiende de baseModel.
*/

export class ${entitySingular}Model extends baseModel {
    constructor() {
        super('${entityPlural.toLowerCase()}');
        this.joins = [];
        this.selectFields = ['${entityPlural.toLowerCase()}.*'];
        this.searchFields = ['${entityPlural.toLowerCase()}.nombre'];
    }
    
    // Sobreescribe findById para lanzar un error con etiqueta de 404
    async findById(id) {
        const ${entitySingular.toLowerCase()} = await this.knex(this.tableName).where({ id }).first();

        if (!${entitySingular.toLowerCase()}) {
            // ERROR CRÍTICO: Usamos una etiqueta para que los controladores puedan identificarlo.
            throw new Error('NOT_FOUND: El ${entitySingular.toLowerCase()} no existe.');
        }

        return ${entitySingular.toLowerCase()};
    }

    // Sobreescribe delete para lanzar un error con etiqueta de 404
    async delete(id) {
        // En un escenario real, baseModel podría tener un método 'delete' que haga esto.
        const numDeleted = await this.knex(this.tableName).where({ id }).del();
        if (numDeleted === 0) {
            throw new Error('NOT_FOUND: El ${entitySingular.toLowerCase()} no existe para eliminar.');
        }
        return numDeleted;
    }

    // El resto de métodos (findAll, create, update) se heredan o se implementan aquí.
}
export default new ${entitySingular}Model();
`},
    {
        dir: 'services', suffix: 'Service', template: (entitySingular, entityPlural) => `
import ${entitySingular}Model from '../models/${entityPlural}Model.js';

// Lógica de negocio (BLL) para la entidad ${entityPlural}

export const getAll${entityPlural} = async () => {
    try {
        return await ${entitySingular}Model.findAll();
    } catch (error) {
        throw new Error(\`Error al obtener ${entityPlural.toLowerCase()}: \${error.message}\`);
    }
};

export const get${entitySingular}ById = async (id) => {
    try {
        return await ${entitySingular}Model.findById(id);
    } catch (error) {
        // Propaga el error de NOT_FOUND del modelo
        throw new Error(\`Error al obtener la ${entitySingular.toLowerCase()} con ID \${id}. \${error.message}\`);
    }
};

export const create${entitySingular} = async (data) => {
    try {
        // Lógica de Validación (ejemplo)
        if (!data.nombre || data.nombre.length < 3) {
            // ERROR CRÍTICO: Usamos una etiqueta para que los controladores puedan identificar un 400
            throw new Error('BAD_REQUEST: El campo "nombre" es obligatorio y debe tener al menos 3 caracteres.');
        }
        
        const newId = await ${entitySingular}Model.create(data);
        return { id: newId[0], ...data };
    } catch (error) {
        // Si el error ya es BAD_REQUEST, lo propagamos. Si no, es un 500.
        throw new Error(\`Error al crear el ${entitySingular.toLowerCase()}. \${error.message}\`);
    }
};

export const update${entitySingular} = async (id, data) => {
    try {
        // Antes de actualizar, podemos verificar si existe usando el mismo findById (que lanzará NOT_FOUND si no)
        await ${entitySingular}Model.findById(id); 

        // Lógica de Validación (ejemplo, omitida para simplicidad)
        
        const result = await ${entitySingular}Model.update(id, data);
        if (result === 0) {
            // Aunque findById ya lo verificaría, esta es una doble verificación.
            throw new Error('NOT_FOUND: ${entitySingular} no encontrada para actualizar');
        }
        return { id, ...data };
    } catch (error) {
        throw new Error(\`Error al actualizar la ${entitySingular.toLowerCase()} con ID \${id}. \${error.message}\`);
    }
};

export const delete${entitySingular} = async (id) => {
    try {
        await ${entitySingular}Model.delete(id);
        return { deleted: true, id };
    } catch (error) {
        // Propaga el error de NOT_FOUND del modelo
        throw new Error(\`Error al eliminar la ${entitySingular.toLowerCase()} con ID \${id}. \${error.message}\`);
    }
};
`},
    {
        dir: 'controllers', suffix: 'Controller', template: (entitySingular, entityPlural) => `
import * as ${entityPlural.toLowerCase()}Service from '../services/${entityPlural}Service.js';

// Función auxiliar para determinar el código de estado HTTP basado en el mensaje de error
const getStatusFromError = (errorMessage) => {
    if (errorMessage.includes('NOT_FOUND')) {
        return 404;
    }
    if (errorMessage.includes('BAD_REQUEST') || errorMessage.includes('violates')) {
        return 400; // 400 para errores de validación de negocio o de base de datos (e.g., violación de restricción)
    }
    return 500; // Por defecto, error interno del servidor
};

// GET /api/${entityPlural.toLowerCase()}
export const get${entityPlural} = async (req, res) => {
    try {
        const data = await ${entityPlural.toLowerCase()}Service.getAll${entityPlural}();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en get${entityPlural}:', error.message);
        const status = getStatusFromError(error.message);
        res.status(status).json({ message: error.message.replace(/^(NOT_FOUND|BAD_REQUEST):\\s*/, '') });
    }
};

// GET /api/${entityPlural.toLowerCase()}/:id
export const get${entitySingular} = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ${entityPlural.toLowerCase()}Service.get${entitySingular}ById(id);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en get${entitySingular}:', error.message);
        const status = getStatusFromError(error.message);
        res.status(status).json({ message: error.message.replace(/^(NOT_FOUND|BAD_REQUEST):\\s*/, '') });
    }
};

// POST /api/${entityPlural.toLowerCase()}
export const create${entitySingular} = async (req, res) => {
    try {
        const data = await ${entityPlural.toLowerCase()}Service.create${entitySingular}(req.body);
        res.status(201).json(data); 
    } catch (error) {
        console.error('Error en create${entitySingular}:', error.message);
        const status = getStatusFromError(error.message);
        res.status(status).json({ message: error.message.replace(/^(NOT_FOUND|BAD_REQUEST):\\s*/, '') });
    }
};

// PUT /api/${entityPlural.toLowerCase()}/:id
export const update${entitySingular} = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ${entityPlural.toLowerCase()}Service.update${entitySingular}(id, req.body);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en update${entitySingular}:', error.message);
        const status = getStatusFromError(error.message);
        res.status(status).json({ message: error.message.replace(/^(NOT_FOUND|BAD_REQUEST):\\s*/, '') });
    }
};

// DELETE /api/${entityPlural.toLowerCase()}/:id
export const delete${entitySingular} = async (req, res) => {
    try {
        const id = req.params.id;
        await ${entityPlural.toLowerCase()}Service.delete${entitySingular}(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error en delete${entitySingular}:', error.message);
        const status = getStatusFromError(error.message);
        res.status(status).json({ message: error.message.replace(/^(NOT_FOUND|BAD_REQUEST):\\s*/, '') });
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

    const baseDir = '.';

    console.log(`\n✨ Iniciando generación para la entidad: ${entityPlural}`);
    console.log(`  - Nombre singular (Clase/Modelo): ${entitySingular}\n`);

    for (const fileDef of files) {
        const { dir, suffix, template } = fileDef;

        const fullDirPath = path.join(baseDir, dir);
        const fileName = `${entityPlural}${suffix}.js`;
        const fullFilePath = path.join(fullDirPath, fileName);

        try {
            await fs.mkdir(fullDirPath, { recursive: true });
            const content = template(entitySingular, entityPlural);
            await fs.writeFile(fullFilePath, content.trim());
            console.log(`✅ Creado: ${fullFilePath}`);

        } catch (error) {
            console.error(`❌ Error al crear ${fullFilePath}: ${error.message}`);
        }
    }

    console.log('\n🎉 ¡Generación de módulo completa!');
    console.log('💡 Recuerda:');
    console.log('  1. Implementar la validación completa en el servicio o un middleware.');
    console.log('  2. Importar el nuevo router en tu archivo principal (ej. server.js).');
}

generateModule();