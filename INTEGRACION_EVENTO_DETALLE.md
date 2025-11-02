# Integración evento.html con eventos.html - Documentación

## 📋 Resumen de Cambios

Se ha implementado la integración completa entre `eventos.html` y `evento.html` para que funcione correctamente con la base de datos y la API del backend.

## 🆕 Archivos Creados

### Backend

1. **`backend/src/controllers/evento.controller.js`**
   - Controlador para manejar un evento individual
   - Funciones:
     - `getEventoDetalle(id)`: Obtiene detalles completos de un evento
     - `crearReserva()`: Crea una reserva para un evento
     - `verificarReserva()`: Verifica si un usuario ya tiene reserva

2. **`backend/src/routes/evento.routes.js`**
   - Rutas para el evento individual
   - Endpoints:
     - `GET /api/evento/:id` - Obtener detalles del evento
     - `POST /api/evento/reserva` - Crear reserva
     - `GET /api/evento/verificar-reserva` - Verificar reserva existente

### Frontend

3. **`frontend/viewsGenerales/evento.js`**
   - Lógica completa para la página de detalle del evento
   - Funciones principales:
     - `cargarEvento(id)`: Carga el evento desde la API
     - `renderizarEvento()`: Renderiza los datos en el DOM
     - `handleReservation()`: Maneja el proceso de reserva
     - `verificarReservaExistente()`: Verifica si ya existe una reserva

## 📝 Archivos Modificados

### Backend

1. **`backend/src/app.js`**
   - Agregada importación de `evento.routes.js`
   - Agregada ruta `/api/evento` al middleware

### Frontend

2. **`frontend/viewsGenerales/evento.html`**
   - Removido código JavaScript embebido
   - Agregada referencia a `evento.js`
   - Agregada referencia a `auth.js`

## 🔄 Flujo de Funcionamiento

### 1. Desde eventos.html a evento.html

```
eventos.html
    ↓ (click en card o botón "Reservar cupo")
    ↓ eventos.js: manejarReserva(eventoId)
    ↓ window.location.href = `evento.html?id=${eventoId}`
    ↓
evento.html?id=123
    ↓ evento.js: inicializarEvento()
    ↓ lee parámetro 'id' de la URL
    ↓ GET /api/evento/123
    ↓ renderiza datos del evento
    ↓ verifica reserva existente
```

### 2. Proceso de Reserva

```
evento.html
    ↓ usuario hace click en "Confirmar Reserva"
    ↓ evento.js: handleReservation()
    ↓ POST /api/evento/reserva
    ↓ body: { id_evento, id_usuario }
    ↓
Backend (evento.controller.js)
    ↓ verificar que evento existe
    ↓ verificar cupos disponibles
    ↓ verificar que usuario no tenga reserva
    ↓ crear reserva en BD (tabla Reservas)
    ↓ incrementar asistencia del evento
    ↓ actualizar estado si se agotó
    ↓ return { success: true, reserva }
    ↓
Frontend
    ↓ mostrar mensaje de éxito
    ↓ actualizar disponibilidad
    ↓ deshabilitar botón
```

## 🗄️ Estructura de Base de Datos Utilizada

### Tabla: Eventos
```sql
CREATE TABLE Eventos (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  lugar VARCHAR(200) NOT NULL,
  capacidad INT NOT NULL,
  asistencia INT DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0,
  acceso ENUM('todos', 'solo_tec') NOT NULL,
  id_creador INT NOT NULL,
  imagen_url VARCHAR(500),
  alt_imagen VARCHAR(300),
  estado ENUM('disponible', 'agotado', 'cancelado') DEFAULT 'disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: Reservas
```sql
CREATE TABLE Reservas (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_evento INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad BETWEEN 1 AND 2),
  metodo_pago ENUM('efectivo', 'tarjeta') NOT NULL,
  estado ENUM('Pendiente', 'Confirmada', 'Cancelada') DEFAULT 'Pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento)
);
```

## 🔌 API Endpoints

### GET /api/evento/:id
**Descripción:** Obtiene los detalles completos de un evento

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Conferencia de Tecnología",
    "descripcion": "Una conferencia sobre...",
    "fecha": "2024-09-12",
    "hora": "10:00:00",
    "lugar": "Auditorio D3, Campus TEC",
    "capacidad": 200,
    "asistencia": 50,
    "costo": 0,
    "acceso": "todos",
    "img": "../images/auditorioD3.webp",
    "alt": "Imagen del evento",
    "estado": "disponible",
    "disponibles": 150,
    "fechaCompleta": "2024-09-12",
    "fechaFormateada": "12 de septiembre · 10:00 a.m.",
    "creador_nombre": "Admin"
  }
}
```

### POST /api/evento/reserva
**Descripción:** Crea una reserva para un evento

