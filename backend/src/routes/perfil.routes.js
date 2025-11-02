import { Router } from 'express';
import { obtenerPerfilUsuario, actualizarPerfilUsuario } from '../controllers/perfil.controllers.js';

const router = Router();

// Ruta para obtener el perfil del usuario
router.get('/api/perfil/:id_usuario', obtenerPerfilUsuario);

// Ruta para actualizar el perfil del usuario
router.put('/api/perfil/:id_usuario', actualizarPerfilUsuario);

export default router;
