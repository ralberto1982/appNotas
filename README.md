# AppNotas

Aplicación web para gestionar notas personales con editor de texto enriquecido, categorías y exportación a PDF. Stack completo con backend Node.js + SQLite y frontend React + Vite.

---

## Características

- Registro e inicio de sesión con autenticación JWT
- Crear, editar y eliminar notas con editor enriquecido (TipTap)
- Organizar notas por categorías con colores personalizados
- Búsqueda por título y contenido
- Exportación de notas a PDF
- Gradientes y colores de fondo personalizables por nota
- Datos almacenados localmente en SQLite (sin servicios externos)

---

## Tecnologías

### Backend
| Paquete | Uso |
|---|---|
| Express | Servidor HTTP y rutas |
| node-sqlite3-wasm | Base de datos SQLite |
| jsonwebtoken | Autenticación JWT |
| bcryptjs | Hash de contraseñas |
| dotenv | Variables de entorno |

### Frontend
| Paquete | Uso |
|---|---|
| React 18 | UI |
| Vite | Bundler y servidor de desarrollo |
| TipTap | Editor de texto enriquecido |
| Axios | Cliente HTTP |
| React Router v6 | Navegación |
| Tailwind CSS | Estilos |
| html2pdf.js | Exportación a PDF |
| lucide-react | Iconos |

---

## Estructura del proyecto

```
appnotas/
├── package.json              # Script raíz para arrancar todo junto
├── backend/
│   ├── .env                  # Variables de entorno (no subir a git)
│   ├── server.js             # Punto de entrada del servidor
│   ├── database.js           # Conexión SQLite y creación de tablas
│   ├── middleware/
│   │   └── auth.js           # Middleware de verificación JWT
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/register, /api/auth/login
│   │   ├── categories.js     # CRUD /api/categories
│   │   └── notes.js          # CRUD /api/notes
│   └── package.json
└── frontend/
    ├── vite.config.js        # Proxy /api → localhost:3001
    ├── src/
    │   ├── api/client.js     # Axios con interceptor JWT
    │   ├── components/       # Componentes React
    │   └── ...
    └── package.json
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/appnotas.git
cd appnotas
```

### 2. Instalar dependencias

```bash
npm run install:all
```

Esto instala las dependencias del backend y del frontend en un solo comando.

### 3. Configurar variables de entorno

Crea el archivo `backend/.env`:

```env
PORT=3001
JWT_SECRET=cambia_esto_por_una_clave_secreta_segura
```

> El archivo `notas.db` se crea automáticamente al arrancar el backend por primera vez.

---

## Ejecución

### Arrancar todo con un solo comando

Desde la carpeta raíz del proyecto:

```bash
npm start
```

Esto inicia el backend y el frontend en paralelo. Verás la salida de ambos en la misma terminal con colores distintos.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |

### Arrancar por separado (opcional)

```bash
# Backend
cd backend
npm start          # producción
npm run dev        # desarrollo con recarga automática (nodemon)

# Frontend
cd frontend
npm run dev        # desarrollo
npm run build      # compilar para producción
npm run preview    # previsualizar build de producción
```

---

## API

Todas las rutas excepto `/register` y `/login` requieren el header:
```
Authorization: Bearer <token>
```

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Notas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/notes` | Listar notas (soporta `?search=` y `?category=`) |
| GET | `/api/notes/:id` | Obtener nota por ID |
| POST | `/api/notes` | Crear nota |
| PUT | `/api/notes/:id` | Actualizar nota |
| DELETE | `/api/notes/:id` | Eliminar nota |

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categories` | Listar categorías del usuario |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/:id` | Actualizar categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del backend | `3001` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | — |

---

## .gitignore recomendado

Asegúrate de que tu `.gitignore` incluya:

```
node_modules/
backend/.env
backend/notas.db
backend/notas.db.lock
frontend/dist/
```

---


