# 🚀 Instrucciones para ejecutar el proyecto con eventos de la BD

## 1️⃣ Configurar la Base de Datos

### Crear el archivo .env
Crea un archivo `.env` en la carpeta `backend/` con la siguiente configuración:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=ubicaTEC
DB_PORT=3306
```

### Ejecutar scripts SQL
Asegúrate de que la base de datos esté creada y poblada:

```sql
-- 1. Ejecutar sqlScriptCreacion.sql
-- 2. Ejecutar sqlScriptLlenado.sql
```

## 2️⃣ Iniciar el Backend

Desde la carpeta raíz del proyecto:

```bash
npm run dev
```

El servidor debería iniciar en http://localhost:3000

## 3️⃣ Abrir el Frontend

Abre el archivo `frontend/viewsGenerales/eventos.html` en tu navegador o usa Live Server.

## 4️⃣ Verificar que funciona

- La página debería cargar los eventos desde la base de datos
- Solo se mostrarán eventos con `acceso = 'todos'`
- Los eventos mostrados son:
  1. Conferencia de Tecnología e Innovación
  2. Taller de Desarrollo Web Moderno (AGOTADO)
  3. Hackathon UbicaTEC 2025
  4. Recital Musical TEC
  5. Seminario de Investigación Académica
  6. Festival Gastronómico TEC

## 🔍 Endpoints disponibles

- `GET /api/eventos/publicos` - Eventos con acceso público
- `GET /api/eventos` - Todos los eventos disponibles
- `GET /api/eventos/:id` - Obtener un evento por ID

## ⚠️ Solución de problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `ubicaTEC` existe

### Error CORS
- El backend ya tiene CORS habilitado para todas las rutas

### Los eventos no cargan
- Abre la consola del navegador (F12)
- Verifica que el backend esté corriendo en http://localhost:3000
- Revisa si hay errores en la consola del servidor

## ✅ Cambios realizados

✅ Eliminados eventos de ejemplo hardcoded
✅ Implementada API REST para eventos
✅ Frontend conectado a la base de datos
✅ Filtrado automático por acceso = 'todos'
✅ Manejo de errores implementado
