import express from 'express';
import cors from 'cors';
import {pool} from './db/connection.js';


const app = express();
app.use(cors());
app.use(express.json());
    

//prueba
app.get('/ping', async (req, res) => {
    const result = await pool.query('SELECT 1 + 1 AS result');
    res.json(result[0]);
});
//agregar rutas que le voy a permitir a la app acceder

// Prueba para backend
app.get('/', (req, res) => {
    res.status(200) // Código de confirmación de exito
    res.send('Corriendo exitosamente')
})

export default app;
