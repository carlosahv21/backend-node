import { z } from 'zod';

/**
 * Mapea los tipos de campos de la base de datos a esquemas de validación Zod
 */
class FieldSchemaBuilder {
    /**
     * Construye un esquema Zod para un campo específico
     * @param {Object} field - Objeto con la metadata del campo desde la tabla fields
     * @returns {z.ZodType} - Esquema de validación Zod
     */
    buildFieldSchema(field) {
        const { type, name, required, options, relation_config } = field;

        let schema;

        switch (type) {
            case 'text':
                schema = this._buildTextSchema(field);
                break;

            case 'textarea':
                schema = z.string();
                break;

            case 'number':
                schema = z.number({
                    invalid_type_error: `El campo '${name}' debe ser un número`
                });
                break;

            case 'boolean':
                schema = z.boolean({
                    invalid_type_error: `El campo '${name}' debe ser verdadero o falso`
                });
                break;

            case 'select':
                schema = this._buildSelectSchema(field);
                break;

            case 'date':
                schema = z.string({
                    invalid_type_error: `El campo '${name}' debe ser una fecha válida`
                });
                break;

            case 'time':
                schema = z.string({
                    invalid_type_error: `El campo '${name}' debe ser una hora válida`
                });
                break;

            case 'password':
                schema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");
                break;

            case 'relation':
                schema = this._buildRelationSchema(field);
                break;

            case 'range':
                schema = this._buildRangeSchema(field);
                break;

            default:
                schema = z.string();
        }

        // Aplicar required/optional
        if (!required) {
            schema = schema.optional();
        }

        return schema;
    }

    /**
     * Construye esquema para campos de texto con validaciones especiales
     * @private
     */
    _buildTextSchema(field) {
        const { name } = field;
        let schema = z.string();

        // Validación especial para email
        if (name === 'email' || name.includes('email')) {
            schema = schema.email("El formato del email no es válido");
        }

        return schema;
    }

    /**
     * Construye esquema para campos select usando enum
     * @private
     */
    _buildSelectSchema(field) {
        const { options, name } = field;

        if (!options || options.length === 0) {
            return z.string();
        }

        // Parse options si es string JSON
        const optionsArray = typeof options === 'string'
            ? JSON.parse(options)
            : options;

        if (!Array.isArray(optionsArray) || optionsArray.length === 0) {
            return z.string();
        }

        return z.enum(optionsArray, {
            errorMap: () => ({
                message: `El campo '${name}' debe ser uno de: ${optionsArray.join(', ')}`
            })
        });
    }

    /**
     * Construye esquema para campos de relación
     * @private
     */
    _buildRelationSchema(field) {
        const { relation_config, name } = field;

        if (!relation_config) {
            return z.number();
        }

        // Parse relation_config si es string JSON
        const config = typeof relation_config === 'string'
            ? JSON.parse(relation_config)
            : relation_config;

        const baseSchema = z.number().int().positive({
            message: `El campo '${name}' debe ser un ID válido`
        });

        // Si permite múltiples valores, retornar array
        if (config.multiple) {
            return z.array(baseSchema).min(1, `Debe seleccionar al menos un ${name}`);
        }

        return baseSchema;
    }

    /**
     * Construye esquema para campos de rango (date ranges o number ranges)
     * @private
     */
    _buildRangeSchema(field) {
        const { name } = field;

        // Para rangos de fechas (como payment_date que ahora es array)
        return z.array(z.string()).length(2, {
            message: `El campo '${name}' debe contener inicio y fin del rango`
        });
    }

    /**
     * Genera un esquema Zod completo a partir de un array de fields
     * @param {Array} fields - Array de objetos field desde la base de datos
     * @returns {z.ZodObject} - Esquema de validación Zod
     */
    buildSchema(fields) {
        const schemaShape = {};

        fields.forEach(field => {
            schemaShape[field.name] = this.buildFieldSchema(field);
        });

        return z.object(schemaShape);
    }

    /**
     * Genera un esquema Zod parcial (todos los campos opcionales)
     * Útil para actualizaciones donde no todos los campos son requeridos
     * @param {Array} fields - Array de objetos field desde la base de datos
     * @returns {z.ZodObject} - Esquema de validación Zod parcial
     */
    buildPartialSchema(fields) {
        return this.buildSchema(fields).partial();
    }
}

export default new FieldSchemaBuilder();
