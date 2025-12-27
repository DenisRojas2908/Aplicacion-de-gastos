# Backend - Finanzas Personales

## Descripción
API RESTful para la aplicación de gestión de finanzas personales. Construida con Node.js, Express y PostgreSQL.

## Características
- 🔐 Autenticación JWT
- 📊 Gestión completa de gastos e ingresos
- 🏷️ Categorización de movimientos
- 💳 Múltiples métodos de pago
- 📈 Dashboard con estadísticas
- 🛡️ Seguridad y rate limiting
- 📱 API RESTful bien documentada

## Instalación

### Requisitos previos
- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd finanzas-personal/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   - Crear una base de datos en PostgreSQL:
     ```sql
     CREATE DATABASE finanzas_db;
     ```
   
   - Ejecutar el esquema SQL:
     ```bash
     psql -U tu_usuario -d finanzas_db -f database/schema.sql
     ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finanzas_db
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   PORT=3001
   JWT_SECRET=tu_secreto_jwt_muy_seguro
   FRONTEND_URL=http://localhost:3000
   ```

5. **Iniciar el servidor**
   ```bash
   # Modo desarrollo
   npm run dev
   
   # Modo producción
   npm start
   ```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── auth.js
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Gasto.js
│   │   ├── Ingreso.js
│   │   ├── Categoria.js
│   │   ├── MetodoPago.js
│   │   └── Dashboard.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── gastos.js
│   │   ├── ingresos.js
│   │   ├── categorias.js
│   │   ├── metodos-pago.js
│   │   └── dashboard.js
│   └── index.js
├── database/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/perfil` - Obtener perfil del usuario

### Gastos
- `GET /api/gastos` - Listar todos los gastos
- `POST /api/gastos` - Crear nuevo gasto
- `GET /api/gastos/:id` - Obtener gasto específico
- `PUT /api/gastos/:id` - Actualizar gasto
- `DELETE /api/gastos/:id` - Eliminar gasto
- `GET /api/gastos/estadisticas/categorias` - Totales por categoría
- `GET /api/gastos/estadisticas/metodos-pago` - Totales por método de pago

### Ingresos
- `GET /api/ingresos` - Listar todos los ingresos
- `POST /api/ingresos` - Crear nuevo ingreso
- `GET /api/ingresos/:id` - Obtener ingreso específico
- `PUT /api/ingresos/:id` - Actualizar ingreso
- `DELETE /api/ingresos/:id` - Eliminar ingreso

### Categorías
- `GET /api/categorias` - Listar todas las categorías
- `GET /api/categorias/tipo/:tipo` - Categorías por tipo

### Métodos de Pago
- `GET /api/metodos-pago` - Listar métodos de pago

### Dashboard
- `GET /api/dashboard/mensual` - Resumen mensual
- `GET /api/dashboard/anual` - Resumen anual
- `GET /api/dashboard/estadisticas` - Estadísticas generales

## Modelos de Datos

### Usuario
```javascript
{
  id: number,
  nombre: string,
  email: string,
  created_at: timestamp
}
```

### Gasto
```javascript
{
  id: number,
  usuario_id: number,
  categoria_id: number,
  metodo_pago_id: number,
  monto: decimal,
  descripcion: string,
  fecha: date,
  mes: number,
  anio: number,
  created_at: timestamp
}
```

### Ingreso
```javascript
{
  id: number,
  usuario_id: number,
  monto: decimal,
  descripcion: string,
  fecha: date,
  mes: number,
  anio: number,
  created_at: timestamp
}
```

## Scripts de Base de Datos

El archivo `database/schema.sql` contiene:
- Esquema completo de tablas
- Datos iniciales de categorías
- Métodos de pago predefinidos
- Vistas útiles para reportes
- Funciones y triggers

## Seguridad

- Autenticación JWT
- Hashing de contraseñas con bcrypt
- Rate limiting (100 requests/15 minutos)
- Helmet.js para headers de seguridad
- Validación de entrada con express-validator
- CORS configurado

## Desarrollo

### Scripts disponibles
- `npm run dev` - Inicia servidor con nodemon
- `npm start` - Inicia servidor para producción

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| DB_HOST | Host de PostgreSQL | localhost |
| DB_PORT | Puerto de PostgreSQL | 5432 |
| DB_NAME | Nombre de la base de datos | finanzas_db |
| DB_USER | Usuario de PostgreSQL | - |
| DB_PASSWORD | Contraseña de PostgreSQL | - |
| PORT | Puerto del servidor | 3001 |
| JWT_SECRET | Secreto para JWT | - |
| FRONTEND_URL | URL del frontend | http://localhost:3000 |

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC.