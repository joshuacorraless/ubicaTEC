import { Router } from 'express';
import { getEventoDetalle, crearReserva, verificarReserva } from '../controllers/evento.controllers.js';

const router = Router();

// Ruta para obtener detalles completos de un evento específico
router.get('/api/evento/:id', getEventoDetalle);

// Ruta para crear una reserva para un evento
router.post('/api/evento/reserva', crearReserva);

// Ruta para verificar si un usuario ya tiene reserva para un evento
router.get('/api/evento/verificar-reserva', verificarReserva);

export default router;
