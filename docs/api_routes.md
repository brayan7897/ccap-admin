# API Routes Reference

Base URL: `http://localhost:8000/api/v1`

> **Autenticación:** todas las rutas protegidas requieren el header  
> `Authorization: Bearer <access_token>`  
> obtenido en `/auth/login`.

---

## Autenticación (`/auth`)

### `POST /auth/login`
**Auth:** ninguna  
**Body:**
```json
{ "email": "admin@ccap.edu.pe", "password": "Admin@12345" }
```
**Respuesta `200`:**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

---

### `POST /auth/logout`
**Auth:** `CurrentUser` (Bearer token)  
**Respuesta `200`:**
```json
{ "detail": "Sesión cerrada exitosamente." }
```

---

### `POST /auth/logout/all`
**Auth:** `CurrentUser`  
**Respuesta `200`:**
```json
{ "detail": "Se cerraron 2 sesión(es) activa(s)." }
```

---

### `POST /auth/login/form`
**Auth:** ninguna — formulario OAuth2 (usado por Swagger UI)  
**Body:** `application/x-www-form-urlencoded`: `username`, `password`  
**Respuesta `200`:** igual que `/auth/login`

---

### `POST /auth/google`
**Auth:** ninguna  
**Body:**
```json
{ "credential": "<google_id_token>" }
```
**Respuesta `200`:** igual que `/auth/login`

---

## Usuarios (`/users`)

### `POST /users/`
**Auth:** ninguna  
**Body:**
```json
{
  "email": "nuevo@ccap.edu.pe",
  "password": "Segura@123",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "document_type": "DNI",
  "document_number": "12345678",
  "phone_number": "+51999000000",
  "role_id": null
}
```
**Respuesta `201`:**
```json
{
  "id": "uuid",
  "email": "nuevo@ccap.edu.pe",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "full_name": "Nombre Apellido",
  "document_type": "DNI",
  "document_number": "12345678",
  "phone_number": "+51999000000",
  "avatar_url": null,
  "bio": null,
  "role_id": "uuid",
  "role_name": "student",
  "is_active": false
}
```
> El usuario se crea con `is_active: false`. Un admin debe activarlo.

---

### `GET /users/me`
**Auth:** `CurrentUser` (funciona aunque `is_active=false`)  
**Respuesta `200`:** mismo objeto `UserResponse` de arriba

---

### `PUT /users/me`
**Auth:** `CurrentUser`  
**Body (todos opcionales):**
```json
{
  "first_name": "NuevoNombre",
  "last_name": "NuevoApellido",
  "phone_number": "+51999000001",
  "avatar_url": "https://...",
  "bio": "Mi bio"
}
```
**Respuesta `200`:** `UserResponse` actualizado

---

### `GET /users/{user_id}`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `UserResponse`

---

## Administración (`/admin`)

> Todos los endpoints requieren `AdminUser` (rol `admin`).  
> Si el token no pertenece a un admin → `403 Forbidden`.

### `GET /admin/users/pending`
**Query params:** `skip=0`, `limit=50`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "email": "nuevo@ccap.edu.pe",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "document_type": "DNI",
    "document_number": "12345678",
    "phone_number": null,
    "role_id": "uuid",
    "role_name": "student",
    "is_active": false,
    "created_at": "2026-03-12T10:00:00"
  }
]
```

---

### `GET /admin/users`
**Query params:** `skip=0`, `limit=50`, `is_active=true|false` (opcional)  
**Respuesta `200`:** lista de `AdminUserResponse` (igual que arriba)

---

### `PATCH /admin/users/{user_id}/activate`
**Body:**
```json
{ "is_active": true }
```
**Respuesta `200`:** `AdminUserResponse` con `is_active` actualizado

---

### `PATCH /admin/users/{user_id}/role`
**Query param:** `role_id=<uuid>`  
**Respuesta `200`:** `AdminUserResponse` con nuevo `role_id` y `role_name`

---

### `GET /admin/stats`
**Respuesta `200`:**
```json
{ "total_users": 10, "active_users": 8, "pending_users": 2 }
```

---

### `GET /admin/courses`
**Descripción:** Lista todos los cursos (publicados y no publicados).  
**Auth:** `AdminUser`  
**Query params:** `skip=0`, `limit=50`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "title": "Curso prueba",
    "slug": "curso-prueba",
    "is_published": false,
    "drive_folder_id": "1ihDuPn3SrtBl7RdKivL-gHUkwiQJKwS3",
    "course_type": "FREE",
    "price": null,
    "created_at": "2026-03-14T04:03:03.385800",
    "updated_at": "2026-03-14T04:03:03.385800"
  }
]
```

---

## Roles y permisos (`/roles`)

> Todos requieren `AdminUser`.

