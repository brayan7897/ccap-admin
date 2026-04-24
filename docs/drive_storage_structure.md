# Google Drive — Estructura de almacenamiento

Base URL de la API: `http://localhost:8000/api/v1`

> **Autenticación:** todos los endpoints de escritura requieren  
> `Authorization: Bearer <access_token>` con rol `instructor` o `admin`.

---

## Jerarquía de carpetas en Drive

Cada entidad del sistema tiene su propia carpeta en Google Drive. La estructura es:

```
GOOGLE_DRIVE_FOLDER_ID  (raíz configurada en .env)
└── Curso-{slug}                    ← se crea al crear el curso
    └── Módulo-{order_index}        ← se crea al crear el módulo
        └── Lección-{order_index}   ← se crea al subir el archivo de la lección
            └── <archivo>           ← video, PDF u otro archivo de contenido
```

### Ejemplo concreto

```
📁 ccap-cursos  (GOOGLE_DRIVE_FOLDER_ID)
└── 📁 Curso-python-desde-cero
    ├── 📁 Módulo-1
    │   ├── 📁 Lección-1
    │   │   └── 🎬 intro.mp4
    │   └── 📁 Lección-2
    │       └── 📄 variables.pdf
    └── 📁 Módulo-2
        └── 📁 Lección-1
            └── 🎬 funciones.mp4
```

---

## Flujo completo: Crear un curso con contenido

### Paso 1 — Crear el curso → carpeta de curso

**`POST /api/v1/courses/`**  
**Auth:** `InstructorOrAdmin`

**Body:**
```json
{
  "title": "Python desde cero",
  "slug": "python-desde-cero",
  "instructor_id": "uuid-del-instructor",
  "category_id": "uuid-categoria",
  "short_description": "Aprende Python de manera práctica.",
  "description": "Curso completo de Python para principiantes.",
  "course_level": "BASIC",
  "course_type": "FREE",
  "price": null,
  "requirements": ["Conocimientos básicos de computación"],
  "what_you_will_learn": ["Variables", "Funciones", "POO"],
  "tags": ["python", "programacion"]
}
```
> `instructor_id` es **opcional**. Si se omite, se usa automáticamente el ID del usuario autenticado.
}
```

**Respuesta `201`:**
```json
{
  "id": "uuid-del-curso",
  "title": "Python desde cero",
  "slug": "python-desde-cero",
  "short_description": "Aprende Python de manera práctica.",
  "description": "Curso completo de Python para principiantes.",
  "thumbnail_url": null,
  "course_level": "BASIC",
  "course_type": "FREE",
  "price": null,
  "requirements": ["Conocimientos básicos de computación"],
  "what_you_will_learn": ["Variables", "Funciones", "POO"],
  "tags": ["python", "programacion"],
  "is_published": false,
  "instructor_id": "uuid-del-instructor",
  "instructor_name": "Nombre Instructor",
  "instructor_email": "instructor@ccap.edu.pe",
  "category_id": "uuid-categoria",
  "category_name": "Programación",
  "category_slug": "programacion",
  "drive_folder_id": "<id-carpeta-Curso-python-desde-cero>"
}
```

> ✅ El campo `drive_folder_id` contiene el ID de la carpeta creada en Drive con el nombre `Curso-python-desde-cero`.

---

### Paso 2 — Crear un módulo → carpeta de módulo

**`POST /api/v1/courses/{course_id}/modules/`**  
**Auth:** `InstructorOrAdmin`

**Body:**
```json
{
  "title": "Módulo 1 — Fundamentos",
  "description": "Variables, tipos de datos y operadores.",
  "order_index": 1
}
```

**Respuesta `201`:**
```json
{
  "id": "uuid-del-modulo",
  "course_id": "uuid-del-curso",
  "title": "Módulo 1 — Fundamentos",
  "description": "Variables, tipos de datos y operadores.",
  "order_index": 1,
  "drive_folder_id": "<id-carpeta-Módulo-1>",
  "created_at": "2026-03-13T00:00:00"
}
```

> ✅ Se crea automáticamente `Módulo-1` dentro de `Curso-python-desde-cero` en Drive.

---

### Paso 3A — Subir archivo (≤ 100 MB) → carpeta de lección (carga directa)

**`POST /api/v1/modules/{module_id}/lessons/upload`**  
**Auth:** `InstructorOrAdmin`  
**Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `file` | `UploadFile` | ✅ | Archivo de contenido (video, PDF, etc.) |
| `title` | `string` | ✅ | Título de la lección |
| `lesson_type` | `string` | ❌ | `VIDEO`, `PDF` o `TEXT` (default: `VIDEO`) |
| `duration_minutes` | `int` | ❌ | Duración en minutos (default: `0`) |
| `order_index` | `int` | ✅ | Posición dentro del módulo |

El backend:
1. Resuelve el `drive_folder_id` del módulo.
2. Crea una subcarpeta `Lección-{order_index}` dentro de la carpeta del módulo.
3. Sube el archivo a esa carpeta de lección.
4. Crea el registro de lección en base de datos.

**Respuesta `201`:**
```json
{
  "id": "uuid-de-la-leccion",
  "module_id": "uuid-del-modulo",
  "title": "Introducción a Python",
  "lesson_type": "VIDEO",
  "drive_file_id": "<id-del-archivo-en-drive>",
  "drive_folder_id": "<id-carpeta-Lección-1>",
  "duration_minutes": 0,
  "order_index": 1,
  "created_at": "2026-03-13T00:00:00"
}
```

---

### Paso 3B — Subir archivo grande (> 100 MB) → carga reanudable (2 pasos)

#### 3B.1 — Iniciar sesión de carga

**`POST /api/v1/modules/{module_id}/lessons/upload-session`**  
**Auth:** `InstructorOrAdmin`

**Body:**
```json
{
  "file_name": "clase1-introduccion.mp4",
  "mime_type": "video/mp4",
  "title": "Introducción a Python",
  "order_index": 1
}
```

El backend:
1. Resuelve el `drive_folder_id` del módulo.
2. Crea una subcarpeta `Lección-{order_index}` dentro de la carpeta del módulo.
3. Inicia una sesión de carga reanudable de Google Drive apuntando a esa carpeta.
4. Devuelve la URL de carga y el ID de la carpeta.

**Respuesta `200`:**
```json
{
  "upload_url": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=AAAXXXyyy...",
  "lesson_folder_id": "<id-carpeta-Lección-1>"
}
```

#### 3B.2 — El frontend sube el archivo directamente a Drive

```
PUT {upload_url}
Content-Type: video/mp4
Content-Length: <tamaño-en-bytes>

