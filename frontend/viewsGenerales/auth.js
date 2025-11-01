//* en este archivo ocurre la reestructuración del panel de eventos según el rol del usuario

// Verificar autenticación y configurar UI según el rol
document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos de sessionStorage
    const tipo_rol = sessionStorage.getItem('tipo_rol');
    const id_usuario = sessionStorage.getItem('id_usuario');
    const id_escuela = sessionStorage.getItem('id_escuela');
    const escuela = sessionStorage.getItem('escuela');

    // Si no hay sesión, redirigir a login
    if (!tipo_rol || !id_usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar UI según el rol
    configurarUISegunRol(tipo_rol, escuela);
});

function configurarUISegunRol(tipo_rol, escuela) {
    const roleLabel = document.getElementById('role-label');
    const gestionEventosItem = document.getElementById('gestion-eventos-item');
    const gestionEventosMobile = document.getElementById('gestion-eventos-mobile');
    const filtroAcceso = document.getElementById('filtro-acceso');

    // Convertir a minúsculas para comparación
    const rol = tipo_rol.toLowerCase();

    if (rol === 'administrador') {
        // ADMINISTRADOR: Ver todo, sin cambios
        roleLabel.textContent = 'ADMINISTRADOR';
        // Gestión de eventos visible (ya está por defecto)
        // Filtro de acceso visible (ya está por defecto)
        
    } else if (rol === 'estudiante') {
        // ESTUDIANTE: Sin gestión de eventos, sin filtro de acceso
        roleLabel.textContent = 'ESTUDIANTE';
        
        // Ocultar gestión de eventos
        if (gestionEventosItem) gestionEventosItem.style.display = 'none';
        if (gestionEventosMobile) gestionEventosMobile.style.display = 'none';
        
        // Ocultar filtro de acceso
        if (filtroAcceso) {
            const filtroAccesoContainer = filtroAcceso.closest('.col-md-3');
            if (filtroAccesoContainer) filtroAccesoContainer.style.display = 'none';
        }
        
        // Guardar escuela en variable global para filtrado
        window.escuelaEstudiante = escuela;
        
    } else if (rol === 'visitante') {
        // VISITANTE: Sin gestión de eventos, sin filtro de acceso
        roleLabel.textContent = 'VISITANTE';
        
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
    const escuela = sessionStorage.getItem('escuela');
    const rol = tipo_rol ? tipo_rol.toLowerCase() : '';

    if (rol === 'administrador') {
        // Administradores ven todos los eventos
        return eventos;
        
    } else if (rol === 'estudiante') {
        // Estudiantes solo ven eventos de su escuela o eventos para todas las escuelas
        return eventos.filter(evento => {
            // Si el evento tiene escuela asignada, debe coincidir con la del estudiante
            // Si no tiene escuela (evento general para todas), también se muestra
            // Si evento.escuelas es un array, verificar si incluye la escuela del estudiante
            if (Array.isArray(evento.escuelas)) {
                return evento.escuelas.length === 0 || evento.escuelas.includes(escuela);
            }
            // Compatibilidad con campo único "escuela"
            return !evento.escuela || evento.escuela === escuela || evento.escuela === 'Todas';
        });
        
    } else if (rol === 'visitante') {
        // Visitantes solo ven eventos con acceso "todos"
        return eventos.filter(evento => evento.acceso === 'todos');
    }

    return eventos;
}

// Exportar la función para usarla en eventos.html
window.filtrarEventosSegunRol = filtrarEventosSegunRol;
