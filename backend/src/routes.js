import express from 'express';
import { pool } from './db/connection.js';

const router = express.Router();

// Ruta para obtener todos los usuarios y también para ejemplo de otros queries
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT nombre, apellido, correo, usuario FROM Usuarios'
        );
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al consultar la base de datos',
            message: error.message 
        });
    }
});

// Ruta para autenticación de usuarios
router.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                error: 'Correo y contraseña son requeridos'
            });
        }
        
        const [rows] = await pool.execute(
            'SELECT u.nombre, u.apellido, u.correo, u.usuario, r.tipo_rol FROM Usuarios u INNER JOIN Roles r ON u.id_rol = r.id_rol WHERE u.correo = ? AND u.contrasena = ?',
            [correo, contrasena]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'Credenciales incorrectas' 
            });
        }
        
        const user = rows[0];
        
        res.json({ 
            success: true,
            message: 'Login exitoso',
            user: user
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error en el servidor',
            message: error.message 
        });
    }
});

export default router;