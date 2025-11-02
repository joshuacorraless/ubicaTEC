//* Rutas para manejar un evento individual (detalles y reservas)

import { Router } from 'express';
import {
    getEventoDetalle,
    crearReserva,
    verificarReserva
} from '../controllers/evento.controller.js';

const router = Router();

/**
 * @route   GET /api/evento/:id
 * @desc    Obtener detalles completos de un evento específico
 * @access  Public
 */
router.get('/:id', getEventoDetalle);

/**
 * @route   POST /api/evento/reserva
 * @desc    Crear una reserva para un evento
 * @access  Private (requiere autenticación)
 */
router.post('/reserva', crearReserva);

/**
 * @route   GET /api/evento/verificar-reserva
 * @desc    Verificar si un usuario ya tiene reserva para un evento
 * @access  Private (requiere autenticación)
 */
router.get('/verificar-reserva', verificarReserva);

export default router;
