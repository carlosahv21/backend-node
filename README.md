

🏗 Arquitectura del Proyecto

El corazón de la aplicación se divide en las siguientes capas l📦 Layered API - Arquitectura por Capas con Node.js y Express

Este proyecto implementa una API RESTful utilizando Node.js y el framework Express, siguiendo una estricta Arquitectura por Capas (Layered Architecture). Este patrón promueve la separación de responsabilidades, facilitando la mantenibilidad, la escalabilidad y la realización de pruebas unitarias. ógicas, cada una con una responsabilidad única:

routes/ (Rutas): Define los endpoints HTTP y delega la lógica al controlador. Es la puerta de entrada de las peticiones.

controllers/ (Controladores): Maneja la petición HTTP, extrae datos (cuerpo, parámetros, query) y pasa esta información al Servicio. No contiene lógica de negocio.

services/ (Servicios): Contiene la Lógica de Negocio. Aquí se realizan validaciones, transformaciones de datos y orquestación de operaciones de la base de datos (Modelos).

models/ (Modelos): Representa la capa de acceso a datos (DAL). Interactúa directamente con la base de datos (o la simula en este caso, con un arreglo/objeto). Contiene las operaciones CRUD (Crear, Leer, Actualizar, Borrar).

utils/ (Utilidades): Módulos auxiliares, como la clase CustomError para el manejo centralizado de errores.

middlewares/: Funciones de Express que se ejecutan antes de los controladores (por ejemplo, manejo de errores, autenticación o validación de JSON).

🚀 Instalación y Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu entorno local.

1. Pre-requisitos

Asegúrate de tener instalado:

Node.js (versión 18+ recomendada)

npm (viene con Node.js)

2. Clonar el Repositorio

git clone <URL_DEL_REPOSITORIO>
cd layered-api


3. Instalar Dependencias

Dado que node_modules no está incluido en el repositorio (¡gracias a la limpieza que hicimos!), es necesario instalar todas las dependencias listadas en package.json.

npm install


4. Configuración del Entorno

Este proyecto asume que las variables de entorno están configuradas (por ejemplo, a través de un archivo .env). Si bien no se han especificado aún, es buena práctica tener un archivo para configurar el puerto o las credenciales de la base de datos.

5. Iniciar la Aplicación

Ejecuta el siguiente comando para iniciar el servidor en modo desarrollo.

# Dependiendo de tu script de inicio (ej. "start" o "dev")
npm start
# o
npm run dev


La API estará disponible en http://localhost:<PUERTO> (ej. http://localhost:3000).

📚 Endpoints Disponibles (Módulo users)

Actualmente, solo el módulo de users está implementado bajo la arquitectura por capas.

Método HTTP

Ruta

Descripción

Cuerpo (Body) Ejemplo

GET

/api/users

Obtiene la lista de todos los usuarios.

N/A

GET

/api/users/:id

Obtiene un usuario por su ID.

N/A

POST

/api/users

Crea un nuevo usuario.

{"name": "Alice", "email": "alice@example.com"}

PUT

/api/users/:id

Actualiza completamente un usuario por ID.

{"name": "Alice M.", "email": "alice.m@example.com"}

DELETE

/api/users/:id

Elimina un usuario por su ID.

N/A

🛠 Pruebas

(Si se usara Jest/Mocha, esta sección detallaría cómo ejecutar las pruebas unitarias para las capas de Servicio y Modelo).

# Ejemplo:
npm test


🤝 Contribución

Haz un fork del repositorio.

Crea una rama para tu nueva funcionalidad (git checkout -b feature/nueva-funcionalidad).

Asegúrate de seguir la arquitectura por capas.

Realiza commit de tus cambios (git commit -m 'feat: Añadir módulo de productos').

Haz push a la rama (git push origin feature/nueva-funcionalidad).

Abre un Pull Request.