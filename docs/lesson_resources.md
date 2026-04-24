# Lesson Resources API

> **Base URL:** `http://localhost:8000/api/v1`  
> **Auth:** todas las rutas protegidas requieren `Authorization: Bearer <access_token>`

---

## Concepto

Un **Resource** es un archivo o enlace adjunto a una lección. Reemplaza la gestión de archivos directamente en la lección.  
Cada lección puede tener múltiples recursos diferenciados por dos atributos clave:

| Atributo | Valores | Descripción |
|---|---|---|
| `resource_type` | `MAIN` \| `SECONDARY` | **MAIN** = contenido principal de la lección (mostrar como foco central). **SECONDARY** = material complementario (mostrar como anexo). |
| `resource_format` | `VIDEO` \| `PDF` \| `DOCUMENT` \| `LINK` \| `IMAGE` | El tipo de contenido del recurso para que el frontend sepa cómo renderizarlo. |

### Regla de display

- El frontend debe mostrar primero el recurso `MAIN` (si existe) como elemento central de la pantalla de lección.
- Los recursos `SECONDARY` se listan debajo como material de apoyo (acordeón, sección de descargas, etc.).
- La lista devuelta por la API ya viene ordenada: `MAIN` primero, luego `SECONDARY`, y dentro de cada grupo por `order_index` ascendente.

### Referencia de contenido

Un recurso almacena el contenido de una de dos formas:

| Campo | Cuándo usarlo |
|---|---|
| `drive_file_id` | El archivo está en Google Drive (subido por cualquiera de los flujos de upload). |
| `external_url` | El recurso es un enlace externo (YouTube, sitio externo, etc.). |

Ambos pueden ser `null` durante el proceso de upload resumible (entre `POST /upload-session` y `POST /confirm-upload`).

---

## Endpoints

Todos los endpoints de recursos tienen el prefijo:

```
/api/v1/lessons/{lesson_id}/resources
```

---

### `GET /api/v1/lessons/{lesson_id}/resources/`

**Auth:** `ActiveUser`  
**Descripción:** Devuelve todos los recursos de la lección ordenados (`MAIN` → `SECONDARY`, luego por `order_index`).

**Respuesta `200`:**
```json
[
  {
    "id": "uuid",
    "lesson_id": "uuid",
    "title": "Video de introducción",
    "resource_type": "MAIN",
    "resource_format": "VIDEO",
    "order_index": 0,
    "drive_file_id": "1BxiMVs0XRA...",
    "external_url": null,
    "created_at": "2026-03-14T12:00:00+00:00"
  },
  {
    "id": "uuid",
    "lesson_id": "uuid",
    "title": "Presentación de la clase",
    "resource_type": "SECONDARY",
    "resource_format": "PDF",
    "order_index": 0,
    "drive_file_id": "1CxiMVs0XRA...",
    "external_url": null,
    "created_at": "2026-03-14T12:05:00+00:00"
  }
]
```

---

### `GET /api/v1/lessons/{lesson_id}/resources/{resource_id}`

**Auth:** `ActiveUser`  
**Respuesta `200`:** igual que un elemento de la lista anterior.  
**Respuesta `404`:** recurso no encontrado.

---

### `POST /api/v1/lessons/{lesson_id}/resources/`

**Auth:** `InstructorOrAdmin`  
**Descripción:** Registra un recurso cuyo contenido ya existe en Drive o en una URL externa. No realiza ninguna subida.

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

**Respuesta `201`:** objeto `ResourceResponse` completo.

---

### `POST /api/v1/lessons/{lesson_id}/resources/upload`

**Auth:** `InstructorOrAdmin`  
**Descripción:** Sube un archivo a Google Drive a través del servidor y registra el recurso. Solo para archivos ≤ `MAX_DIRECT_UPLOAD_SIZE_MB` (normalmente 100 MB). Para archivos más grandes usar el flujo resumible.

**Body:** `multipart/form-data`

| Campo | Tipo | Requerido | Default |
|---|---|---|---|
| `file` | File | ✅ | — |
| `title` | string | ✅ | — |
| `resource_type` | `MAIN` \| `SECONDARY` | ❌ | `SECONDARY` |
| `resource_format` | `VIDEO` \| `PDF` \| `DOCUMENT` \| `LINK` \| `IMAGE` | ❌ | `VIDEO` |
| `order_index` | int | ❌ | `0` |

