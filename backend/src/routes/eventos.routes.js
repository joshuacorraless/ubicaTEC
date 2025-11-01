//* Este archivo tiene los endpoints de eventos

//* imports:
import { Router } from 'express';
import { 
    getEventosPublicos, 
    getTodosLosEventos, 
    getEventoPorId,
    getEventosPorEscuela
} from '../controllers/eventos.controllers.js';

const router = Router();

// Endpoint para obtener eventos públicos (acceso = 'todos')
router.get('/api/eventos/publicos', getEventosPublicos);

// Endpoint para obtener todos los eventos
router.get('/api/eventos', getTodosLosEventos);

// Endpoint para obtener eventos por escuela
router.get('/api/eventos/escuela/:id_escuela', getEventosPorEscuela);

// Endpoint para obtener un evento específico por ID
router.get('/api/eventos/:id', getEventoPorId);

export default router;
