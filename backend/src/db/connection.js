import mysql, { createPool } from 'mysql2/promise';
import 'dotenv/config';



export const pool = createPool({  // esto crea el mismo objeto que dbSettings en sql server
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

