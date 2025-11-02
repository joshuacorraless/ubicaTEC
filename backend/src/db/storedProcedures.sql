






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
        
        -- Retornar datos completos del usuario
        SELECT 
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            r.tipo_rol,
            u.id_escuela,
            e.nombre_escuela AS escuela
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        LEFT JOIN EscuelasTEC e ON u.id_escuela = e.id_escuela
        WHERE u.correo = inCorreo
        LIMIT 1;
    END IF;
    
END//

DELIMITER ;


-- ===============================================
-- SP para decrementar la capacidad de un evento
-- Si capacidad > 0 => resta 1 y retorna código 0 (éxito)
-- Si no existe el evento => retorna código 1
-- Si capacidad = 0 => no resta y actualiza estado='agotado', retorna código 2
-- ===============================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_decrementar_capacidad_evento//

CREATE PROCEDURE sp_decrementar_capacidad_evento(
    IN p_id_evento INT,
    OUT p_result_code INT
)
BEGIN
    DECLARE v_capacidad INT;
    DECLARE v_estado VARCHAR(20);

    -- Inicializar resultado
    SET p_result_code = -1;

    -- Verificar existencia del evento y obtener capacidad y estado
    IF NOT EXISTS (SELECT 1 FROM Eventos WHERE id_evento = p_id_evento) THEN
        SET p_result_code = 1; -- evento no encontrado
    ELSE
        SELECT capacidad, estado INTO v_capacidad, v_estado
        FROM Eventos
        WHERE id_evento = p_id_evento
        LIMIT 1;

        IF v_capacidad <= 0 THEN
            -- Si ya no hay capacidad, marcar como agotado
            UPDATE Eventos
            SET estado = 'agotado'
            WHERE id_evento = p_id_evento;

            SET p_result_code = 2; -- ya agotado
        ELSE
            -- Decrementar capacidad en 1
            UPDATE Eventos
            SET capacidad = capacidad - 1
            WHERE id_evento = p_id_evento;

            -- Si tras decrementar la capacidad llegó a 0, marcar agotado
            UPDATE Eventos
            SET estado = 'agotado'
            WHERE id_evento = p_id_evento AND capacidad = 0;

            SET p_result_code = 0; -- éxito
        END IF;
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


























































-- ===============================================
-- SP para registrar un nuevo usuario
-- ===============================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_crear_usuario//

