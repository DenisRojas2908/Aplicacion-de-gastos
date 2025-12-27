const pool = require('../config/database');

class Dashboard {
  static async obtenerResumenMensual(usuarioId, mes, anio) {
    // Total de gastos del mes
    const gastosQuery = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos
      WHERE usuario_id = $1 AND mes = $2 AND anio = $3
    `;
    const gastosResult = await pool.query(gastosQuery, [usuarioId, mes, anio]);
    const totalGastos = parseFloat(gastosResult.rows[0].total);

    // Total de ingresos del mes
    const ingresosQuery = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM ingresos
      WHERE usuario_id = $1 AND mes = $2 AND anio = $3
    `;
    const ingresosResult = await pool.query(ingresosQuery, [usuarioId, mes, anio]);
    const totalIngresos = parseFloat(ingresosResult.rows[0].total);

    // Balance actual (todos los meses)
    const balanceQuery = `
      SELECT 
        (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1) -
        (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1) as balance
    `;
    const balanceResult = await pool.query(balanceQuery, [usuarioId]);
    const balanceActual = parseFloat(balanceResult.rows[0].balance);

    // Gastos por categoría
    const categoriasQuery = `
      SELECT c.nombre, c.icono, c.color, COALESCE(SUM(g.monto), 0) as total
      FROM categorias c
      LEFT JOIN gastos g ON c.id = g.categoria_id AND g.usuario_id = $1 AND g.mes = $2 AND g.anio = $3
      WHERE c.tipo = 'gasto'
      GROUP BY c.id, c.nombre, c.icono, c.color
      ORDER BY total DESC NULLS LAST
    `;
    const categoriasResult = await pool.query(categoriasQuery, [usuarioId, mes, anio]);

    // Últimos 5 gastos
    const ultimosGastosQuery = `
      SELECT g.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = $1
      ORDER BY g.fecha DESC, g.created_at DESC
      LIMIT 5
    `;
    const ultimosGastosResult = await pool.query(ultimosGastosQuery, [usuarioId]);

    return {
      totalGastos,
      totalIngresos,
      balanceActual,
      balanceMes: totalIngresos - totalGastos,
      gastosPorCategoria: categoriasResult.rows,
      ultimosGastos: ultimosGastosResult.rows
    };
  }

  static async obtenerResumenAnual(usuarioId, anio) {
    // Resumen por mes
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
    const mesesResult = await pool.query(mesesQuery, [usuarioId, anio]);

    // Top categorías del año
    const topCategoriasQuery = `
      SELECT c.nombre, c.icono, c.color, SUM(g.monto) as total, COUNT(g.id) as cantidad
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = $1 AND g.anio = $2
      GROUP BY c.id, c.nombre, c.icono, c.color
      ORDER BY total DESC
      LIMIT 5
    `;
    const topCategoriasResult = await pool.query(topCategoriasQuery, [usuarioId, anio]);

    // Totales del año
    const totalesQuery = `
      SELECT 
        (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1 AND anio = $2) as total_ingresos,
        (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1 AND anio = $2) as total_gastos
    `;
    const totalesResult = await pool.query(totalesQuery, [usuarioId, anio]);

    return {
      resumenPorMes: mesesResult.rows,
      topCategorias: topCategoriasResult.rows,
      totalIngresosAnual: parseFloat(totalesResult.rows[0].total_ingresos),
      totalGastosAnual: parseFloat(totalesResult.rows[0].total_gastos),
      balanceAnual: parseFloat(totalesResult.rows[0].total_ingresos) - parseFloat(totalesResult.rows[0].total_gastos)
    };
  }

  static async obtenerEstadisticasGenerales(usuarioId) {
    // Promedio de gastos diarios
    const promedioQuery = `
      SELECT AVG(daily_total) as promedio_diario
      FROM (
        SELECT fecha, SUM(monto) as daily_total
        FROM gastos
        WHERE usuario_id = $1
        GROUP BY fecha
      ) AS daily_totals
    `;
    const promedioResult = await pool.query(promedioQuery, [usuarioId]);
    const promedioDiario = parseFloat(promedioResult.rows[0].promedio_diario) || 0;

    // Día con más gastos
    const maxDiaQuery = `
      SELECT fecha, SUM(monto) as total
      FROM gastos
      WHERE usuario_id = $1
      GROUP BY fecha
      ORDER BY total DESC
      LIMIT 1
    `;
    const maxDiaResult = await pool.query(maxDiaQuery, [usuarioId]);

    // Categoría más gastada
    const maxCategoriaQuery = `
      SELECT c.nombre, c.icono, SUM(g.monto) as total
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = $1
      GROUP BY c.id, c.nombre, c.icono
      ORDER BY total DESC
      LIMIT 1
    `;
    const maxCategoriaResult = await pool.query(maxCategoriaQuery, [usuarioId]);

    return {
      promedioGastoDiario: promedioDiario,
      diaMayorGasto: maxDiaResult.rows[0] || null,
      categoriaMayorGasto: maxCategoriaResult.rows[0] || null
    };
  }
}

module.exports = Dashboard;