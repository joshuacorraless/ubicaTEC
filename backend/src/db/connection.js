
//* este archivo es para la conexion a mysql, en donde esta nuestra BD. 



import { createPool } from 'mysql2/promise';
import 'dotenv/config';


// pool de conexiones
export const pool = createPool({  
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});



// esta funcion es la que se llama para obtener la conexion a la pool de conexiones.
export const getConnection = async () => {
    return await pool.getConnection();
};


