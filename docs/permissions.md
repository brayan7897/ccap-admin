# Sistema de Permisos — Documentación para el Frontend

## Filosofía del sistema

La API usa un sistema de **permisos basados en base de datos**, NO roles como guardas de acceso.

```
Usuario → Rol (etiqueta/nombre) → [Permisos en BD]
```

- Un **Rol** es solo un nombre/grupo (ej. "Administrador", "Instructor").
- Un **Permiso** es un código de acción (ej. `"course:create"`). 
- El acceso real lo determinan los **permisos**, no el rol.
- Un administrador puede asignar/revocar permisos a cualquier rol **sin cambios de código**.

---

## Flujo de autenticación

### 1. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "secret" }
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "full_name": "Juan Pérez",
    "role_id": "b1f2c3d4-...",
    "role_name": "Administrador",
    "is_active": true,
    "course_access": "APPROVED",
    "avatar_url": null,
    "permissions": [
      "admin:access",
      "user:manage",
      "course:create",
      "course:edit",
      "course:delete",
      "course:publish",
      "category:manage",
      "enrollment:manage",
      "certificate:manage",
      "notification:manage"
    ]
  }
}
```

> **Acción recomendada:** Al recibir la respuesta del login, guarda `access_token` en memoria/localStorage y guarda el objeto `user.permissions` en tu store/contexto global.

### 2. Usar el token

Incluye el token en **todas** las peticiones protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 3. Obtener perfil actualizado

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

La respuesta incluye el mismo campo `permissions[]`. Úsalo para refrescar permisos si el usuario ha estado mucho tiempo logueado.

### 4. Refrescar permisos sin re-login

```http
GET /api/v1/roles/me/permissions
Authorization: Bearer <token>
```

```json
{
  "role_id": "b1f2c3d4-...",
  "role_name": "Administrador",
  "permissions": [
    { "id": "...", "code": "admin:access", "name": "Acceso Admin", "description": null, "created_at": "..." },
    { "id": "...", "code": "course:create", "name": "Crear Cursos", "description": null, "created_at": "..." }
  ]
}
```

---

## Códigos de permisos (convención `<recurso>:<acción>`)

| Código | Guard alias (backend) | Descripción |
|---|---|---|
| `admin:access` | `AdminUser` | Acceso completo al panel de administración |
| `user:manage` | `UserManager` | Crear, editar, desactivar usuarios y cambiar roles |
| `course:create` | `CourseCreator` | Crear nuevos cursos |
| `course:edit` | `CourseEditor` | Editar cursos, módulos, lecciones y recursos |
| `course:delete` | `CourseDeleter` | Eliminar cursos |
| `course:publish` | `CoursePublisher` | Publicar/despublicar cursos |
| `category:manage` | `CategoryManager` | CRUD completo de categorías de cursos |
| `enrollment:manage` | `EnrollmentManager` | Gestionar inscripciones (aprobar/rechazar/crear) |
| `certificate:manage` | `CertificateManager` | Emitir/actualizar/revocar certificados |
| `notification:manage` | `NotificationManager` | Crear y enviar notificaciones a usuarios |

> Los códigos son extensibles — un administrador puede crear nuevos desde el panel o vía API.

---

## Control de acceso en el frontend

### ⚠️ Regla crítica

El frontend usa permisos para **ocultar/mostrar UI**. La API **siempre valida independientemente** en el servidor. Nunca confíes en el array de permisos del frontend como garantía de seguridad.

### Implementación recomendada (React/Vue/Angular)

```typescript
// store/auth.ts (ejemplo con Zustand / Pinia / signal)

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  permissions: Set<string>;
}

// Acción de login
async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const { access_token, user } = res.data;
  
  store.token = access_token;
  store.user = user;
  store.permissions = new Set(user.permissions); // O(1) lookup
}

// Guard de permiso
function hasPermission(code: string): boolean {
  return store.permissions.has(code);
}

// Guard de cualquiera de varios permisos
function hasAnyPermission(...codes: string[]): boolean {
  return codes.some(code => store.permissions.has(code));
}
```

### Uso en componentes

```tsx
// React example
function CourseCreateButton() {
  const { hasPermission } = useAuth();
  
  if (!hasPermission('course:create')) return null;
  
  return <button onClick={handleCreate}>Crear Curso</button>;
}

// Admin sidebar item
function AdminNavItem() {
  const { hasPermission } = useAuth();
  
  if (!hasPermission('admin:access')) return null;
  
  return <NavItem href="/admin" label="Panel Admin" />;
}
```

```vue
<!-- Vue example -->
<template>
  <button v-if="hasPermission('course:create')" @click="createCourse">
    Crear Curso
  </button>
