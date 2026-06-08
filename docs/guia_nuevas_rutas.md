# Guía de Uso: Nuevas Rutas de Información del Sitio (Site API)

Esta guía detalla cómo interactuar con las nuevas rutas públicas y administrativas del sitio de CCAP. La base del API se encuentra por defecto en:
`http://localhost:8000/api/v1`

---

## 1. Rutas Públicas (Uso para el Front-End / Sin Autenticación)

Estas rutas son de acceso público, no requieren cabeceras de autorización y están diseñadas para alimentar la página de inicio (Landing Page) y el pie de página (Footer).

### A. Información de la Empresa (Company Info)
Obtiene los datos de contacto y redes sociales de la institución.

* **Método y Ruta:** `GET /public/company-info`
* **Código de Respuesta Exitoso:** `200 OK`
* **Ejemplo de Respuesta:**
  ```json
  {
    "id": "e1b2c3d4-0001-4000-8000-000000000001",
    "phone_number": "+51 1 234-5678",
    "email": "contacto@ccap.edu.pe",
    "address": "Av. Universitaria 1234, Lima, Perú",
    "facebook_url": "https://facebook.com/ccapedupe",
    "instagram_url": "https://instagram.com/ccapedupe",
    "twitter_url": "https://x.com/ccapedupe",
    "youtube_url": "https://youtube.com/@ccapedupe",
    "linkedin_url": "https://linkedin.com/company/ccapedupe",
    "tiktok_url": "https://tiktok.com/@ccapedupe",
    "website_url": "https://www.ccap.edu.pe",
    "updated_at": "2026-06-04T05:45:00.000000"
  }
  ```

### B. Profesores Destacados (Featured Professors)
Retorna la lista de profesores seleccionados para aparecer en la landing page. Retorna un máximo de **3 profesores**. Solo expone el nombre, especialización y URL de la imagen para proteger datos personales.

* **Método y Ruta:** `GET /public/featured-professors`
* **Código de Respuesta Exitoso:** `200 OK`
* **Ejemplo de Respuesta:**
  ```json
  [
    {
      "name": "María García López",
      "specialization": "Desarrollo Web & Python",
      "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
    },
    {
      "name": "Juan Pérez Quispe",
      "specialization": "Diseño UX/UI & Experiencia Digital",
      "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      "name": "Roberto Silva Campos",
      "specialization": "Bases de Datos & Cloud DevOps",
      "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    }
  ]
  ```

### C. Testimonios Públicos (Testimonials)
Retorna los testimonios que el administrador ha marcado como "destacados" (`is_featured: true`). Retorna un máximo de **5 testimonios** ordenados por fecha de creación (los más recientes primero).

* **Método y Ruta:** `GET /public/testimonials`
* **Código de Respuesta Exitoso:** `200 OK`
* **Ejemplo de Respuesta:**
  ```json
  [
    {
      "user_name": "Ana Torres Mendoza",
      "text": "Los cursos de CCAP me ayudaron a dar el salto en mi carrera. La calidad de los instructores y el contenido práctico son excepcionales. ¡Totalmente recomendado!",
      "rating": 5,
      "user_image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
    },
    {
      "user_name": "Luis Ramírez Huamán",
      "text": "Aprendí Python desde cero y ahora trabajo como desarrollador junior. La metodología paso a paso hizo toda la diferencia.",
      "rating": 5,
      "user_image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face"
    }
  ]
  ```

### D. Imagen en Categorías (Categories)
Las categorías ahora incluyen el campo `image_url` en su respuesta para mostrar ilustraciones o fotos de la temática de la categoría.

* **Método y Ruta:** `GET /categories/`
* **Código de Respuesta Exitoso:** `200 OK`
* **Ejemplo de un Elemento en la Respuesta:**
  ```json
  {
    "id": "b1b2c3d4-0001-4000-8000-000000000001",
    "name": "Programación",
    "slug": "programacion",
    "description": "Cursos de desarrollo de software, algoritmos y lenguajes de programación.",
    "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
    "created_at": "2026-06-04T05:45:00.000000"
  }
  ```

---

## 2. Autenticación de Administrador

Para consumir las rutas de administración detalladas a continuación, debes incluir un **Bearer Token** en las cabeceras HTTP:

`Authorization: Bearer <TU_JWT_TOKEN>`

### Obtención del Token
* **Método y Ruta:** `POST /auth/login` (JSON body)
* **Cuerpo de la Solicitud:**
  ```json
  {
    "email": "admin@ccap.edu.pe",
    "password": "Admin@12345"
  }
  ```
* **Respuesta:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

---

## 3. Rutas de Administrador (Gestión del Sitio)

Todas las rutas bajo este bloque requieren autenticación y privilegios de administrador.

