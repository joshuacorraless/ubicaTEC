// Referencias del DOM
const nombreElement = document.getElementById('usuario-nombre');
const emailElement = document.getElementById('usuario-email');
const usuarioElement = document.getElementById('usuario-usuario');
const tipoElement = document.getElementById('usuario-tipo');
const carneElement = document.getElementById('usuario-carne');
const escuelaElement = document.getElementById('usuario-escuela');
const ingresoElement = document.getElementById('usuario-ingreso');

// Contenedores de campos
const carneItem = document.querySelector('[data-field="carne"]');
const escuelaItem = document.querySelector('[data-field="escuela"]');
const ingresoItem = document.querySelector('[data-field="ingreso"]');

// Obtener datos de sesión
function obtenerDatosSesion() {
  const idUsuario = sessionStorage.getItem('id_usuario');
  const tipoRol = sessionStorage.getItem('tipo_rol');
  
  if (!idUsuario || !tipoRol) {
    // Si no hay sesión, redirigir al login
    window.location.href = 'login.html';
    return null;
  }
  
  return {
    id_usuario: idUsuario,
    tipo_rol: tipoRol
  };
}

// Cargar perfil desde la API
async function cargarPerfil() {
  const sesion = obtenerDatosSesion();
  if (!sesion) return;
  
  try {
    const response = await fetch(`https://ubicatec-production-bfb7.up.railway.app/api/perfil/${sesion.id_usuario}`);
    const data = await response.json();
    
    if (data.success) {
      mostrarDatosUsuario(data.data);
      adaptarVistaPorTipo(sesion.tipo_rol);
    } else {
      mostrarError('No se pudo cargar el perfil');
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    mostrarError('Error de conexión con el servidor');
  }
}

// Mostrar datos del usuario
function mostrarDatosUsuario(usuario) {
  nombreElement.textContent = `${usuario.nombre} ${usuario.apellido}`;
  emailElement.textContent = usuario.correo;
  usuarioElement.textContent = usuario.usuario;
  tipoElement.textContent = obtenerNombreTipo(usuario.tipo_rol);
  
  // Mostrar escuela si existe
  if (usuario.escuela) {
    escuelaElement.textContent = usuario.escuela;
  } else {
    escuelaElement.textContent = 'N/A';
  }
}

// Adaptar vista según tipo de usuario
function adaptarVistaPorTipo(tipoRol) {
  if (tipoRol === 'Estudiante') {
    // Estudiante: eliminar carné e ingreso, mantener escuela
    ocultarCampo(carneItem);
    ocultarCampo(ingresoItem);
    mostrarCampo(escuelaItem);
    
  } else if (tipoRol === 'Administrador') {
    // Administrador: eliminar carné, ingreso y escuela
    ocultarCampo(carneItem);
    ocultarCampo(ingresoItem);
    ocultarCampo(escuelaItem);
    
  } else if (tipoRol === 'Visitante') {
    // Visitante: eliminar carné, ingreso y escuela
    ocultarCampo(carneItem);
    ocultarCampo(ingresoItem);
    ocultarCampo(escuelaItem);
  }
}

// Ocultar campo
function ocultarCampo(elemento) {
  if (elemento) {
    elemento.style.display = 'none';
  }
}

// Mostrar campo
function mostrarCampo(elemento) {
  if (elemento) {
    elemento.style.display = 'flex';
  }
}

// Obtener nombre legible del tipo de usuario
function obtenerNombreTipo(tipo) {
  const tipos = {
    'Estudiante': 'Estudiante TEC',
    'Administrador': 'Administrador',
    'Visitante': 'Visitante'
  };
  return tipos[tipo] || tipo;
}

// Mostrar error
function mostrarError(mensaje) {
  const statusDiv = document.getElementById('live-status');
  if (statusDiv) {
    statusDiv.textContent = mensaje;
    statusDiv.classList.remove('visually-hidden');
    
    setTimeout(() => {
      statusDiv.classList.add('visually-hidden');
    }, 3000);
  }
  
  console.error(mensaje);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  cargarPerfil();
  document.getElementById('year').textContent = new Date().getFullYear();
});

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
