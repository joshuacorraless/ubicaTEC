

//* este archivo tiene los endpoints de login


import { Router } from 'express';
import { loginUsuario } from '../controllers/login.controllers.js';
const router = Router();

// endpoint para login de usuario
router.post('/login', loginUsuario);

export default router;