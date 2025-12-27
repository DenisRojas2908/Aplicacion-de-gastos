const pool = require('../config/database');

class Categoria {
  static async obtenerTodas() {
    const query = 'SELECT * FROM categorias ORDER BY nombre';
    const result = await pool.query(query);
    return result.rows;
  }

  static async obtenerPorTipo(tipo) {
    const query = 'SELECT * FROM categorias WHERE tipo = $1 ORDER BY nombre';
    const result = await pool.query(query, [tipo]);
    return result.rows;
  }

  static async obtenerPorId(id) {
    const query = 'SELECT * FROM categorias WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async crear({ nombre, descripcion, icono, color, tipo }) {
    const query = `
      INSERT INTO categorias (nombre, descripcion, icono, color, tipo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [nombre, descripcion, icono, color, tipo];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Categoria;