CREATE PROCEDURE sp_crear_usuario(
    IN p_nombre VARCHAR(50),
    IN p_apellido VARCHAR(50),
    IN p_correo VARCHAR(150),
    IN p_usuario VARCHAR(50),
    IN p_contrasena VARCHAR(255),
    IN p_tipo_usuario VARCHAR(20), -- 'estudiante', 'administrativo', 'visitante'
    IN p_id_escuela INT,           -- NULL para admin y visitantes
    IN p_codigo_admin VARCHAR(10), -- '777' para admins, NULL para otros
    OUT p_result_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_id_rol INT;
    DECLARE v_codigo_esperado VARCHAR(10) DEFAULT '777';
    
    -- Inicializar resultado
    SET p_result_code = 0;
    SET p_message = 'Usuario creado exitosamente';
    
    -- Validar que el correo no exista
    IF EXISTS(SELECT 1 FROM Usuarios WHERE correo = p_correo) THEN
        SET p_result_code = 1;
        SET p_message = 'El correo electrónico ya está registrado';
    
    -- Validar que el usuario no exista
    ELSEIF EXISTS(SELECT 1 FROM Usuarios WHERE usuario = p_usuario) THEN
        SET p_result_code = 2;
        SET p_message = 'El nombre de usuario ya está en uso';
    
    -- Validar código de administrador si es necesario
    ELSEIF p_tipo_usuario = 'administrativo' AND (p_codigo_admin IS NULL OR p_codigo_admin != v_codigo_esperado) THEN
        SET p_result_code = 3;
        SET p_message = 'Código de administrador inválido';
    
    -- Validar que estudiante tenga escuela
    ELSEIF p_tipo_usuario = 'estudiante' AND p_id_escuela IS NULL THEN
        SET p_result_code = 4;
        SET p_message = 'Los estudiantes deben seleccionar una escuela';
    
    ELSE
        -- Obtener el ID del rol según el tipo de usuario
        IF p_tipo_usuario = 'administrativo' THEN
            SELECT id_rol INTO v_id_rol FROM Roles WHERE tipo_rol = 'Administrador' LIMIT 1;
        ELSEIF p_tipo_usuario = 'estudiante' THEN
            SELECT id_rol INTO v_id_rol FROM Roles WHERE tipo_rol = 'Estudiante' LIMIT 1;
        ELSEIF p_tipo_usuario = 'visitante' THEN
            SELECT id_rol INTO v_id_rol FROM Roles WHERE tipo_rol = 'Visitante' LIMIT 1;
        ELSE
            SET p_result_code = 5;
            SET p_message = 'Tipo de usuario inválido';
        END IF;
        
        -- Si se encontró el rol, insertar el usuario
        IF p_result_code = 0 AND v_id_rol IS NOT NULL THEN
            INSERT INTO Usuarios (
                nombre, 
                apellido, 
                correo, 
                usuario, 
                contrasena, 
                id_rol, 
                id_escuela, 
                codigo_admin
            ) VALUES (
                TRIM(p_nombre),
                TRIM(p_apellido),
                TRIM(p_correo),
                TRIM(p_usuario),
                p_contrasena, -- Ya debe venir hasheada del backend si usas bcrypt
                v_id_rol,
                p_id_escuela,
                p_codigo_admin
            );
        ELSEIF v_id_rol IS NULL THEN
            SET p_result_code = 6;
            SET p_message = 'No se encontró el rol especificado';
        END IF;
    END IF;
    
END//

DELIMITER ;

-- =====================================================
-- SP para obtener información del perfil del usuario
-- =====================================================

DELIMITER //

CREATE PROCEDURE sp_obtener_perfil_usuario(
    IN p_id_usuario INT
)
BEGIN
    SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.usuario,
        r.tipo_rol,
        u.id_escuela,
        e.nombre_escuela AS escuela
    FROM Usuarios u
    INNER JOIN Roles r ON u.id_rol = r.id_rol
    LEFT JOIN EscuelasTEC e ON u.id_escuela = e.id_escuela
    WHERE u.id_usuario = p_id_usuario;
END//

DELIMITER ;

-- =====================================================
-- SP para actualizar información del perfil del usuario
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_actualizar_perfil_usuario//

CREATE PROCEDURE sp_actualizar_perfil_usuario(
    IN p_id_usuario INT,
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_correo VARCHAR(150),
    IN p_usuario VARCHAR(50),
    IN p_nueva_contrasena VARCHAR(255), -- NULL si no cambia
    OUT p_result_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Inicializar resultado
    SET p_result_code = 0;
    SET p_message = 'Perfil actualizado exitosamente';
    
    -- Validar que el usuario exista
    IF NOT EXISTS(SELECT 1 FROM Usuarios WHERE id_usuario = p_id_usuario) THEN
        SET p_result_code = 1;
        SET p_message = 'Usuario no encontrado';
    
    -- Validar que el correo no esté en uso por otro usuario
    ELSEIF EXISTS(
        SELECT 1 FROM Usuarios 
        WHERE correo = p_correo AND id_usuario != p_id_usuario
    ) THEN
        SET p_result_code = 2;
        SET p_message = 'El correo electrónico ya está en uso por otro usuario';
    
    -- Validar que el nombre de usuario no esté en uso por otro usuario
    ELSEIF EXISTS(
        SELECT 1 FROM Usuarios 
        WHERE usuario = p_usuario AND id_usuario != p_id_usuario
    ) THEN
        SET p_result_code = 3;
        SET p_message = 'El nombre de usuario ya está en uso';
    
    ELSE
        -- Actualizar datos del usuario
        IF p_nueva_contrasena IS NOT NULL AND LENGTH(p_nueva_contrasena) > 0 THEN
            -- Actualizar incluyendo contraseña
            UPDATE Usuarios
            SET 
                nombre = TRIM(p_nombre),
                apellido = TRIM(p_apellido),
                correo = TRIM(p_correo),
                usuario = TRIM(p_usuario),
                contrasena = p_nueva_contrasena
            WHERE id_usuario = p_id_usuario;
        ELSE
            -- Actualizar sin cambiar contraseña
            UPDATE Usuarios
            SET 
                nombre = TRIM(p_nombre),
                apellido = TRIM(p_apellido),
                correo = TRIM(p_correo),
                usuario = TRIM(p_usuario)
            WHERE id_usuario = p_id_usuario;
        END IF;
    END IF;
    
END//

DELIMITER ;


-- =====================================================
-- SP para obtener detalle completo de un evento
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_obtener_evento_detalle//

CREATE PROCEDURE sp_obtener_evento_detalle(
    IN p_id_evento INT,
    OUT p_result_code INT
)
BEGIN
    -- Inicializar resultado
    SET p_result_code = 0;
    
    -- Verificar si el evento existe
    IF NOT EXISTS(SELECT 1 FROM Eventos WHERE id_evento = p_id_evento) THEN
        SET p_result_code = 1; -- Evento no encontrado
    ELSE
        -- Retornar datos del evento
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
        WHERE e.id_evento = p_id_evento;
    END IF;
END//

DELIMITER ;


-- =====================================================
-- SP para crear una reserva
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_crear_reserva//

CREATE PROCEDURE sp_crear_reserva(
    IN p_id_evento INT,
    IN p_id_usuario INT,
    OUT p_result_code INT,
    OUT p_message VARCHAR(255),
    OUT p_id_reserva INT
)
BEGIN
    DECLARE v_capacidad INT;
    DECLARE v_asistencia INT;
    DECLARE v_estado VARCHAR(20);
    
    -- Inicializar variables
    SET p_result_code = 0;
    SET p_message = 'Reserva creada exitosamente';
    SET p_id_reserva = NULL;
    
    -- Verificar que el evento existe
    IF NOT EXISTS(SELECT 1 FROM Eventos WHERE id_evento = p_id_evento) THEN
        SET p_result_code = 1;
        SET p_message = 'Evento no encontrado';
    
    -- Verificar que el usuario existe
    ELSEIF NOT EXISTS(SELECT 1 FROM Usuarios WHERE id_usuario = p_id_usuario) THEN
        SET p_result_code = 2;
        SET p_message = 'Usuario no encontrado';
    
    -- Verificar si ya tiene una reserva
    ELSEIF EXISTS(
        SELECT 1 FROM Reservas 
        WHERE id_evento = p_id_evento AND id_usuario = p_id_usuario
    ) THEN
        SET p_result_code = 3;
        SET p_message = 'Ya tienes una reserva para este evento';
    
    ELSE
        -- Obtener información del evento
        SELECT capacidad, asistencia, estado 
        INTO v_capacidad, v_asistencia, v_estado
        FROM Eventos 
        WHERE id_evento = p_id_evento;
        
        -- Verificar estado del evento
        IF v_estado != 'disponible' THEN
            SET p_result_code = 4;
            SET p_message = 'El evento no está disponible para reservas';
        
        -- Verificar disponibilidad
        ELSEIF v_asistencia >= v_capacidad THEN
            SET p_result_code = 5;
            SET p_message = 'No hay cupos disponibles para este evento';
        
        ELSE
            -- Crear la reserva
            INSERT INTO Reservas (id_evento, id_usuario, cantidad, metodo_pago, estado)
            VALUES (p_id_evento, p_id_usuario, 1, 'efectivo', 'Confirmada');
            
            SET p_id_reserva = LAST_INSERT_ID();
            
            -- Incrementar asistencia
            UPDATE Eventos 
            SET asistencia = asistencia + 1
            WHERE id_evento = p_id_evento;
            
            -- Si se alcanzó la capacidad, marcar como agotado
            IF v_asistencia + 1 >= v_capacidad THEN
                UPDATE Eventos 
                SET estado = 'agotado'
                WHERE id_evento = p_id_evento;
            END IF;
        END IF;
    END IF;
    
END//

DELIMITER ;


-- =====================================================
-- SP para verificar si existe una reserva
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_verificar_reserva//

CREATE PROCEDURE sp_verificar_reserva(
    IN p_id_evento INT,
    IN p_id_usuario INT,
    OUT p_tiene_reserva BOOLEAN
)
BEGIN
    -- Verificar si existe la reserva
    IF EXISTS(
        SELECT 1 FROM Reservas 
        WHERE id_evento = p_id_evento AND id_usuario = p_id_usuario
    ) THEN
        SET p_tiene_reserva = TRUE;
        
        -- Retornar datos de la reserva
        SELECT 
            id_reserva,
            estado,
            creado_en
        FROM Reservas
        WHERE id_evento = p_id_evento AND id_usuario = p_id_usuario
        LIMIT 1;
    ELSE
        SET p_tiene_reserva = FALSE;
    END IF;
END//

DELIMITER ;


-- =====================================================
-- SP para obtener eventos creados por un administrador
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_listar_eventos_administrador//

CREATE PROCEDURE sp_listar_eventos_administrador(
    IN p_id_creador INT
)
BEGIN
    -- Validar que el usuario existe
    IF NOT EXISTS(SELECT 1 FROM Usuarios WHERE id_usuario = p_id_creador) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario administrador no existe';
    ELSE
        -- Retornar todos los eventos creados por este administrador
        SELECT 
            e.id_evento,
            e.nombre,
            e.descripcion,
            e.fecha,
            e.hora,
            e.lugar,
            e.capacidad,
            e.asistencia,
            e.precio,
            e.acceso,
            e.imagen_url,
            e.alt_imagen,
            e.estado,
            e.creado_en,
            (e.capacidad - e.asistencia) AS disponibles
        FROM Eventos e
        WHERE e.id_creador = p_id_creador
        ORDER BY e.fecha DESC, e.hora DESC;
    END IF;
END//

DELIMITER ;


-- =====================================================
-- SP para crear un nuevo evento
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_crear_evento//

CREATE PROCEDURE sp_crear_evento(
    IN p_nombre VARCHAR(200),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_lugar VARCHAR(200),
    IN p_capacidad INT,
    IN p_precio DECIMAL(10,2),
    IN p_acceso ENUM('todos', 'solo_tec'),
    IN p_id_creador INT,
    IN p_imagen_url VARCHAR(500),
    IN p_alt_imagen VARCHAR(300),
    IN p_escuelas JSON, -- Array de IDs de escuelas: [1,2,3] o NULL si es 'todos'
    OUT p_result_code INT,
    OUT p_message VARCHAR(255),
    OUT p_id_evento INT
)
BEGIN
    DECLARE v_id_escuela INT;
    DECLARE v_escuelas_count INT;
    DECLARE v_index INT DEFAULT 0;
    
    -- Inicializar variables
    SET p_result_code = 0;
    SET p_message = 'Evento creado exitosamente';
    SET p_id_evento = NULL;
    
    -- Validar que el creador existe y es administrador
    IF NOT EXISTS(
        SELECT 1 FROM Usuarios u 
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = p_id_creador AND r.tipo_rol = 'Administrador'
    ) THEN
        SET p_result_code = 1;
        SET p_message = 'El usuario no existe o no es administrador';
    
    -- Validar datos básicos
    ELSEIF LENGTH(TRIM(p_nombre)) < 5 THEN
        SET p_result_code = 2;
        SET p_message = 'El nombre del evento debe tener al menos 5 caracteres';
        
    ELSEIF LENGTH(TRIM(p_descripcion)) < 20 THEN
        SET p_result_code = 3;
        SET p_message = 'La descripción debe tener al menos 20 caracteres';
        
    ELSEIF p_fecha < CURDATE() THEN
        SET p_result_code = 4;
        SET p_message = 'La fecha del evento no puede ser anterior a hoy';
        
    ELSEIF p_capacidad < 1 OR p_capacidad > 1000 THEN
        SET p_result_code = 5;
        SET p_message = 'La capacidad debe estar entre 1 y 1000';
        
    ELSEIF p_precio < 0 THEN
        SET p_result_code = 6;
        SET p_message = 'El precio no puede ser negativo';
    
    -- Validar que si el acceso es 'solo_tec' se incluyan escuelas
    ELSEIF p_acceso = 'solo_tec' AND (p_escuelas IS NULL OR JSON_LENGTH(p_escuelas) = 0) THEN
        SET p_result_code = 7;
        SET p_message = 'Debe seleccionar al menos una escuela para eventos exclusivos del TEC';
        
    ELSE
        -- Crear el evento
        INSERT INTO Eventos (
            nombre,
            descripcion,
            fecha,
            hora,
            lugar,
            capacidad,
            asistencia,
            precio,
            acceso,
            id_creador,
            imagen_url,
            alt_imagen,
            estado
        ) VALUES (
            TRIM(p_nombre),
            TRIM(p_descripcion),
            p_fecha,
            p_hora,
            TRIM(p_lugar),
            p_capacidad,
            0, -- asistencia inicial en 0
            p_precio,
            p_acceso,
            p_id_creador,
            p_imagen_url,
            TRIM(p_alt_imagen),
            'disponible'
        );
        
        SET p_id_evento = LAST_INSERT_ID();
        
        -- Si el acceso es 'solo_tec' y hay escuelas, insertarlas en Eventos_Escuelas
        IF p_acceso = 'solo_tec' AND p_escuelas IS NOT NULL AND JSON_LENGTH(p_escuelas) > 0 THEN
            SET v_escuelas_count = JSON_LENGTH(p_escuelas);
            SET v_index = 0;
            
            WHILE v_index < v_escuelas_count DO
                SET v_id_escuela = JSON_EXTRACT(p_escuelas, CONCAT('$[', v_index, ']'));
                
                -- Insertar relación evento-escuela
                INSERT INTO Eventos_Escuelas (id_evento, id_escuela)
                VALUES (p_id_evento, v_id_escuela);
                
                SET v_index = v_index + 1;
            END WHILE;
        END IF;
    END IF;
    
END//

DELIMITER ;


-- =============================================
-- SP para actualizar un evento existente
-- =============================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_actualizar_evento//

CREATE PROCEDURE sp_actualizar_evento(
    IN p_id_evento INT,
    IN p_nombre VARCHAR(200),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_lugar VARCHAR(200),
    IN p_capacidad INT,
    IN p_precio DECIMAL(10,2),
    IN p_imagen_url VARCHAR(500),
    IN p_alt_imagen VARCHAR(300),
    OUT p_result_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_asistencia_actual INT;
    
    -- Inicializar variables
    SET p_result_code = 0;
    SET p_message = 'Evento actualizado exitosamente';
    
    -- Validar que el evento existe
    IF NOT EXISTS(SELECT 1 FROM Eventos WHERE id_evento = p_id_evento) THEN
        SET p_result_code = 1;
        SET p_message = 'El evento no existe';
    
    -- Validar datos básicos
    ELSEIF LENGTH(TRIM(p_nombre)) < 5 THEN
        SET p_result_code = 2;
        SET p_message = 'El nombre del evento debe tener al menos 5 caracteres';
        
    ELSEIF LENGTH(TRIM(p_descripcion)) < 20 THEN
        SET p_result_code = 3;
        SET p_message = 'La descripción debe tener al menos 20 caracteres';
        
    ELSEIF p_fecha < CURDATE() THEN
        SET p_result_code = 4;
        SET p_message = 'La fecha del evento no puede ser anterior a hoy';
        
    ELSEIF p_capacidad < 1 OR p_capacidad > 1000 THEN
        SET p_result_code = 5;
        SET p_message = 'La capacidad debe estar entre 1 y 1000';
        
    ELSEIF p_precio < 0 THEN
        SET p_result_code = 6;
        SET p_message = 'El precio no puede ser negativo';
    
    ELSE
        -- Obtener asistencia actual para validar capacidad
        SELECT asistencia INTO v_asistencia_actual
        FROM Eventos
        WHERE id_evento = p_id_evento;
        
        -- Validar que la nueva capacidad no sea menor a la asistencia actual
        IF p_capacidad < v_asistencia_actual THEN
            SET p_result_code = 7;
            SET p_message = CONCAT('La capacidad no puede ser menor a la asistencia actual (', v_asistencia_actual, ')');
        ELSE
            -- Actualizar el evento
            UPDATE Eventos
            SET 
                nombre = TRIM(p_nombre),
                descripcion = TRIM(p_descripcion),
                fecha = p_fecha,
                hora = p_hora,
                lugar = TRIM(p_lugar),
                capacidad = p_capacidad,
                precio = p_precio,
                imagen_url = p_imagen_url,
                alt_imagen = TRIM(p_alt_imagen),
                estado = CASE 
                    WHEN p_capacidad <= v_asistencia_actual THEN 'agotado'
                    ELSE 'disponible'
                END
            WHERE id_evento = p_id_evento;
        END IF;
    END IF;
    
END//

DELIMITER ;


-- =============================================
-- SP para eliminar un evento (soft delete)
-- =============================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_eliminar_evento//

CREATE PROCEDURE sp_eliminar_evento(
    IN p_id_evento INT,
    OUT p_result_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    
    -- Inicializar variables
    SET p_result_code = 0;
    SET p_message = 'Evento eliminado exitosamente';
    
    -- Validar que el evento existe
    IF NOT EXISTS(SELECT 1 FROM Eventos WHERE id_evento = p_id_evento) THEN
        SET p_result_code = 1;
        SET p_message = 'El evento no existe';
    ELSE
        -- Obtener el estado actual del evento
        SELECT estado INTO v_estado_actual
        FROM Eventos
        WHERE id_evento = p_id_evento;
        
        -- Validar que el evento no esté ya cancelado
        IF v_estado_actual = 'cancelado' THEN
            SET p_result_code = 2;
            SET p_message = 'El evento ya se encuentra cancelado';
        ELSE
            -- Soft delete: cambiar estado a 'cancelado'
            UPDATE Eventos
            SET estado = 'cancelado'
            WHERE id_evento = p_id_evento;
        END IF;
    END IF;
    
END//

DELIMITER ;
