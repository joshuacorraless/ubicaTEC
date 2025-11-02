//* Controlador para manejar un evento individual

import { getConnection } from '../db/connection.js';

/**
 * Obtener un evento específico por ID con toda su información
 * Este endpoint se usa en la página de detalles/reserva
 */
export const getEventoDetalle = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del evento es requerido'
            });
        }

        connection = await getConnection();
        
        const query = `
            SELECT 
                e.id_evento as id,
                e.nombre as titulo,
                e.descripcion,
                e.fecha,
                e.hora,
                e.lugar,
                e.capacidad,
                e.asistencia,
                e.precio as costo,
                e.acceso,
                e.imagen_url as img,
                e.alt_imagen as alt,
                e.estado,
                (e.capacidad - e.asistencia) as disponibles,
                DATE_FORMAT(e.fecha, '%Y-%m-%d') as fechaCompleta,
                DATE_FORMAT(e.fecha, '%d') as dia,
                DATE_FORMAT(e.fecha, '%M') as mesNombre,
                CONCAT(u.nombre, ' ', u.apellido) as creador_nombre
            FROM Eventos e
            LEFT JOIN Usuarios u ON e.id_creador = u.id_usuario
            WHERE e.id_evento = ?
        `;
        
        const [eventos] = await connection.query(query, [id]);
        
        if (eventos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        const evento = eventos[0];
        
        // Formatear la fecha para mostrar
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        
        const fechaObj = new Date(evento.fechaCompleta + 'T00:00:00');
        const dia = fechaObj.getDate();
        const mes = meses[fechaObj.getMonth()];
        
        // Formatear hora
        const [horas, minutos] = evento.hora.split(':');
        const horaNum = parseInt(horas);
        const periodo = horaNum >= 12 ? 'p.m.' : 'a.m.';
        const hora12 = horaNum > 12 ? horaNum - 12 : (horaNum === 0 ? 12 : horaNum);
        
        evento.fechaFormateada = `${dia} de ${mes} · ${hora12}:${minutos} ${periodo}`;
        
        res.status(200).json({
            success: true,
            data: evento
        });
        
    } catch (error) {
        console.error('Error al obtener detalle del evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el evento',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Crear una reserva para un evento
 */
export const crearReserva = async (req, res) => {
    let connection;
    try {
        const { id_evento, id_usuario } = req.body;
        
        if (!id_evento || !id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'ID del evento y usuario son requeridos'
            });
        }

        connection = await getConnection();
        
        // Verificar que el evento existe y tiene cupos disponibles
        const [eventos] = await connection.query(
            'SELECT capacidad, asistencia, estado FROM Eventos WHERE id_evento = ?',
            [id_evento]
        );
        
        if (eventos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        const evento = eventos[0];
        
        if (evento.estado !== 'disponible') {
            return res.status(400).json({
                success: false,
                message: 'El evento no está disponible para reservas'
            });
        }
        
        if (evento.asistencia >= evento.capacidad) {
            return res.status(400).json({
                success: false,
                message: 'No hay cupos disponibles para este evento'
            });
        }
        
        // Verificar que el usuario no tenga ya una reserva para este evento
        const [reservasExistentes] = await connection.query(
            'SELECT id_reserva FROM Reservas WHERE id_evento = ? AND id_usuario = ?',
            [id_evento, id_usuario]
        );
        
        if (reservasExistentes.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una reserva para este evento'
            });
        }
        
        // Iniciar transacción
        await connection.beginTransaction();
        
        try {
            // Crear la reserva
            // Usar valores por defecto según la estructura de la tabla
            const cantidad = 1; // Por defecto 1 entrada
            const metodo_pago = 'efectivo'; // Por defecto efectivo (puede cambiarse después)
            
            const [resultado] = await connection.query(
                'INSERT INTO Reservas (id_evento, id_usuario, cantidad, metodo_pago, estado) VALUES (?, ?, ?, ?, ?)',
                [id_evento, id_usuario, cantidad, metodo_pago, 'Confirmada']
            );
            
            // Incrementar asistencia del evento
            await connection.query(
                'UPDATE Eventos SET asistencia = asistencia + 1 WHERE id_evento = ?',
                [id_evento]
            );
            
            // Verificar si el evento se agotó
            await connection.query(
                `UPDATE Eventos 
                 SET estado = CASE 
                    WHEN asistencia >= capacidad THEN 'agotado'
                    ELSE 'disponible'
                 END
                 WHERE id_evento = ?`,
                [id_evento]
            );
            
            await connection.commit();
            
            res.status(201).json({
                success: true,
                message: 'Reserva creada exitosamente',
                data: {
                    id_reserva: resultado.insertId,
                    id_evento,
                    id_usuario
                }
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la reserva',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Verificar si un usuario ya tiene una reserva para un evento
 */
export const verificarReserva = async (req, res) => {
    let connection;
    try {
        const { id_evento, id_usuario } = req.query;
        
        if (!id_evento || !id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'ID del evento y usuario son requeridos'
            });
        }

        connection = await getConnection();
        
        const [reservas] = await connection.query(
            'SELECT id_reserva, estado, fecha_reserva FROM Reservas WHERE id_evento = ? AND id_usuario = ?',
            [id_evento, id_usuario]
        );
        
        res.status(200).json({
            success: true,
            tieneReserva: reservas.length > 0,
            reserva: reservas.length > 0 ? reservas[0] : null
        });
        
    } catch (error) {
        console.error('Error al verificar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar la reserva',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};
