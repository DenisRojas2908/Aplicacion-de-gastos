const express = require('express');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Registro de usuario
router.post('/register', [
  body('nombre').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Debe proporcionar un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.encontrarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear usuario
    const usuario = await Usuario.crear({ nombre, email, password });
    
    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Debe proporcionar un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const resultado = await Usuario.login(email, password);
    
    res.json(resultado);

  } catch (error) {
    console.error('Error en login:', error);
    if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener perfil del usuario autenticado
router.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const usuario = await Usuario.encontrarPorId(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

module.exports = router;