### `GET /roles/`
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "name": "admin",
    "description": "Administrador",
    "is_system_role": true,
    "permission_count": 35,
    "created_at": "2026-03-12T10:00:00"
  }
]
```

---

### `GET /roles/{role_id}`
**Respuesta `200`:**
```json
{
  "id": "uuid",
  "name": "admin",
  "description": "Administrador",
  "is_system_role": true,
  "permissions": [
    { "id": "uuid", "code": "course:create", "name": "Crear cursos", "description": null, "created_at": "..." }
  ],
  "created_at": "..."
}
```

---

### `POST /roles/`
**Body:**
```json
{ "name": "moderador", "description": "Moderador de contenido", "is_system_role": false }
```
**Respuesta `201`:** `RoleResponse` con `permissions: []`

---

### `PUT /roles/{role_id}`
**Body (opcionales):** `{ "name": "...", "description": "..." }`  
**Respuesta `200`:** `RoleResponse`

---

### `DELETE /roles/{role_id}`
**Respuesta `204`:** sin cuerpo. Falla si es rol de sistema.

---

### `GET /roles/permissions/all`
**Respuesta `200`:**
```json
[
  { "id": "uuid", "code": "course:create", "name": "Crear cursos", "description": null, "created_at": "..." }
]
```

---

### `POST /roles/permissions`
**Body:**
```json
{ "code": "course:create", "name": "Crear cursos", "description": null }
```
**Respuesta `201`:** `PermissionResponse`

---

### `POST /roles/{role_id}/permissions`
**Body:** `{ "permission_id": "uuid" }`  
**Respuesta `201`:** `RoleResponse` con el permiso asignado

---

### `DELETE /roles/{role_id}/permissions/{permission_id}`
**Respuesta `204`:** sin cuerpo

---

## Categorías (`/categories`)

### `GET /categories/`
**Auth:** ninguna  
**Query params:** `skip=0`, `limit=50`  
**Respuesta `200`:**
```json
[
  { "id": "uuid", "name": "Desarrollo Web", "slug": "desarrollo-web", "description": "...", "created_at": "..." }
]
```

---

### `GET /categories/{category_id}`
**Auth:** ninguna  
**Respuesta `200`:** `CategoryResponse` individual

---

### `POST /categories/`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{ "name": "Desarrollo Web", "slug": "desarrollo-web", "description": "Cursos de web" }
```
**Respuesta `201`:** `CategoryResponse`

---

### `PUT /categories/{category_id}`
**Auth:** `InstructorOrAdmin`  
**Body (opcionales):** `name`, `slug`, `description`  
**Respuesta `200`:** `CategoryResponse`

---

### `DELETE /categories/{category_id}`
**Auth:** `InstructorOrAdmin`  
**Respuesta `204`:** sin cuerpo

---

## Cursos (`/courses`)

### `GET /courses/`
**Auth:** ninguna  
**Query params:** `skip=0`, `limit=20`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "title": "Python desde cero",
    "slug": "python-desde-cero",
    "short_description": "...",
    "description": "...",
    "thumbnail_url": null,
    "course_level": "BASIC",
    "requirements": [],
    "what_you_will_learn": [],
    "tags": [],
    "is_published": true,
    "instructor_id": "uuid",
    "category_id": "uuid"
  }
]
```

---

### `GET /courses/{course_id}`
**Auth:** ninguna  
**Respuesta `200`:** `CourseResponse` individual

---

### `GET /courses/slug/{slug}`
**Auth:** ninguna  
**Respuesta `200`:** `CourseDetailResponse` — incluye lista de módulos y lecciones:
```json
{
  "id": "uuid",
  "title": "Python desde cero",
  "slug": "python-desde-cero",
  "modules": [
    {
      "id": "uuid",
      "title": "Módulo 1",
      "description": null,
      "order_index": 1,
      "lessons": [
        { "id": "uuid", "title": "Lección 1", "lesson_type": "VIDEO", "duration_minutes": 10, "order_index": 1 }
      ]
    }
  ]
}
```

---

### `POST /courses/`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{
  "title": "Python desde cero",
  "slug": "python-desde-cero",
  "instructor_id": "uuid",
  "category_id": "uuid",
  "short_description": "...",
  "description": "...",
  "course_level": "BASIC",
  "course_type": "FREE",
  "price": null,
  "requirements": [],
  "what_you_will_learn": [],
  "tags": []
}
```
> `instructor_id` es **opcional**. Si se omite, se asigna automáticamente el ID del usuario autenticado.  
> `course_level`: `BASIC`, `INTERMEDIATE`, `ADVANCED`.  
> `course_type`: `FREE`, `PAID`.

**Respuesta `201`:** `CourseResponse`

