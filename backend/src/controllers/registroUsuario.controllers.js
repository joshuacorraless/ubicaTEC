//* Controlador para manejar usuarios (registro)

import { getConnection } from '../db/connection.js';

/**
 * Crear un nuevo usuario (registro)
 */
export const crearUsuario = async (req, res) => {
    let connection;
    try {
        const { 
            nombre, 
            apellido, 
            correo, 
            usuario, 
            contrasena, 
            tipoUsuario,
            idEscuela,
            codigoAdministrador 
        } = req.body;

        console.log('📝 Datos de registro recibidos:', { 
            nombre, 
            apellido, 
            correo, 
            usuario, 
            tipoUsuario,
            idEscuela,
            tieneCodigoAdmin: !!codigoAdministrador
        });

        // Validaciones básicas
        if (!nombre || !apellido || !correo || !usuario || !contrasena || !tipoUsuario) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({
                success: false,
                message: 'El formato del correo electrónico no es válido'
            });
        }

        // Validar longitud de contraseña
        if (contrasena.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Validar tipo de usuario
        const tiposValidos = ['estudiante', 'administrativo', 'visitante'];
        if (!tiposValidos.includes(tipoUsuario)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de usuario inválido'
            });
        }

        // Validar escuela para estudiantes
        if (tipoUsuario === 'estudiante' && !idEscuela) {
            return res.status(400).json({
                success: false,
                message: 'Los estudiantes deben seleccionar una escuela'
            });
        }

        // Validar código de administrador
        if (tipoUsuario === 'administrativo' && codigoAdministrador !== '777') {
            return res.status(400).json({
                success: false,
                message: 'Código de administrador inválido'
            });
        }

        connection = await getConnection();

        // Preparar parámetros para el SP
        const escuelaId = tipoUsuario === 'estudiante' ? parseInt(idEscuela) : null;
        const codigoAdmin = tipoUsuario === 'administrativo' ? codigoAdministrador : null;

        // Llamar al stored procedure
        await connection.query(
            'CALL sp_crear_usuario(?, ?, ?, ?, ?, ?, ?, ?, @p_result_code, @p_message)',
            [
                nombre,
                apellido,
                correo,
                usuario,
                contrasena, // En producción deberías hashear con bcrypt
                tipoUsuario,
                escuelaId,
                codigoAdmin
            ]
        );

        // Obtener los códigos de resultado
        const [[result]] = await connection.query(
            'SELECT @p_result_code as resultCode, @p_message as message'
        );

        console.log('📊 Resultado del SP:', result);

        // Evaluar resultado
        if (result.resultCode === 0) {
            return res.status(201).json({
                success: true,
                message: result.message || 'Usuario creado exitosamente'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message || 'Error al crear el usuario'
            });
        }

    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear el usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