</template>
```

### Con React Router / guards de ruta

```typescript
// routes.tsx
function PermissionRoute({ code, children }: { code: string; children: ReactNode }) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(code)) {
    return <Navigate to="/403" replace />;
  }
  
  return children;
}

// Uso:
<Route path="/admin/*" element={
  <PermissionRoute code="admin:access">
    <AdminLayout />
  </PermissionRoute>
} />

<Route path="/courses/create" element={
  <PermissionRoute code="course:create">
    <CreateCoursePage />
  </PermissionRoute>
} />
```

---

## Gestión de permisos (solo admins)

Todos los endpoints de gestión requieren el permiso `admin:access`.

### Listar todos los permisos del sistema

```http
GET /api/v1/roles/permissions/all
Authorization: Bearer <admin-token>
```

```json
[
  { "id": "...", "code": "admin:access", "name": "Acceso Admin", "description": null, "created_at": "..." },
  { "id": "...", "code": "course:create", "name": "Crear Cursos", "description": null, "created_at": "..." }
]
```

### Crear un permiso nuevo

```http
POST /api/v1/roles/permissions
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "code": "report:export",
  "name": "Exportar Reportes",
  "description": "Permite exportar reportes en CSV/PDF"
}
```

### Actualizar un permiso

```http
PUT /api/v1/roles/permissions/{permission_id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Exportar Reportes (Excel y CSV)",
  "description": "Descripción actualizada"
}
```

> El `code` no se puede cambiar (es la clave usada en el código). Crea uno nuevo y elimina el viejo.

### Eliminar un permiso

```http
DELETE /api/v1/roles/permissions/{permission_id}
Authorization: Bearer <admin-token>
```

> La eliminación se propaga automáticamente: todos los roles que tenían ese permiso lo perderán (CASCADE en BD).

---

## Gestión de roles (solo admins)

Un rol es un nombre que agrupa permisos.

### Listar roles

```http
GET /api/v1/roles/
Authorization: Bearer <admin-token>
```

### Crear un rol

```http
POST /api/v1/roles/
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Instructor Senior",
  "description": "Instructor con permisos de publicación",
  "is_system_role": false
}
```

### Asignar un permiso a un rol

```http
POST /api/v1/roles/{role_id}/permissions
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "permission_id": "uuid-del-permiso" }
```

### Revocar un permiso de un rol

```http
DELETE /api/v1/roles/{role_id}/permissions/{permission_id}
Authorization: Bearer <admin-token>
```

### Ver detalle de un rol (con sus permisos)

```http
GET /api/v1/roles/{role_id}
Authorization: Bearer <admin-token>
```

---

## Cambiar el rol de un usuario

```http
PATCH /api/v1/admin/users/{user_id}/role?role_id={new_role_id}
Authorization: Bearer <admin-token>
```

> Después de cambiar el rol de un usuario, sus permisos se actualizan en la **próxima request** que haga (el JWT no necesita rotarse; la carga de permisos es dinámica desde BD).

---

## Tabla de rutas completa

### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | Ninguna | Login → JWT + perfil + permisos |
| `POST` | `/auth/logout` | Bearer | Cerrar sesión actual |
| `POST` | `/auth/logout/all` | Bearer | Cerrar todas las sesiones |
| `POST` | `/auth/google` | Ninguna | Login Google → JWT + perfil + permisos |

### Permisos propios

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/users/me` | Bearer | Perfil + permisos actuales |
| `GET` | `/roles/me/permissions` | Bearer (activo) | Solo permisos (sin re-login) |

### Admin — Gestión de permisos

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `GET` | `/roles/permissions/all` | `admin:access` | Listar todos los permisos |
| `POST` | `/roles/permissions` | `admin:access` | Crear permiso |
| `GET` | `/roles/permissions/{id}` | `admin:access` | Detalle de permiso |
| `PUT` | `/roles/permissions/{id}` | `admin:access` | Actualizar permiso |
| `DELETE` | `/roles/permissions/{id}` | `admin:access` | Eliminar permiso |