---

### `PUT /courses/{course_id}` *(si existe)*
**Auth:** `InstructorOrAdmin`  
**Body (todos opcionales):** `title`, `slug`, `short_description`, `description`, `course_level`, `requirements`, `what_you_will_learn`, `tags`, `category_id`, `is_published`  
**Respuesta `200`:** `CourseResponse`

---

### `POST /courses/{course_id}/enroll`
**Auth:** ninguna (pero requiere `student_id` válido)  
**Body:** `{ "student_id": "uuid" }`  
**Respuesta `200`:**
```json
{ "student_id": "uuid", "course_id": "uuid", "message": "Inscripción exitosa." }
```

---

## Módulos (`/courses/{course_id}/modules`)

> ⚠️ Los módulos están anidados bajo un curso. La ruta base es  
> `/courses/{course_id}/modules`, **no** `/modules/`.

### `GET /courses/{course_id}/modules/`
**Auth:** `ActiveUser`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Módulo 1",
    "description": null,
    "order_index": 1,
    "drive_folder_id": "<google-drive-folder-id>",
    "created_at": "2026-03-12T10:00:00"
  }
]
```

---

### `GET /courses/{course_id}/modules/{module_id}`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `ModuleResponse` individual

---

### `POST /courses/{course_id}/modules/`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{ "title": "Módulo 1", "description": "Intro", "order_index": 1 }
```
**Respuesta `201`:** `ModuleResponse`

---

### `PUT /courses/{course_id}/modules/{module_id}`
**Auth:** `InstructorOrAdmin`  
**Body (opcionales):** `title`, `description`, `order_index`  
**Respuesta `200`:** `ModuleResponse`

---

### `DELETE /courses/{course_id}/modules/{module_id}`
**Auth:** `InstructorOrAdmin`  
**Respuesta `204`:** sin cuerpo (elimina el módulo y sus lecciones en cascada)

---

## Lecciones (`/modules/{module_id}/lessons`)

> ⚠️ Las lecciones están anidadas bajo un módulo. La ruta base es  
> `/modules/{module_id}/lessons`, **no** `/lessons/`.

### `GET /modules/{module_id}/lessons/`
**Auth:** `ActiveUser`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "module_id": "uuid",
    "title": "Lección 1 — Variables",
    "lesson_type": "VIDEO",
    "drive_file_id": "<google-drive-file-id>",
    "drive_folder_id": "<google-drive-folder-id>",
    "duration_minutes": 15,
    "order_index": 1,
    "created_at": "2026-03-12T10:00:00"
  }
]
```

---

### `GET /modules/{module_id}/lessons/{lesson_id}`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `LessonResponse` individual

---

### `POST /modules/{module_id}/lessons/`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{
  "title": "Lección 1 — Variables",
  "lesson_type": "VIDEO",
  "drive_file_id": "<google-drive-file-id>",
  "duration_minutes": 15,
  "order_index": 1
}
```
`lesson_type` puede ser: `VIDEO`, `PDF`, `TEXT`  
> Usar este endpoint solo si el archivo ya existe en Drive. Para subir archivos usa `POST /upload` o `POST /upload-session`.  
**Respuesta `201`:** `LessonResponse`

---

### `POST /modules/{module_id}/lessons/upload`
**Auth:** `InstructorOrAdmin`  
**Content-Type:** `multipart/form-data`  
**Campos:**
| Campo | Tipo | Descripción |
|---|---|---|
| `file` | `UploadFile` | Archivo a subir (video, PDF, etc.) |
| `title` | `string` | Título de la lección |
| `lesson_type` | `string` | `VIDEO`, `PDF` o `TEXT` (default `VIDEO`) |
| `duration_minutes` | `int` | Duración en minutos (default `0`) |
| `order_index` | `int` | Posición dentro del módulo |

El backend:
1. Crea automáticamente una carpeta `Lección-{order_index}` dentro de la carpeta del módulo en Drive.
2. Sube el archivo dentro de esa carpeta de lección.
3. Crea el registro de lección en base de datos con `drive_file_id` y `drive_folder_id`.  

Límite de tamaño: `MAX_DIRECT_UPLOAD_SIZE_MB` (por defecto 100 MB). Para archivos más grandes usa `POST /upload-session`.  
**Respuesta `201`:** `LessonResponse` con `drive_file_id` y `drive_folder_id` generados.

---

