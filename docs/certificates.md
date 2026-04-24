# Certificados — Referencia de API

Base URL: `http://localhost:8000/api/v1`

---

## Modelo de datos

```ts
interface CertificateResponse {
  id: string;              // UUID
  user_id: string;         // UUID del titular
  course_id: string;       // UUID del curso
  certificate_code: string; // e.g. "CCAP-A3F7-2X9Q" — dato del código de barras
  drive_file_id: string | null; // ID interno de Google Drive (puede ser null)
  pdf_url: string | null;      // URL pública al PDF (puede ser null)
  html_content: string | null; // HTML renderizado del certificado (puede ser null)
  issued_at: string;           // ISO 8601, e.g. "2026-03-26T00:00:00"
}
```

### Campos inmutables (no cambian tras la emisión)
| Campo | Descripción |
|-------|-------------|
| `id` | Identificador primario |
| `user_id` | Titular del certificado |
| `course_id` | Curso completado |
| `certificate_code` | Código único — payload del código QR/barcode |
| `issued_at` | Fecha y hora de emisión |

### Campos mutables (sólo admin puede editarlos)
| Campo | Descripción |
|-------|-------------|
| `drive_file_id` | ID del archivo PDF en Google Drive |
| `pdf_url` | URL pública al PDF (Drive share, CDN, etc.) |
| `html_content` | HTML completo del certificado listo para imprimir |

---

## Código de barras / QR

El campo `certificate_code` (formato `CCAP-XXXX-XXXX`) es el dato que debe
codificarse en el QR o código de barras impreso en el certificado.

**Flujo de verificación:**
1. El usuario escanea el código del certificado.
2. El lector lo lleva a `GET /api/v1/certificates/verify/{certificate_code}`.
3. La respuesta incluye todos los campos, incluidos `html_content` y `pdf_url`.

Ejemplo con la librería `qrcode` en el front:
```js
// react-qr-code (npm i react-qr-code)
import QRCode from 'react-qr-code';

<QRCode value={cert.certificate_code} size={128} />
```

O con `jsbarcode` para código de barras lineal:
```js
import JsBarcode from 'jsbarcode';
JsBarcode('#barcode', cert.certificate_code, { format: 'CODE128' });
```

---

## Endpoints públicos (sin autenticación)

### `GET /certificates/verify/{certificate_code}`
Verifica un certificado por su código único (payload del QR/barcode).

**Parámetro de ruta:** `certificate_code` — string, e.g. `CCAP-A3F7-2X9Q`

**Respuesta `200`:** `CertificateResponse`  
**Respuesta `404`:** certificado no válido

```bash
curl http://localhost:8000/api/v1/certificates/verify/CCAP-A3F7-2X9Q
```

---

### `GET /certificates/{id}`
Obtiene un certificado por su UUID.

**Parámetro de ruta:** `id` — UUID

**Respuesta `200`:** `CertificateResponse`  
**Respuesta `404`:** no encontrado

```bash
curl http://localhost:8000/api/v1/certificates/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

---

## Endpoints de usuario (requieren `Authorization: Bearer <token>`)

### `GET /certificates/my`
Lista todos los certificados del usuario autenticado.

**Auth:** `ActiveUser`  
**Respuesta `200`:** `CertificateResponse[]`

```bash
curl http://localhost:8000/api/v1/certificates/my \
  -H "Authorization: Bearer <token>"
```

---

## Endpoints de administrador (requieren rol `admin`)

### `GET /certificates/`
Lista todos los certificados con filtros opcionales.

**Auth:** `AdminUser`  
**Query params:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | UUID (opcional) | Filtrar por usuario |
| `course_id` | UUID (opcional) | Filtrar por curso |
| `skip` | int (default `0`) | Paginación |
| `limit` | int (default `50`) | Paginación |

**Respuesta `200`:** `CertificateResponse[]`

```bash
curl "http://localhost:8000/api/v1/certificates/?course_id=<uuid>&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

---

### `POST /certificates/`
Crea manualmente un certificado para un par usuario/curso.  
El `certificate_code` se genera automáticamente.

**Auth:** `AdminUser`  
**Body:**
```json
{
  "user_id": "uuid-del-usuario",
  "course_id": "uuid-del-curso",
  "html_content": "<html>...</html>",
  "pdf_url": "https://drive.google.com/file/d/.../view",
  "drive_file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74od"
}
```
> `html_content`, `pdf_url` y `drive_file_id` son opcionales al crear. Pueden
> completarse más tarde con `PATCH`.

**Respuesta `201`:** `CertificateResponse` con `certificate_code` generado.

```bash
curl -X POST http://localhost:8000/api/v1/certificates/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<uuid>","course_id":"<uuid>"}'
```

---

### `PATCH /certificates/{id}`
Actualiza los campos mutables de un certificado existente.  
**Solo los campos incluidos en el body se modifican** (patch parcial).

**Auth:** `AdminUser`  
**Parámetro de ruta:** `id` — UUID  
**Body (todos opcionales):**
```json
{
  "drive_file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74od",
  "pdf_url": "https://drive.google.com/file/d/.../view?usp=sharing",
  "html_content": "<html lang=\"es\">...</html>"
}
```

**Campos inmutables** (`user_id`, `course_id`, `certificate_code`, `issued_at`)
**no se pueden cambiar** y se ignoran si se envían.

**Respuesta `200`:** `CertificateResponse` actualizado  
**Respuesta `404`:** certificado no encontrado

```bash
curl -X PATCH http://localhost:8000/api/v1/certificates/<uuid> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"pdf_url":"https://drive.google.com/file/d/ABC/view"}'
```

---

### `DELETE /certificates/{id}`
Elimina el registro del certificado de la base de datos.

**Auth:** `AdminUser`  
**Respuesta `204`:** sin cuerpo  
**Respuesta `404`:** no encontrado

```bash
curl -X DELETE http://localhost:8000/api/v1/certificates/<uuid> \
  -H "Authorization: Bearer <admin_token>"
```

---

## Tabla de endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/certificates/verify/{code}` | público | Verificar por código QR/barcode |
| `GET` | `/certificates/{id}` | público | Obtener por UUID |
| `GET` | `/certificates/my` | `ActiveUser` | Mis certificados |
| `GET` | `/certificates/` | `AdminUser` | Listar todos (con filtros) |
| `POST` | `/certificates/` | `AdminUser` | Crear certificado |
| `PATCH` | `/certificates/{id}` | `AdminUser` | Actualizar campos mutables |
| `DELETE` | `/certificates/{id}` | `AdminUser` | Eliminar certificado |

---

## Notas de implementación para el front

1. **Mostrar el certificado:** usar `html_content` para renderizar el
   certificado dentro de un `<iframe srcdoc="...">` o `dangerouslySetInnerHTML`.
2. **Descargar PDF:** enlazar `pdf_url` directamente en un `<a href={cert.pdf_url} target="_blank">`.
3. **Código QR:** codificar `certificate_code` con una librería como
   `react-qr-code`. Al escanear debe navegar a
   `GET /api/v1/certificates/verify/{certificate_code}`.
4. **Página pública de verificación:** no requiere login — cualquier persona con
   el código o el UUID puede consultar el certificado.

---

*Actualizado 2026-03-26.*
