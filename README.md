# Marmai Gym — Sistema de Gestión

Monorepo para gestión de gimnasio. Gestiona alumnos, profesores, disciplinas, horarios y pagos mensuales.

## Stack

- **Frontend**: Next.js 14, TailwindCSS, React Query
- **Backend**: NestJS, Prisma ORM, JWT Auth
- **Database**: PostgreSQL
- **Monorepo**: pnpm workspaces + Turborepo

## Estructura

```
marmai-gym/
├── apps/
│   ├── web/          # Next.js frontend (puerto 3000)
│   └── api/          # NestJS backend (puerto 3001)
├── packages/
│   └── shared/       # Tipos y DTOs compartidos
├── turbo.json
└── package.json
```

## Setup inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

**API** — copiar el ejemplo y completar los valores:
```bash
copy apps\api\.env.example apps\api\.env
```

`apps/api/.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/marmai_gym?schema=public"
JWT_SECRET="tu-clave-secreta-muy-segura"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Web** — copiar el ejemplo:
```bash
copy apps\web\.env.example apps\web\.env.local
```

`apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Configurar la base de datos PostgreSQL

> ⚠️ La API **no arranca** sin `DATABASE_URL` configurada y PostgreSQL corriendo.

```bash
# Aplicar migraciones (crea las tablas)
pnpm --filter @marmai/api db:migrate

# Cargar datos de prueba (opcional)
pnpm --filter @marmai/api db:seed
```

### 4. Ejecutar en desarrollo

```bash
# Levanta API + Frontend en paralelo
pnpm dev

# O por separado (útil si todavía no tenés la base de datos lista):
pnpm dev:web    # solo Next.js  → http://localhost:3000
pnpm dev:api    # solo NestJS   → http://localhost:3001
```

URLs disponibles:
- Frontend: http://localhost:3000
- API REST: http://localhost:3001/api
- Swagger docs: http://localhost:3001/api/docs

### Credenciales de prueba (seed)

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin@marmai.gym | admin123 | Admin |
| teacher@marmai.gym | teacher123 | Profesor |

## Comandos útiles

```bash
# Build de producción
pnpm build

# Prisma Studio (GUI de la base de datos)
pnpm --filter @marmai/api db:studio

# Generar cliente Prisma después de cambios al schema
pnpm --filter @marmai/api db:generate
```

## Funcionalidades

- **Alumnos**: Alta, baja, perfil con historial de pagos e inscripciones
- **Profesores**: Gestión con cuenta de acceso asociada
- **Disciplinas**: CRUD con color personalizado
- **Horarios**: Configuración por disciplina y día de la semana
- **Pagos**: Generación masiva mensual, registro individual, marcar como pagado
- **Dashboard**: Resumen del día con clases y pagos pendientes
- **Autenticación**: JWT con roles Admin y Profesor