### `POST /modules/{module_id}/lessons/upload-session`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{
  "file_name": "clase1.mp4",
  "mime_type": "video/mp4",
  "title": "Lección 1 — Variables",
  "order_index": 1
}
```

El backend:
1. Crea una carpeta `Lección-{order_index}` dentro de la carpeta del módulo en Drive.
2. Inicia una sesión de carga reanudable de Google Drive apuntando a esa carpeta.
3. Devuelve la URL de carga y el ID de la carpeta de lección.  

**Respuesta `200`:**
```json
{
  "upload_url": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=...",
  "lesson_folder_id": "<google-drive-folder-id>"
}
```
> El frontend debe hacer `PUT` con el contenido del archivo directamente a `upload_url` (el archivo **nunca pasa por este servidor**). Luego debe llamar a `POST /confirm-upload`.

---

### `POST /modules/{module_id}/lessons/confirm-upload`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{
  "drive_file_id": "<google-drive-file-id-returned-by-drive>",
  "lesson_folder_id": "<lesson_folder_id-from-upload-session>",
  "title": "Lección 1 — Variables",
  "lesson_type": "VIDEO",
  "duration_minutes": 30,
  "order_index": 1
}
```
> `lesson_folder_id` es el valor devuelto por `POST /upload-session`. Si se omite, la lección se crea sin carpeta asociada.

**Respuesta `201`:** `LessonResponse`

---

### `PUT /modules/{module_id}/lessons/{lesson_id}`
**Auth:** `InstructorOrAdmin`  
**Body (opcionales):** `title`, `lesson_type`, `drive_file_id`, `duration_minutes`, `order_index`  
**Respuesta `200`:** `LessonResponse`

---

### `DELETE /modules/{module_id}/lessons/{lesson_id}`
**Auth:** `InstructorOrAdmin`  
**Respuesta `204`:** sin cuerpo

---

## Recursos (`/lessons/{lesson_id}/resources`)

> Prefijo completo: `/api/v1/lessons/{lesson_id}/resources`  
> Documentación detallada: [`docs/lesson_resources.md`](./lesson_resources.md)

Un **Resource** es un archivo o enlace adjunto a una lección. Cada lección puede tener:
- Un recurso `MAIN` (contenido principal: video, PDF, etc.)
- Múltiples recursos `SECONDARY` (material complementario: slides, links, imágenes, documentos)

### `GET /lessons/{lesson_id}/resources/`
**Auth:** `ActiveUser`  
**Descripción:** Lista todos los recursos de la lección ordenados (`MAIN` primero, luego `SECONDARY`, dentro de cada grupo por `order_index`).  
**Respuesta `200`:** lista de `ResourceResponse`

---

### `GET /lessons/{lesson_id}/resources/{resource_id}`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `ResourceResponse`  
**Respuesta `404`:** recurso no encontrado

---

### `POST /lessons/{lesson_id}/resources/`
**Auth:** `InstructorOrAdmin`  
**Descripción:** Registra un recurso sin subir archivos. Puedes indicar un archivo que ya existe en Drive (`drive_file_id`) o un enlace manual (`external_url`). Esto es útil cuando el archivo ya está dentro de la carpeta de la lección (o quieres usar un link compartido).  
**Body:**
```json
{
  "title": "Enlace a documentación oficial",
  "resource_type": "SECONDARY",
  "resource_format": "LINK",
  "order_index": 1,
  "drive_file_id": null,
  "external_url": "https://docs.example.com/intro"
}
```
> Se requiere `drive_file_id` **o** `external_url` (o ambos). Si ninguno se provee, el servidor retorna `422`.

**Respuesta `201`:** `ResourceResponse`

---

### `POST /lessons/{lesson_id}/resources/upload`
**Auth:** `InstructorOrAdmin`  
**Descripción:** Sube un archivo a Google Drive a través del servidor y registra el recurso. Solo para archivos ≤ `MAX_DIRECT_UPLOAD_SIZE_MB` (100 MB por defecto). Para archivos más grandes usar el flujo resumible.  
**Body:** `multipart/form-data`

| Campo | Tipo | Requerido | Default |
|---|---|---|---|
| `file` | File | ✅ | — |
| `title` | string | ✅ | — |
| `resource_type` | `MAIN` \| `SECONDARY` | ❌ | `SECONDARY` |
| `resource_format` | `VIDEO` \| `PDF` \| `DOCUMENT` \| `LINK` \| `IMAGE` | ❌ | `VIDEO` |
| `order_index` | int | ❌ | `0` |

**Respuesta `201`:** `ResourceResponse` con `drive_file_id` ya estampado.  
**Respuesta `413`:** archivo excede el límite — usar flujo resumible.

---

### Flujo Resumible (archivos grandes)

Permite que el frontend suba el archivo **directamente a Google Drive** sin que los bytes pasen por este servidor.

