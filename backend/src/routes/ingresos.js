const express = require('express');
const { body, validationResult } = require('express-validator');
const Ingreso = require('../models/Ingreso');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Obtener todos los ingresos del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filtros = {};
    
    if (req.query.mes) filtros.mes = parseInt(req.query.mes);
    if (req.query.anio) filtros.anio = parseInt(req.query.anio);
    if (req.query.fechaInicio) filtros.fechaInicio = req.query.fechaInicio;
    if (req.query.fechaFin) filtros.fechaFin = req.query.fechaFin;

    const ingresos = await Ingreso.obtenerPorUsuario(req.user.id, filtros);
    res.json(ingresos);
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    res.status(500).json({ error: 'Error al obtener los ingresos' });
  }
});

// Crear un nuevo ingreso
router.post('/', authenticateToken, [
  body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('descripcion').trim().isLength({ min: 1 }).withMessage('La descripción es requerida'),
  body('fecha').isISO8601().withMessage('La fecha debe ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { monto, descripcion, fecha } = req.body;

    const ingreso = await Ingreso.crear({
      usuarioId: req.user.id,
      monto,
      descripcion,
      fecha
    });

    res.status(201).json(ingreso);
  } catch (error) {
    console.error('Error creando ingreso:', error);
    res.status(500).json({ error: 'Error al crear el ingreso' });
  }
});

// Obtener un ingreso específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ingreso = await Ingreso.obtenerPorId(parseInt(req.params.id), req.user.id);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json(ingreso);
  } catch (error) {
    console.error('Error obteniendo ingreso:', error);
    res.status(500).json({ error: 'Error al obtener el ingreso' });
  }
});

// Actualizar un ingreso
router.put('/:id', authenticateToken, [
  body('monto').optional().isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('descripcion').optional().trim().isLength({ min: 1 }).withMessage('La descripción no puede estar vacía'),
  body('fecha').optional().isISO8601().withMessage('La fecha debe ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const datos = {};
    if (req.body.monto !== undefined) datos.monto = req.body.monto;
    if (req.body.descripcion !== undefined) datos.descripcion = req.body.descripcion;
    if (req.body.fecha !== undefined) datos.fecha = req.body.fecha;

    const ingreso = await Ingreso.actualizar(parseInt(req.params.id), req.user.id, datos);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json(ingreso);
  } catch (error) {
    console.error('Error actualizando ingreso:', error);
    res.status(500).json({ error: 'Error al actualizar el ingreso' });
  }
});

// Eliminar un ingreso
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const ingreso = await Ingreso.eliminar(parseInt(req.params.id), req.user.id);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json({ mensaje: 'Ingreso eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    res.status(500).json({ error: 'Error al eliminar el ingreso' });
  }
});

// Obtener total de ingresos por mes
router.get('/total/mes', authenticateToken, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Mes y año son requeridos' });
    }

    const total = await Ingreso.obtenerTotalPorMes(
      req.user.id, 
      parseInt(mes), 
      parseInt(anio)
    );
    res.json({ total });
  } catch (error) {
    console.error('Error obteniendo total de ingresos:', error);
    res.status(500).json({ error: 'Error al obtener el total de ingresos' });
  }
});

module.exports = router;