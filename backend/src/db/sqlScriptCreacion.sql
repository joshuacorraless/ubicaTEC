



create database ubicaTEC;

use ubicaTEC;

CREATE TABLE Roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  tipo_rol ENUM('Administrador', 'Estudiante', 'Visitante') NOT NULL
);

CREATE TABLE EscuelasTEC (
  id_escuela INT AUTO_INCREMENT PRIMARY KEY,
  nombre_escuela VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE Usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL, -- encriptada con bcrypt
  id_rol INT NOT NULL,
  id_escuela INT NULL, -- Solo para estudiantes
  codigo_admin VARCHAR(50) NULL, -- Solo para administradores
  FOREIGN KEY (id_rol) REFERENCES Roles(id_rol),
  FOREIGN KEY (id_escuela) REFERENCES EscuelasTEC(id_escuela)
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
  acceso ENUM('todos', 'solo_tec') NOT NULL, -- todos (incluye visitantes), solo_tec (admins y estudiantes)
  id_creador INT NOT NULL, -- Admin que creó el evento
  imagen_url VARCHAR(500), -- link Cloudinary o ruta local
  alt_imagen VARCHAR(300), -- Texto alternativo para accesibilidad
  estado ENUM('disponible', 'agotado', 'cancelado') DEFAULT 'disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_creador) REFERENCES Usuarios(id_usuario)
);

-- Tabla intermedia para relación muchos a muchos entre Eventos y Escuelas
CREATE TABLE Eventos_Escuelas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_evento INT NOT NULL,
  id_escuela INT NOT NULL,
  FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento) ON DELETE CASCADE,
  FOREIGN KEY (id_escuela) REFERENCES EscuelasTEC(id_escuela),
  UNIQUE KEY unique_evento_escuela (id_evento, id_escuela)
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