### Admin — Gestión de roles

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `GET` | `/roles/` | `admin:access` | Listar roles |
| `POST` | `/roles/` | `admin:access` | Crear rol |
| `GET` | `/roles/{id}` | `admin:access` | Detalle rol + permisos |
| `PUT` | `/roles/{id}` | `admin:access` | Actualizar rol |
| `DELETE` | `/roles/{id}` | `admin:access` | Eliminar rol |
| `POST` | `/roles/{id}/permissions` | `admin:access` | Asignar permiso a rol |
| `DELETE` | `/roles/{id}/permissions/{pid}` | `admin:access` | Revocar permiso de rol |

### Admin — Usuarios

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `GET` | `/admin/users/pending` | `user:manage` | Listar usuarios pendientes |
| `GET` | `/admin/users` | `user:manage` | Listar todos los usuarios |
| `PATCH` | `/admin/users/{id}/activate` | `user:manage` | Activar/desactivar usuario |
| `PATCH` | `/admin/users/{id}/role` | `user:manage` | Cambiar rol de usuario |
| `GET` | `/admin/courses` | `admin:access` | Listar todos los cursos (admin) |
| `GET` | `/admin/stats` | `admin:access` | Estadísticas generales |

### Cursos, Módulos y Lecciones

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `POST` | `/courses/` | `course:create` | Crear curso |
| `PUT` | `/courses/{id}` | `course:edit` | Editar curso |
| `POST` | `/courses/{id}/modules/` | `course:edit` | Crear módulo |
| `PUT` | `/courses/{id}/modules/{mid}` | `course:edit` | Editar módulo |
| `DELETE` | `/courses/{id}/modules/{mid}` | `course:edit` | Eliminar módulo |
| `POST` | `/modules/{mid}/lessons/` | `course:edit` | Crear lección |
| `PUT` | `/modules/{mid}/lessons/{lid}` | `course:edit` | Editar lección |
| `DELETE` | `/modules/{mid}/lessons/{lid}` | `course:edit` | Eliminar lección |
| `POST` | `/lessons/{lid}/resources/` | `course:edit` | Registrar recurso |
| `POST` | `/lessons/{lid}/resources/upload` | `course:edit` | Subir archivo |
| `PUT` | `/lessons/{lid}/resources/{rid}` | `course:edit` | Editar recurso |
| `DELETE` | `/lessons/{lid}/resources/{rid}` | `course:edit` | Eliminar recurso |

### Categorías

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `POST` | `/categories/` | `category:manage` | Crear categoría |
| `PUT` | `/categories/{id}` | `category:manage` | Editar categoría |
| `DELETE` | `/categories/{id}` | `category:manage` | Eliminar categoría |

### Inscripciones

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `POST` | `/enrollments/admin` | `enrollment:manage` | Inscribir usuario manualmente |
| `GET` | `/enrollments/` | `enrollment:manage` | Listar todas las inscripciones |

### Certificados

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `GET` | `/certificates/` | `certificate:manage` | Listar todos los certificados |
| `POST` | `/certificates/` | `certificate:manage` | Crear certificado |
| `PATCH` | `/certificates/{id}` | `certificate:manage` | Actualizar certificado |
| `DELETE` | `/certificates/{id}` | `certificate:manage` | Eliminar certificado |

### Notificaciones

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `POST` | `/notifications/` | `notification:manage` | Crear/enviar notificación |
| `GET` | `/notifications/` | `notification:manage` | Listar todas las notificaciones |

---

## Seed de datos recomendado

Al inicializar el sistema, crea estos permisos mínimos y asígnalos al rol "Administrador":

```sql
INSERT INTO permissions (code, name) VALUES
  ('admin:access',         'Acceso al Panel de Administración'),
  ('user:manage',          'Gestionar Usuarios'),
  ('course:create',        'Crear Cursos'),
  ('course:edit',          'Editar Cursos, Módulos, Lecciones y Recursos'),
  ('course:delete',        'Eliminar Cursos'),
  ('course:publish',       'Publicar/Despublicar Cursos'),
  ('category:manage',      'Gestionar Categorías de Cursos'),
  ('enrollment:manage',    'Gestionar Inscripciones'),
  ('certificate:manage',   'Gestionar Certificados'),
  ('notification:manage',  'Crear y Enviar Notificaciones');
```

---

## Notas de seguridad

1. **El frontend es solo UI** — Los permisos en el array son para mostrar/ocultar botones. La API valida en cada request.
2. **Permisos frescos** — Si un admin cambia los permisos de un usuario, el cambio se refleja en la próxima request autenticada.
3. **No expongas permisos en URLs** — Usa el array de permisos para lógica de UI, nunca como parámetro de URL.
4. **Token válido 24h** — El JWT dura 24 horas. Los permisos se recargan desde BD en cada request.
