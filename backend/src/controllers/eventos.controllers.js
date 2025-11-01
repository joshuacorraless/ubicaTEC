//* Controlador para manejar eventos

import { getConnection } from '../db/connection.js';

/**
 * Obtener todos los eventos con acceso público (acceso = 'todos')
 */
export const getEventosPublicos = async (req, res) => {
    let connection;
    try {
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
                DATE_FORMAT(e.fecha, '%Y-%m-%d') as fechaCompleta
            FROM Eventos e
            WHERE e.acceso = 'todos' AND e.estado = 'disponible'
            ORDER BY e.fecha ASC, e.hora ASC
        `;
        
        const [eventos] = await connection.query(query);
        
        res.status(200).json({
            success: true,
            data: eventos
        });
        
    } catch (error) {
        console.error('Error al obtener eventos públicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Obtener eventos generales (acceso 'todos' y 'solo_tec')
 * NO incluye eventos específicos de escuelas
 */
export const getTodosLosEventos = async (req, res) => {
    let connection;
    try {
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
                DATE_FORMAT(e.fecha, '%Y-%m-%d') as fechaCompleta
            FROM Eventos e
            WHERE e.estado = 'disponible'
              AND (e.acceso = 'todos' OR e.acceso = 'solo_tec')
            ORDER BY e.fecha ASC, e.hora ASC
        `;
        
        const [eventos] = await connection.query(query);
        
        res.status(200).json({
            success: true,
            data: eventos
        });
        
    } catch (error) {
        console.error('Error al obtener todos los eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Obtener un evento específico por ID
 */
export const getEventoPorId = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
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
                DATE_FORMAT(e.fecha, '%Y-%m-%d') as fechaCompleta
            FROM Eventos e
            WHERE e.id_evento = ?
        `;
        
        const [eventos] = await connection.query(query, [id]);
        
        if (eventos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: eventos[0]
        });
        
    } catch (error) {
        console.error('Error al obtener evento por ID:', error);
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
 * Obtener eventos específicos de una escuela usando stored procedure
 */
export const getEventosPorEscuela = async (req, res) => {
    let connection;
    try {
        const { id_escuela } = req.params;
        
        if (!id_escuela) {
            return res.status(400).json({
                success: false,
                message: 'ID de escuela requerido'
            });
        }
        
        connection = await getConnection();
        
        // Llamar al stored procedure
        const [eventos] = await connection.query(
            'CALL sp_obtener_eventos_por_escuela(?)',
            [id_escuela]
        );
        
        // El stored procedure devuelve un array con los resultados en la primera posición
        const eventosData = eventos[0];
        
        res.status(200).json({
            success: true,
            data: eventosData
        });
        
    } catch (error) {
        console.error('Error al obtener eventos por escuela:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos de la escuela',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};
