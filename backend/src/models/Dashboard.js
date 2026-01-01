const pool = require('../config/database');

class Dashboard {
  static async obtenerResumenMensual(usuarioId, mes, anio) {
    // 1. Definir todas las consultas SQL
    const gastosQuery = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos
      WHERE usuario_id = $1 AND mes = $2 AND anio = $3
    `;

    const ingresosQuery = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM ingresos
      WHERE usuario_id = $1 AND mes = $2 AND anio = $3
    `;

    const balanceQuery = `
      SELECT 
        (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1) -
        (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1) as balance
    `;

    const categoriasQuery = `
      SELECT c.nombre, c.icono, c.color, COALESCE(SUM(g.monto), 0) as total
      FROM categorias c
      LEFT JOIN gastos g ON c.id = g.categoria_id AND g.usuario_id = $1 AND g.mes = $2 AND g.anio = $3
      WHERE c.tipo = 'gasto'
      GROUP BY c.id, c.nombre, c.icono, c.color
      ORDER BY total DESC NULLS LAST
    `;

    const ultimosGastosQuery = `
      SELECT g.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = $1
      ORDER BY g.fecha DESC, g.created_at DESC
      LIMIT 5
    `;

    // 2. EJECUCIÓN PARALELA (La magia de la velocidad ⚡)
    // Disparamos todas las promesas al mismo tiempo sin "await" individual
    try {
      const [
        gastosResult, 
        ingresosResult, 
        balanceResult, 
        categoriasResult, 
        ultimosGastosResult
      ] = await Promise.all([
        pool.query(gastosQuery, [usuarioId, mes, anio]),
        pool.query(ingresosQuery, [usuarioId, mes, anio]),
        pool.query(balanceQuery, [usuarioId]),
        pool.query(categoriasQuery, [usuarioId, mes, anio]),
        pool.query(ultimosGastosQuery, [usuarioId])
      ]);

      // 3. Procesar resultados
      const totalGastos = parseFloat(gastosResult.rows[0].total);
      const totalIngresos = parseFloat(ingresosResult.rows[0].total);
      const balanceActual = parseFloat(balanceResult.rows[0].balance || 0); // Agregué || 0 por seguridad

      return {
        totalGastos,
        totalIngresos,
        balanceActual,
        balanceMes: totalIngresos - totalGastos,
        gastosPorCategoria: categoriasResult.rows,
        ultimosGastos: ultimosGastosResult.rows
      };
    } catch (error) {
      throw error; // Dejar que el controlador maneje el error
    }
  }

  static async obtenerResumenAnual(usuarioId, anio) {
    // 1. Definir consultas
    const mesesQuery = `
      SELECT 
        mes,
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) as gastos
      FROM (
        SELECT mes, monto, 'gasto' as tipo FROM gastos WHERE usuario_id = $1 AND anio = $2
        UNION ALL
        SELECT mes, monto, 'ingreso' as tipo FROM ingresos WHERE usuario_id = $1 AND anio = $2
      ) AS datos
      GROUP BY mes
      ORDER BY mes
    `;

    const topCategoriasQuery = `
      SELECT c.nombre, c.icono, c.color, SUM(g.monto) as total, COUNT(g.id) as cantidad
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = $1 AND g.anio = $2
      GROUP BY c.id, c.nombre, c.icono, c.color
      ORDER BY total DESC
      LIMIT 5
    `;

    const totalesQuery = `
      SELECT 
        (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1 AND anio = $2) as total_ingresos,
        (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1 AND anio = $2) as total_gastos
    `;

    // 2. Ejecución Paralela ⚡
    try {
      const [mesesResult, topCategoriasResult, totalesResult] = await Promise.all([
        pool.query(mesesQuery, [usuarioId, anio]),
        pool.query(topCategoriasQuery, [usuarioId, anio]),
        pool.query(totalesQuery, [usuarioId, anio])
      ]);

      // 3. Procesar
      const totalIngresosAnual = parseFloat(totalesResult.rows[0].total_ingresos || 0);
      const totalGastosAnual = parseFloat(totalesResult.rows[0].total_gastos || 0);

      return {
        resumenPorMes: mesesResult.rows,
        topCategorias: topCategoriasResult.rows,
        totalIngresosAnual,
        totalGastosAnual,
        balanceAnual: totalIngresosAnual - totalGastosAnual
      };
    } catch (error) {
      throw error;
    }
  }

  static async obtenerEstadisticasGenerales(usuarioId) {
    // 1. Definir consultas
    const promedioQuery = `
      SELECT AVG(daily_total) as promedio_diario
      FROM (
        SELECT fecha, SUM(monto) as daily_total
        FROM gastos
        WHERE usuario_id = $1
        GROUP BY fecha
      ) AS daily_totals
    `;

    const maxDiaQuery = `
      SELECT fecha, SUM(monto) as total
      FROM gastos
      WHERE usuario_id = $1
      GROUP BY fecha
      ORDER BY total DESC
      LIMIT 1
    `;

    const maxCategoriaQuery = `
      SELECT c.nombre, c.icono, SUM(g.monto) as total
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = $1
      GROUP BY c.id, c.nombre, c.icono
      ORDER BY total DESC
      LIMIT 1
    `;

    // 2. Ejecución Paralela ⚡
    try {
      const [promedioResult, maxDiaResult, maxCategoriaResult] = await Promise.all([
        pool.query(promedioQuery, [usuarioId]),
        pool.query(maxDiaQuery, [usuarioId]),
        pool.query(maxCategoriaQuery, [usuarioId])
      ]);

      const promedioDiario = parseFloat(promedioResult.rows[0].promedio_diario) || 0;

      return {
        promedioGastoDiario: promedioDiario,
        diaMayorGasto: maxDiaResult.rows[0] || null,
        categoriaMayorGasto: maxCategoriaResult.rows[0] || null
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Dashboard;