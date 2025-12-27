# Finanzas Personales - Aplicación Web

Aplicación completa de gestión de finanzas personales con backend en Node.js/Express y frontend en React. Diseñada con colores cálidos y enfoque en la visualización de números para facilitar el control de gastos e ingresos.

## 🌟 Características Principales

### Backend (Node.js + Express + PostgreSQL)
- ✅ API RESTful completa con autenticación JWT
- ✅ Base de datos PostgreSQL con esquema optimizado
- ✅ Categorías de gastos predefinidas (Comida, Transporte, Entretenimiento, etc.)
- ✅ Múltiples métodos de pago (Efectivo, Yape, Tarjeta BCP, Plin, etc.)
- ✅ Dashboard con estadísticas mensuales y anuales
- ✅ Seguridad con rate limiting, helmet y validación de datos
- ✅ Exportación de datos para trazabilidad

### Frontend (React + Tailwind CSS)
- ✅ Diseño responsive para desktop y móvil
- ✅ Colores cálidos (naranja #FF6B35, marrón #8D6E63)
- ✅ Dashboard con gráficos interactivos (Recharts)
- ✅ Gestión completa de gastos e ingresos
- ✅ Filtros por fecha, categoría y método de pago
- ✅ Autenticación de usuarios
- ✅ Notificaciones toast integradas

## 🎨 Diseño y UX

### Colores Principales
- **Naranja Primario**: #FF6B35 - Para acciones principales y highlights
- **Marrón Secundario**: #8D6E63 - Para elementos de apoyo
- **Verde Éxito**: #2E865F - Para ingresos y valores positivos
- **Rojo Suave**: #E57373 - Para gastos y alertas

### Tipografía
- **Inter**: Fuente principal para interfaz
- **JetBrains Mono**: Para números y monedas

### Características de Diseño
- Diseño minimalista sin clutter visual
- Enfoque en números grandes y destacados
- Cards con sombras suaves y efectos hover
- Bottom navigation para móvil
- Sidebar para desktop
- Gráficos interactivos con colores consistentes

## 🚀 Instalación Rápida

### Requisitos
- Node.js (v16+)
- PostgreSQL (v12+)
- npm o yarn

### 1. Backend

```bash
cd backend
npm install

# Configurar base de datos PostgreSQL
createdb finanzas_db
psql -U tu_usuario -d finanzas_db -f database/schema.sql

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor
npm run dev  # Modo desarrollo
npm start    # Modo producción
```

### 2. Frontend

```bash
cd frontend
npm install

# El proxy está configurado para http://localhost:3001
npm start  # Iniciar servidor de desarrollo
npm run build  # Construir para producción
```

## 📊 Estructura del Proyecto

```
finanzas-personal/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración (DB, Auth)
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas API
│   │   └── index.js        # Punto de entrada
│   ├── database/
│   │   └── schema.sql      # Esquema PostgreSQL
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos (Auth)
│   │   ├── pages/          # Páginas principales
│   │   ├── utils/          # Utilidades y formatters
│   │   └── index.js        # Punto de entrada
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
└── README.md
```

## 🔧 Configuración de Base de Datos

El archivo `backend/database/schema.sql` incluye:

### Tablas Principales
- **usuarios**: Información de usuarios con autenticación
- **categorias**: Categorías de gastos e ingresos con iconos y colores
- **metodos_pago**: Métodos de pago (Yape, Tarjeta BCP, etc.)
- **gastos**: Registro de gastos diarios
- **ingresos**: Registro de ingresos mensuales
- **presupuestos**: Presupuestos mensuales por categoría

### Datos Iniciales
- 12 categorías de gastos (Comida, Transporte, Entretenimiento, etc.)
- 6 métodos de pago (Efectivo, Yape, Tarjeta BCP, Plin, etc.)
- Vistas útiles para reportes
- Funciones y triggers para automatización

## 📱 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/perfil` - Obtener perfil

### Gastos
- `GET /api/gastos` - Listar gastos (con filtros)
- `POST /api/gastos` - Crear gasto
- `PUT /api/gastos/:id` - Actualizar gasto
- `DELETE /api/gastos/:id` - Eliminar gasto

### Ingresos
- `GET /api/ingresos` - Listar ingresos
- `POST /api/ingresos` - Crear ingreso
- `PUT /api/ingresos/:id` - Actualizar ingreso
- `DELETE /api/ingresos/:id` - Eliminar ingreso

### Dashboard y Reportes
- `GET /api/dashboard/mensual` - Resumen mensual
- `GET /api/dashboard/anual` - Resumen anual
- `GET /api/dashboard/estadisticas` - Estadísticas generales

## 🎯 Funcionalidades Principales

### Dashboard
- ✅ Balance actual y mensual
- ✅ Gráficos de barras comparativos
- ✅ Gráfico de pastel por categorías
- ✅ Últimos movimientos
- ✅ Acciones rápidas

### Gestión de Gastos
- ✅ Registro por categorías
- ✅ Método de pago (Yape, Tarjeta BCP, etc.)
- ✅ Descripción y fecha
- ✅ Filtros por mes/año/categoría
- ✅ Edición y eliminación

### Reportes
- ✅ Análisis mensual detallado
- ✅ Evolución anual con gráficos de línea
- ✅ Top categorías de gasto
- ✅ Estadísticas generales
- ✅ Promedio de gasto diario

### Trazabilidad
- ✅ Registro completo de transacciones
- ✅ Filtros avanzados
- ✅ Exportación de datos (preparado para implementar)
- ✅ Historial por método de pago

## 🛡️ Seguridad

- Autenticación JWT con tokens seguros
- Hashing de contraseñas con bcrypt
- Rate limiting (100 requests/15 minutos)
- Helmet.js para headers de seguridad
- CORS configurado
- Validación de entrada con express-validator

## 📊 Tecnologías Utilizadas

### Backend
- Node.js + Express
- PostgreSQL con pg
- JWT para autenticación
- bcrypt para hashing
- express-validator para validación
- Helmet para seguridad
- Morgan para logging

### Frontend
- React 18
- Tailwind CSS
- React Router v6
- Axios para peticiones HTTP
- Recharts para gráficos
- React Hot Toast para notificaciones
- Heroicons para iconos

## 🎨 Personalización

### Agregar nuevas categorías
```sql
INSERT INTO categorias (nombre, descripcion, icono, color, tipo)
VALUES ('Viajes', 'Gastos en viajes y vacaciones', '✈️', '#FF6B35', 'gasto');
```

### Modificar colores
Editar `frontend/tailwind.config.js` y `frontend/src/index.css`

### Agregar métodos de pago
```sql
INSERT INTO metodos_pago (nombre, descripcion, icono)
VALUES ('Transferencia', 'Transferencia bancaria', '🏦');
```

## 🚀 Despliegue

### Backend
1. Configurar variables de entorno en producción
2. Usar PM2 para mantener el servidor activo
3. Configurar PostgreSQL en producción
4. Usar nginx como reverse proxy

### Frontend
1. Construir con `npm run build`
2. Servir archivos estáticos con nginx
3. Configurar rutas del API

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📞 Soporte

Para preguntas o soporte, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para estudiantes de Ingeniería de Sistemas**

*Aplicación diseñada siguiendo principios de UX/UI con enfoque en usabilidad y claridad visual.*