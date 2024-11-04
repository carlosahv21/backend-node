// controllers/classesController.js

const knex = require('../db/knex');

// Obtener todas las clases con paginación, búsqueda y filtros
exports.getAllClasses = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, level } = req.query;

        // Inicia una consulta básica en la tabla de clases
        let query = knex('classes');

        // Agrega filtros de búsqueda
        if (search) {
            query = query.where('name', 'like', `%${search}%`);
        }

        // Filtra por nivel si está definido
        if (level) {
            query = query.where('level', level);
        }

        // Obtiene los resultados de la página solicitada con el límite especificado
        const classes = await query
            .limit(limit)
            .offset((page - 1) * limit);

        // Obtiene el total de registros para calcular la cantidad de páginas
        const total = await knex('classes').count('* as count').first();

        // Responde con los datos y la información de paginación
        res.json({
            data: classes,
            total: total.count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las clases', error });
    }
};

// Crear una nueva clase
exports.createClass = async (req, res) => {
    try {
        const { name, level, description, duration, schedule, capacity } = req.body;

        // Inserta una nueva clase en la base de datos
        const [newClass] = await knex('classes')
            .insert({ name, level, description, duration, schedule, capacity })
            .returning('*'); // Devuelve los datos de la clase creada

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la clase', error });
    }
};

// Actualizar una clase existente
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, description, duration, schedule, capacity } = req.body;

        // Actualiza la clase con los datos proporcionados
        const [updatedClass] = await knex('classes')
            .where({ id })
            .update({ name, level, description, duration, schedule, capacity })
            .returning('*');

        if (!updatedClass) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }

        res.json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la clase', error });
    }
};

// Eliminar una clase
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        // Elimina la clase con el id proporcionado
        const deletedCount = await knex('classes')
            .where({ id })
            .del();

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }

        res.status(204).send(); // No retorna contenido después de eliminar
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la clase', error });
    }
};
