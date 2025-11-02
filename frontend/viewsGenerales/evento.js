// evento.js - Lógica para la página de detalle y reserva de evento

// Configuración de API
const API_CONFIG = {
    base: 'http://localhost:3000/api',
    endpoints: {
        eventoDetalle: '/evento',
        crearReserva: '/evento/reserva',
        verificarReserva: '/evento/verificar-reserva'
    }
};

// Variables globales
let eventoActual = null;
let usuarioActual = null;

/**
 * Inicializar la página de evento
 */
async function inicializarEvento() {
    console.log('🚀 Inicializando página de evento...');
    
    // Obtener ID del evento desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('id');
    
    if (!eventoId) {
        mostrarError('No se especificó un evento');
        return;
    }
    
    // Cargar usuario desde sessionStorage
    cargarUsuario();
    
    // Cargar evento desde la API
    await cargarEvento(eventoId);
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar año en footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarEvento);

/**
 * Cargar información del usuario desde sessionStorage
 */
function cargarUsuario() {
    // Obtener nombre y apellido del sessionStorage
    const nombre = sessionStorage.getItem('nombre') || '';
    const apellido = sessionStorage.getItem('apellido') || '';
    const nombreCompleto = `${nombre} ${apellido}`.trim() || 'Usuario';
    
    usuarioActual = {
        id: sessionStorage.getItem('id_usuario'),
        nombre: nombreCompleto,
        email: sessionStorage.getItem('correo') || sessionStorage.getItem('email') || 'usuario@tec.ac.cr',
        tipo_rol: sessionStorage.getItem('tipo_rol') || 'estudiante',
        escuela: sessionStorage.getItem('escuela') || 'TEC'
    };
    
    console.log('👤 Usuario cargado:', usuarioActual);
    
    // Actualizar información en el DOM
    const nombreElement = document.getElementById('usuario-nombre');
    const emailElement = document.getElementById('usuario-email');
    const tipoElement = document.getElementById('usuario-tipo');
    const carneElement = document.getElementById('usuario-carne');
    
    if (nombreElement) nombreElement.textContent = usuarioActual.nombre;
    if (emailElement) emailElement.textContent = usuarioActual.email;
    if (tipoElement) {
        const tipoTexto = usuarioActual.tipo_rol === 'administrador' ? 'Administrador TEC' : 'Estudiante TEC';
        tipoElement.textContent = tipoTexto;
    }
    if (carneElement) {
        carneElement.textContent = usuarioActual.id || 'N/A';
    }
}

/**
 * Cargar evento desde la API
 */
