const express = require('express');
const MetodoPago = require('../models/MetodoPago');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Obtener todos los métodos de pago
router.get('/', authenticateToken, async (req, res) => {
  try {
    const metodos = await MetodoPago.obtenerTodos();
    res.json(metodos);
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({ error: 'Error al obtener los métodos de pago' });
  }
});

module.exports = router;