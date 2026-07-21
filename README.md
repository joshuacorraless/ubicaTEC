<div align="center">

<img width="96" alt="ubicaTEC" src="frontend/images/charlieLogo.png">

# ubicaTEC

<b>Sistema full stack para gestion, segmentacion y reserva de eventos universitarios</b>

<br>

<img alt="Node.js" src="https://img.shields.io/badge/Node.js-0B6E4F?style=for-the-badge&logo=node.js&logoColor=white">
<img alt="Express" src="https://img.shields.io/badge/Express-111827?style=for-the-badge&logo=express&logoColor=white">
<img alt="MySQL" src="https://img.shields.io/badge/MySQL-075985?style=for-the-badge&logo=mysql&logoColor=white">
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-B7791F?style=for-the-badge&logo=javascript&logoColor=111827">
<img alt="Cloudinary" src="https://img.shields.io/badge/Cloudinary-2563EB?style=for-the-badge&logo=cloudinary&logoColor=white">
<img alt="SendGrid" src="https://img.shields.io/badge/SendGrid-0EA5E9?style=for-the-badge&logo=sendgrid&logoColor=white">
<img alt="Railway" src="https://img.shields.io/badge/Railway-5B21B6?style=for-the-badge&logo=railway&logoColor=white">

</div>

<br>

<table>
  <tr>
    <td width="50%">
      <b>Producto</b>
      <br>
      Plataforma web para publicar, segmentar y reservar eventos dentro del entorno TEC.
    </td>
    <td width="50%">
      <b>Enfoque</b>
      <br>
      API REST, base relacional, procedimientos almacenados y servicios externos para imagenes y correo.
    </td>
  </tr>
  <tr>
    <td>
      <b>Usuarios</b>
      <br>
      Visitantes, estudiantes y administradores con experiencias diferenciadas.
    </td>
    <td>
      <b>Despliegue</b>
      <br>
      La aplicacion estuvo publicada en Railway durante la etapa activa del proyecto.
    </td>
  </tr>
</table>

<br>

## Producto

ubicaTEC organiza la vida de eventos universitarios en una experiencia unica. El sistema muestra actividades segun el perfil de la persona, permite reservar cupos, confirma asistencia por correo y entrega a los administradores un flujo directo para mantener el catalogo actualizado.

La solucion prioriza separacion por rol, consistencia en reglas de negocio, disponibilidad de cupos y una estructura preparada para operar fuera del entorno local.

<br>

## Capacidades

<table>
  <tr>
    <td width="28%"><b>Identidad y acceso</b></td>
    <td>Registro, login y perfiles para visitantes, estudiantes y administradores.</td>
  </tr>
  <tr>
    <td><b>Segmentacion academica</b></td>
    <td>Eventos publicos, eventos solo TEC y eventos asociados a escuelas especificas.</td>
  </tr>
  <tr>
    <td><b>Reservas</b></td>
    <td>Validacion de cupos, prevencion de reservas duplicadas y actualizacion de asistencia.</td>
  </tr>
  <tr>
    <td><b>Operacion administrativa</b></td>
    <td>Creacion, edicion, listado y cancelacion logica de eventos.</td>
  </tr>
  <tr>
    <td><b>Multimedia</b></td>
    <td>Carga de imagenes de eventos mediante Cloudinary y procesamiento en memoria.</td>
  </tr>
  <tr>
    <td><b>Asistencia integrada</b></td>
    <td>Widget de chatbot reutilizable con respuestas contextualizadas por vista.</td>
  </tr>
</table>

<br>

## Stack

<table>
  <tr>
    <td align="center" width="14%">
      <img alt="Node.js" width="42" src="https://cdn.simpleicons.org/nodedotjs/339933">
      <br>
      <b>Node.js</b>
      <br>
      Runtime
    </td>
    <td align="center" width="14%">
      <img alt="Express" width="42" src="https://cdn.simpleicons.org/express/111827">
      <br>
      <b>Express</b>
      <br>
      API REST
    </td>
    <td align="center" width="14%">
      <img alt="MySQL" width="42" src="https://cdn.simpleicons.org/mysql/4479A1">
      <br>
      <b>MySQL</b>
      <br>
      Datos y SP
    </td>
    <td align="center" width="14%">
      <img alt="JavaScript" width="42" src="https://cdn.simpleicons.org/javascript/F7DF1E">
      <br>
      <b>JavaScript</b>
      <br>
      Cliente
    </td>
    <td align="center" width="14%">
      <img alt="Bootstrap" width="42" src="https://cdn.simpleicons.org/bootstrap/7952B3">
      <br>
      <b>Bootstrap</b>
      <br>
      UI
    </td>
    <td align="center" width="14%">
      <img alt="Cloudinary" width="42" src="https://cdn.simpleicons.org/cloudinary/3448C5">
      <br>
      <b>Cloudinary</b>
      <br>
      Imagenes
    </td>
    <td align="center" width="14%">
      <img alt="SendGrid" width="42" src="https://cdn.simpleicons.org/sendgrid/51A9E3">
      <br>
      <b>SendGrid</b>
      <br>
      Correo
    </td>
  </tr>
  <tr>
    <td align="center" colspan="7">
      <img alt="Railway" width="42" src="https://cdn.simpleicons.org/railway/0B0D0E">
      <br>
      <b>Railway</b>
      <br>
      Hosting
    </td>
  </tr>