#### Paso 1 — `POST /lessons/{lesson_id}/resources/upload-session`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{
  "file_name": "clase-01-intro.mp4",
  "mime_type": "video/mp4",
  "title": "Video Clase 01",
  "resource_type": "MAIN",
  "resource_format": "VIDEO",
  "order_index": 0
}
```
**Respuesta `200`:**
```json
{
  "upload_url": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=...",
  "resource_id": "uuid-del-recurso-pre-guardado"
}
```

#### Paso 2 — Upload directo a Drive (hecho por el frontend)
```http
PUT {upload_url}
Content-Type: video/mp4
Content-Length: {tamaño_en_bytes}

<bytes del archivo>
```
Cuando Drive responde `200`/`201`, el cuerpo contiene el `id` del archivo en Drive → ese es el `drive_file_id`.

#### Paso 3 — `POST /lessons/{lesson_id}/resources/confirm-upload`
**Auth:** `InstructorOrAdmin`  
**Body:**
```json
{
  "resource_id": "uuid-del-recurso-pre-guardado",
  "drive_file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74od..."
}
```
**Respuesta `200`:** `ResourceResponse` con `drive_file_id` actualizado.

---

### `PUT /lessons/{lesson_id}/resources/{resource_id}`
**Auth:** `InstructorOrAdmin`  
**Descripción:** Actualiza metadatos del recurso. Todos los campos son opcionales.  
**Body:**
```json
{
  "title": "Video actualizado",
  "resource_type": "MAIN",
  "resource_format": "VIDEO",
  "order_index": 0,
  "drive_file_id": null,
  "external_url": null
}
```
**Respuesta `200`:** `ResourceResponse`  
**Respuesta `404`:** recurso no encontrado

---

### `DELETE /lessons/{lesson_id}/resources/{resource_id}`
**Auth:** `InstructorOrAdmin`  
**Respuesta `204`:** eliminado exitosamente  
**Respuesta `404`:** recurso no encontrado

> **Nota:** el archivo en Google Drive **no se elimina** automáticamente. Solo se elimina el registro en la BD.

---

## Inscripciones (`/enrollments`)

### `POST /enrollments/`
**Auth:** `ActiveUser`  
**Body:** `{ "course_id": "uuid" }`  
**Respuesta `201`:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "course_id": "uuid",
  "status": "ACTIVE",
  "progress_percentage": 0.0,
  "enrolled_at": "2026-03-12T10:00:00"
}
```

---

### `GET /enrollments/my`
**Auth:** `ActiveUser`  
**Query params:** `skip=0`, `limit=50`  
**Respuesta `200`:** lista de `EnrollmentResponse`

---

### `GET /enrollments/{enrollment_id}`
**Auth:** `ActiveUser` (sólo la propia; admin ve cualquiera)  
**Respuesta `200`:** `EnrollmentResponse`

---

### `PATCH /enrollments/{enrollment_id}/cancel`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `EnrollmentResponse` con `status: "CANCELLED"`

---

### `POST /enrollments/progress`
**Auth:** `ActiveUser`  
**Body:**
```json
{
  "lesson_id": "uuid",
  "last_position_seconds": 120,
  "watch_time_seconds": 120,
  "is_completed": false
}
```
**Respuesta `200`:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "lesson_id": "uuid",
  "last_position_seconds": 120,
  "watch_time_seconds": 120,
  "is_completed": false,
  "completed_at": null,
  "last_accessed_at": "2026-03-12T10:00:00"
}
```

---

### `GET /enrollments/progress/my`
**Auth:** `ActiveUser`  
**Query param (opcional):** `course_id=uuid`  
**Respuesta `200`:** lista de `LessonProgressResponse`

---

### `GET /enrollments/`
**Auth:** `AdminUser`  
**Query params (opcionales):** `course_id`, `user_id`, `skip=0`, `limit=50`  
**Respuesta `200`:** lista de `EnrollmentResponse`

---

## Certificados (`/certificates`)

### `GET /certificates/my`
**Auth:** `ActiveUser`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "course_id": "uuid",
    "certificate_code": "CCAP-XXXX-XXXX",
    "drive_file_id": "abc123",
    "issued_at": "2026-03-12T10:00:00"
  }
]
```

---

### `GET /certificates/{certificate_id}`
**Auth:** `ActiveUser` (propia; admin ve cualquiera)  
**Respuesta `200`:** `CertificateResponse`

---

### `GET /certificates/verify/{certificate_code}`
**Auth:** ninguna (público)  
**Respuesta `200`:** `CertificateResponse`

---

### `GET /certificates/`
**Auth:** `AdminUser`  
**Query params (opcionales):** `user_id`, `course_id`, `skip=0`, `limit=50`  
**Respuesta `200`:** lista de `CertificateResponse`

---

## Notificaciones (`/notifications`)