### A. Gestión de Información de la Empresa
Permite consultar la ficha completa y actualizarla (operación tipo *upsert*).

#### 1. Obtener datos completos
* **Método y Ruta:** `GET /site/company-info`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta:** `200 OK` (retorna el objeto JSON completo de la empresa).

#### 2. Crear o Actualizar datos
* **Método y Ruta:** `PUT /site/company-info`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Solicitud (todos los campos son opcionales):**
  ```json
  {
    "phone_number": "+51 987 654 321",
    "email": "nuevo_contacto@ccap.edu.pe",
    "address": "Calle Las Flores 456, San Isidro, Lima",
    "facebook_url": "https://facebook.com/ccapedupe",
    "instagram_url": "https://instagram.com/ccapedupe",
    "twitter_url": "https://x.com/ccapedupe",
    "youtube_url": null,
    "linkedin_url": null,
    "tiktok_url": null,
    "website_url": "https://www.ccap.edu.pe"
  }
  ```
* **Respuesta:** `200 OK` (retorna los datos actualizados).

---

### B. Gestión de Profesores Destacados
El administrador puede seleccionar qué profesores destacar en la landing page.

> [!IMPORTANT]
> **Regla de Negocio:** Solo se permite registrar un máximo de **3 profesores destacados**. Si intentas agregar un cuarto profesor, el servidor responderá con un error `400 Bad Request` indicando que debes eliminar uno existente primero.

#### 1. Listar todos los profesores destacados registrados
* **Método y Ruta:** `GET /site/featured-professors`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta:** `200 OK` (retorna la lista con los IDs internos de registro, IDs de usuario, nombres completos y orden de despliegue).
  ```json
  [
    {
      "id": "f1b2c3d4-0001-4000-8000-000000000001",
      "user_id": "c1b2c3d4-0001-4000-8000-000000000002",
      "name": "María García López",
      "specialization": "Desarrollo Web & Python",
      "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      "display_order": 1,
      "created_at": "2026-06-04T05:45:00.000000"
    }
  ]
  ```

#### 2. Registrar profesor como destacado
* **Método y Ruta:** `POST /site/featured-professors`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Solicitud:**
  ```json
  {
    "user_id": "c1b2c3d4-0001-4000-8000-000000000003",
    "specialization": "Diseño UX/UI Avanzado",
    "image_url": "https://url_de_la_imagen.jpg"
  }
  ```
  *(Nota: El backend asocia automáticamente el nombre real del usuario instructor registrado).*
* **Respuesta:** `201 Created`

#### 3. Eliminar profesor destacado (quitar de la lista)
* **Método y Ruta:** `DELETE /site/featured-professors/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta:** `204 No Content`

---

### C. Gestión de Testimonios
Permite añadir testimonios directamente, eliminarlos o decidir cuáles se muestran en la landing page pública (marcar como destacados).

#### 1. Listar todos los testimonios en el sistema
* **Método y Ruta:** `GET /site/testimonials`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta:** `200 OK` (incluye la propiedad `is_featured`).

#### 2. Crear un nuevo testimonio
* **Método y Ruta:** `POST /site/testimonials`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Solicitud:**
  ```json
  {
    "user_name": "Carlos Gomez",
    "text": "La plataforma de CCAP es muy intuitiva y rápida.",
    "rating": 5,
    "user_image_url": "https://url_de_la_foto.jpg"
  }
  ```
  *(Nota: `rating` es obligatorio y debe ser un número entero entre 1 y 5).*
* **Respuesta:** `201 Created`

#### 3. Eliminar un testimonio
* **Método y Ruta:** `DELETE /site/testimonials/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta:** `204 No Content`

#### 4. Cambiar estado de "Destacado" (Habilitar/Deshabilitar para la Landing)
El administrador puede cambiar el valor de `is_featured` para cada testimonio.

> [!IMPORTANT]
> **Regla de Negocio:** Solo se pueden destacar un máximo de **5 testimonios** a la vez. Si intentas destacar un sexto, el backend lanzará un error `400 Bad Request`. Deberás quitar la propiedad destacada a otro antes de asignar este nuevo.

* **Método y Ruta:** `PATCH /site/testimonials/{id}/featured`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Solicitud:**
  ```json
  {
    "featured": true
  }
  ```
  *(O `false` para quitarlo de destacados).*
* **Respuesta:** `200 OK` (retorna el objeto actualizado).
  ```json
  {
    "id": "a1b2c3d4-0001-4000-8000-000000000001",
    "user_name": "Carlos Gomez",
    "user_image_url": "https://url_de_la_foto.jpg",
    "text": "La plataforma de CCAP es muy intuitiva y rápida.",
    "rating": 5,
    "is_featured": true,
    "created_at": "2026-06-04T05:50:00.000000"
  }
  ```
