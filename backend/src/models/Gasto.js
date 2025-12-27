const pool = require('../config/database');

class Gasto {
  static async crear({ usuarioId, categoriaId, metodoPagoId, monto, descripcion, fecha }) {
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth() + 1;
    const anio = fechaObj.getFullYear();

    const query = `
      INSERT INTO gastos (usuario_id, categoria_id, metodo_pago_id, monto, descripcion, fecha, mes, anio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [usuarioId, categoriaId, metodoPagoId, monto, descripcion, fecha, mes, anio];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async obtenerPorUsuario(usuarioId, filtros = {}) {
    let query = `
      SELECT g.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color,
             mp.nombre as metodo_pago_nombre, mp.icono as metodo_pago_icono
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      JOIN metodos_pago mp ON g.metodo_pago_id = mp.id
      WHERE g.usuario_id = $1
    `;
    const values = [usuarioId];
    let paramIndex = 1;

    if (filtros.mes && filtros.anio) {
      paramIndex++;
      query += ` AND g.mes = $${paramIndex}`;
      values.push(filtros.mes);
      paramIndex++;
      query += ` AND g.anio = $${paramIndex}`;
      values.push(filtros.anio);
    }

    if (filtros.categoriaId) {
      paramIndex++;
      query += ` AND g.categoria_id = $${paramIndex}`;
      values.push(filtros.categoriaId);
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      paramIndex++;
      query += ` AND g.fecha >= $${paramIndex}`;
      values.push(filtros.fechaInicio);
      paramIndex++;
      query += ` AND g.fecha <= $${paramIndex}`;
      values.push(filtros.fechaFin);
    }

    query += ' ORDER BY g.fecha DESC, g.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async obtenerPorId(id, usuarioId) {
    const query = `
      SELECT g.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color,
             mp.nombre as metodo_pago_nombre, mp.icono as metodo_pago_icono
      FROM gastos g
      JOIN categorias c ON g.categoria_id = c.id
      JOIN metodos_pago mp ON g.metodo_pago_id = mp.id
      WHERE g.id = $1 AND g.usuario_id = $2
    `;
    const result = await pool.query(query, [id, usuarioId]);
    return result.rows[0];
  }

  static async actualizar(id, usuarioId, datos) {
    const campos = [];
    const values = [];
    let paramIndex = 0;

    if (datos.categoriaId !== undefined) {
      paramIndex++;
      campos.push(`categoria_id = $${paramIndex}`);
      values.push(datos.categoriaId);
    }

    if (datos.metodoPagoId !== undefined) {
      paramIndex++;
      campos.push(`metodo_pago_id = $${paramIndex}`);
      values.push(datos.metodoPagoId);
    }

    if (datos.monto !== undefined) {
      paramIndex++;
      campos.push(`monto = $${paramIndex}`);
      values.push(datos.monto);
    }

    if (datos.descripcion !== undefined) {
      paramIndex++;
      campos.push(`descripcion = $${paramIndex}`);
      values.push(datos.descripcion);
    }

    if (datos.fecha !== undefined) {
      paramIndex++;
      campos.push(`fecha = $${paramIndex}`);
      values.push(datos.fecha);
      
      const fechaObj = new Date(datos.fecha);
      paramIndex++;
      campos.push(`mes = $${paramIndex}`);
      values.push(fechaObj.getMonth() + 1);
      
      paramIndex++;
      campos.push(`anio = $${paramIndex}`);
      values.push(fechaObj.getFullYear());
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    paramIndex++;
    campos.push(`updated_at = CURRENT_TIMESTAMP`);
    
    paramIndex++;
    const query = `UPDATE gastos SET ${campos.join(', ')} WHERE id = $${paramIndex - 1} AND usuario_id = $${paramIndex} RETURNING *`;
    values.push(id, usuarioId);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async eliminar(id, usuarioId) {
    const query = 'DELETE FROM gastos WHERE id = $1 AND usuario_id = $2 RETURNING id';
    const result = await pool.query(query, [id, usuarioId]);
    return result.rows[0];
  }

  // CORREGIDO: Ahora devuelve los nombres de columnas que el Frontend espera
  static async obtenerTotalesPorCategoria(usuarioId, mes, anio) {
    const query = `
      SELECT c.id, 
             c.nombre as categoria_nombre, 
             c.icono as categoria_icono, 
             c.color as categoria_color, 
             SUM(g.monto) as total, 
             COUNT(g.id) as cantidad
      FROM categorias c
      LEFT JOIN gastos g ON c.id = g.categoria_id AND g.usuario_id = $1 AND g.mes = $2 AND g.anio = $3
      WHERE c.tipo = 'gasto'
      GROUP BY c.id, c.nombre, c.icono, c.color
      ORDER BY total DESC NULLS LAST
    `;
    const result = await pool.query(query, [usuarioId, mes, anio]);
    return result.rows;
  }

  static async obtenerTotalesPorMetodoPago(usuarioId, mes, anio) {
    const query = `
      SELECT mp.id, mp.nombre, mp.icono, SUM(g.monto) as total, COUNT(g.id) as cantidad
      FROM metodos_pago mp
      LEFT JOIN gastos g ON mp.id = g.metodo_pago_id AND g.usuario_id = $1 AND g.mes = $2 AND g.anio = $3
      WHERE mp.activo = TRUE
      GROUP BY mp.id, mp.nombre, mp.icono
      ORDER BY total DESC NULLS LAST
    `;
    const result = await pool.query(query, [usuarioId, mes, anio]);
    return result.rows;
  }
}

module.exports = Gasto;