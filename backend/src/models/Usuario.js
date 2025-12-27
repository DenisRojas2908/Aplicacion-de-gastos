const pool = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../config/auth');

class Usuario {
  static async crear({ nombre, email, password }) {
    const passwordHash = await hashPassword(password);
    const query = `
      INSERT INTO usuarios (nombre, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, email, created_at
    `;
    const values = [nombre, email, passwordHash];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async encontrarPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async encontrarPorId(id) {
    const query = 'SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async login(email, password) {
    const usuario = await this.encontrarPorEmail(email);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const passwordValido = await comparePassword(password, usuario.password_hash);
    if (!passwordValido) {
      throw new Error('Contraseña incorrecta');
    }

    const token = generateToken({ 
      id: usuario.id, 
      email: usuario.email, 
      nombre: usuario.nombre 
    });

    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      },
      token
    };
  }
}

module.exports = Usuario;