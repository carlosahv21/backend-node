# API Documentation — New Endpoints (Fase 1 & 2)

## Table of Contents
- [student_stats](#student_stats)
- [teacher_reviews](#teacher_reviews)
- [achievements](#achievements)
- [user_achievements](#user_achievements)
- [challenges](#challenges)
- [user_challenges](#user_challenges)
- [connections](#connections)

---

## student_stats

Estadísticas acumuladas de un estudiante (lecturas, sesiones, streaks, etc).

### GET `/api/student-stats`

Obtiene todas las estadísticas (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página (default: 1) |
| `limit` | number | Límite por página (default: 10) |
| `search` | string | Busca por nombre del estudiante |
| `student_id` | uuid | Filtrar por estudiante |

**Response:**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "student_id": "uuid",
        "first_name": "Juan",
        "last_name": "Pérez",
        "avatar": "https://...",
        "total_classes_attended": 45,
        "current_streak": 5,
        "longest_streak": 12,
        "total_lessons_completed": 30,
        "total_reading_minutes": 1200,
        "average_rating_given": 4.5,
        "total_reviews_made": 8,
        "challenges_joined": 3,
        "challenges_completed": 2,
        "achievements_count": 5,
        "level": 3,
        "points": 1250,
        "created_at": "2026-01-15T10:00:00Z",
        "updated_at": "2026-06-10T15:30:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/student-stats/:id`

Obtiene una estadística por ID.

### GET `/api/student-stats/student/:studentId`

Obtiene las estadísticas de un estudiante específico por su user ID.

---

## teacher_reviews

Reseñas de estudiantes hacia profesores. Soporta anonimato.

### GET `/api/teacher-reviews`

Obtiene todas las reseñas (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Límite por página |
| `search` | string | Busca por nombre de estudiante o profesor |
| `teacher_id` | uuid | Filtrar por profesor |
| `student_id` | uuid | Filtrar por estudiante |
| `class_id` | uuid | Filtrar por clase |
| `rating` | number | Filtrar por rating exacto |

**Response:**
```json
{
  "success": true,
  "message": "Reseñas obtenidas correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "student_id": "uuid",
        "teacher_id": "uuid",
        "class_id": "uuid",
        "student_first_name": "María",
        "student_last_name": "García",
        "teacher_first_name": "Carlos",
        "teacher_last_name": "López",
        "class_name": "Yoga Flow",
        "rating": 5,
        "comment": "Excelente clase, muy buena energía",
        "is_anonymous": false,
        "created_at": "2026-06-10T12:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/teacher-reviews/:id`

Obtiene una reseña por ID.

### GET `/api/teacher-reviews/teacher/:teacherId`

Obtiene todas las reseñas de un profesor específico. Respeta el flag `is_anonymous` — si es true, los campos `student_first_name` y `student_last_name` retornan `null`.

### POST `/api/teacher-reviews`

Crea una nueva reseña. El `student_id` se inyecta automáticamente desde el token JWT.

**Body:**
```json
{
  "teacher_id": "uuid",
  "class_id": "uuid (opcional)",
  "rating": 5,
  "comment": "Excelente profesor (opcional)",
  "is_anonymous": false
}
```

**Validaciones:**
- `rating`: requerido, entre 1 y 5
- `teacher_id`: requerido

### PUT `/api/teacher-reviews/:id`

Actualiza una reseña (solo el creador o admin).

### PATCH `/api/teacher-reviews/:id/bin`

Mueve la reseña a papelera (soft delete).

### PATCH `/api/teacher-reviews/:id/restore`

Restaura la reseña de la papelera.

### DELETE `/api/teacher-reviews/:id`

Elimina permanentemente la reseña.

---

## achievements

Catálogo de logros del sistema. CRUD administrativo.

### GET `/api/achievements`

Obtiene todos los logros (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Límite |
| `search` | string | Busca por nombre o descripción |
| `category` | string | Filtrar por categoría |

**Response:**
```json
{
  "success": true,
  "message": "Logros obtenidos correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Primera Clase",
        "description": "Asiste a tu primera clase",
        "icon_url": "https://...",
        "category": "attendance",
        "points_reward": 50,
        "created_at": "2026-01-15T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/achievements/:id`

Obtiene un logro por ID.

### POST `/api/achievements`

Crea un nuevo logro (admin only).

**Body:**
```json
{
  "name": "Primera Clase",
  "description": "Asiste a tu primera clase",
  "icon_url": "https://...",
  "category": "attendance",
  "points_reward": 50
}
```

### PUT `/api/achievements/:id`

Actualiza un logro.

### PATCH `/api/achievements/:id/bin`

Mueve a papelera.

### PATCH `/api/achievements/:id/restore`

Restaura de papelera.

### DELETE `/api/achievements/:id`

Elimina permanentemente.

---

## user_achievements

Logros asignados a usuarios.

### GET `/api/user-achievements`

Obtiene todas las asignaciones de logros (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Límite |
| `user_id` | uuid | Filtrar por usuario |
| `achievement_id` | uuid | Filtrar por logro |

**Response:**
```json
{
  "success": true,
  "message": "Logros de usuario obtenidos correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "achievement_id": "uuid",
        "achievement_name": "Primera Clase",
        "achievement_description": "Asiste a tu primera clase",
        "achievement_icon": "https://...",
        "achievement_category": "attendance",
        "first_name": "Juan",
        "last_name": "Pérez",
        "earned_at": "2026-03-20T14:30:00Z",
        "created_at": "2026-03-20T14:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/user-achievements/:id`

Obtiene una asignación por ID.

### GET `/api/user-achievements/user/:userId`

Obtiene todos los logros de un usuario específico.

### POST `/api/user-achievements`

Asigna un logro a un usuario (admin only).

**Body:**
```json
{
  "user_id": "uuid",
  "achievement_id": "uuid"
}
```

### DELETE `/api/user-achievements/:id`

Remueve un logro de un usuario (soft delete).

---

## challenges

Catálogo de retos del sistema. CRUD administrativo.

### GET `/api/challenges`

Obtiene todos los retos (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Límite |
| `search` | string | Busca por nombre o descripción |
| `challenge_type` | string | Filtrar por tipo |
| `is_active` | boolean | Filtrar por estado |

**Response:**
```json
{
  "success": true,
  "message": "Retos obtenidos correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "30 Días de Yoga",
        "description": "Asiste a 30 clases de yoga en 30 días",
        "challenge_type": "attendance",
        "goal_value": 30,
        "start_date": "2026-07-01T00:00:00Z",
        "end_date": "2026-07-31T23:59:59Z",
        "points_reward": 500,
        "is_active": true,
        "created_at": "2026-06-15T10:00:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/challenges/:id`

Obtiene un reto por ID.

### POST `/api/challenges`

Crea un nuevo reto (admin only).

**Body:**
```json
{
  "name": "30 Días de Yoga",
  "description": "Asiste a 30 clases de yoga en 30 días",
  "challenge_type": "attendance",
  "goal_value": 30,
  "start_date": "2026-07-01T00:00:00Z",
  "end_date": "2026-07-31T23:59:59Z",
  "points_reward": 500,
  "is_active": true
}
```

### PUT `/api/challenges/:id`

Actualiza un reto.

### PATCH `/api/challenges/:id/bin`

Mueve a papelera.

### PATCH `/api/challenges/:id/restore`

Restaura de papelera.

### DELETE `/api/challenges/:id`

Elimina permanentemente.

---

## user_challenges

Participación de usuarios en retos.

### GET `/api/user-challenges`

Obtiene todas las participaciones (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Límite |
| `user_id` | uuid | Filtrar por usuario |
| `challenge_id` | uuid | Filtrar por reto |
| `status` | string | Filtrar por estado (`active`, `completed`, `abandoned`) |

**Response:**
```json
{
  "success": true,
  "message": "Retos de usuario obtenidos correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "challenge_id": "uuid",
        "challenge_name": "30 Días de Yoga",
        "challenge_description": "Asiste a 30 clases de yoga en 30 días",
        "challenge_type": "attendance",
        "goal_value": 30,
        "first_name": "Juan",
        "last_name": "Pérez",
        "status": "active",
        "progress": 15,
        "joined_at": "2026-06-15T10:00:00Z",
        "completed_at": null,
        "created_at": "2026-06-15T10:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/user-challenges/:id`

Obtiene una participación por ID.

### GET `/api/user-challenges/user/:userId`

Obtiene todos los retos de un usuario específico.

### POST `/api/user-challenges/join`

El usuario se une a un reto.

**Body:**
```json
{
  "challenge_id": "uuid"
}
```

**Validaciones:**
- El reto debe existir y estar activo
- El usuario no puede unirse dos veces al mismo reto

### DELETE `/api/user-challenges/leave/:challengeId`

El usuario abandona un reto.

### DELETE `/api/user-challenges/:id`

Elimina una participación (admin).

---

## connections

Conexiones sociales entre usuarios (amistades, contactos).

### GET `/api/user-connections`

Obtiene las conexiones del usuario autenticado (paginado).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Límite |
| `status` | string | Filtrar por estado (`pending`, `accepted`, `rejected`) |

**Response:**
```json
{
  "success": true,
  "message": "Conexiones obtenidas correctamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "requester_id": "uuid",
        "receiver_id": "uuid",
        "status": "accepted",
        "other_first_name": "María",
        "other_last_name": "García",
        "other_avatar": "https://...",
        "other_user_id": "uuid",
        "created_at": "2026-06-10T12:00:00Z",
        "updated_at": "2026-06-10T12:05:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### GET `/api/user-connections/all`

Obtiene todas las conexiones del sistema (admin, paginado).

### GET `/api/user-connections/:id`

Obtiene una conexión por ID.

### POST `/api/user-connections/request`

Envía una solicitud de conexión.

**Body:**
```json
{
  "receiver_id": "uuid"
}
```

**Validaciones:**
- No puedes conectarte contigo mismo
- No puede existir una conexión previa entre ambos usuarios

### PATCH `/api/user-connections/:id/accept`

Acepta una solicitud de conexión. Solo el receptor puede aceptar.

### PATCH `/api/user-connections/:id/reject`

Rechaza una solicitud de conexión. Solo el receptor puede rechazar.

### DELETE `/api/user-connections/:id`

Elimina una conexión. Solo los participantes pueden eliminar.

---

## Common Response Format

### Error
```json
{
  "success": false,
  "message": "Error message",
  "details": [
    { "field": "field_name", "message": "Validation error detail" }
  ]
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Bad request / Validation error |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 409 | Conflict (duplicate, already exists) |
| 500 | Internal server error |

## Authentication

All endpoints require Bearer token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Pagination

All list endpoints support pagination:
```
GET /api/achievements?page=2&limit=20
```

## Filtering

Most list endpoints support filtering via query params:
```
GET /api/teacher-reviews?teacher_id=uuid&rating=5
```

## Search

Most list endpoints support search via `search` query param:
```
GET /api/challenges?search=yoga
```
