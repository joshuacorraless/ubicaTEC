
//* en este archivo se se crea la aplicacion usando express y se importan las rutas:

//* imports:

import express from 'express';
import cors from 'cors';  // para acceder desde otro dominio (frontend)
import loginRoutes from './routes/login.routes.js';
import eventosRoutes from './routes/eventos.routes.js';
import eventoRoutes from './routes/evento.routes.js';


const app = express();

app.use(cors()); // CORS para todas las rutas
app.use(express.json()); // para parsear json en el body
app.use(loginRoutes); // que la app use las rutas de login
app.use(eventosRoutes); // que la app use las rutas de eventos
app.use('/api/evento', eventoRoutes); // que la app use las rutas de evento individual



export default app;