### `GET /notifications/inbox`
**Auth:** `ActiveUser`  
**Query params:** `skip=0`, `limit=50`, `unread_only=false`  
**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "notification_id": "uuid",
    "type": "SYSTEM",
    "title": "Bienvenido",
    "message": "Tu cuenta ha sido activada.",
    "action_url": null,
    "is_read": false,
    "read_at": null,
    "created_at": "2026-03-12T10:00:00"
  }
]
```

---

### `GET /notifications/inbox/unread-count`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `{ "unread_count": 3 }`

---

### `PATCH /notifications/inbox/{notification_id}/read`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `UserNotificationResponse` con `is_read: true`

---

### `PATCH /notifications/inbox/read-all`
**Auth:** `ActiveUser`  
**Respuesta `200`:** `{ "marked_read": 5 }`

---

### `POST /notifications/`
**Auth:** `AdminUser`  
**Body:**
```json
{
  "type": "SYSTEM",
  "title": "Mantenimiento",
  "message": "El sistema estará en mantenimiento el sábado.",
  "action_url": null,
  "target_user_ids": []
}
```
`target_user_ids: []` = broadcast a todos los usuarios activos.  
`type` puede ser: `SYSTEM`, `COURSE`, `ENROLLMENT`, `CERTIFICATE`  
**Respuesta `201`:**
```json
{
  "id": "uuid",
  "type": "SYSTEM",
  "title": "Mantenimiento",
  "message": "El sistema estará en mantenimiento el sábado.",
  "action_url": null,
  "created_at": "2026-03-12T10:00:00"
}
```

---

### `GET /notifications/`
**Auth:** `AdminUser`  
**Query params:** `skip=0`, `limit=50`  
**Respuesta `200`:** lista de `NotificationResponse`

---

## Valores de enumeraciones

| Enum | Valores posibles |
|------|-----------------|
| `DocumentType` | `DNI`, `CE`, `PASAPORTE` |
| `CourseLevel` | `BASIC`, `INTERMEDIATE`, `ADVANCED` |
| `LessonType` | `VIDEO`, `PDF`, `TEXT` |
| `EnrollmentStatus` | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `NotificationType` | `SYSTEM`, `COURSE`, `ENROLLMENT`, `CERTIFICATE` |

---

## Errores comunes

| Código | Causa |
|--------|-------|
| `400` | Datos de entrada inválidos o preflight CORS rechazado |
| `401` | Token ausente, expirado o sesión revocada |
| `403` | Usuario sin el rol requerido (`AdminUser`, `InstructorOrAdmin`) |
| `404` | Recurso no encontrado |
| `422` | Fallo de validación Pydantic (campo requerido faltante, tipo incorrecto) |

*Actualizado 2026‑03‑12 — rutas verificadas contra el código fuente.*


> **Nota:** la validación de sesión se realiza mediante el
> `SessionVerificationMiddleware` global (agregado en `presentation/main.py`).
> Además, los endpoints que sólo deberían ser accesibles por administradores
> usan la dependencia `AdminUser` en sus firmas y, por tanto, rechazan cualquier
> petición realizada por un usuario sin el rol `admin`.

---

## Autenticación (`/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Inicia sesión y devuelve JWT en JSON. |
| `POST` | `/auth/logout` | Revoca el token actual (elimina sesión en Redis). |
| `POST` | `/auth/login/form` | Mismo que `/auth/login` pero para formularios.

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ccap.edu.pe","password":"Admin@12345"}'
```

---

## Usuarios (`/users`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/users/` | ninguna | Registro público (usuario inactivo). |
| `GET` | `/users/me` | `CurrentUser` | Perfil propio. |
| `PUT`  | `/users/me` | `CurrentUser` | Actualiza perfil propio. |
| `GET`  | `/users/{id}` | `ActiveUser` | Ver datos de cualquier usuario activo. |

**Ejemplo:** obtener perfil propio
```bash
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

---

## Administración (`/admin`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/admin/users/pending` | `AdminUser` | Usuarios esperando activación. |
| `GET` | `/admin/users` | `AdminUser` | Listar usuarios (filtro `is_active`). |
| `PATCH` | `/admin/users/{id}/activate` | `AdminUser` | Activar/desactivar usuario. |
| `PATCH` | `/admin/users/{id}/role` | `AdminUser` | Cambiar rol de un usuario. |
| `GET` | `/admin/stats` | `AdminUser` | Estadísticas generales. |

**Ejemplo:** activar un usuario
```bash
curl -X PATCH http://localhost:8000/api/v1/admin/users/c1b2c3d4-0001-.../activate \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_active":true}'
```

---