<bytes-del-archivo>
```

> ⚠️ El archivo **nunca pasa por este servidor**. El fronend hace PUT directamente a Google Drive usando la URL devuelta. Google devuelve el `id` del archivo creado en el body de la respuesta.

#### 3B.3 — Confirmar la subida

**`POST /api/v1/modules/{module_id}/lessons/confirm-upload`**  
**Auth:** `InstructorOrAdmin`

**Body:**
```json
{
  "drive_file_id": "<id-del-archivo-devuelto-por-drive>",
  "lesson_folder_id": "<lesson_folder_id-de-upload-session>",
  "title": "Introducción a Python",
  "lesson_type": "VIDEO",
  "duration_minutes": 30,
  "order_index": 1
}
```

> `lesson_folder_id` es el valor devuelto por `POST /upload-session` en el paso anterior.  
> Si se omite, la lección se crea sin carpeta Drive asociada.

**Respuesta `201`:**
```json
{
  "id": "uuid-de-la-leccion",
  "module_id": "uuid-del-modulo",
  "title": "Introducción a Python",
  "lesson_type": "VIDEO",
  "drive_file_id": "<id-del-archivo-en-drive>",
  "drive_folder_id": "<id-carpeta-Lección-1>",
  "duration_minutes": 30,
  "order_index": 1,
  "created_at": "2026-03-13T00:00:00"
}
```

---

## Campos Drive en cada entidad

| Entidad | Campo BD | Drive | Cuándo se crea |
|---|---|---|---|
| `Course` | `drive_folder_id` | `Curso-{slug}` | Al crear el curso vía `POST /courses/` |
| `Module` | `drive_folder_id` | `Módulo-{order_index}` | Al crear el módulo vía `POST /courses/{id}/modules/` |
| `Lesson` | `drive_folder_id` | `Lección-{order_index}` | Al subir archivo vía `POST /upload` o `POST /upload-session` |
| `Lesson` | `drive_file_id` | Archivo de contenido | Al subir el archivo |

> Las carpetas de módulo/lección se **renombran automáticamente** en Drive si se cambia el `order_index` vía `PUT`.

---

## Casos de degradación

Si Drive no está disponible o las credenciales fallan:

- **Creación de curso:** el curso se guarda en BD con `drive_folder_id = null`. El error se registra en el log.
- **Creación de módulo:** el módulo se guarda con `drive_folder_id = null`.
- **Subida de lección:** si no existe `drive_folder_id` en el módulo, el archivo se sube a la raíz (`GOOGLE_DRIVE_FOLDER_ID`). La lección se guarda con `drive_folder_id = null`.

---

## Variables de entorno relevantes

| Variable | Descripción |
|---|---|
| `GOOGLE_CREDENTIALS_JSON` | Ruta al JSON de la cuenta de servicio |
| `GOOGLE_DRIVE_FOLDER_ID` | ID de la carpeta raíz de Drive |
| `MAX_DIRECT_UPLOAD_SIZE_MB` | Límite de carga directa (default: `100`) |
