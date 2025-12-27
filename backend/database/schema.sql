-- ========================================
-- ESQUEMA DE BASE DE DATOS - FINANZAS PERSONALES
-- ========================================

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE CATEGORÍAS DE GASTOS
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    icono VARCHAR(50),
    color VARCHAR(7), -- Hex color (#FF6B35)
    tipo VARCHAR(10) DEFAULT 'gasto', -- 'gasto' o 'ingreso'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE MÉTODOS DE PAGO
CREATE TABLE IF NOT EXISTS metodos_pago (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE INGRESOS MENSUALES
CREATE TABLE IF NOT EXISTS ingresos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE GASTOS DIARIOS
CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id),
    metodo_pago_id INTEGER REFERENCES metodos_pago(id),
    monto DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    es_recurrente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE PRESUPUESTOS MENSUALES
CREATE TABLE IF NOT EXISTS presupuestos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id),
    monto_presupuestado DECIMAL(10,2) NOT NULL,
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INSERCIÓN DE DATOS INICIALES
-- ========================================

-- Categorías de gastos
INSERT INTO categorias (nombre, descripcion, icono, color, tipo) VALUES
('Comida', 'Gastos en alimentos y restaurantes', '🍽️', '#FF6B35', 'gasto'),
('Transporte', 'Gastos en movilidad', '🚗', '#4ECDC4', 'gasto'),
('Entretenimiento', 'Cine, streaming, eventos', '🎬', '#45B7D1', 'gasto'),
('Cuidado Personal', 'Productos de higiene y belleza', '💄', '#96CEB4', 'gasto'),
('Salud', 'Medicinas y consultas médicas', '🏥', '#FFEAA7', 'gasto'),
('Educación', 'Cursos, libros, materiales', '📚', '#DDA0DD', 'gasto'),
('Regalos', 'Regalos para familia y amigos', '🎁', '#FFB6C1', 'gasto'),
('Hoteles', 'Alojamientos y viajes', '🏨', '#98D8C8', 'gasto'),
('Otros', 'Gastos varios', '📦', '#B0BEC5', 'gasto'),
('Sueldo', 'Ingreso por trabajo', '💰', '#2E865F', 'ingreso'),
('Freelance', 'Ingresos adicionales', '💻', '#27AE60', 'ingreso'),
('Inversiones', 'Rendimientos de inversiones', '📈', '#16A085', 'ingreso');

-- Métodos de pago
INSERT INTO metodos_pago (nombre, descripcion, icono) VALUES
('Efectivo', 'Pago en efectivo', '💵'),
('Yape', 'Transferencia Yape', '📱'),
('Tarjeta BCP', 'Tarjeta de crédito/débito BCP', '💳'),
('Plin', 'Transferencia Plin', '🟢'),
('Tarjeta Interbank', 'Tarjeta de crédito/débito Interbank', '🔵'),
('Otro', 'Otro método de pago', '🔄');

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_mes_anio ON gastos(mes, anio);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_usuario ON ingresos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_mes_anio ON ingresos(mes, anio);

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de resumen mensual
CREATE OR REPLACE VIEW resumen_mensual AS
SELECT 
    g.usuario_id,
    g.mes,
    g.anio,
    COALESCE(SUM(g.monto), 0) as total_gastos,
    COALESCE(SUM(i.monto), 0) as total_ingresos,
    COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0) as balance
FROM (
    SELECT DISTINCT usuario_id, mes, anio FROM gastos
    UNION
    SELECT DISTINCT usuario_id, mes, anio FROM ingresos
) AS todos_meses
LEFT JOIN gastos g ON todos_meses.usuario_id = g.usuario_id AND todos_meses.mes = g.mes AND todos_meses.anio = g.anio
LEFT JOIN ingresos i ON todos_meses.usuario_id = i.usuario_id AND todos_meses.mes = i.mes AND todos_meses.anio = i.anio
GROUP BY g.usuario_id, g.mes, g.anio
ORDER BY g.anio DESC, g.mes DESC;

-- Vista de gastos por categoría
CREATE OR REPLACE VIEW gastos_por_categoria AS
SELECT 
    g.usuario_id,
    g.categoria_id,
    c.nombre as categoria_nombre,
    c.icono as categoria_icono,
    c.color as categoria_color,
    g.mes,
    g.anio,
    COUNT(g.id) as cantidad_gastos,
    SUM(g.monto) as total_gastos
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
GROUP BY g.usuario_id, g.categoria_id, c.nombre, c.icono, c.color, g.mes, g.anio;

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener el balance actual de un usuario
CREATE OR REPLACE FUNCTION obtener_balance_usuario(user_id INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_ingresos DECIMAL(10,2);
    total_gastos DECIMAL(10,2);
    balance DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(monto), 0) INTO total_ingresos FROM ingresos WHERE usuario_id = user_id;
    SELECT COALESCE(SUM(monto), 0) INTO total_gastos FROM gastos WHERE usuario_id = user_id;
    balance := total_ingresos - total_gastos;
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingresos_updated_at BEFORE UPDATE ON ingresos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();