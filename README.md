<div align="center">

# ubicaTEC

<b>Una plataforma web para descubrir, administrar y reservar eventos dentro del ecosistema TEC</b>

<br>

<img alt="Node.js" src="https://img.shields.io/badge/Node.js-1F8A70?style=for-the-badge&logo=node.js&logoColor=white">
<img alt="Express" src="https://img.shields.io/badge/Express-27374D?style=for-the-badge&logo=express&logoColor=white">
<img alt="MySQL" src="https://img.shields.io/badge/MySQL-176B87?style=for-the-badge&logo=mysql&logoColor=white">
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F2BE22?style=for-the-badge&logo=javascript&logoColor=1f1f1f">
<img alt="Railway" src="https://img.shields.io/badge/Railway-5B4B8A?style=for-the-badge&logo=railway&logoColor=white">

</div>

<br>

## Una lectura rapida del proyecto

ubicaTEC nace como una prueba aplicada de desarrollo web full stack, pensada para resolver una necesidad concreta dentro del contexto universitario. La aplicacion centraliza eventos, diferencia la experiencia segun el tipo de usuario y permite que una persona encuentre actividades relevantes sin navegar por informacion dispersa.

El repositorio no presenta solo pantallas estaticas. Tiene una API en Node.js con Express, persistencia en MySQL, procedimientos almacenados para reglas de negocio, integracion con Cloudinary para imagenes de eventos, confirmaciones por correo mediante SendGrid y un frontend modular construido con HTML, CSS y JavaScript.

La aplicacion tambien tuvo una etapa de despliegue real en Railway. Ese hosting formo parte del proyecto porque se requeria que la solucion estuviera disponible en la nube durante su evaluacion y uso. Actualmente esa etapa ya cumplio su funcion, pero el codigo conserva la evidencia de una aplicacion preparada para ejecutarse fuera del entorno local.

<br>

## Que problema resuelve

En una comunidad universitaria, la informacion de eventos suele fragmentarse entre correos, grupos, afiches y publicaciones aisladas. ubicaTEC propone una experiencia mas ordenada.

<table>
  <tr>
    <td><b>Visitantes</b></td>
    <td>Exploran eventos abiertos al publico general.</td>
  </tr>
  <tr>
    <td><b>Estudiantes</b></td>
    <td>Ven eventos publicos y actividades relacionadas con su escuela.</td>
  </tr>
  <tr>
    <td><b>Administradores</b></td>
    <td>Crean, editan, listan y cancelan eventos desde vistas especializadas.</td>
  </tr>
</table>

El sistema filtra el catalogo por rol, escuela, acceso y disponibilidad. Tambien controla reservas para evitar duplicados y actualiza el estado de los eventos cuando se agotan los cupos.

<br>

## La experiencia construida

<table>
  <tr>
    <td width="33%"><b>Acceso y registro</b></td>
    <td>Registro de usuarios con roles de visitante, estudiante y administrador. Los estudiantes se asocian a una escuela del TEC y los administradores requieren codigo interno.</td>
  </tr>
  <tr>
    <td><b>Catalogo de eventos</b></td>
    <td>Listado dinamico con busqueda, filtros, disponibilidad, costo, fecha, lugar e imagen representativa.</td>
  </tr>
  <tr>
    <td><b>Detalle y reserva</b></td>
    <td>Vista individual del evento, verificacion de reserva existente y confirmacion de cupo.</td>
  </tr>
  <tr>
    <td><b>Panel administrativo</b></td>
    <td>Gestion de eventos creados por administradores, carga de imagenes, seleccion de escuelas y cancelacion logica.</td>
  </tr>
  <tr>
    <td><b>Perfil de usuario</b></td>
    <td>Consulta y actualizacion de datos personales con validaciones contra la base de datos.</td>
  </tr>
  <tr>
    <td><b>Asistente integrado</b></td>
    <td>Widget de chatbot reutilizable con respuestas contextualizadas para vistas generales y administrativas.</td>
  </tr>
</table>

<br>

## Arquitectura del repositorio

<table>
  <tr>
    <td><b>backend/src</b></td>
    <td>Servidor Express, rutas REST, controladores, conexion MySQL, middleware de subida y configuracion de Cloudinary.</td>
  </tr>
  <tr>
    <td><b>backend/src/db</b></td>
    <td>Modelo relacional, datos de llenado, procedimientos almacenados y documento de modelado.</td>
  </tr>
  <tr>
    <td><b>frontend/viewsGenerales</b></td>
    <td>Pantallas de login, registro, perfil, listado de eventos y detalle de evento.</td>
  </tr>
  <tr>
    <td><b>frontend/viewsAdministrador</b></td>
    <td>Flujo administrativo para crear, editar, listar y probar la integracion del chatbot.</td>
  </tr>
  <tr>
    <td><b>frontend/viewsChatbot</b></td>
    <td>Widget reusable del asistente, estilos, plantilla HTML e integracion universal.</td>
  </tr>
  <tr>
    <td><b>frontend/images</b></td>
    <td>Recursos visuales usados por la interfaz para ubicar la experiencia en el entorno TEC.</td>
  </tr>
</table>

<br>

## Decisiones tecnicas que vale la pena notar

