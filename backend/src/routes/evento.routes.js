import { Router } from 'express';
import { getEventoDetalle, crearReserva, verificarReserva } from '../controllers/evento.controllers.js';

const router = Router();

// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos

// Ruta para verificar si un usuario ya tiene reserva para un evento
router.get('/api/evento/verificar-reserva', verificarReserva);

// Ruta para crear una reserva para un evento
router.post('/api/evento/reserva', crearReserva);

// Ruta para obtener detalles completos de un evento específico (debe ir al final)
router.get('/api/evento/:id', getEventoDetalle);

export default router;