async function cargarEvento(eventoId) {
    try {
        console.log('🌐 Cargando evento:', eventoId);
        
        const url = `${API_CONFIG.base}${API_CONFIG.endpoints.eventoDetalle}/${eventoId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al cargar el evento');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar el evento');
        }
        
        eventoActual = data.data;
        console.log('✅ Evento cargado:', eventoActual);
        
        // Renderizar evento en el DOM
        renderizarEvento();
        
        // Verificar si el usuario ya tiene una reserva
        if (usuarioActual.id) {
            await verificarReservaExistente();
        }
        
    } catch (error) {
        console.error('❌ Error al cargar evento:', error);
        mostrarError(error.message);
    }
}

/**
 * Renderizar evento en el DOM
 */
function renderizarEvento() {
    if (!eventoActual) return;
    
    // Información principal
    const nombreElement = document.getElementById('nombre-evento');
    const descripcionElement = document.getElementById('descripcion-evento');
    const lugarElement = document.getElementById('lugar-evento');
    const fechaElement = document.getElementById('fecha-evento');
    const capacidadElement = document.getElementById('capacidad-evento');
    const costoElement = document.getElementById('costo-evento');
    
    if (nombreElement) nombreElement.textContent = eventoActual.titulo;
    if (descripcionElement) descripcionElement.textContent = eventoActual.descripcion;
    if (lugarElement) lugarElement.textContent = eventoActual.lugar;
    if (fechaElement) fechaElement.textContent = eventoActual.fechaFormateada;
    if (capacidadElement) capacidadElement.textContent = `${eventoActual.capacidad} personas`;
    
    if (costoElement) {
        const textoGratis = 'Gratis (entrada libre para comunidad TEC)';
        const textoCosto = `₡${eventoActual.costo.toLocaleString('es-CR')}`;
        costoElement.textContent = eventoActual.costo === 0 ? textoGratis : textoCosto;
    }
    
    // Imagen
    const imagenElement = document.querySelector('.evento-imagen img');
    if (imagenElement && eventoActual.img) {
        imagenElement.src = eventoActual.img;
        imagenElement.alt = eventoActual.alt || `Imagen del evento: ${eventoActual.titulo}`;
    }
    
    // Disponibilidad
    const badgeDisponibilidad = document.querySelector('.badge-disponibilidad');
    if (badgeDisponibilidad) {
        const disponibles = eventoActual.disponibles;
        const icono = disponibles > 0 ? 'check-circle' : 'x-circle';
        const clase = disponibles > 0 ? 'badge-disponibilidad' : 'badge bg-danger';
        const texto = disponibles > 0 ? `${disponibles} cupos disponibles` : 'Sin cupos';
        
        badgeDisponibilidad.className = clase;
        badgeDisponibilidad.innerHTML = `<i class="bi bi-${icono} me-1"></i>${texto}`;
    }
    
    // Resumen de reserva
    const resumenEventoElement = document.getElementById('resumen-evento');
    const resumenFechaElement = document.getElementById('resumen-fecha');
    const resumenLugarElement = document.getElementById('resumen-lugar');
    
    if (resumenEventoElement) resumenEventoElement.textContent = eventoActual.titulo;
    if (resumenFechaElement) resumenFechaElement.textContent = eventoActual.fechaFormateada;
    if (resumenLugarElement) {
        // Extraer solo el lugar sin "Campus TEC"
        const lugarCorto = eventoActual.lugar.split(',')[0];
        resumenLugarElement.textContent = lugarCorto;
    }
    
    // Verificar estado del evento
    verificarEstadoEvento();
}

/**
 * Verificar el estado del evento y actualizar el botón de reserva
 */
function verificarEstadoEvento() {
    const btnReservar = document.getElementById('btn-reservar');
    if (!btnReservar) return;
    
    const btnText = btnReservar.querySelector('.btn-text');
    if (!btnText) return;
    
    // Verificar si el evento ya pasó
    const fechaEvento = new Date(eventoActual.fechaCompleta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaEvento < hoy) {
        btnReservar.disabled = true;
        btnReservar.className = 'btn btn-secondary btn-lg w-100 mb-3';
        btnText.innerHTML = '<i class="bi bi-calendar-x me-2"></i>Evento finalizado';
        return;
    }
    
    // Verificar disponibilidad
    if (eventoActual.disponibles === 0 || eventoActual.estado === 'agotado') {
        btnReservar.disabled = true;
        btnReservar.className = 'btn btn-outline-secondary btn-lg w-100 mb-3';
        btnText.innerHTML = '<i class="bi bi-x-circle me-2"></i>Sin cupos disponibles';
        return;
    }
    
    // Verificar si está cancelado
    if (eventoActual.estado === 'cancelado') {
        btnReservar.disabled = true;
        btnReservar.className = 'btn btn-danger btn-lg w-100 mb-3';
        btnText.innerHTML = '<i class="bi bi-x-circle me-2"></i>Evento cancelado';
        return;
    }
}

/**
 * Verificar si el usuario ya tiene una reserva
 */
async function verificarReservaExistente() {
    if (!usuarioActual.id || !eventoActual.id) return;
    
    try {
        const url = `${API_CONFIG.base}${API_CONFIG.endpoints.verificarReserva}?id_evento=${eventoActual.id}&id_usuario=${usuarioActual.id}`;
        const response = await fetch(url);
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.tieneReserva) {
            const btnReservar = document.getElementById('btn-reservar');
            if (btnReservar) {
                btnReservar.disabled = true;
                btnReservar.className = 'btn btn-success btn-lg w-100 mb-3';
                const btnText = btnReservar.querySelector('.btn-text');
                if (btnText) {
                    btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>Ya tienes una reserva';
                }
            }
        }
        
    } catch (error) {
        console.error('Error al verificar reserva existente:', error);
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Botón de Google Maps
    const btnMaps = document.getElementById('btn-maps');
    if (btnMaps) {
        btnMaps.addEventListener('click', () => {
            if (eventoActual && eventoActual.lugar) {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(eventoActual.lugar)}`;
                window.open(url, '_blank');
            }
        });
    }
    
    // Botón de reserva
    const btnReservar = document.getElementById('btn-reservar');
    if (btnReservar) {
        btnReservar.addEventListener('click', handleReservation);
    }
}

/**
 * Manejar el proceso de reserva
 */