<table>
  <tr>
    <td><b>Reglas cerca de los datos</b></td>
    <td>La base MySQL concentra validaciones importantes mediante procedimientos almacenados para login, creacion de usuarios, eventos filtrados, reservas y operaciones administrativas.</td>
  </tr>
  <tr>
    <td><b>Separacion por rol</b></td>
    <td>La API entrega eventos segun el rol autenticado y la escuela asociada, lo que evita cargar todo el catalogo en el cliente para luego ocultarlo.</td>
  </tr>
  <tr>
    <td><b>Imagenes externas</b></td>
    <td>La creacion de eventos permite subir imagenes a Cloudinary mediante streams en memoria con Multer y Streamifier.</td>
  </tr>
  <tr>
    <td><b>Correo no bloqueante</b></td>
    <td>La reserva responde al usuario de inmediato y deja el envio de confirmacion por SendGrid como trabajo asincrono.</td>
  </tr>
  <tr>
    <td><b>Cancelacion logica</b></td>
    <td>Eliminar un evento cambia su estado a cancelado, conservando el historial operativo.</td>
  </tr>
</table>

<br>

## Tecnologias

<table>
  <tr>
    <td><b>Capa</b></td>
    <td><b>Herramientas</b></td>
  </tr>
  <tr>
    <td>Servidor</td>
    <td>Node.js, Express, CORS, dotenv</td>
  </tr>
  <tr>
    <td>Base de datos</td>
    <td>MySQL, mysql2, procedimientos almacenados</td>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>HTML, CSS, JavaScript, Bootstrap Icons</td>
  </tr>
  <tr>
    <td>Imagenes</td>
    <td>Cloudinary, Multer, Streamifier</td>
  </tr>
  <tr>
    <td>Correo</td>
    <td>SendGrid</td>
  </tr>
  <tr>
    <td>Nube</td>
    <td>Railway durante la etapa activa del proyecto</td>
  </tr>
</table>

<br>

## Modelo de datos

El modelo se apoya en seis entidades principales.

<table>
  <tr>
    <td><b>Roles</b></td>
    <td>Administrador, Estudiante y Visitante.</td>
  </tr>
  <tr>
    <td><b>EscuelasTEC</b></td>
    <td>Catalogo de escuelas para segmentar eventos institucionales.</td>
  </tr>
  <tr>
    <td><b>Usuarios</b></td>
    <td>Datos personales, credenciales, rol y relacion opcional con escuela.</td>
  </tr>
  <tr>
    <td><b>Eventos</b></td>
    <td>Informacion publica del evento, capacidad, asistencia, precio, acceso, imagen y estado.</td>
  </tr>
  <tr>
    <td><b>Eventos_Escuelas</b></td>
    <td>Relacion muchos a muchos para eventos exclusivos de una o varias escuelas.</td>
  </tr>
  <tr>
    <td><b>Reservas</b></td>
    <td>Registro de cupos confirmados por usuario y evento.</td>
  </tr>
</table>

<br>

## Ejecucion local

Primero se instalan las dependencias desde la raiz.

```bash
npm install
```

Luego se prepara MySQL con los scripts incluidos en `backend/src/db`.

```sql
source backend/src/db/sqlScriptCreacion.sql
source backend/src/db/sqlScriptLlenado.sql
source backend/src/db/storedProcedures.sql
```

Despues se crea un archivo `.env` en la raiz con las variables que usa el backend.

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contrasena
DB_NAME=ubicaTEC
DB_PORT=3306
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
SENDGRID_API_KEY=tu_sendgrid_key
EMAIL_USER=correo_remitente
NODE_ENV=development
```

Finalmente se levanta el servidor.

```bash
npm run dev
```

La API queda expuesta en el puerto `3000` y Express sirve los archivos estaticos del frontend desde la carpeta `frontend`.

<br>

## Rutas principales de la API

<table>
  <tr>
    <td><b>Metodo</b></td>
    <td><b>Ruta</b></td>
    <td><b>Uso</b></td>
  </tr>
  <tr>
    <td>POST</td>
    <td><code>/api/login</code></td>
    <td>Validar credenciales y devolver datos de sesion.</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><code>/api/usuarios/registro</code></td>
    <td>Crear usuarios segun rol.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/eventos/filtrados</code></td>
    <td>Obtener eventos visibles para rol y escuela.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/evento/{id}</code></td>
    <td>Consultar el detalle completo de un evento.</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><code>/api/evento/reserva</code></td>
    <td>Crear reserva y disparar correo de confirmacion.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/evento/verificar-reserva</code></td>
    <td>Evitar reservas duplicadas.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/perfil/{id_usuario}</code></td>
    <td>Consultar perfil.</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td><code>/api/perfil/{id_usuario}</code></td>
    <td>Actualizar perfil.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/administradores/eventos</code></td>
    <td>Listar eventos de un administrador.</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><code>/api/administradores/eventos</code></td>
    <td>Crear evento con imagen.</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td><code>/api/administradores/eventos/{id}</code></td>
    <td>Actualizar evento.</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td><code>/api/administradores/eventos/{id}</code></td>
    <td>Cancelar evento mediante cambio de estado.</td>
  </tr>
</table>

<br>

## Estado de nube

Durante la etapa activa del proyecto, ubicaTEC estuvo desplegada en Railway para cumplir el requerimiento de disponibilidad en la nube. Ese despliegue permitio validar la comunicacion entre frontend, API, base de datos, carga de imagenes y envio de correos en un entorno externo al equipo local.

Hoy el repositorio queda como evidencia tecnica del desarrollo y de esa etapa de despliegue. Si se desea reactivar la aplicacion, el camino natural es volver a configurar las variables de entorno, provisionar MySQL y publicar el servicio Node.js en Railway u otra plataforma compatible.

<br>