## Roles y permisos (`/roles`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/roles/` | `AdminUser` | Listar roles. |
| `GET` | `/roles/{id}` | `AdminUser` | Obtener rol con permisos. |
| `POST` | `/roles/` | `AdminUser` | Crear rol. |
| `PUT` | `/roles/{id}` | `AdminUser` | Actualizar rol. |
| `DELETE` | `/roles/{id}` | `AdminUser` | Eliminar rol. |
| `POST` | `/roles/{id}/permissions` | `AdminUser` | Asignar permiso a rol. |
| `DELETE` | `/roles/{id}/permissions/{pid}` | `AdminUser` | Revocar permiso. |
| `GET` | `/roles/permissions/all` | `AdminUser` | Listar todos los permisos. |
| `POST` | `/roles/permissions` | `AdminUser` | Crear permiso. |

**Ejemplo:** crear permiso
```bash
curl -X POST http://localhost:8000/api/v1/roles/permissions \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"course:create","name":"Crear cursos"}'
```

---

## Categorías (`/categories`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/categories/` | público | Listar categorías. |
| `GET` | `/categories/{id}` | público | Detalle de categoría. |
| `POST` | `/categories/` | `AdminUser` | Crear categoría. |
| `PUT` | `/categories/{id}` | `AdminUser` | Actualizar categoría. |
| `DELETE` | `/categories/{id}` | `AdminUser` | Eliminar categoría. |

**Ejemplo:** crear categoría
```bash
curl -X POST http://localhost:8000/api/v1/categories/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Desarrollo Web","description":"Cursos de web"}'
```

---

## Cursos (`/courses`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/courses/` | público | Listar cursos (con filtros). |
| `GET` | `/courses/{id}` | público | Detalle de curso. |
| `POST` | `/courses/` | `InstructorOrAdmin` | Crear curso. |
| `PUT` | `/courses/{id}` | `InstructorOrAdmin` | Actualizar curso. |
| `DELETE` | `/courses/{id}` | `InstructorOrAdmin` | Eliminar curso. |

---

## Módulos (`/modules`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/modules/` | público | Listar módulos. |
| `GET` | `/modules/{id}` | público | Detalle de módulo. |
| `POST` | `/modules/` | `InstructorOrAdmin` | Crear módulo. |
| `PUT` | `/modules/{id}` | `InstructorOrAdmin` | Actualizar módulo. |
| `DELETE` | `/modules/{id}` | `InstructorOrAdmin` | Eliminar módulo. |

---

## Lecciones (`/lessons`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/lessons/` | público | Listar lecciones (filtros por módulo). |
| `GET` | `/lessons/{id}` | público | Detalle de lección. |
| `POST` | `/lessons/` | `InstructorOrAdmin` | Crear lección. |
| `PUT` | `/lessons/{id}` | `InstructorOrAdmin` | Actualizar lección. |
| `DELETE` | `/lessons/{id}` | `InstructorOrAdmin` | Eliminar lección. |

---

## Recursos (`/lessons/{lesson_id}/resources`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/lessons/{lesson_id}/resources/` | `ActiveUser` | Listar recursos de la lección. |
| `GET` | `/lessons/{lesson_id}/resources/{id}` | `ActiveUser` | Detalle de recurso. |
| `POST` | `/lessons/{lesson_id}/resources/` | `InstructorOrAdmin` | Registrar recurso por referencia (Drive o URL). |
| `POST` | `/lessons/{lesson_id}/resources/upload` | `InstructorOrAdmin` | Subir archivo ≤ 100 MB y registrar recurso. |
| `POST` | `/lessons/{lesson_id}/resources/upload-session` | `InstructorOrAdmin` | Iniciar sesión de upload resumible (archivos grandes). |
| `POST` | `/lessons/{lesson_id}/resources/confirm-upload` | `InstructorOrAdmin` | Confirmar upload resumible completado. |
| `PUT` | `/lessons/{lesson_id}/resources/{id}` | `InstructorOrAdmin` | Actualizar metadatos del recurso. |
| `DELETE` | `/lessons/{lesson_id}/resources/{id}` | `InstructorOrAdmin` | Eliminar recurso. |

---

## Inscripciones (`/enrollments`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/enrollments/` | `AdminUser` | Listar todas inscripciones. |
| `GET` | `/enrollments/me` | `ActiveUser` | Mis inscripciones. |
| `POST` | `/enrollments/` | `ActiveUser` | Inscribirse en curso. |
| `DELETE` | `/enrollments/{id}` | `ActiveUser` | Cancelar mi inscripción. |

---

## Certificados (`/certificates`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/certificates/` | `AdminUser` | Listar todos. |
| `GET` | `/certificates/me` | `ActiveUser` | Mis certificados. |
| `POST` | `/certificates/verify/{code}` | público | Verificar un código. |

---

## Notificaciones (`/notifications`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/notifications/` | `AdminUser` | Listar todas. |
| `GET` | `/notifications/me` | `ActiveUser` | Mis notificaciones. |
| `POST` | `/notifications/` | `AdminUser` | Crear / enviar notificación. |


