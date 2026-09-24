# ubicaTEC

Campus event discovery and reservations for students, visitors, and administrators at Tecnológico de Costa Rica. This academic web project combines a browser interface with an Express API and MySQL stored procedures.

[Documentación técnica en español](README.es.md)

## What it includes

- Event listings filtered by role and academic school, with event details and availability.
- Reservations with duplicate and capacity checks, plus SendGrid confirmation emails.
- Administrator screens for creating, editing, and cancelling events, with Cloudinary image uploads.
- User registration, profiles, and a Botsonic chat widget with contextual quick actions.

**Stack:** JavaScript, HTML/CSS, Node.js, Express, MySQL, Cloudinary, SendGrid, Botsonic.

## Run locally

Requires Node.js, npm, and MySQL. Run commands from the repository root.

1. Install dependencies with `npm install`.
2. Create a root `.env` file:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=ubicatec
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SENDGRID_API_KEY=your_sendgrid_key
   EMAIL_USER=your_verified_sender
   NODE_ENV=development
   ```

3. On a fresh local MySQL instance, run these files in order from the MySQL client:

   ```sql
   SOURCE backend/src/db/sqlScriptCreacion.sql;
   SOURCE backend/src/db/sqlScriptLlenado.sql;
   SOURCE backend/src/db/storedProcedures.sql;
   ```

4. Update the API URLs in `frontend/viewsGenerales/*.js` and `frontend/viewsAdministrador/*.js`. They currently reference the former Railway deployment; use `http://localhost:3000/api` for local development.
5. Run `npm run dev`, then open [the login page](http://localhost:3000/viewsGenerales/login.html).

The main server serves the frontend and API on port `3000`. Cloudinary is needed for image uploads; SendGrid needs a verified sender for confirmation emails. The chatbot has separate configuration in [chatbot.js](frontend/viewsChatbot/chatbot.js).

## Code map

| Area | Source |
| --- | --- |
| API routes and request handling | [Routes](backend/src/routes) · [Controllers](backend/src/controllers) |
| Schema, seed data, and stored procedures | [Database scripts](backend/src/db) |
| Data model | [ER diagram](backend/src/db/modelado.pdf) |
| Participant and administrator interfaces | [General views](frontend/viewsGenerales) · [Administrator views](frontend/viewsAdministrador) |
| Chat widget | [Chatbot files](frontend/viewsChatbot) |

## Project status

Academic prototype. The previous Railway deployment is no longer maintained. Authentication and authorization hardening, server-side handling of chatbot credentials, and automated tests remain work for a future deployment.