**Respuesta `201`:** objeto `ResourceResponse` con `drive_file_id` ya estampado.  
**Respuesta `413`:** archivo excede el límite. Usar flujo resumible.

---

### Flujo Resumible (para archivos grandes)

Permite que el frontend suba el archivo **directamente a Google Drive** sin pasar el binario por el servidor.

#### Paso 1 — `POST /api/v1/lessons/{lesson_id}/resources/upload-session`

**Auth:** `InstructorOrAdmin`  
**Descripción:** El servidor crea una sesión de subida resumible en Drive y pre-guarda el recurso en la BD con `drive_file_id = null`.

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

El frontend realiza el upload usando la `upload_url` recibida:

```http
PUT {upload_url}
Content-Type: video/mp4
Content-Length: {tamaño_en_bytes}

<bytes del archivo>
```

La URL de upload es de un solo uso, tiene duración limitada (~1 semana, pero usar lo antes posible). Cuando Drive responde `200`/`201`, el body contiene el objeto del archivo con su **`id`** → ese es el `drive_file_id`.

```json
{
  "kind": "drive#file",
  "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74od...",
  "name": "clase-01-intro.mp4",
  ...
}
```

#### Paso 3 — `POST /api/v1/lessons/{lesson_id}/resources/confirm-upload`

**Auth:** `InstructorOrAdmin`  
**Descripción:** Estampa el `drive_file_id` en el recurso pre-guardado.

**Body:**
```json
{
  "resource_id": "uuid-del-recurso-pre-guardado",
  "drive_file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74od..."
}
```

**Respuesta `200`:** objeto `ResourceResponse` con `drive_file_id` actualizado.

---

### `PUT /api/v1/lessons/{lesson_id}/resources/{resource_id}`

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

**Respuesta `200`:** objeto `ResourceResponse` actualizado.  
**Respuesta `404`:** recurso no encontrado.

---

### `DELETE /api/v1/lessons/{lesson_id}/resources/{resource_id}`

**Auth:** `InstructorOrAdmin`  
**Respuesta `204`:** eliminado exitosamente.  
**Respuesta `404`:** recurso no encontrado.

> **Nota:** el archivo en Google Drive **no se borra** automáticamente. Solo se elimina el registro en la BD.

---

## Esquema de Respuesta (`ResourceResponse`)

```typescript
interface ResourceResponse {
  id: string;              // UUID
  lesson_id: string;       // UUID de la lección a la que pertenece
  title: string;
  resource_type: "MAIN" | "SECONDARY";
  resource_format: "VIDEO" | "PDF" | "DOCUMENT" | "LINK" | "IMAGE";
  order_index: number;
  drive_file_id: string | null;  // null durante upload en curso o para recursos LINK
  external_url: string | null;   // null para recursos de Drive
  created_at: string;            // ISO 8601
}
```

---

## Referencia de Tipos

### `resource_type`

| Valor | Uso |
|---|---|
| `MAIN` | Contenido central de la lección. Típicamente un video o PDF principal. Mostrar como elemento primario en la UI. Idealmente una lección tiene un solo MAIN. |
| `SECONDARY` | Material de apoyo: slides, lecturas adicionales, ejercicios, enlaces. Mostrar en una sección de "Recursos complementarios". |

### `resource_format`

| Valor | Renderizado sugerido |
|---|---|
| `VIDEO` | Reproductor de video embebido (usando URL de Drive o URL externa de YouTube, etc.) |
| `PDF` | Visor de PDF embebido o botón de descarga |
| `DOCUMENT` | Botón de descarga o visor si es compatible |
| `LINK` | Botón/hipervínculo a `external_url` |
| `IMAGE` | Imagen embebida directamente |

---

## Cambios respecto a la API anterior de Lecciones

Los siguientes endpoints de lecciones han sido **eliminados**:

| Endpoint eliminado | Reemplazo |
|---|---|
| `POST /modules/{module_id}/lessons/upload` | `POST /lessons/{lesson_id}/resources/upload` |
| `POST /modules/{module_id}/lessons/upload-session` | `POST /lessons/{lesson_id}/resources/upload-session` |
| `POST /modules/{module_id}/lessons/confirm-upload` | `POST /lessons/{lesson_id}/resources/confirm-upload` |

El flujo ahora es:
1. **Crear la lección** con `POST /modules/{module_id}/lessons/` (sin archivo; solo metadatos).
2. **Agregar recursos** con los endpoints de esta API.
