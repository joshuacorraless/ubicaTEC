


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