**Body:**
```json
{
  "id_evento": 1,
  "id_usuario": 123
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id_reserva": 456,
    "id_evento": 1,
    "id_usuario": 123
  }
}
```

### GET /api/evento/verificar-reserva
**Descripción:** Verifica si un usuario ya tiene una reserva

**Query Params:**
- `id_evento`: ID del evento
- `id_usuario`: ID del usuario

**Respuesta:**
```json
{
  "success": true,
  "tieneReserva": true,
  "reserva": {
    "id_reserva": 456,
    "estado": "Confirmada",
    "fecha_reserva": "2024-11-01T10:30:00.000Z"
  }
}
```

## 🧪 Instrucciones de Prueba

### 1. Iniciar el Backend
```bash
cd backend
npm install
npm start
```

### 2. Abrir el Frontend
- Abrir `eventos.html` en el navegador
- Asegurarse de tener una sesión iniciada (datos en sessionStorage)

### 3. Probar la Navegación
1. En `eventos.html`, hacer click en cualquier tarjeta de evento
2. Debería redirigir a `evento.html?id=X`
3. La página debería cargar los detalles del evento desde la API

### 4. Probar la Reserva
1. En `evento.html`, verificar que aparezcan los datos del evento
2. Hacer click en "Confirmar Reserva"
3. Debería:
   - Mostrar spinner de carga
   - Crear la reserva en la BD
   - Mostrar mensaje de éxito
   - Actualizar la disponibilidad
   - Deshabilitar el botón

### 5. Verificar Estados del Botón
El botón de reserva debe cambiar según:
- **Evento pasado:** "Evento finalizado" (deshabilitado)
- **Sin cupos:** "Sin cupos disponibles" (deshabilitado)
- **Evento cancelado:** "Evento cancelado" (deshabilitado)
- **Ya tiene reserva:** "Ya tienes una reserva" (deshabilitado)
- **Disponible:** "Confirmar Reserva" (habilitado)

## 📱 SessionStorage Requerido

El usuario debe estar autenticado y tener los siguientes datos en sessionStorage:

```javascript
sessionStorage.setItem('id_usuario', '123');
sessionStorage.setItem('nombre', 'Juan');
sessionStorage.setItem('apellido', 'Pérez');
sessionStorage.setItem('correo', 'juan@tec.ac.cr');
sessionStorage.setItem('tipo_rol', 'estudiante');
sessionStorage.setItem('escuela', 'Ingeniería en Computación');
```

**Nota:** El código concatena automáticamente `nombre` + `apellido` para mostrar el nombre completo.

## ⚠️ Validaciones Implementadas

### Backend
- ✅ Evento existe
- ✅ Evento tiene cupos disponibles
- ✅ Evento está en estado "disponible"
- ✅ Usuario no tiene reserva previa
- ✅ Transacción atómica (reserva + incremento asistencia + actualización estado)

### Frontend
- ✅ Usuario autenticado (tiene id_usuario)
- ✅ Evento cargado correctamente
- ✅ Fecha del evento no ha pasado
- ✅ Hay cupos disponibles
- ✅ Estado del evento es válido
- ✅ Manejo de errores con mensajes descriptivos

## 🎨 Mejoras de UX

- **Loading states:** Spinner mientras se procesa la reserva
- **Feedback visual:** Botón cambia de color según estado
- **Efectos de éxito:** Animación de ondas cuando se confirma
- **Toast notifications:** Notificación de confirmación enviada
- **Screen reader support:** Anuncios para lectores de pantalla
- **Actualización en tiempo real:** Disponibilidad se actualiza después de reservar

## 🔍 Debugging

### Ver logs en consola del navegador:
```javascript
// Al cargar el evento
🚀 Inicializando página de evento...
👤 Usuario cargado: {id, nombre, email, ...}
🌐 Cargando evento: 123
✅ Evento cargado: {id, titulo, ...}
```

### Ver logs en consola del servidor:
```
📥 Parámetros recibidos: { tipo_rol, id_escuela }
✅ Eventos obtenidos: 5
```

## 📚 Dependencias

- **Bootstrap 5.3.3:** UI components y estilos
- **Bootstrap Icons:** Iconografía
- **Fetch API:** Peticiones HTTP
- **Express.js:** Backend server
- **MySQL2:** Conexión a base de datos

## 🚀 Próximas Mejoras Sugeridas

1. Agregar selector de cantidad de entradas (1-2)
2. Agregar selector de método de pago
3. Implementar cancelación de reservas
4. Agregar sección "Mis Reservas"
5. Enviar emails de confirmación reales
6. Agregar calendario de eventos
7. Implementar sistema de recordatorios
8. Agregar valoraciones y comentarios de eventos

---

**Fecha de implementación:** Noviembre 2024  
**Autor:** GitHub Copilot  
**Versión:** 1.0
