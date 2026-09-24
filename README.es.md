# ubicaTEC — guía técnica

[English overview](README.md)

Aplicación académica para consultar eventos del Tecnológico de Costa Rica, reservar espacios y administrar el catálogo. El frontend usa HTML, CSS y JavaScript; el backend usa Express, MySQL y procedimientos almacenados.

## Preparación local

Se requieren Node.js, npm y MySQL. Desde la raíz del repositorio:

```sh
npm install
```

Crea un archivo `.env` en la raíz:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=ubicatec
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
SENDGRID_API_KEY=tu_sendgrid_key
EMAIL_USER=tu_remitente_verificado
NODE_ENV=development
```

En una instancia local nueva, ejecuta desde el cliente de MySQL y en este orden:

```sql
SOURCE backend/src/db/sqlScriptCreacion.sql;
SOURCE backend/src/db/sqlScriptLlenado.sql;
SOURCE backend/src/db/storedProcedures.sql;
```

Los scripts del frontend aún apuntan al antiguo dominio de Railway. Actualiza las URLs de la API en `frontend/viewsGenerales/*.js` y `frontend/viewsAdministrador/*.js` a `http://localhost:3000/api` antes de usar la interfaz local.

```sh
npm run dev
```

Abre [la página de ingreso](http://localhost:3000/viewsGenerales/login.html). El servidor principal sirve la API y el frontend en el puerto fijo `3000`.

## Integraciones

- **Cloudinary:** carga de imágenes de eventos.
- **SendGrid:** correos de confirmación; requiere una API key y un remitente verificado.
- **Botsonic:** widget de conversación con configuración en [chatbot.js](frontend/viewsChatbot/chatbot.js). Su disponibilidad depende del servicio externo.

## Rutas principales

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/api/login` | Inicio de sesión |
| POST | `/api/usuarios/registro` | Registro |
| GET | `/api/eventos/filtrados` | Catálogo filtrado |
| GET | `/api/evento/:id` | Detalle de un evento |
| POST | `/api/evento/reserva` | Crear una reserva |
| GET | `/api/perfil/:id_usuario` | Consultar perfil |
| POST | `/api/administradores/eventos` | Crear un evento |
| PUT / DELETE | `/api/administradores/eventos/:id` | Editar o cancelar un evento |

Las rutas exactas y sus parámetros están en [backend/src/routes](backend/src/routes). El [modelo de datos](backend/src/db/modelado.pdf) acompaña los scripts SQL.

## Estado

Prototipo académico. El despliegue anterior en Railway ya no se mantiene. Una nueva publicación requiere reforzar autenticación y autorización, trasladar las credenciales del chatbot al servidor y añadir pruebas automatizadas. El puerto del backend está fijado en el código; deberá adaptarse si el proveedor exige una variable `PORT`.
