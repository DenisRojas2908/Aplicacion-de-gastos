const express = require('express');
const Dashboard = require('../models/Dashboard');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Obtener resumen mensual
router.get('/mensual', authenticateToken, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    const fechaActual = new Date();
    const mesActual = mes ? parseInt(mes) : fechaActual.getMonth() + 1;
    const anioActual = anio ? parseInt(anio) : fechaActual.getFullYear();

    const resumen = await Dashboard.obtenerResumenMensual(req.user.id, mesActual, anioActual);
    res.json(resumen);
  } catch (error) {
    console.error('Error obteniendo resumen mensual:', error);
    res.status(500).json({ error: 'Error al obtener el resumen mensual' });
  }
});

// Obtener resumen anual
router.get('/anual', authenticateToken, async (req, res) => {
  try {
    const { anio } = req.query;
    const anioActual = anio ? parseInt(anio) : new Date().getFullYear();

    const resumen = await Dashboard.obtenerResumenAnual(req.user.id, anioActual);
    res.json(resumen);
  } catch (error) {
    console.error('Error obteniendo resumen anual:', error);
    res.status(500).json({ error: 'Error al obtener el resumen anual' });
  }
});

// Obtener estadísticas generales
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const estadisticas = await Dashboard.obtenerEstadisticasGenerales(req.user.id);
    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
});

module.exports = router;