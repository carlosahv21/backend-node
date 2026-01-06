# 🚀 Backend Node Project

Este es el backend de la aplicación, construido con **Node.js** y **Express**, siguiendo una arquitectura estructurada yescalable.

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente:

- **[Node.js](https://nodejs.org/)** (v18 o superior)
- **[Laragon](https://laragon.org/)** (Recomendado para manejar MySQL en Windows) o MySQL instalado aparte.
- **[DBeaver](https://dbeaver.io/)** (Para gestionar visualmente la base de datos).
- **[Bruno](https://www.usebruno.com/)** (Para ejecutar las pruebas de la API).

## ⚡ Instalación Rápida

Sigue estos pasos para levantar el entorno de desarrollo:

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/carlosahv21/backend-node.git
    cd backend-node
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    # o si usas pnpm
    pnpm install
    ```

3.  **Configurar variables de entorno:**

    Crea un archivo `.env` en la raíz del proyecto (puedes copiar el `.env_example`) y configura tus credenciales:

    ```ini
    PORT=tu_puerto

    # Configuración de Base de Datos
    DB_HOST=tu_host
    DB_USER=tu_usuario
    DB_PASSWORD=tu_contraseña         # Deja vacío si usas Laragon por defecto
    DB_NAME=tu_basedatos   # Asegúrate de crear esta DB en DBeaver/Laragon
    DB_PORT=tu_puerto

    # Seguridad
    JWT_SECRET=tu_secreto_super_seguro
    ```

## 🗄️ Base de Datos

Utilizamos **MySQL**. Puedes usar **Laragon** para iniciar el servicio de MySQL rápidamente.

1.  Abre **Laragon** y dale a "Start All".
2.  Abre **DBeaver** y conéctate a tu servidor local.
3.  Crea una base de datos vacía (ej. `backend_db`) que coincida con tu `.env`.

### Migraciones y Seeds

El proyecto cuenta con scripts para inicializar la base de datos:

```bash
# Correr migraciones (crear tablas)
npm run migrate

# Llenar la base de datos con datos de prueba (seeds)
npm run seed
```

## 🧪 Pruebas de API con Bruno

Olvídate de Postman. Usamos **Bruno** para las pruebas de integración.

1.  Abre la aplicación **Bruno**.
2.  Haz clic en **"Open Collection"**.
3.  Selecciona la carpeta `api_tests/Backend Node Project` que está en la raíz de este repositorio.
4.  ¡Listo! Ya puedes ejecutar las requests de Login, Usuarios, etc.

> **Nota:** La carpeta `api_tests` contiene la colección ("Golden Collection") y está configurada para ignorar tus secretos locales (`Local.bru`), así que puedes usarla con seguridad.

## 📡 Estándar de Respuesta API

Todas las respuestas de la API siguen un formato JSON estandarizado para facilitar su consumo.

### Éxito (200, 201)

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error (400, 404, 500, etc.)

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (opcional)"
}
```

## 📜 Scripts Disponibles

En la terminal puedes ejecutar:

| Comando            | Descripción                                                                          |
| :----------------- | :----------------------------------------------------------------------------------- |
| `npm run dev`      | Inicia el servidor en modo desarrollo con **Nodemon** (reinicia al guardar cambios). |
| `npm start`        | Inicia el servidor en modo producción (Node estándar).                               |
| `npm run migrate`  | Ejecuta las migraciones de Knex ubicadas en `db/migration`.                          |
| `npm run seed`     | Ejecuta los seeders de Knex para poblar la DB.                                       |
| `npm run rollback` | Deshace el último lote de migraciones.                                               |
| `npm run generate` | Ejecuta el script de generación de código (`scripts/generate.js`).                   |

---

¡Happy Coding! 👨‍💻
