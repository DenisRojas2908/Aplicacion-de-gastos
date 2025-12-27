const pool = require('../config/database');

class Ingreso {
  static async crear({ usuarioId, monto, descripcion, fecha }) {
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth() + 1;
    const anio = fechaObj.getFullYear();

    const query = `
      INSERT INTO ingresos (usuario_id, monto, descripcion, fecha, mes, anio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [usuarioId, monto, descripcion, fecha, mes, anio];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async obtenerPorUsuario(usuarioId, filtros = {}) {
    let query = `
      SELECT * FROM ingresos
      WHERE usuario_id = $1
    `;
    const values = [usuarioId];
    let paramIndex = 1;

    if (filtros.mes && filtros.anio) {
      paramIndex++;
      query += ` AND mes = $${paramIndex}`;
      values.push(filtros.mes);
      paramIndex++;
      query += ` AND anio = $${paramIndex}`;
      values.push(filtros.anio);
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      paramIndex++;
      query += ` AND fecha >= $${paramIndex}`;
      values.push(filtros.fechaInicio);
      paramIndex++;
      query += ` AND fecha <= $${paramIndex}`;
      values.push(filtros.fechaFin);
    }

    query += ' ORDER BY fecha DESC, created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async obtenerPorId(id, usuarioId) {
    const query = 'SELECT * FROM ingresos WHERE id = $1 AND usuario_id = $2';
    const result = await pool.query(query, [id, usuarioId]);
    return result.rows[0];
  }

  static async actualizar(id, usuarioId, datos) {
    const campos = [];
    const values = [];
    let paramIndex = 0;

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
    const query = `UPDATE ingresos SET ${campos.join(', ')} WHERE id = $${paramIndex - 1} AND usuario_id = $${paramIndex} RETURNING *`;
    values.push(id, usuarioId);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async eliminar(id, usuarioId) {
    const query = 'DELETE FROM ingresos WHERE id = $1 AND usuario_id = $2 RETURNING id';
    const result = await pool.query(query, [id, usuarioId]);
    return result.rows[0];
  }

  // AGREGADO: Para que coincida con lo que llama la ruta del dashboard
  static async obtenerTotal(usuarioId, mes, anio) {
    const query = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM ingresos
      WHERE usuario_id = $1 AND mes = $2 AND anio = $3
    `;
    const result = await pool.query(query, [usuarioId, mes, anio]);
    return result.rows[0].total || 0;
  }

  // AGREGADO: Para calcular el balance histórico
  static async obtenerTotalHistorico(usuarioId) {
    const query = `SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE usuario_id = $1`;
    const result = await pool.query(query, [usuarioId]);
    return result.rows[0].total || 0;
  }
}

module.exports = Ingreso;