    -- Stored Procedures para Eventos por Escuela

    USE ubicaTEC;

    DELIMITER $$

-- Procedimiento para obtener eventos específicos de una escuela
DROP PROCEDURE IF EXISTS sp_obtener_eventos_por_escuela$$

CREATE PROCEDURE sp_obtener_eventos_por_escuela(
    IN p_id_escuela INT
)
BEGIN
    -- Obtener eventos donde el acceso coincide con el nombre de la escuela del usuario
    SELECT DISTINCT
        E.id_evento as id,
        E.nombre as titulo,
        E.descripcion,
        E.fecha,
        E.hora,
        E.lugar,
        E.capacidad,
        E.asistencia,
        E.precio as costo,
        E.acceso,
        E.imagen_url as img,
        E.alt_imagen as alt,
        E.estado,
        (E.capacidad - E.asistencia) as disponibles,
        DATE_FORMAT(E.fecha, '%Y-%m-%d') as fechaCompleta
    FROM
        Eventos AS E
    INNER JOIN
        EscuelasTEC AS ET ON E.acceso = ET.nombre_escuela
    WHERE
        ET.id_escuela = p_id_escuela
        AND E.estado = 'disponible'
    ORDER BY
        E.fecha ASC, E.hora ASC;
END$$    DELIMITER ;
