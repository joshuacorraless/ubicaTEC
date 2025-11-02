// ======= CONFIGURACIÓN Y VARIABLES GLOBALES =======
const API_URL = 'https://ubicatec-production-bfb7.up.railway.app/api/administradores/eventos';

let todosLosEventos = [];
let eventosFiltrados = [];
let currentSort = 'fecha';

// ======= INICIALIZACIÓN =======
document.addEventListener('DOMContentLoaded', function() {
  // Año dinámico
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Cargar eventos del administrador en sesión
  cargarEventosAdministrador();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Animaciones de entrada
  animateOnLoad();
});

// ======= CARGAR EVENTOS DEL ADMINISTRADOR =======
async function cargarEventosAdministrador() {
  const id_usuario = sessionStorage.getItem('id_usuario');
  
  // Verificar que hay usuario en sesión
  if (!id_usuario) {
    window.location.href = '../viewsGenerales/login.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}?id_usuario=${id_usuario}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al cargar eventos');
    }

    if (result.success) {
      todosLosEventos = result.data.map(evento => ({
        id: evento.id_evento,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        fecha: evento.fecha,
        fechaTexto: formatearFecha(evento.fecha),
        hora: evento.hora,
        asistencia: evento.asistencia,
        capacidad: evento.capacidad,
        estado: evento.estado,
        lugar: evento.lugar,
        precio: evento.precio,
        acceso: evento.acceso,
        imagen_url: evento.imagen_url,
        disponibles: evento.disponibles
      }));

      eventosFiltrados = [...todosLosEventos];
      renderEventos();
      actualizarContadores();
    }

  } catch (error) {
    console.error('Error al cargar eventos:', error);
    showNotification('Error al cargar los eventos: ' + error.message, 'error');
  }
}

// ======= FORMATEAR FECHA =======
function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible';
  
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  // La fecha viene en formato YYYY-MM-DD desde MySQL
  const partes = fecha.split('T')[0].split('-'); // Separar por 'T' primero por si viene con hora
  const año = partes[0];
  const mesIndex = parseInt(partes[1]) - 1; // Restar 1 porque los meses van de 0-11
  const dia = parseInt(partes[2]);
  
  const mes = meses[mesIndex];
  
  return `${dia} ${mes} ${año}`;
}

