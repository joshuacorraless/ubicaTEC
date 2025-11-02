//* Controlador para manejar un evento individual

import { getConnection } from '../db/connection.js';
import nodemailer from 'nodemailer';
import 'dotenv/config';

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
            // Crear la reserva (una entrada por defecto)
            const cantidad = 1;
            const metodo_pago = 'efectivo';

            const [resultado] = await connection.query(
                'INSERT INTO Reservas (id_evento, id_usuario, cantidad, metodo_pago, estado) VALUES (?, ?, ?, ?, ?)',
                [id_evento, id_usuario, cantidad, metodo_pago, 'Confirmada']
            );

            // Llamar al stored procedure que decrementa la capacidad
            await connection.query('CALL sp_decrementar_capacidad_evento(?, @p_result_code);', [id_evento]);
            const [selectOut] = await connection.query('SELECT @p_result_code as p_result_code;');
            const spResult = selectOut && selectOut.length ? selectOut[0].p_result_code : null;

            if (spResult === null) {
                await connection.rollback();
                return res.status(500).json({ success: false, message: 'Error al ejecutar el stored procedure' });
            }

            if (spResult === 1) {
                // Evento no encontrado
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Evento no encontrado (SP)' });
            }

            if (spResult === 2) {
                // Capacidad ya agotada
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'No hay cupos disponibles (agotado)' });
            }

            // Actualizar asistencia (ya que el SP decrementó la columna 'capacidad')
            await connection.query('UPDATE Eventos SET asistencia = asistencia + 1 WHERE id_evento = ?', [id_evento]);

            await connection.commit();

            // Obtener datos del usuario para el correo
            const [usuarios] = await connection.query('SELECT nombre, apellido, correo FROM Usuarios WHERE id_usuario = ?', [id_usuario]);
            const usuario = usuarios && usuarios.length ? usuarios[0] : null;

            // Obtener datos del evento para el correo
            const [eventos2] = await connection.query('SELECT nombre, fecha, hora, lugar FROM Eventos WHERE id_evento = ?', [id_evento]);
            const eventoInfo = eventos2 && eventos2.length ? eventos2[0] : null;

            // Enviar correo de confirmación (no bloquear el flujo si falla el envío)
            try {
                // Usar configuración SMTP explícita para Gmail (mejor compatibilidad con App Passwords)
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // true para port 465
                    auth: {
                        user: process.env.EMAIL_USER || 'ubicatecoficial@gmail.com',
                        pass: process.env.EMAIL_PASS || 'ubicatec777charlie'
                    }
                });

                const toEmail = usuario ? usuario.correo : null;
                const nombreUsuario = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario';

                // Formatear fecha y hora para Costa Rica (UTC-6)
                let fechaFormateada = '';
                let horaFormateada = '';
                
                if (eventoInfo) {
                    // Formatear fecha (ej: "12 de septiembre de 2025")
                    const meses = [
                        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                    ];
                    
                    // MySQL devuelve fecha como Date object, no string
                    const fechaObj = eventoInfo.fecha instanceof Date 
                        ? eventoInfo.fecha 
                        : new Date(eventoInfo.fecha);
                    
                    const dia = fechaObj.getDate();
                    const mes = meses[fechaObj.getMonth()];
                    const anio = fechaObj.getFullYear();
                    fechaFormateada = `${dia} de ${mes} de ${anio}`;
                    
                    // Formatear hora (ej: "10:00 a.m.")
                    // Si hora es string "10:00:00" o Date/Time object
                    let horaStr = eventoInfo.hora;
                    if (typeof horaStr !== 'string') {
                        horaStr = horaStr.toString();
                    }
                    const [horas, minutos] = horaStr.split(':');
                    const horaNum = parseInt(horas);
                    const periodo = horaNum >= 12 ? 'p.m.' : 'a.m.';
                    const hora12 = horaNum > 12 ? horaNum - 12 : (horaNum === 0 ? 12 : horaNum);
                    horaFormateada = `${hora12}:${minutos} ${periodo}`;
                }

                if (toEmail && eventoInfo) {
                    const mailOptions = {
                        from: 'ubicaTEC <ubicatecoficial@gmail.com>',
                        to: toEmail,
                        subject: `Confirmación de reserva: ${eventoInfo.nombre}`,
                        html: `
                            <p>Hola <strong>${nombreUsuario}</strong>,</p>
                            <p>Tu reserva para el evento <strong>${eventoInfo.nombre}</strong> ha sido confirmada.</p>
                            <ul>
                                <li><strong>Fecha:</strong> ${fechaFormateada}</li>
                                <li><strong>Hora:</strong> ${horaFormateada} (hora de Costa Rica)</li>
                                <li><strong>Lugar:</strong> ${eventoInfo.lugar}</li>
                            </ul>
                            <p>¡Te esperamos!</p>
                            <p>— equipo ubicaTEC</p>
                        `
                    };

                    await transporter.sendMail(mailOptions);
                }
            } catch (mailErr) {
                console.error('Error enviando correo de confirmación:', mailErr);
                // No revertimos la transacción por error en correo — retornamos éxito pero avisamos que el email falló
                return res.status(201).json({
                    success: true,
                    message: 'Reserva creada exitosamente, pero no se pudo enviar el correo de confirmación',
                    data: {
                        id_reserva: resultado.insertId,
                        id_evento,
                        id_usuario
                    }
                });
            }

            // Responder éxito
            return res.status(201).json({
                success: true,
                message: 'Reserva creada y correo de confirmación enviado correctamente',
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
