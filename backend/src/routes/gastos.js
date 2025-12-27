const express = require('express');
const { body, validationResult } = require('express-validator');
const Gasto = require('../models/Gasto');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Obtener todos los gastos del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filtros = {};
    
    if (req.query.mes) filtros.mes = parseInt(req.query.mes);
    if (req.query.anio) filtros.anio = parseInt(req.query.anio);
    if (req.query.categoriaId) filtros.categoriaId = parseInt(req.query.categoriaId);
    if (req.query.fechaInicio) filtros.fechaInicio = req.query.fechaInicio;
    if (req.query.fechaFin) filtros.fechaFin = req.query.fechaFin;

    const gastos = await Gasto.obtenerPorUsuario(req.user.id, filtros);
    res.json(gastos);
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({ error: 'Error al obtener los gastos' });
  }
});

// Crear un nuevo gasto
router.post('/', authenticateToken, [
  body('categoriaId').isInt().withMessage('La categoría es requerida'),
  body('metodoPagoId').isInt().withMessage('El método de pago es requerido'),
  body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('descripcion').trim().isLength({ min: 1 }).withMessage('La descripción es requerida'),
  body('fecha').isISO8601().withMessage('La fecha debe ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoriaId, metodoPagoId, monto, descripcion, fecha } = req.body;

    const gasto = await Gasto.crear({
      usuarioId: req.user.id,
      categoriaId,
      metodoPagoId,
      monto,
      descripcion,
      fecha
    });

    res.status(201).json(gasto);
  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({ error: 'Error al crear el gasto' });
  }
});

// Obtener un gasto específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const gasto = await Gasto.obtenerPorId(parseInt(req.params.id), req.user.id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json(gasto);
  } catch (error) {
    console.error('Error obteniendo gasto:', error);
    res.status(500).json({ error: 'Error al obtener el gasto' });
  }
});

// Actualizar un gasto
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
    if (req.body.categoriaId !== undefined) datos.categoriaId = req.body.categoriaId;
    if (req.body.metodoPagoId !== undefined) datos.metodoPagoId = req.body.metodoPagoId;
    if (req.body.monto !== undefined) datos.monto = req.body.monto;
    if (req.body.descripcion !== undefined) datos.descripcion = req.body.descripcion;
    if (req.body.fecha !== undefined) datos.fecha = req.body.fecha;

    const gasto = await Gasto.actualizar(parseInt(req.params.id), req.user.id, datos);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json(gasto);
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({ error: 'Error al actualizar el gasto' });
  }
});

// Eliminar un gasto
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const gasto = await Gasto.eliminar(parseInt(req.params.id), req.user.id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json({ mensaje: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({ error: 'Error al eliminar el gasto' });
  }
});

// Obtener totales por categoría
router.get('/estadisticas/categorias', authenticateToken, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Mes y año son requeridos' });
    }

    const totales = await Gasto.obtenerTotalesPorCategoria(
      req.user.id, 
      parseInt(mes), 
      parseInt(anio)
    );
    res.json(totales);
  } catch (error) {
    console.error('Error obteniendo totales por categoría:', error);
    res.status(500).json({ error: 'Error al obtener los totales por categoría' });
  }
});

// Obtener totales por método de pago
router.get('/estadisticas/metodos-pago', authenticateToken, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Mes y año son requeridos' });
    }

    const totales = await Gasto.obtenerTotalesPorMetodoPago(
      req.user.id, 
      parseInt(mes), 
      parseInt(anio)
    );
    res.json(totales);
  } catch (error) {
    console.error('Error obteniendo totales por método de pago:', error);
    res.status(500).json({ error: 'Error al obtener los totales por método de pago' });
  }
});

module.exports = router;