// ======= RENDERIZADO DE EVENTOS =======
function renderEventos() {
  const tbody = document.getElementById("tabla-eventos");
  tbody.innerHTML = "";
  
  if (eventosFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5">
          <i class="bi bi-inbox display-4 text-muted d-block mb-3"></i>
          <p class="text-muted">No se encontraron eventos con los filtros aplicados</p>
        </td>
      </tr>
    `;
    return;
  }

  eventosFiltrados.forEach((evento, index) => {
    const fila = document.createElement("tr");
    fila.style.animationDelay = `${index * 0.1}s`;
    fila.classList.add('fade-in-row');
    
    const porcentajeOcupacion = Math.round((evento.asistencia / evento.capacidad) * 100);
    
    let estadoBadge;
    switch(evento.estado) {
      case 'disponible':
        estadoBadge = `<span class="badge badge-disponible">
          <i class="bi bi-check-circle me-1"></i>Disponible
        </span>`;
        break;
      case 'agotado':
        estadoBadge = `<span class="badge badge-agotado">
          <i class="bi bi-x-circle me-1"></i>Agotado
        </span>`;
        break;
      case 'cancelado':
        estadoBadge = `<span class="badge bg-secondary">
          <i class="bi bi-dash-circle me-1"></i>Cancelado
        </span>`;
        break;
      default:
        estadoBadge = `<span class="badge bg-secondary">${evento.estado}</span>`;
    }

    fila.innerHTML = `
      <td class="text-center">
        <strong>${evento.id}</strong>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <div class="me-3">
            <div class="evento-icon">
              <i class="bi bi-calendar-event"></i>
            </div>
          </div>
          <div>
            <h6 class="mb-1 fw-bold">${evento.nombre}</h6>
            <small class="text-muted">
              <i class="bi bi-geo-alt me-1"></i>${evento.lugar}
            </small>
          </div>
        </div>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-calendar3 me-2 text-primary"></i>
          <span class="fw-semibold">${evento.fechaTexto}</span>
        </div>
      </td>
      <td class="text-center">
        <div class="asistencia-info">
          <div class="fw-bold text-primary">${evento.asistencia}/${evento.capacidad}</div>
          <div class="progress mt-1" style="height: 4px;">
            <div class="progress-bar" role="progressbar" 
                 style="width: ${porcentajeOcupacion}%; background: var(--tec-gradient);" 
                 aria-valuenow="${porcentajeOcupacion}" aria-valuemin="0" aria-valuemax="100">
            </div>
          </div>
          <small class="text-muted">${porcentajeOcupacion}%</small>
        </div>
      </td>
      <td class="text-center">
        ${estadoBadge}
      </td>
      <td class="text-center">
        <div class="btn-group" role="group" aria-label="Acciones del evento ${evento.nombre}">
          <button class="btn btn-sm btn-outline-primary" 
                  onclick="verEvento(${evento.id})" 
                  title="Ver detalles">
            <i class="bi bi-eye"></i>
          </button>
          <a href="editarEvento.html?id=${evento.id}" 
             class="btn btn-sm btn-primary" 
             title="Editar evento"
             aria-label="Editar ${evento.nombre}">
            <i class="bi bi-pencil"></i>
          </a>
          <button class="btn btn-sm btn-danger" 
                  onclick="eliminarEvento(${evento.id})" 
                  title="Eliminar evento"
                  aria-label="Eliminar ${evento.nombre}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(fila);
  });
  
  actualizarContadores();
}

// ======= ACTUALIZAR CONTADORES =======
function actualizarContadores() {
  const totalEventos = document.getElementById("total-eventos");
  const eventosActivos = document.getElementById("eventos-activos");
  const showingEvents = document.getElementById("showing-events");
  
  const activos = todosLosEventos.filter(e => e.estado === 'disponible').length;
  
  totalEventos.textContent = todosLosEventos.length;
  eventosActivos.textContent = activos;
  showingEvents.textContent = eventosFiltrados.length;
}

// ======= EVENT LISTENERS =======
function setupEventListeners() {
  // Búsqueda en tiempo real
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(handleSearch, 300));
  
  // Filtro por estado
  const filterStatus = document.getElementById('filterStatus');
  filterStatus.addEventListener('change', handleFilter);
  
  // Ordenamiento
  const sortBy = document.getElementById('sortBy');
  sortBy.addEventListener('change', handleSort);
}

// ======= FUNCIONES DE FILTRADO Y BÚSQUEDA =======
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    eventosFiltrados = [...todosLosEventos];
  } else {
    eventosFiltrados = todosLosEventos.filter(evento => 
      evento.nombre.toLowerCase().includes(searchTerm) ||
      evento.lugar.toLowerCase().includes(searchTerm) ||
      evento.descripcion.toLowerCase().includes(searchTerm)
    );
  }
  
  applyCurrentFilters();
}

function handleFilter(e) {
  const status = e.target.value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  
  // Primero aplicar búsqueda
  if (searchTerm === '') {
    eventosFiltrados = [...todosLosEventos];
  } else {
    eventosFiltrados = todosLosEventos.filter(evento => 
      evento.nombre.toLowerCase().includes(searchTerm) ||
      evento.lugar.toLowerCase().includes(searchTerm) ||
      evento.descripcion.toLowerCase().includes(searchTerm)
    );
  }
  
  // Luego aplicar filtro de estado
  if (status) {
    eventosFiltrados = eventosFiltrados.filter(evento => evento.estado === status);
  }
  
  sortEventos(currentSort);
}

