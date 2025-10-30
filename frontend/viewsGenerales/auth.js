//* en este archivo ocurre la restructuracion del panel de eventos egun el rol del usuario

// Verificar autenticación y configurar UI según el rol
document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos de sessionStorage
    const tipo_rol = sessionStorage.getItem('tipo_rol');
    const id_usuario = sessionStorage.getItem('id_usuario');
    const carrera = sessionStorage.getItem('carrera');

    // Si no hay sesión, redirigir a login
    if (!tipo_rol || !id_usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar UI según el rol
    configurarUISegunRol(tipo_rol, carrera);
});

function configurarUISegunRol(tipo_rol, carrera) {
    const roleLabel = document.getElementById('role-label');
    const gestionEventosItem = document.getElementById('gestion-eventos-item');
    const gestionEventosMobile = document.getElementById('gestion-eventos-mobile');
    const filtroAcceso = document.getElementById('filtro-acceso');

    // Convertir a minúsculas para comparación
    const rol = tipo_rol.toLowerCase();

    if (rol === 'administrador') {
        // ADMINISTRADOR: Ver todo, sin cambios
        roleLabel.textContent = 'Administrador';
        // Gestión de eventos visible (ya está por defecto)
        // Filtro de acceso visible (ya está por defecto)
        
    } else if (rol === 'estudiante') {
        // ESTUDIANTE: Sin gestión de eventos, sin filtro de acceso
        roleLabel.textContent = 'Estudiante';
        
        // Ocultar gestión de eventos
        if (gestionEventosItem) gestionEventosItem.style.display = 'none';
        if (gestionEventosMobile) gestionEventosMobile.style.display = 'none';
        
        // Ocultar filtro de acceso
        if (filtroAcceso) {
            const filtroAccesoContainer = filtroAcceso.closest('.col-md-3');
            if (filtroAccesoContainer) filtroAccesoContainer.style.display = 'none';
        }
        
        // Guardar carrera en variable global para filtrado
        window.carreraEstudiante = carrera;
        
    } else if (rol === 'visitante') {
        // VISITANTE: Sin gestión de eventos, sin filtro de acceso
        roleLabel.textContent = 'Visitante';
        
        // Ocultar gestión de eventos
        if (gestionEventosItem) gestionEventosItem.style.display = 'none';
        if (gestionEventosMobile) gestionEventosMobile.style.display = 'none';
        
        // Ocultar filtro de acceso
        if (filtroAcceso) {
            const filtroAccesoContainer = filtroAcceso.closest('.col-md-3');
            if (filtroAccesoContainer) filtroAccesoContainer.style.display = 'none';
        }
        
        // Los visitantes solo ven eventos con acceso "todos"
        window.esVisitante = true;
    }
}

// Función para filtrar eventos según el rol
function filtrarEventosSegunRol(eventos) {
    const tipo_rol = sessionStorage.getItem('tipo_rol');
    const carrera = sessionStorage.getItem('carrera');
    const rol = tipo_rol ? tipo_rol.toLowerCase() : '';

    if (rol === 'administrador') {
        // Administradores ven todos los eventos
        return eventos;
        
    } else if (rol === 'estudiante') {
        // Estudiantes solo ven eventos de su carrera
        return eventos.filter(evento => {
            // Si el evento tiene carrera asignada, debe coincidir con la del estudiante
            // Si no tiene carrera (evento general), también se muestra
            return !evento.carrera || evento.carrera === carrera;
        });
        
    } else if (rol === 'visitante') {
        // Visitantes solo ven eventos con acceso "todos"
        return eventos.filter(evento => evento.acceso === 'todos');
    }

    return eventos;
}

// Exportar la función para usarla en eventos.html
window.filtrarEventosSegunRol = filtrarEventosSegunRol;
