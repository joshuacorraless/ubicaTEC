/**
 * Sidebar dinámico para ubicaTEC
 * Maneja la navegación según el rol del usuario
 */

document.addEventListener('DOMContentLoaded', function() {
  inicializarSidebar();
});

function inicializarSidebar() {
  const tipoRol = sessionStorage.getItem('tipo_rol');
  const paginaActual = window.location.pathname.split('/').pop();
  
  // Obtener elementos del sidebar
  const sidebarDesktop = document.querySelector('.sidebar nav ul');
  const sidebarMobile = document.querySelector('.offcanvas-body nav ul');
  
  if (!sidebarDesktop || !sidebarMobile) {
    console.warn('No se encontraron elementos del sidebar');
    return;
  }
  
  // Generar menú según rol
  const menuHTML = generarMenuPorRol(tipoRol, paginaActual);
  
  // Actualizar ambos sidebars
  sidebarDesktop.innerHTML = menuHTML;
  sidebarMobile.innerHTML = menuHTML;
}

function generarMenuPorRol(tipoRol, paginaActual) {
  let menuItems = [];
  
  // Opción común para todos: Ver eventos
  menuItems.push({
    href: 'eventos.html',
    icon: 'bi-calendar-event',
    text: 'Ver Eventos',
    paginas: ['eventos.html', 'evento.html']
  });
  
  // Opciones según el rol
  if (tipoRol === 'Administrador') {
    menuItems.push({
      href: '../viewsAdministrador/registrarEvento.html',
      icon: 'bi-plus-circle',
      text: 'Crear Evento',
      paginas: ['registrarEvento.html']
    });
    menuItems.push({
      href: '../viewsAdministrador/listarEventos.html',
      icon: 'bi-list-ul',
      text: 'Gestión de Eventos',
      paginas: ['listarEventos.html', 'editarEvento.html']
    });
  } else if (tipoRol === 'Estudiante') {
    // Los estudiantes pueden ver sus reservas (cuando se implemente)
    menuItems.push({
      href: '#',
      icon: 'bi-bookmark-check',
      text: 'Mis Reservas',
      paginas: ['misReservas.html'],
      disabled: true
    });
  }
  
  // Separador
  menuItems.push({ separator: true });
  
  // Opción común: Perfil
  menuItems.push({
    href: 'viewPerfilUsuario.html',
    icon: 'bi-person-circle',
    text: 'Mi Perfil',
    paginas: ['viewPerfilUsuario.html', 'editarPerfilUsuario.html']
  });
  
  // Opción común: Cerrar sesión
  menuItems.push({
    href: '#',
    icon: 'bi-box-arrow-right',
    text: 'Cerrar Sesión',
    onclick: 'cerrarSesion()',
    paginas: []
  });
  
  // Generar HTML
  return menuItems.map(item => {
    if (item.separator) {
      return '<li class="nav-item mt-3 mb-2"><hr class="dropdown-divider"></li>';
    }
    
    const isActive = item.paginas.some(p => paginaActual.includes(p));
    const activeClass = isActive ? 'active' : '';
    const disabledClass = item.disabled ? 'disabled' : '';
    const onclickAttr = item.onclick ? `onclick="${item.onclick}"` : '';
    
    return `
      <li class="nav-item">
        <a class="nav-link d-flex align-items-center ${activeClass} ${disabledClass}" 
           href="${item.href}" 
           ${onclickAttr}
           ${item.disabled ? 'aria-disabled="true"' : ''}>
          <i class="bi ${item.icon} me-2"></i> ${item.text}
        </a>
      </li>
    `;
  }).join('');
}

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}

// Exponer función globalmente
window.cerrarSesion = cerrarSesion;
