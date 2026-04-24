# CCAP Admin Panel

Panel de Administración para la plataforma de cursos y certificaciones de CCAP. Este proyecto está construido con Next.js (App Router), proporcionando una interfaz moderna, rápida y segura para la gestión integral de la plataforma educativa.

## 🚀 Tecnologías Principales

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes UI:** shadcn/ui & Radix UI
- **Estado Global:** Zustand & React Query (@tanstack/react-query)
- **Formularios & Validación:** React Hook Form + Zod
- **Autenticación:** NextAuth.js
- **Gestión de Tablas:** TanStack Table v8

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura orientada a características (Feature-Sliced Design simplificado) dentro del directorio `src/`.

```text
src/
├── app/                  # Rutas de la aplicación (Next.js App Router)
│   ├── (auth)/           # Rutas de autenticación (Login)
│   ├── (dashboard)/      # Rutas protegidas del panel (Cursos, Usuarios, etc.)
│   ├── api/              # Rutas de API internas (ej. NextAuth)
│   └── certificates/     # Rutas públicas (Verificación de certificados)
├── components/           # Componentes UI compartidos
│   ├── forms/            # Formularios reutilizables
│   ├── providers/        # Proveedores de contexto (Query, Theme, Session)
│   ├── shared/           # Componentes comunes (Navbar, Sidebar, Modales)
│   └── tables/           # Componentes de tablas de datos
├── features/             # Módulos de dominio (Agrupados por contexto)
│   ├── auth/             # Autenticación
│   ├── categories/       # Gestión de Categorías
│   ├── certificates/     # Gestión y Emisión de Certificados
│   ├── courses/          # Gestión de Cursos
│   ├── enrollments/      # Matrículas
│   ├── files/            # Gestión de Archivos (Drive)
│   ├── lessons/          # Lecciones de Cursos
│   ├── modules/          # Módulos de Cursos
│   ├── notifications/    # Sistema de Notificaciones
│   ├── resources/        # Recursos Educativos
│   ├── roles/            # Roles del Sistema
│   └── users/            # Gestión de Usuarios
├── hooks/                # Custom hooks globales
├── lib/                  # Utilidades y configuración de librerías (API client, utilidades)
├── store/                # Manejo de estado global (Zustand)
└── types/                # Definiciones de tipos TypeScript globales
```

## 🛠️ Requisitos Previos

- Node.js (v18.x o superior)
- npm, yarn o pnpm

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y configura las siguientes variables según el entorno:

```env
# URL Base de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL de la API de Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Configuración de NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_seguro_generado_aqui
```

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/brayan7897/ccap-admin.git
   cd ccap-admin
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

4. **Construcción para Producción:**
   ```bash
   npm run build
   npm run start
   ```

## 📚 Documentación Adicional

En la carpeta `docs/` encontrarás documentación técnica detallada sobre diversos módulos del sistema:

- [Rutas de la API (`docs/api_routes.md`)](./docs/api_routes.md)
- [Gestión de Certificados (`docs/certificates.md`)](./docs/certificates.md)
- [Estructura de Almacenamiento en Drive (`docs/drive_storage_structure.md`)](./docs/drive_storage_structure.md)
- [Recursos de Lecciones (`docs/lesson_resources.md`)](./docs/lesson_resources.md)
- [Sistema de Notificaciones (`docs/notifications.md`)](./docs/notifications.md)
- [Sistema de Permisos (`docs/permissions.md`)](./docs/permissions.md)
- [Tipos de Cursos y Accesos (`docs/user_access_and_course_types.md`)](./docs/user_access_and_course_types.md)

## 🤝 Contribución

1. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
2. Haz commit de tus cambios (`git commit -m 'feat: Agrega NuevaCaracteristica'`)
3. Sube tus cambios a la rama (`git push origin feature/NuevaCaracteristica`)
4. Abre un Pull Request
