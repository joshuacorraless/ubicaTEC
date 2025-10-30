create database ubicaTEC;

use ubicaTEC;

CREATE TABLE Roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  tipo_rol ENUM('Administrador', 'Estudiante', 'Visitante') NOT NULL
);

CREATE TABLE Usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL, -- encriptada con bcrypt
  id_rol INT NOT NULL,
  carrera VARCHAR(200) NULL, -- Solo para estudiantes
  codigo_admin VARCHAR(50) NULL, -- Solo para administradores
  FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

CREATE TABLE Eventos (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  lugar VARCHAR(200) NOT NULL,
  capacidad INT NOT NULL,
  asistencia INT DEFAULT 0, -- Número actual de asistentes
  precio DECIMAL(10,2) DEFAULT 0, -- 0 = Gratis
  acceso ENUM('tec', 'todos') NOT NULL, -- Solo TEC o TEC+Visitantes
  imagen_url VARCHAR(500), -- link Cloudinary o ruta local
  alt_imagen VARCHAR(300), -- Texto alternativo para accesibilidad
  estado ENUM('disponible', 'agotado', 'cancelado') DEFAULT 'disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Reservas (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_evento INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad BETWEEN 1 AND 2), -- máx 2 entradas
  metodo_pago ENUM('efectivo', 'tarjeta') NOT NULL,
  estado ENUM('Pendiente', 'Confirmada', 'Cancelada') DEFAULT 'Pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento)
);

drop procedure sp_verificar_login;

select * from usuarios;

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
        
        -- Retornar ID del usuario, tipo de rol y carrera
        SELECT u.id_usuario, r.tipo_rol, u.carrera
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        WHERE u.correo = inCorreo
        LIMIT 1;
    END IF;
    
END//

DELIMITER ;