


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
('Victor', 'Garro Abarca', 'v.garro.1@tec.ac.cr', 'victorabark', 'Ubica,1234', 1, NULL, '777'), -- Admin
('Mariel', 'Abarca Marín', 'marielmarin@gmail.com', 'marielmarin', 'Ubica,1234', 3, NULL, NULL); -- Visitante

INSERT INTO Eventos (nombre, descripcion, fecha, hora, lugar, capacidad, asistencia, precio, acceso, id_creador, imagen_url, alt_imagen, estado) VALUES
(
  'Conferencia de Tecnología e Innovación',
  'Una conferencia sobre las últimas tendencias en inteligencia artificial, ciberseguridad y desarrollo de software, organizada por la Escuela de Ingeniería en Computación.',
  '2025-11-12',
  '10:00:00',
  'Auditorio Edificio D3',
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
  '2025-11-15',
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
  '2025-12-01',
  '09:00:00',
  'Learning Commons',
  100,
  11,
  0,
  'solo_tec',
  4, -- Creado por Victor (admin)
  '../images/laboratorioComputacion.jpg',
  'Hackathon en Learning Commons',
  'disponible'
),
(
  'Recital Musical TEC',
  'Presentación de música clásica y contemporánea por estudiantes de música del TEC.',
  '2025-11-20',
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
  '2025-11-25',
  '09:00:00',
  'Auditorio Edificio D3',
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
  '2025-12-20',
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
  'Evento tecnológico organizado por IBM enfocado en computación en la nube y IA.',
  '2026-01-15',
  '14:00:00',
  'Biblioteca José Figueres Ferrer',
  150,
  45,
  0,
  'solo_tec', -- Corregido: debe ser 'todos' o 'solo_tec'
  4, -- Creado por Victor (admin)
  '../images/auditorioD3.webp',
  'Conferencia IBM sobre tecnología',
  'disponible'
);

-- Asignar escuelas SOLO a eventos con acceso 'solo_tec'
INSERT INTO Eventos_Escuelas (id_evento, id_escuela) VALUES
-- Evento 3: Hackathon (solo_tec) - Ing. Computación e Ing. Electrónica
(3, 4),
(3, 2),

-- Evento 7: IBM Conference (solo_tec) - Solo Ing. Computación
(7, 4);

-- Nota: Eventos con acceso='todos' (1, 2, 4, 5, 6) NO tienen escuelas asignadas
-- porque son para todo el público o todos los estudiantes
;

-- Insertar algunas reservas de ejemplo
INSERT INTO Reservas (id_usuario, id_evento, cantidad, metodo_pago, estado) VALUES
(1, 1, 1, 'efectivo', 'Confirmada'),     -- Carlos reserva Conferencia
(2, 1, 2, 'tarjeta', 'Confirmada'),      -- Joshua reserva Conferencia (2 entradas)
(3, 3, 1, 'efectivo', 'Confirmada'),     -- Dilan reserva Hackathon
(5, 4, 1, 'tarjeta', 'Confirmada'),      -- Mariel (visitante) reserva Recital
(1, 5, 1, 'efectivo', 'Pendiente'),      -- Carlos reserva Seminario (pendiente)
(2, 6, 2, 'tarjeta', 'Confirmada');      -- Joshua reserva Festival