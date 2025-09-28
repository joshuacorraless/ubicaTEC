-- Poblado de Datos

use ubicatec;

INSERT INTO Roles (tipo_rol) VALUES 
('Administrador'),
('Estudiante'),
('Visitante');

INSERT INTO Usuarios (nombre, apellido, correo, usuario, contrasena, id_rol) VALUES
('Carlos Andrés', 'Abarca Mora', 'c.abarca.1@estudiantec.cr', 'charlieabark', 'Ubica,1234', 2),
('Joshua', 'Corrales Retana', 'j.retana.1@estudiantec.cr', 'joshuacorrales_', 'Ubica,1234', 2),
('Dilan', 'Hernandez', 'd.hernandez.1@estudiantec.cr', '_dyyylannn', 'Ubica,1234', 2),
('Victor', 'Garro Abarca', 'v.garro.1@algoritmos.cr', 'victorabark', 'Ubica,1234', 1),
('Mariel', 'Abarca Marín', 'marielmarin@gmail.com', 'marielmarin', 'Ubica,1234', 3);

INSERT INTO Eventos (nombre, descripcion, fecha, hora, lugar, capacidad, precio, acceso, imagen_url) VALUES
('Hackaton IEEE 2025',
'Bienvenido al evento del año para programadores competitivos, proporcionado por la IEEE se llevará a cabo en el TEC a las 12:00am',
'2025-12-12',
'12:00:00',
'Cartago, D3, Auditorio',
120,
0,
'tec',
''
),
('Festival Gastronómico TEC',
'Evento cultural con muestra de platos tradicionales de todas las provincias de Costa Rica',
'2025-08-20',
'10:30:00',
'Cartago, Comedor Institucional',
200,
5000,
'tec',
''
),
('Encuentro de Investigación Académica',
'Presentación de proyectos interdisciplinarios con invitados internacionales',
'2025-05-15',
'08:00:00',
'Cartago, Learning Commons',
80,
0,
'todos',
''
);