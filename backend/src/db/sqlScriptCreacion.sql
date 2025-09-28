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
  precio DECIMAL(10,2) DEFAULT 0, -- 0 = Gratis
  acceso ENUM('tec', 'todos') NOT NULL, -- Solo TEC o TEC+Visitantes
  imagen_url VARCHAR(500), -- link Cloudinary
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

