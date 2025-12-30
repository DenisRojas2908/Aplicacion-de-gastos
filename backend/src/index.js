const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const gastosRoutes = require('./routes/gastos');
const ingresosRoutes = require('./routes/ingresos');
const categoriasRoutes = require('./routes/categorias');
const metodosPagoRoutes = require('./routes/metodos-pago');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// SOLUCIÓN AL ERROR ROJO (Trust Proxy)
// Esto es obligatorio cuando usas rate-limit detrás de un proxy (como Render)
app.set('trust proxy', 1);

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.'
});

// Middlewares
app.use(helmet());

// --- INICIO DE CONFIGURACIÓN CORS CORREGIDA ---
// Lista blanca de orígenes permitidos
const allowedOrigins = [
  process.env.FRONTEND_URL,                      // Tu variable de entorno (si existe)
  'https://finanzas-frontend-49li.onrender.com', // Tu Web en producción
  'http://localhost:3000',                       // Desarrollo local
  'capacitor://localhost',                       // App Android/iOS (Capacitor)
  'http://localhost',                            // Webview Android estándar
  'http://localhost:3001'                        // Por si acaso te llamas a ti mismo
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Apps móviles nativas o Postman)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista blanca
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      // Opcional: Para desarrollo, puedes descomentar la siguiente línea para ver quién está fallando
      // console.log('Origen bloqueado por CORS:', origin);
      
      // Si quieres ser estricto, devuelve error. 
      // Si quieres que funcione SÍ o SÍ, cambia el error por 'return callback(null, true);'
      return callback(new Error('No permitido por CORS (Origen: ' + origin + ')'));
    }
  },
  credentials: true
}));
// --- FIN DE CONFIGURACIÓN CORS ---

app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API de Finanzas Personales funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;