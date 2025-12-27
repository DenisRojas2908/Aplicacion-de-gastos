const pool = require('../config/database');

class MetodoPago {
  static async obtenerTodos() {
    const query = 'SELECT * FROM metodos_pago WHERE activo = TRUE ORDER BY nombre';
    const result = await pool.query(query);
    return result.rows;
  }

  static async obtenerPorId(id) {
    const query = 'SELECT * FROM metodos_pago WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async crear({ nombre, descripcion, icono }) {
    const query = `
      INSERT INTO metodos_pago (nombre, descripcion, icono)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [nombre, descripcion, icono];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = MetodoPago;