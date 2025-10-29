
//* En este archivo se se crea la aplicacion usando express y se importan las rutas:

//* Se hacen los imports necesarios:

import express from 'express';
import cors from 'cors';  // para acceder desde otro dominio (frontend)

import loginRoutes from './routes/login.routes.js';


const app = express();

app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // para parsear json en el body
app.use(loginRoutes); // usar las rutas de login



export default app;



