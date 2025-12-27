const express = require('express');
const Categoria = require('../models/Categoria');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Obtener todas las categorías
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categorias = await Categoria.obtenerTodas();
    res.json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

// Obtener categorías por tipo (gasto o ingreso)
router.get('/tipo/:tipo', authenticateToken, async (req, res) => {
  try {
    const { tipo } = req.params;
    if (!['gasto', 'ingreso'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo debe ser "gasto" o "ingreso"' });
    }
    
    const categorias = await Categoria.obtenerPorTipo(tipo);
    res.json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías por tipo:', error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

module.exports = router;