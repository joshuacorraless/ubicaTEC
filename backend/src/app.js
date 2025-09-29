// Librerías 
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {pool} from './db/connection.js';
import routes from './routes.js';

// Objetos
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend ANTES de las rutas específicas
app.use(express.static(path.join(__dirname, '../../frontend')));

// Usar las rutas de la API
app.use('/api', routes);

// Conexión con el login (DESPUÉS de los archivos estáticos)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/viewsGenerales/login.html'))
});

// Función para probar conexión DB
async function testDatabaseConnection() {
    const [rows] = await pool.execute('SELECT 1');
    return true;
}

// Exportar tanto la app como la función de test
export { testDatabaseConnection };
export default app;
