






-- SP del login de usuario:


USE ubicatec;

DELIMITER //

CREATE PROCEDURE sp_verificar_login(
    IN inCorreo VARCHAR(150),
    IN inContrasena VARCHAR(255),
    OUT outResultCode INT
)
BEGIN
    -- Limpiar espacios
    SET inCorreo = TRIM(inCorreo);
    SET inContrasena = TRIM(inContrasena);
    
    -- Inicializar variable de salida
    SET outResultCode = 0;
    
    -- Verificar si el usuario existe por correo
    IF NOT EXISTS(SELECT 1 FROM Usuarios WHERE correo = inCorreo) THEN
        SET outResultCode = 1; -- Usuario no existe
    
    -- Verificar si la contraseña es correcta
    ELSEIF NOT EXISTS(
        SELECT 1 
        FROM Usuarios 
        WHERE correo = inCorreo AND contrasena = inContrasena
    ) THEN
        SET outResultCode = 2; -- Contraseña incorrecta
    
    -- Login exitoso
    ELSE
        SET outResultCode = 0; -- Login exitoso
        
        -- Retornar ID del usuario, tipo de rol, id_escuela y nombre de escuela
        SELECT u.id_usuario, r.tipo_rol, u.id_escuela, e.nombre_escuela AS escuela
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        LEFT JOIN EscuelasTEC e ON u.id_escuela = e.id_escuela
        WHERE u.correo = inCorreo
        LIMIT 1;
    END IF;
    
END//

DELIMITER ;


-- ===============================================
-- SP para obtener eventos según rol y escuela
-- ===============================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_obtener_eventos_filtrados//

CREATE PROCEDURE sp_obtener_eventos_filtrados(
    IN p_tipo_rol VARCHAR(50),
    IN p_id_escuela INT
)
BEGIN
    IF p_tipo_rol = 'Visitante' THEN
        -- VISITANTES: Solo eventos con acceso 'todos'
        SELECT DISTINCT
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
            DATE_FORMAT(e.fecha, '%d de %M') as fechaFormateada
        FROM Eventos e
        WHERE e.estado = 'disponible'
          AND e.acceso = 'todos'
        ORDER BY e.fecha ASC, e.hora ASC;
        
    ELSEIF p_tipo_rol = 'Administrador' THEN
        -- ADMINISTRADORES: Todos los eventos (acceso 'todos' y 'solo_tec')
        SELECT DISTINCT
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
            DATE_FORMAT(e.fecha, '%d de %M') as fechaFormateada
        FROM Eventos e
        WHERE e.estado = 'disponible'
        ORDER BY e.fecha ASC, e.hora ASC;
        
    ELSEIF p_tipo_rol = 'Estudiante' THEN
        -- ESTUDIANTES: 
        -- 1. Todos los eventos con acceso='todos' 
        -- 2. Eventos con acceso='solo_tec' que incluyan su escuela
        SELECT DISTINCT
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
            DATE_FORMAT(e.fecha, '%d de %M') as fechaFormateada
        FROM Eventos e
        WHERE e.estado = 'disponible'
          AND (
              -- Si es acceso 'todos', traerlo directamente
              e.acceso = 'todos'
              OR
              -- Si es 'solo_tec', verificar que incluya la escuela del estudiante
              (
                  e.acceso = 'solo_tec' 
                  AND EXISTS (
                      SELECT 1 
                      FROM Eventos_Escuelas ee 
                      WHERE ee.id_evento = e.id_evento 
                        AND ee.id_escuela = p_id_escuela
                  )
              )
          )
        ORDER BY e.fecha ASC, e.hora ASC;
        
    ELSE
        -- Por defecto, no devolver nada
        SELECT 'Rol no válido' as error;
    END IF;
END//

DELIMITER ;