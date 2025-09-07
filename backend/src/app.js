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


export default app;
