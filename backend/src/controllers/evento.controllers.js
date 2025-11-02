
//* en este archivo esta toda la logica backend para manejar un evento individual


//* imports:
import { getConnection } from '../db/connection.js';
import nodemailer from 'nodemailer';
import 'dotenv/config';




// funcion para obtener un evento específico por ID con toda su información:
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
        
        // llamar al stored procedure
        await connection.query('CALL sp_obtener_evento_detalle(?, @p_result_code)', [id]);
        const [[result]] = await connection.query('SELECT @p_result_code as result_code');
        
        if (result.result_code === 1) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // obtener los datos del evento
        const [eventos] = await connection.query('CALL sp_obtener_evento_detalle(?, @p_result_code)', [id]);
        const evento = eventos[0][0]; // primera fila del primer resultado
        
        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // formatear la fecha para mostrar
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        
        const fechaObj = new Date(evento.fechaCompleta + 'T00:00:00');
        const dia = fechaObj.getDate();
        const mes = meses[fechaObj.getMonth()];
        
        // formatear hora
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





// funcion para crear una reserva para un evento:
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
        
        // llamar al stored procedure para crear la reserva
        await connection.query(
            'CALL sp_crear_reserva(?, ?, @p_result_code, @p_message, @p_id_reserva)',
            [id_evento, id_usuario]
        );
        
        const [[result]] = await connection.query(
            'SELECT @p_result_code as result_code, @p_message as message, @p_id_reserva as id_reserva'
        );
        
        // manejar códigos de error
        if (result.result_code !== 0) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
        // obtener datos del usuario para el correo
        const [usuarios] = await connection.query(
            'SELECT nombre, apellido, correo FROM Usuarios WHERE id_usuario = ?',
            [id_usuario]
        );
        const usuario = usuarios && usuarios.length ? usuarios[0] : null;

        // obtener datos del evento para el correo
        const [eventos] = await connection.query(
            'SELECT nombre, fecha, hora, lugar FROM Eventos WHERE id_evento = ?',
            [id_evento]
        );
        const eventoInfo = eventos && eventos.length ? eventos[0] : null;

        // responder inmediatamente con éxito
        const responseData = {
            success: true,
            message: 'Reserva creada exitosamente',
            data: {
                id_reserva: result.id_reserva,
                id_evento,
                id_usuario
            }
        };
        
        res.status(201).json(responseData);

        // enviar correo de confirmación de forma asíncrona (no bloquear la respuesta)
        setImmediate(async () => {
            try {
                console.log('📧 Intentando enviar correo de confirmación (async)...');
                
                // usar SMTP2GO en lugar de Gmail (más confiable para producción)
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'mail.smtp2go.com',
                    port: process.env.SMTP_PORT || 2525, // puerto alternativo que no bloquean
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER || process.env.EMAIL_USER,
                        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
                    }
                });

                const toEmail = usuario ? usuario.correo : null;
                const nombreUsuario = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario';
                
                console.log('Destinatario:', toEmail);

                // formatear fecha y hora
                let fechaFormateada = '';
                let horaFormateada = '';
                
                if (eventoInfo) {
                    const meses = [
                        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                    ];
                    
                    const fechaObj = eventoInfo.fecha instanceof Date 
                        ? eventoInfo.fecha 
                        : new Date(eventoInfo.fecha);
                    
                    const dia = fechaObj.getDate();
                    const mes = meses[fechaObj.getMonth()];
                    const anio = fechaObj.getFullYear();
                    fechaFormateada = `${dia} de ${mes} de ${anio}`;
                    
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
                        from: process.env.EMAIL_FROM || 'ubicaTEC <ubicatecoficial@gmail.com>',
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
                    console.log('✅ Correo enviado exitosamente a:', toEmail);
                } else {
                    console.log('⚠️ No se envió correo: toEmail o eventoInfo faltante');
                }
            } catch (mailErr) {
                console.error('❌ Error enviando correo:', mailErr.message);
            }
        });

        // no retornar nada aquí, ya respondimos arriba
        return;
        
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




// funcion para verificar si un usuario ya tiene una reserva para un evento:
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
        
        // llamar al stored procedure
        await connection.query(
            'CALL sp_verificar_reserva(?, ?, @p_tiene_reserva)',
            [id_evento, id_usuario]
        );
        
        const [[result]] = await connection.query('SELECT @p_tiene_reserva as tiene_reserva');
        
        if (result.tiene_reserva) {
            // obtener datos de la reserva
            const [reservas] = await connection.query(
                'CALL sp_verificar_reserva(?, ?, @p_tiene_reserva)',
                [id_evento, id_usuario]
            );
            
            res.status(200).json({
                success: true,
                tieneReserva: true,
                reserva: reservas[0][0] || null
            });
        } else {
            res.status(200).json({
                success: true,
                tieneReserva: false,
                reserva: null
            });
        }
        
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
