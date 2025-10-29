
//* este archivo tiene los endpoints de login

//* imports:
import { Router } from 'express';
import { loginUsuario } from '../controllers/login.controllers.js';
const router = Router();


// endpoint para login de usuario
router.post('/api/login', loginUsuario);

export default router;