</table>

<br>

## Arquitectura

<table>
  <tr>
    <td width="32%"><b>Backend</b></td>
    <td><code>backend/src</code> concentra Express, rutas REST, controladores, conexion MySQL, middleware de carga y configuracion cloud.</td>
  </tr>
  <tr>
    <td><b>Base de datos</b></td>
    <td><code>backend/src/db</code> contiene creacion del modelo, llenado inicial, procedimientos almacenados y modelado en PDF.</td>
  </tr>
  <tr>
    <td><b>Cliente</b></td>
    <td><code>frontend/viewsGenerales</code> y <code>frontend/viewsAdministrador</code> separan experiencia publica, sesion, perfil, eventos y administracion sobre HTML, CSS, JavaScript y Bootstrap.</td>
  </tr>
  <tr>
    <td><b>Asistente</b></td>
    <td><code>frontend/viewsChatbot</code> encapsula estilos, plantilla e integracion reusable del chatbot.</td>
  </tr>
</table>

<br>

## Reglas de negocio

<table>
  <tr>
    <td><b>Rol primero</b></td>
    <td>La API filtra eventos antes de responder al cliente, usando rol y escuela como parametros de acceso.</td>
  </tr>
  <tr>
    <td><b>Datos consistentes</b></td>
    <td>MySQL valida login, registro, perfil, reservas, cupos y administracion mediante procedimientos almacenados.</td>
  </tr>
  <tr>
    <td><b>Reserva controlada</b></td>
    <td>Una reserva confirma cupo, incrementa asistencia y marca el evento como agotado cuando corresponde.</td>
  </tr>
  <tr>
    <td><b>Eliminacion responsable</b></td>
    <td>Los eventos no desaparecen del historial operativo, se cancelan por estado.</td>
  </tr>
  <tr>
    <td><b>Correo desacoplado</b></td>
    <td>La respuesta de reserva no espera el envio de SendGrid, evitando bloquear la experiencia del usuario.</td>
  </tr>
</table>

<br>

## API esencial

<table>
  <tr>
    <td><b>Autenticacion</b></td>
    <td><code>POST /api/login</code></td>
    <td>Inicio de sesion y datos de usuario.</td>
  </tr>
  <tr>
    <td><b>Usuarios</b></td>
    <td><code>POST /api/usuarios/registro</code></td>
    <td>Registro por tipo de usuario.</td>
  </tr>
  <tr>
    <td><b>Eventos</b></td>
    <td><code>GET /api/eventos/filtrados</code></td>
    <td>Catalogo segun rol y escuela.</td>
  </tr>
  <tr>
    <td><b>Detalle</b></td>
    <td><code>GET /api/evento/{id}</code></td>
    <td>Informacion completa de un evento.</td>
  </tr>
  <tr>
    <td><b>Reservas</b></td>
    <td><code>POST /api/evento/reserva</code></td>
    <td>Confirmacion de cupo y correo.</td>
  </tr>
  <tr>
    <td><b>Perfil</b></td>
    <td><code>GET /api/perfil/{id_usuario}</code></td>
    <td>Consulta de datos personales.</td>
  </tr>
  <tr>
    <td><b>Administracion</b></td>
    <td><code>POST /api/administradores/eventos</code></td>
    <td>Creacion de evento con imagen.</td>
  </tr>
</table>

<br>

## Base de datos

<table>
  <tr>
    <td width="18%"><b>Roles</b></td>
    <td>Administrador, Estudiante, Visitante.</td>
  </tr>
  <tr>
    <td><b>Usuarios</b></td>
    <td>Identidad, credenciales, rol y escuela asociada cuando aplica.</td>
  </tr>
  <tr>
    <td><b>Eventos</b></td>
    <td>Nombre, descripcion, fecha, lugar, capacidad, asistencia, precio, acceso, imagen y estado.</td>
  </tr>
  <tr>
    <td><b>EscuelasTEC</b></td>
    <td>Catalogo academico para segmentar actividades institucionales.</td>
  </tr>
  <tr>
    <td><b>Reservas</b></td>
    <td>Confirmaciones de asistencia vinculadas a usuario y evento.</td>
  </tr>
</table>

<br>

## Operacion local

```bash
npm install
npm run dev
```

```sql
source backend/src/db/sqlScriptCreacion.sql
source backend/src/db/sqlScriptLlenado.sql
source backend/src/db/storedProcedures.sql
```

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contrasena
DB_NAME=ubicatec
DB_PORT=3306
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
SENDGRID_API_KEY=tu_sendgrid_key
EMAIL_USER=correo_remitente
NODE_ENV=development
```

El servidor principal escucha en el puerto `3000` y sirve el frontend desde `frontend`.

<br>

## Railway

ubicaTEC tuvo una version desplegada en Railway durante la etapa de evaluacion del proyecto. Ese entorno permitio validar la aplicacion fuera del equipo local, con API, frontend, base de datos, imagenes y correos operando como un flujo completo.

La instancia ya cumplio su proposito. Para publicar nuevamente en un proveedor similar, el backend debe tomar el puerto desde variables de entorno y conectarse a una base MySQL provisionada.

<br>


<<<<<<< HEAD
<b>Joshua Cabral Betana</b>

Desarrollo full stack orientado a producto, datos relacionales y servicios externos.
=======
>>>>>>> f133d9226b4b8489c81c5f7bea224cc0406add72
