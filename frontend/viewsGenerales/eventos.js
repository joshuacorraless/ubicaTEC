// eventos.js - Lógica completa para la página de eventos

// Configuración de API
const API_CONFIG = {
    base: 'https://ubicatec-production-bfb7.up.railway.app//api',
    endpoints: {
        eventosFiltrados: '/eventos/filtrados',
        eventoPorId: '/eventos'
    }
};

// Variables globales
let eventos = [];
let eventosFiltrados = [];
let eventosActuales = [];

/**
 * Inicializar la página de eventos
 */
async function inicializarEventos() {
    console.log('🚀 Inicializando página de eventos...');
    
    // Configurar listeners de filtros
    setupEventListeners();
    
    // Cargar eventos según rol y escuela del usuario
    await cargarEventos();
    
    // Actualizar año en footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarEventos);

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    const buscarInput = document.getElementById('buscar-evento');
    const filtroLugar = document.getElementById('filtro-lugar');
    const filtroAcceso = document.getElementById('filtro-acceso');

    if (buscarInput) buscarInput.addEventListener('input', filtrarEventos);
    if (filtroLugar) filtroLugar.addEventListener('change', filtrarEventos);
    if (filtroAcceso) filtroAcceso.addEventListener('change', filtrarEventos);
}

/**
 * Cargar eventos desde la API según el rol y escuela del usuario
 */
async function cargarEventos() {
    mostrarCargando();
    
    try {
        // Obtener información del usuario desde sessionStorage
        const tipo_rol = sessionStorage.getItem('tipo_rol');
        const id_escuela = sessionStorage.getItem('id_escuela');
        
        console.log('📊 Datos del usuario desde sessionStorage:', { 
            tipo_rol, 
            id_escuela,
            tipo_id_escuela: typeof id_escuela,
            todos_los_items: {
                id_usuario: sessionStorage.getItem('id_usuario'),
                tipo_rol: sessionStorage.getItem('tipo_rol'),
                id_escuela: sessionStorage.getItem('id_escuela'),
                escuela: sessionStorage.getItem('escuela')
            }
        });
        
        if (!tipo_rol) {
            throw new Error('No se encontró información de sesión. Por favor inicia sesión.');
        }
        
        // Construir URL con parámetros
        const params = new URLSearchParams({
            tipo_rol: tipo_rol,
            id_escuela: id_escuela || ''
        });
        
        const url = `${API_CONFIG.base}${API_CONFIG.endpoints.eventosFiltrados}?${params}`;
        console.log('🌐 Solicitando eventos:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar eventos');
        }
        
        console.log(`✅ Eventos obtenidos: ${data.count}`);
        
        // Procesar eventos
        eventos = data.data.map(evento => ({
            ...evento,
            fecha: formatearFecha(evento.fechaCompleta, evento.hora)
        }));
        
        eventosFiltrados = [...eventos];
        eventosActuales = [...eventos];
        
        renderizarEventos(eventosActuales);
        actualizarContador(eventosActuales.length);
        
    } catch (error) {
        console.error('❌ Error al cargar eventos:', error);
        mostrarErrorCarga(error.message);
    }
}

/**
 * Formatear fecha para mostrar
 */
function formatearFecha(fechaStr, horaStr) {
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    try {
        const fechaObj = new Date(fechaStr + 'T00:00:00');
        
        if (isNaN(fechaObj.getTime())) {
            return 'Fecha por confirmar';
        }
        
        const dia = fechaObj.getDate();
        const mes = meses[fechaObj.getMonth()];
        
        // Formatear hora
        const [horas, minutos] = horaStr.split(':');
        const horaNum = parseInt(horas);
        const periodo = horaNum >= 12 ? 'p.m.' : 'a.m.';
        const hora12 = horaNum > 12 ? horaNum - 12 : (horaNum === 0 ? 12 : horaNum);
        
        return `${dia} de ${mes} · ${hora12}:${minutos} ${periodo}`;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Fecha por confirmar';
    }
}

/**
 * Mostrar estado de carga
 */