function handleSort(e) {
  currentSort = e.target.value;
  sortEventos(currentSort);
}

function sortEventos(criteria) {
  eventosFiltrados.sort((a, b) => {
    switch(criteria) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'fecha':
        return new Date(a.fecha) - new Date(b.fecha);
      case 'asistencia':
        return b.asistencia - a.asistencia;
      default:
        return 0;
    }
  });
  renderEventos();
}

function applyCurrentFilters() {
  const filterStatus = document.getElementById('filterStatus').value;
  if (filterStatus) {
    eventosFiltrados = eventosFiltrados.filter(evento => evento.estado === filterStatus);
  }
  sortEventos(currentSort);
}

// ======= FUNCIONES DE ACCIÓN =======
function verEvento(id) {
  const evento = todosLosEventos.find(e => e.id === id);
  if (evento) {
    showEventModal(evento);
  }
}

function eliminarEvento(id) {
  const evento = todosLosEventos.find(e => e.id === id);
  if (!evento) {
    showNotification('Evento no encontrado', 'danger');
    return;
  }

  // Validar que el evento no esté ya cancelado
  if (evento.estado === 'cancelado') {
    showNotification('El evento ya se encuentra cancelado', 'warning');
    return;
  }

  // Mostrar modal de confirmación bonito y accesible
  showDeleteConfirmModal(evento, id);
}

function showDeleteConfirmModal(evento, id) {
  const modalHTML = `
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-describedby="deleteConfirmDesc" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: var(--border-radius); border: none; overflow: hidden;">
          <div class="modal-header" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; border: none;">
            <h2 class="modal-title h5" id="deleteConfirmModalLabel">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>Confirmar Eliminación
            </h2>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar diálogo de confirmación"></button>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-3" aria-hidden="true">
              <i class="bi bi-trash3" style="font-size: 3rem; color: #dc3545;"></i>
            </div>
            <p id="deleteConfirmDesc" class="mb-3">¿Estás seguro de eliminar el evento <strong>"${evento.nombre}"</strong>?</p>
            <p class="text-muted small">Esta acción marcará el evento como cancelado y no se podrá revertir.</p>
          </div>
          <div class="modal-footer" style="border: none; background-color: #f8f9fa;">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" aria-label="Cancelar eliminación">
              <i class="bi bi-x-circle me-1" aria-hidden="true"></i>Cancelar
            </button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn" aria-label="Confirmar eliminación del evento ${evento.nombre}">
              <i class="bi bi-trash3 me-1" aria-hidden="true"></i>Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal existente si lo hay
  const existingModal = document.getElementById('deleteConfirmModal');
  if (existingModal) existingModal.remove();
  
  // Agregar nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  
  // Configurar evento del botón de confirmar
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    modal.hide();
    ejecutarEliminacion(id);
  });
  
  // Enfocar el botón de cancelar cuando se abre el modal para mejor accesibilidad
  document.getElementById('deleteConfirmModal').addEventListener('shown.bs.modal', () => {
    document.querySelector('#deleteConfirmModal .btn-outline-secondary').focus();
  });
  
  modal.show();
}

function ejecutarEliminacion(id) {
  // Llamar al backend para eliminar
  fetch(`https://ubicatec-production-bfb7.up.railway.app/api/administradores/eventos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(async res => {
    // Intentar parsear JSON, pero si falla, retornar error
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  })
  .then(result => {
    if (result.success) {
      showNotification('Evento eliminado exitosamente', 'success');
      // Recargar eventos después de un pequeño delay para asegurar que la BD se actualice
      setTimeout(() => {
        cargarEventosAdministrador();
      }, 300);
    } else {
      showNotification(result.message || 'Error al eliminar el evento', 'danger');
    }
  })
  .catch(error => {
    console.error('Error al eliminar:', error);
    showNotification('Error de conexión al eliminar el evento', 'danger');
    // Intentar recargar de todas formas por si se eliminó
    setTimeout(() => {
      cargarEventosAdministrador();
    }, 500);
  });
}

