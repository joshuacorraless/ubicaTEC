import { Router } from 'express';
import { obtenerEventosAdministrador, obtenerEscuelas, crearEvento, actualizarEvento, eliminarEvento } from '../controllers/administradores.controllers.js';

const router = Router();

/**
 * GET /api/administradores/eventos
 * Obtener todos los eventos creados por un administrador específico
 * Query params: id_usuario
 */
router.get('/api/administradores/eventos', obtenerEventosAdministrador);

/**
 * GET /api/administradores/escuelas
 * Obtener lista de todas las escuelas del TEC
 */
router.get('/api/administradores/escuelas', obtenerEscuelas);

/**
 * POST /api/administradores/eventos
 * Crear un nuevo evento
 * Body: { nombre, descripcion, fecha, hora, lugar, capacidad, precio, acceso, id_creador, imagen_url, alt_imagen, escuelas }
 */
router.post('/api/administradores/eventos', crearEvento);

/**
 * PUT /api/administradores/eventos/:id
 * Actualizar un evento existente
 * Body: { nombre, descripcion, fecha, hora, lugar, capacidad, precio, imagen_url, alt_imagen }
 */
router.put('/api/administradores/eventos/:id', actualizarEvento);

/**
 * DELETE /api/administradores/eventos/:id
 * Eliminar un evento (soft delete - cambia estado a 'cancelado')
 */
router.delete('/api/administradores/eventos/:id', eliminarEvento);

export default router;
