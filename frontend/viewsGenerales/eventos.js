// eventos.js - Lógica completa para la página de eventos

// Configuración de API
const API_CONFIG = {
    base: 'http://localhost:3000/api',
    endpoints: {
        todosEventos: '/eventos',
        eventosPorEscuela: '/eventos/escuela'
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
    
    // Cargar eventos
    await cargarEventosCombinados();
    
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
 * Cargar eventos combinados (generales + escuela específica)
 */
async function cargarEventosCombinados() {
    mostrarCargando();
    
    try {
        // Obtener información del usuario desde sessionStorage
        const id_escuela = sessionStorage.getItem('id_escuela'); // Cambiar a id_escuela numérico
        const tipo_rol = sessionStorage.getItem('tipo_rol');
        
        console.log('📊 Datos del usuario:', { id_escuela, tipo_rol });
        
        // Array para almacenar todas las promesas de fetch
        const promesas = [];
        
        // 1. Siempre cargar eventos generales
        promesas.push(fetchEventosGenerales());
        
        // 2. Si el usuario tiene escuela, cargar eventos de su escuela
        if (id_escuela && id_escuela !== 'null' && id_escuela !== '') {
            promesas.push(fetchEventosPorEscuela(id_escuela));
        }
        
        // Ejecutar ambas peticiones en paralelo
        const resultados = await Promise.all(promesas);
        
        // Combinar resultados
        let eventosGenerales = resultados[0] || [];
        let eventosEscuela = resultados[1] || [];
        
        console.log(`✅ Eventos generales: ${eventosGenerales.length}`);
        console.log(`✅ Eventos de escuela: ${eventosEscuela.length}`);
        
        // Combinar y eliminar duplicados por ID
        const eventosCombinados = combinarEventos(eventosGenerales, eventosEscuela);
        
        console.log(`📦 Total eventos combinados: ${eventosCombinados.length}`);
        
        // Formatear fechas
        eventos = eventosCombinados.map(evento => ({
            ...evento,
            fecha: formatearFecha(evento.fecha, evento.hora)
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
 * Obtener eventos generales desde la API
 */
async function fetchEventosGenerales() {
    try {
        const url = `${API_CONFIG.base}${API_CONFIG.endpoints.todosEventos}`;
        console.log('🌐 Obteniendo eventos generales:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            return data.data;
        }
        
        return [];
        
    } catch (error) {
        console.error('Error al obtener eventos generales:', error);
        return [];
    }
}

/**
 * Obtener eventos específicos de una escuela desde la API
 */
async function fetchEventosPorEscuela(id_escuela) {
    try {
        const url = `${API_CONFIG.base}${API_CONFIG.endpoints.eventosPorEscuela}/${id_escuela}`;
        console.log('🏫 Obteniendo eventos de escuela:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            return data.data;
        }
        
        return [];
        
    } catch (error) {
        console.error('Error al obtener eventos de escuela:', error);
        return [];
    }
}

/**
 * Combinar arrays de eventos y eliminar duplicados
 */
function combinarEventos(eventosGenerales, eventosEscuela) {
    // Crear un Map para eliminar duplicados por ID
    const mapaEventos = new Map();
    
    // Agregar eventos generales
    eventosGenerales.forEach(evento => {
        mapaEventos.set(evento.id, evento);
    });
    
    // Agregar eventos de escuela (sobrescribe si ya existe)
    eventosEscuela.forEach(evento => {
        mapaEventos.set(evento.id, evento);
    });
    
    // Convertir de vuelta a array
    return Array.from(mapaEventos.values());
}

/**
 * Formatear fecha para mostrar
 */
function formatearFecha(fecha, hora) {
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const fechaObj = new Date(fecha + 'T00:00:00');
    const dia = fechaObj.getDate();
    const mes = meses[fechaObj.getMonth()];
    
    // Formatear hora
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const periodo = horaNum >= 12 ? 'p.m.' : 'a.m.';
    const hora12 = horaNum > 12 ? horaNum - 12 : (horaNum === 0 ? 12 : horaNum);
    
    return `${dia} de ${mes} · ${hora12}:${minutos} ${periodo}`;
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
            <article class="card evento-card h-100" role="article" aria-labelledby="evento-${evento.id}">
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
                                <i class="bi bi-currency-dollar me-1"></i>
                                ${evento.costo === 0 ? 'Gratuito' : `₡${evento.costo}`}
                            </span>
                            <small class="text-muted">
                                <i class="bi bi-people me-1"></i>
                                ${evento.disponibles}/${evento.capacidad} disponibles
                            </small>
                        </div>
                        
                        ${estadoReserva.html}
                    </div>
                </div>
            </article>
        `;

        contenedor.appendChild(col);
    });

    // Agregar event listeners a los botones
    agregarEventListenersReserva();
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