---

## Cómo usar

1. Obtener token a través de `/auth/login`.
2. Guardar el `access_token` y usarlo en el header `Authorization`
   (`Bearer <token>`).
3. Llamar los endpoints listados según el recurso y método.

Recuerde que sólo los usuarios activos pueden acceder a la mayoría de los
endpoints; los usuarios pendientes sólo tienen acceso público a cursos y
categorías. Los administradores tienen privilegios especiales mediante la
dependencia `AdminUser`.

---

*Documento generado manualmente el 2026‑03‑12.*

---

## Modelos de datos (esquemas Pydantic)

Estos son los esquemas que se usan en las rutas de la API. Los nombres aparecen
junto a su lugar de definición, lo que permite recrear el mismo contrato en el
front-end.

### Autenticación

```python
class TokenResponse(BaseModel):
    access_token: str
    token_type: str  # "bearer"

class LogoutResponse(BaseModel):
    detail: str
``` 

### Usuarios & administración

```python
class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    document_type: DocumentType
    document_number: str
    phone_number: Optional[str]
    role_id: Optional[UUID]

class UpdateUserRequest(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    phone_number: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]

class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    full_name: str
    document_type: Optional[DocumentType]
    document_number: Optional[str]
    phone_number: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    role_id: UUID
    role_name: Optional[str]
    is_active: bool

class AdminUserResponse(UserResponse):
    created_at: str

class ActivateUserRequest(BaseModel):
    is_active: bool

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    pending_users: int
``` 

### Roles y permisos

```python
class PermissionResponse(BaseModel):
    id: UUID
    code: str
    name: str
    description: Optional[str]
    created_at: str

class CreatePermissionRequest(BaseModel):
    code: str
    name: str
    description: Optional[str]

class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    is_system_role: bool
    permissions: List[PermissionResponse]
    created_at: str

class RoleListResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    is_system_role: bool
    permission_count: int
    created_at: str

class CreateRoleRequest(BaseModel):
    name: str
    description: Optional[str]
    is_system_role: bool = False

class UpdateRoleRequest(BaseModel):
    name: Optional[str]
    description: Optional[str]

class AssignPermissionRequest(BaseModel):
    permission_id: UUID
``` 

### Categorías

```python
class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_at: str
``` 

### Cursos & módulos & lecciones

```python
class CourseResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    short_description: Optional[str]
    description: Optional[str]
    thumbnail_url: Optional[str]
    course_level: CourseLevel  # "BASIC" | "INTERMEDIATE" | "ADVANCED"
    requirements: List[str]
    what_you_will_learn: List[str]
    tags: List[str]
    is_published: bool
    instructor_id: UUID
    category_id: Optional[UUID]
    drive_folder_id: Optional[str]  # ID de carpeta en Google Drive (auto-creada)

class ModuleResponse(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    description: Optional[str]
    order_index: int
    drive_folder_id: Optional[str]  # ID de subcarpeta en Google Drive (auto-creada)
    created_at: str

class LessonResponse(BaseModel):
    id: UUID
    module_id: UUID
    title: str
    lesson_type: LessonType  # "VIDEO" | "PDF" | "TEXT"
    drive_file_id: str
    duration_minutes: int
    order_index: int
    created_at: str
```

### Recursos

```python
class ResourceResponse(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str
    resource_type: ResourceType    # "MAIN" | "SECONDARY"
    resource_format: ResourceFormat  # "VIDEO" | "PDF" | "DOCUMENT" | "LINK" | "IMAGE"
    order_index: int
    drive_file_id: Optional[str]   # null mientras el upload resumible está en curso
    external_url: Optional[str]    # null para recursos de Drive
    created_at: str                # ISO 8601

class UploadSessionResponse(BaseModel):
    upload_url: str    # URL de subida resumible de Google Drive (un solo uso)
    resource_id: UUID  # ID del recurso pre-guardado; usar en confirm-upload
``` 

### Inscripciones & progreso

```python
class EnrollmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    user_id: UUID
    enrolled_at: str

class LessonProgressResponse(BaseModel):
    lesson_id: UUID
    user_id: UUID
    completed: bool
    completed_at: Optional[str]
``` 

### Certificados

```python
class CertificateResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    issued_at: str
``` 

### Notificaciones

```python
class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    created_at: str

class UserNotificationResponse(NotificationResponse):
    read: bool

class UnreadCountResponse(BaseModel):
    count: int
```

---

*Las definiciones anteriores pueden servir como referencia al construir las
interfaces o clases de tipo en el front-end; son una transcripción directa de
los modelos Pydantic usados en los routers.*