// ======= MODAL DINÁMICO =======
function showEventModal(evento) {
  const porcentajeOcupacion = evento.capacidad > 0 ? Math.round((evento.asistencia/evento.capacidad)*100) : 0;
  const estadoTexto = evento.estado === 'disponible' ? 'Disponible' : evento.estado === 'agotado' ? 'Agotado' : 'Cancelado';
  
  const modalHTML = `
    <div class="modal fade" id="eventoModal" tabindex="-1" aria-labelledby="eventoModalLabel" aria-describedby="eventoModalDesc" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="border-radius: var(--border-radius); border: none; overflow: hidden; box-shadow: var(--shadow-lg);">
          
          <!-- Header con gradiente -->
          <div class="modal-header" style="background: var(--tec-gradient); color: white; border: none; padding: 1.5rem;">
            <h2 class="modal-title h5 fw-bold" id="eventoModalLabel">
              <i class="bi bi-calendar-event me-2" aria-hidden="true"></i>${evento.nombre}
            </h2>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar detalles del evento"></button>
          </div>
          
          <!-- Body -->
          <div class="modal-body" style="padding: 2rem;">
            <p id="eventoModalDesc" class="visually-hidden">Detalles completos del evento ${evento.nombre}, estado ${estadoTexto}</p>
            
            <!-- Badge de estado -->
            <div class="mb-4 text-center" role="status" aria-live="polite">
              <span class="badge ${evento.estado === 'disponible' ? 'badge-disponible' : evento.estado === 'agotado' ? 'badge-agotado' : 'bg-secondary'}" 
                    style="font-size: 0.9rem; padding: 0.5rem 1.5rem; border-radius: 50px;"
                    aria-label="Estado del evento: ${estadoTexto}">
                <i class="bi bi-${evento.estado === 'disponible' ? 'check-circle' : evento.estado === 'agotado' ? 'x-circle' : 'dash-circle'} me-1" aria-hidden="true"></i>
                ${estadoTexto}
              </span>
            </div>
            
            <!-- Información en tarjetas -->
            <div class="row g-3 mb-4">
              
              <!-- Tarjeta: Información General -->
              <div class="col-md-6">
                <div class="card h-100" style="border: 1px solid #e3e6f0; border-radius: 12px; background: linear-gradient(135deg, rgba(0,82,204,0.03) 0%, rgba(255,255,255,1) 100%);">
                  <div class="card-body">
                    <h3 class="card-title h6 mb-3" style="color: var(--tec-primary); font-weight: 600;">
                      <i class="bi bi-info-circle-fill me-2" aria-hidden="true"></i>Información General
                    </h3>
                    <ul class="list-unstyled mb-0" style="line-height: 2;">
                      <li><i class="bi bi-calendar3 text-primary me-2" aria-hidden="true"></i><strong>Fecha:</strong> ${evento.fechaTexto}</li>
                      <li><i class="bi bi-clock text-primary me-2" aria-hidden="true"></i><strong>Hora:</strong> ${evento.hora}</li>
                      <li><i class="bi bi-geo-alt text-primary me-2" aria-hidden="true"></i><strong>Lugar:</strong> ${evento.lugar}</li>
                      <li><i class="bi bi-cash text-primary me-2" aria-hidden="true"></i><strong>Precio:</strong> ${evento.precio > 0 ? '₡' + evento.precio.toLocaleString() : 'Gratis'}</li>
                      <li><i class="bi bi-shield-check text-primary me-2" aria-hidden="true"></i><strong>Acceso:</strong> ${evento.acceso === 'todos' ? 'Abierto a todos' : 'Solo TEC'}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- Tarjeta: Capacidad -->
              <div class="col-md-6">
                <div class="card h-100" style="border: 1px solid #e3e6f0; border-radius: 12px; background: linear-gradient(135deg, rgba(0,101,255,0.03) 0%, rgba(255,255,255,1) 100%);">
                  <div class="card-body">
                    <h3 class="card-title h6 mb-3" style="color: var(--tec-primary); font-weight: 600;">
                      <i class="bi bi-people-fill me-2" aria-hidden="true"></i>Capacidad
                    </h3>
                    <div class="text-center mb-3">
                      <div style="font-size: 2.5rem; font-weight: bold; color: var(--tec-primary);" aria-label="${evento.asistencia} de ${evento.capacidad} asistentes registrados">
                        ${evento.asistencia}<span style="font-size: 1.5rem; color: #6c757d;">/${evento.capacidad}</span>
                      </div>
                      <p class="text-muted mb-0">asistentes registrados</p>
                    </div>
                    <div class="progress mb-2" style="height: 12px; border-radius: 10px; background-color: #e9ecef;" role="progressbar" aria-valuenow="${porcentajeOcupacion}" aria-valuemin="0" aria-valuemax="100" aria-label="Ocupación del evento: ${porcentajeOcupacion} por ciento">
                      <div class="progress-bar" 
                           style="width: ${porcentajeOcupacion}%; background: var(--tec-gradient); border-radius: 10px;">
                      </div>
                    </div>
                    <p class="text-center text-muted small mb-0">${porcentajeOcupacion}% ocupado · ${evento.disponibles} disponibles</p>
                  </div>
                </div>
              </div>
              
            </div>
            
            <!-- Descripción -->
            <div class="card" style="border: 1px solid #e3e6f0; border-radius: 12px; background-color: #f8f9fa;">
              <div class="card-body">
                <h3 class="card-title h6 mb-3" style="color: var(--tec-primary); font-weight: 600;">
                  <i class="bi bi-card-text me-2" aria-hidden="true"></i>Descripción
                </h3>
                <p class="mb-0" style="color: #495057; line-height: 1.8;">${evento.descripcion}</p>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div class="modal-footer" style="border: none; background-color: #f8f9fa; padding: 1.25rem;">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" aria-label="Cerrar detalles del evento">
              <i class="bi bi-x-circle me-1" aria-hidden="true"></i>Cerrar
            </button>
            <a href="editarEvento.html?id=${evento.id}" class="btn btn-primary" style="background: var(--tec-gradient); border: none;" aria-label="Ir a editar el evento ${evento.nombre}">
              <i class="bi bi-pencil me-1" aria-hidden="true"></i>Editar Evento
            </a>
          </div>
          
        </div>
      </div>
    </div>
  `;
  
  // Remover modal existente si lo hay
  const existingModal = document.getElementById('eventoModal');
  if (existingModal) existingModal.remove();
  
  // Agregar nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = new bootstrap.Modal(document.getElementById('eventoModal'));
  modal.show();
}

// ======= NOTIFICACIONES =======
function showNotification(message, type = 'success') {
  // Anunciar a lectores de pantalla usando aria-live region
  const liveStatus = document.getElementById('live-status');
  if (liveStatus) {
    liveStatus.textContent = message;
    // Limpiar después para que esté listo para el próximo anuncio
    setTimeout(() => { liveStatus.textContent = ''; }, 1000);
  }
  
  // Crear notificación visual
  const notification = document.createElement('div');
  const alertType = type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning';
  notification.className = `alert alert-${alertType} alert-dismissible fade show`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'assertive');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.innerHTML = `
    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'} me-2" aria-hidden="true"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar notificación"></button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
}

// ======= UTILIDADES =======
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ======= ANIMACIONES =======
function animateOnLoad() {
  const cards = document.querySelectorAll('.card-elevada');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

// ======= FUNCIÓN DE CIERRE DE SESIÓN =======
function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = '../viewsGenerales/login.html';
}

// Exponer funciones globalmente
window.verEvento = verEvento;
window.eliminarEvento = eliminarEvento;
window.cerrarSesion = cerrarSesion;
