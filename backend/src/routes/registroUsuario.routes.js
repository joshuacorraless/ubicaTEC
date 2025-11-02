//* Rutas para registro de usuarios

//* imports:
import { Router } from 'express';
import { crearUsuario } from '../controllers/registroUsuario.controllers.js';
const router = Router();


// endpoint para crear nuevo usuario (registro)
router.post('/api/usuarios/registro', crearUsuario);

export default router;