function mostrarCargando() {
    const contenedor = document.getElementById('contenedor-eventos');
    const contadorEventos = document.getElementById('contador-eventos');
    
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        col.innerHTML = `
            <div class="card evento-card h-100">
                <div class="loading-skeleton" style="height: 200px;"></div>
                <div class="card-body">
                    <div class="loading-skeleton mb-2" style="height: 24px; width: 80%;"></div>
                    <div class="loading-skeleton mb-2" style="height: 16px; width: 60%;"></div>
                    <div class="loading-skeleton mb-3" style="height: 14px; width: 40%;"></div>
                    <div class="loading-skeleton" style="height: 38px;"></div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    }
    
    if (contadorEventos) {
        contadorEventos.textContent = 'Cargando eventos...';
    }
}

/**
 * Renderizar eventos en el DOM
 */
function renderizarEventos(eventos) {
    const contenedor = document.getElementById('contenedor-eventos');
    
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (eventos.length === 0) {
        mostrarMensajeVacio();
        return;
    }

    eventos.forEach((evento, index) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        col.style.animationDelay = `${index * 0.1}s`;

        const disponibilidad = calcularDisponibilidad(evento);
        const estadoReserva = obtenerEstadoReserva(evento);

        col.innerHTML = `
            <article class="card evento-card h-100" role="article" aria-labelledby="evento-${evento.id}" data-evento-id="${evento.id}">
                <img src="${evento.img}" class="card-img-top" alt="${evento.alt}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <header>
                        <h3 id="evento-${evento.id}" class="card-title">${evento.titulo}</h3>
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-geo-alt me-1 text-primary"></i>
                            <span class="card-text">${evento.lugar}</span>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-clock me-1 text-primary"></i>
                            <span class="card-text">${evento.fecha}</span>
                        </div>
                    </header>
                    
                    <p class="card-text flex-grow-1 mb-3" style="font-size: 0.9rem; color: #666;">
                        ${evento.descripcion}
                    </p>
                    
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge badge-acceso">
                                <i class="bi bi-${evento.acceso === 'todos' ? 'globe' : 'people'} me-1"></i>
                                ${obtenerTextoAcceso(evento.acceso)}
                            </span>
                            <small class="text-muted">${disponibilidad}</small>
                        </div>
                        
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge badge-fecha">
                    ${evento.costo === 0 ? 'Gratuito' : `Costo: ₡${evento.costo.toLocaleString()}`}
                  </span>
                  <small class="text-muted">
                    <i class="bi bi-people me-1"></i>
                    ${evento.disponibles}/${evento.capacidad} disponibles
                  </small>
                </div>                        ${estadoReserva.html}
                    </div>
                </div>
            </article>
        `;

        contenedor.appendChild(col);
    });

    // Agregar event listeners a las cards para redirigir a detalles
    agregarEventListenersCards();
    
    // Agregar event listeners a los botones
    agregarEventListenersReserva();
}

/**
 * Agregar event listeners a las cards para redirección a detalles
 */
function agregarEventListenersCards() {
    const cards = document.querySelectorAll('.evento-card');
    
    cards.forEach(card => {
        // Hacer la card clickeable con cursor pointer
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            // No redirigir si se hizo clic en un botón
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const eventoId = this.getAttribute('data-evento-id');
            if (eventoId) {
                // Redirigir a la página de detalles del evento
                window.location.href = `evento.html?id=${eventoId}`;
            }
        });
        
        // Mejorar accesibilidad: permitir activar con Enter o Espacio
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const eventoId = this.getAttribute('data-evento-id');
                if (eventoId) {
                    window.location.href = `evento.html?id=${eventoId}`;
                }
            }
        });
    });
}

/**
 * Obtener texto descriptivo del acceso
 */
function obtenerTextoAcceso(acceso) {
    if (acceso === 'todos') return 'Abierto';
    if (acceso === 'solo_tec') return 'Solo TEC';
    return acceso; // Devuelve el nombre de la escuela
}

/**
 * Calcular disponibilidad
 */
function calcularDisponibilidad(evento) {
    const porcentaje = (evento.disponibles / evento.capacidad) * 100;
    if (porcentaje > 50) return 'Alta disponibilidad';
    if (porcentaje > 20) return 'Disponibilidad media';
    if (porcentaje > 0) return 'Últimos cupos';
    return 'Agotado';
}

/**
 * Obtener estado de reserva
 */
function obtenerEstadoReserva(evento) {
    const tipo = sessionStorage.getItem('tipo_rol') || 'visitante';
    
    // Verificar si el evento ya pasó
    const fechaEvento = new Date(evento.fechaCompleta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaEvento < hoy) {
        return {
            html: `<button class="btn btn-secondary w-100" disabled>
                     <i class="bi bi-calendar-x me-2"></i>Evento finalizado
                   </button>`,
            disponible: false
        };
    }

    // Verificar disponibilidad
    if (evento.disponibles === 0) {
        return {
            html: `<button class="btn btn-outline-secondary w-100" disabled>
                     <i class="bi bi-x-circle me-2"></i>Sin cupos disponibles
                   </button>`,
            disponible: false
        };
    }

    // Botón de reserva disponible
    return {
        html: `<button class="btn btn-primary w-100 btn-reservar" data-evento-id="${evento.id}">
                 <i class="bi bi-bookmark-plus me-2"></i>Reservar cupo
               </button>`,
        disponible: true
    };
}

/**
 * Agregar event listeners a botones de reserva
 */
function agregarEventListenersReserva() {
    const botonesReserva = document.querySelectorAll('.btn-reservar');
    botonesReserva.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventoId = parseInt(this.dataset.eventoId);
            manejarReserva(eventoId);
        });
    });
}

/**
 * Manejar reserva de evento
 */
function manejarReserva(eventoId) {
    window.location.href = `evento.html?id=${eventoId}`;
}

/**
 * Filtrar eventos
 */
function filtrarEventos() {
    const buscarInput = document.getElementById('buscar-evento');
    const filtroLugar = document.getElementById('filtro-lugar');
    const filtroAcceso = document.getElementById('filtro-acceso');
    
    const textoBusqueda = buscarInput ? buscarInput.value.toLowerCase().trim() : '';
    const lugarSeleccionado = filtroLugar ? filtroLugar.value : '';
    const accesoSeleccionado = filtroAcceso ? filtroAcceso.value : '';

    eventosActuales = eventosFiltrados.filter(evento => {
        const cumpleBusqueda = !textoBusqueda || 
            evento.titulo.toLowerCase().includes(textoBusqueda) ||
            evento.lugar.toLowerCase().includes(textoBusqueda) ||
            evento.descripcion.toLowerCase().includes(textoBusqueda);
        
        const cumpleLugar = !lugarSeleccionado || evento.lugar === lugarSeleccionado;
        
        // El filtro de acceso es opcional - solo aplicar si se selecciona
        // El backend ya filtró por rol y escuela, este es un filtro adicional
        const cumpleAcceso = !accesoSeleccionado || evento.acceso === accesoSeleccionado;
        
        return cumpleBusqueda && cumpleLugar && cumpleAcceso;
    });

    renderizarEventos(eventosActuales);
    actualizarContador(eventosActuales.length);
    
    // Anunciar cambios para accesibilidad
    const mensaje = `Se encontraron ${eventosActuales.length} evento${eventosActuales.length !== 1 ? 's' : ''}`;
    anunciarCambio(mensaje);
}

/**
 * Mostrar mensaje cuando no hay eventos
 */
function mostrarMensajeVacio() {
    const contenedor = document.getElementById('contenedor-eventos');
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="col-12">
            <div class="card card-elevada text-center py-5">
                <div class="card-body">
                    <i class="bi bi-calendar-x display-1 text-muted mb-3"></i>
                    <h3 class="h4 text-muted">No se encontraron eventos</h3>
                    <p class="text-muted mb-3">
                        Intenta ajustar los filtros de búsqueda o revisa más tarde.
                    </p>
                    <button class="btn btn-outline-primary" onclick="window.limpiarFiltros()">
                        <i class="bi bi-arrow-counterclockwise me-2"></i>Limpiar filtros
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Limpiar filtros
 */
function limpiarFiltros() {
    const buscarInput = document.getElementById('buscar-evento');
    const filtroLugar = document.getElementById('filtro-lugar');
    const filtroAcceso = document.getElementById('filtro-acceso');
    
    if (buscarInput) buscarInput.value = '';
    if (filtroLugar) filtroLugar.value = '';
    if (filtroAcceso) filtroAcceso.value = '';
    
    filtrarEventos();
}

/**
 * Actualizar contador de eventos
 */
function actualizarContador(cantidad) {
    const contadorEventos = document.getElementById('contador-eventos');
    if (!contadorEventos) return;
    
    contadorEventos.textContent = `${cantidad} evento${cantidad !== 1 ? 's' : ''} ${cantidad !== eventosFiltrados.length ? 'filtrado' + (cantidad !== 1 ? 's' : '') : 'disponible' + (cantidad !== 1 ? 's' : '')}`;
}

/**
 * Anunciar cambios para accesibilidad
 */
function anunciarCambio(mensaje) {
    const statusDiv = document.getElementById('live-status');
    if (!statusDiv) return;
    
    statusDiv.textContent = mensaje;
    statusDiv.classList.remove('visually-hidden');
    
    setTimeout(() => {
        statusDiv.classList.add('visually-hidden');
    }, 3000);
}

/**
 * Mostrar error de carga
 */
function mostrarErrorCarga(mensaje) {
    const contenedor = document.getElementById('contenedor-eventos');
    const contadorEventos = document.getElementById('contador-eventos');
    
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="card card-elevada text-center py-5">
                    <div class="card-body">
                        <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
                        <h3 class="h4 text-muted">Error al cargar eventos</h3>
                        <p class="text-muted mb-3">${mensaje}</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (contadorEventos) {
        contadorEventos.textContent = 'Error al cargar';
    }
}

// Exponer funciones globalmente para uso en HTML
window.limpiarFiltros = limpiarFiltros;

/**
 * Cerrar sesión del usuario
 */
function cerrarSesion() {
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Redirigir al login
    window.location.href = 'login.html';
}

// Exponer función de logout
window.cerrarSesion = cerrarSesion;
