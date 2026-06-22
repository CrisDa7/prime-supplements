# Prime Supplements v2.0 — Guía de Despliegue

## Requisitos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com) (gratuita)

---

## 1. Configurar la Base de Datos (Supabase)

1. Crea un proyecto en Supabase (https://supabase.com)
2. Ve a **Project Settings > Database > Connection string** y copia la URI de conexión
3. Ve al **SQL Editor** de Supabase, pega el contenido de `backend/src/migrations/001_init.sql` y ejecútalo
4. Ve a **Project Settings > API** y copia la URL del proyecto y la `anon public key` (las necesitarás para el frontend si despliegas por separado)

## 2. Configurar el Backend

```bash
cd backend
cp .env.example .env
```

Edita `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
JWT_SECRET=genera-un-string-largo-y-aleatorio-aqui
JWT_EXPIRES_IN=7d
PORT=3001
```

Instala dependencias y corre la migración:
```bash
cd backend
npm install
npm run migrate
```

## 3. Configurar el Frontend

```bash
cd frontend
npm install
```

Para desarrollo local, el proxy de Vite redirige `/api` al backend en `localhost:3001`.
No necesita configuración extra.

## 4. Ejecutar en Desarrollo

Desde la raíz del proyecto:
```bash
npm run install:all    # Instalar dependencias de raíz, backend y frontend
npm run dev            # Inicia backend (puerto 3001) y frontend (puerto 5173) concurrentemente
```

O por separado:
```bash
cd backend && npm run dev   # Backend en http://localhost:3001
cd frontend && npm run dev  # Frontend en http://localhost:5173
```

## 5. Desplegar a Producción

### Opción A: Backend en Railway / Render / Fly.io

1. Sube la carpeta `backend/` a un servicio como Railway, Render o Fly.io
2. Configura las variables de entorno (`DATABASE_URL`, `JWT_SECRET`, `PORT`)
3. El comando de inicio es: `npm start`

### Opción B: Frontend en Vercel / Netlify

```bash
cd frontend
npm run build   # Genera carpeta dist/
```

- **Vercel**: Conecta el repo, configura:
  - Framework: Vite
  - Build command: `cd frontend && npm run build`
  - Output directory: `frontend/dist`
  - Environment variable: `VITE_API_URL=https://tu-backend.com/api`
- **Netlify**: Similar, apunta a `frontend/` y build command `npm run build`

### IMPORTANTE: API_URL en Producción

Si despliegas frontend y backend por separado, crea un archivo `.env` en `frontend/`:

```
VITE_API_URL=https://tu-api-en-produccion.com
```

Y modifica `frontend/src/api/client.js` para que use `import.meta.env.VITE_API_URL` como baseURL en lugar de `/api`.

## 6. Crear Usuario Admin

1. Abre la app en el navegador
2. Haz clic en "Regístrate"
3. Crea tu cuenta (email + contraseña)
4. ¡Listo! El primer usuario registrado será el administrador

---

## Estructura del Proyecto

```
prime-supplements/
├── backend/                # API Node.js + Express
│   ├── src/
│   │   ├── index.js        # Entry point
│   │   ├── db.js           # Conexión PostgreSQL
│   │   ├── routes/         # Rutas de la API
│   │   │   ├── auth.js
│   │   │   ├── productos.js
│   │   │   ├── ventas.js
│   │   │   ├── movimientos.js
│   │   │   └── stock.js
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT middleware
│   │   └── migrations/
│   │       └── 001_init.sql
│   ├── .env.example
│   └── package.json
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── pages/          # Páginas (Dashboard, Productos, etc.)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── api/            # Cliente Axios
│   │   └── lib/            # Utilidades
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── DEPLOY.md
└── package.json            # Scripts raíz
```
