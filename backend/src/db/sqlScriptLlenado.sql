


-- Poblado de Datos

use ubicatec;

INSERT INTO Roles (tipo_rol) VALUES 
('Administrador'),
('Estudiante'),
('Visitante');

-- Insertar las escuelas del TEC
INSERT INTO EscuelasTEC (nombre_escuela) VALUES 
('Escuela de Administración de Empresas'),
('Escuela de Ingeniería Electrónica'),
('Escuela de Física'),
('Escuela de Ingeniería en Computación'),
('Escuela de Ingeniería en Producción Industrial'),
('Todas');

INSERT INTO Usuarios (nombre, apellido, correo, usuario, contrasena, id_rol, id_escuela, codigo_admin) VALUES
('Carlos Andrés', 'Abarca Mora', 'c.abarca.1@estudiantec.cr', 'charlieabark', 'Ubica,1234', 2, 4, NULL), -- Ing. Computación
('Joshua', 'Corrales Retana', 'j.retana.1@estudiantec.cr', 'joshuacorrales_', 'Ubica,1234', 2, 4, NULL), -- Ing. Computación
('Dilan', 'Hernandez', 'd.hernandez.1@estudiantec.cr', '_dyyylannn', 'Ubica,1234', 2, 1, NULL), -- Administración
('Victor', 'Garro Abarca', 'v.garro.1@tec.ac.cr', 'victorabark', 'Ubica,1234', 1, NULL, 'ADMIN-2024-001'), -- Admin
('Mariel', 'Abarca Marín', 'marielmarin@gmail.com', 'marielmarin', 'Ubica,1234', 3, NULL, NULL); -- Visitante

INSERT INTO Eventos (nombre, descripcion, fecha, hora, lugar, capacidad, asistencia, precio, acceso, id_creador, imagen_url, alt_imagen, estado) VALUES
(
  'Conferencia de Tecnología e Innovación',
  'Una conferencia sobre las últimas tendencias en inteligencia artificial, ciberseguridad y desarrollo de software, organizada por la Escuela de Ingeniería en Computación.',
  '2025-09-12',
  '10:00:00',
  'Auditorio D3',
  200,
  50,
  0,
  'todos',
  4, -- Creado por Victor (admin)
  '../images/auditorioD3.webp',
  'Conferencia de tecnología en el Auditorio D3',
  'disponible'
),
(
  'Taller de Desarrollo Web Moderno',
  'Aprende React, Node.js y las últimas tecnologías web en un taller práctico interactivo.',
  '2025-09-15',
  '14:00:00',
  'Learning Commons',
  150,
  150,
  0,
  'todos',
  4, -- Creado por Victor (admin)
  '../images/learningCommons.jpg',
  'Taller de desarrollo web en Learning Commons',
  'agotado'
),
(
  'Hackathon UbicaTEC 2025',
  '48 horas de código, creatividad e innovación tecnológica. Desafía tus habilidades y crea soluciones innovadoras.',
  '2025-10-01',
  '09:00:00',
  'Laboratorio de Computación',
  100,
  11,
  0,
  'solo_tec',
  4, -- Creado por Victor (admin)
  '../images/laboratorioComputacion.jpg',
  'Hackathon en laboratorio de computación',
  'disponible'
),
(
  'Recital Musical TEC',
  'Presentación de música clásica y contemporánea por estudiantes de música del TEC.',
  '2025-09-20',
  '18:00:00',
  'Restaurante Institucional',
  120,
  25,
  0,
  'todos',
  4, -- Creado por Victor (admin)
  '../images/restauranteInstitucional.webp',
  'Recital musical en restaurante institucional',
  'disponible'
),
(
  'Seminario de Investigación Académica',
  'Presentación de proyectos interdisciplinarios con invitados internacionales.',
  '2025-09-25',
  '09:00:00',
  'Auditorio D3',
  80,
  45,
  0,
  'todos',
  4, -- Creado por Victor (admin)
  '../images/auditorioD3.webp',
  'Seminario de investigación en Auditorio D3',
  'disponible'
),
(
  'Festival Gastronómico TEC',
  'Evento cultural con muestra de platos tradicionales de todas las provincias de Costa Rica.',
  '2025-08-20',
  '10:30:00',
  'Restaurante Institucional',
  200,
  78,
  5000,
  'todos',
  4, -- Creado por Victor (admin)
  '../images/restauranteInstitucional.webp',
  'Festival gastronómico en restaurante institucional',
  'disponible'
),
(
  'IBM Conference',
  'Evento de IBM.',
  '2025-08-20',
  '10:30:00',
  'Centro de investigación de IBM',
  200,
  78,
  5000,
  'Escuela de Ingeniería en Computación',
  4, -- Creado por Victor (admin)
  '../images/restauranteInstitucional.webp',
  'Festival gastronómico en restaurante institucional',
  'disponible'
);

-- Asignar escuelas a los eventos
INSERT INTO Eventos_Escuelas (id_evento, id_escuela) VALUES
-- Evento 1: Conferencia de Tecnología - Solo Ing. Computación
(1, 4),

-- Evento 2: Taller Web - Solo Ing. Computación
(2, 4),

-- Evento 3: Hackathon - Ing. Computación e Ing. Electrónica
(3, 4),
(3, 2),

-- Eventos 4, 5, 6: Sin registros = Para TODAS las escuelas
-- (Recital, Seminario, Festival)
;

-- Insertar algunas reservas de ejemplo
INSERT INTO Reservas (id_usuario, id_evento, cantidad, metodo_pago, estado) VALUES
(1, 1, 1, 'efectivo', 'Confirmada'),     -- Carlos reserva Conferencia
(2, 1, 2, 'tarjeta', 'Confirmada'),      -- Joshua reserva Conferencia (2 entradas)
(3, 3, 1, 'efectivo', 'Confirmada'),     -- Dilan reserva Hackathon
(5, 4, 1, 'tarjeta', 'Confirmada'),      -- Mariel (visitante) reserva Recital
(1, 5, 1, 'efectivo', 'Pendiente'),      -- Carlos reserva Seminario (pendiente)
(2, 6, 2, 'tarjeta', 'Confirmada');      -- Joshua reserva Festival