async function handleReservation() {
    const btnReservar = document.getElementById('btn-reservar');
    if (!btnReservar || btnReservar.disabled) return;
    
    // Verificar que haya un usuario autenticado
    if (!usuarioActual.id) {
        showError('Debes iniciar sesión para reservar');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Estado de carga
    setLoadingState(true);
    
    try {
        // Crear reserva
        const url = `${API_CONFIG.base}${API_CONFIG.endpoints.crearReserva}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_evento: eventoActual.id,
                id_usuario: usuarioActual.id
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al crear la reserva');
        }
        
        if (data.success) {
            showSuccess(data.message);
        } else {
            throw new Error(data.message || 'Error al crear la reserva');
        }
        
    } catch (error) {
        console.error('❌ Error al crear reserva:', error);
        showError(error.message);
    } finally {
        setTimeout(() => setLoadingState(false), 1000);
    }
}

/**
 * Establecer estado de carga del botón
 */
function setLoadingState(loading) {
    const btnReservar = document.getElementById('btn-reservar');
    if (!btnReservar) return;
    
    const btnText = btnReservar.querySelector('.btn-text');
    if (!btnText) return;
    
    if (loading) {
        btnReservar.disabled = true;
        btnReservar.classList.add('btn-loading');
        btnText.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>Procesando reserva...';
    } else {
        btnReservar.disabled = false;
        btnReservar.classList.remove('btn-loading');
        btnText.innerHTML = '<i class="bi bi-bookmark-plus me-2"></i>Confirmar Reserva';
    }
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccess() {
    // showSuccess(message?) - muestra UI de éxito y toast
    const message = arguments.length > 0 ? arguments[0] : null;
    const btnReservar = document.getElementById('btn-reservar');
    if (!btnReservar) return;
    
    const btnText = btnReservar.querySelector('.btn-text');
    if (!btnText) return;
    
    btnReservar.className = 'btn btn-success btn-lg w-100 mb-3';
    btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Reserva confirmada!';
    
    // Anunciar para accesibilidad
    announceToScreenReader('Reserva confirmada exitosamente. Se envió el correo de confirmación.');
    
    // Mostrar mensaje del servidor si viene, si no usar texto por defecto
    mostrarToast(message || 'Correo de confirmación enviado correctamente.');
    
    // Crear efecto visual
    createSuccessEffect();
    
    // Actualizar disponibilidad
    if (eventoActual) {
        eventoActual.disponibles--;
        eventoActual.asistencia++;
        
        const badgeDisponibilidad = document.querySelector('.badge-disponibilidad');
        if (badgeDisponibilidad && eventoActual.disponibles >= 0) {
            badgeDisponibilidad.innerHTML = `<i class="bi bi-check-circle me-1"></i>${eventoActual.disponibles} cupos disponibles`;
        }
    }
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    const btnReservar = document.getElementById('btn-reservar');
    if (!btnReservar) return;
    
    const btnText = btnReservar.querySelector('.btn-text');
    if (!btnText) return;
    
    btnReservar.className = 'btn btn-danger btn-lg w-100 mb-3';
    btnText.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${message}`;
    
    announceToScreenReader(`Error: ${message}`);
    
    // Restaurar después de 3 segundos
    setTimeout(() => {
        btnReservar.className = 'btn btn-primary btn-lg w-100 mb-3';
        btnText.innerHTML = '<i class="bi bi-bookmark-plus me-2"></i>Confirmar Reserva';
        btnReservar.disabled = false;
    }, 3000);
}

/**
 * Mostrar error de carga general
 */
function mostrarError(mensaje) {
    const contenedor = document.getElementById('contenido-principal');
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading"><i class="bi bi-exclamation-triangle me-2"></i>Error</h4>
            <p>${mensaje}</p>
            <hr>
            <p class="mb-0">
                <a href="eventos.html" class="btn btn-primary">
                    <i class="bi bi-arrow-left me-2"></i>Volver a eventos
                </a>
            </p>
        </div>
    `;
}

/**
 * Crear efecto visual de éxito
 */
function createSuccessEffect() {
    const btnReservar = document.getElementById('btn-reservar');
    if (!btnReservar) return;
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 10px;
                height: 10px;
                background: rgba(40, 167, 69, 0.6);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: ripple 1s ease-out;
                z-index: 1000;
            `;
            
            btnReservar.style.position = 'relative';
            btnReservar.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 1000);
        }, i * 200);
    }
    
    // Agregar animación CSS si no existe
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to { transform: translate(-50%, -50%) scale(4); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Anunciar mensaje para lectores de pantalla
 */
function announceToScreenReader(message) {
    const statusDiv = document.getElementById('live-status');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.classList.remove('visually-hidden');
    
    setTimeout(() => {
        statusDiv.classList.add('visually-hidden');
    }, 3000);
}

/**
 * Mostrar toast de notificación
 */
function mostrarToast(mensaje) {
    try {
        const toastBody = document.getElementById('emailToastBody');
        if (toastBody) toastBody.textContent = mensaje;
        
        const toastEl = document.getElementById('emailToast');
        if (toastEl && window.bootstrap && bootstrap.Toast) {
            const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
            toast.show();
        }
    } catch (e) {
        console.warn('No se pudo mostrar el toast:', e);
    }
}

// Exponer funciones globalmente si es necesario
window.eventoApp = {
    cargarEvento,
    renderizarEvento,
    handleReservation
};
