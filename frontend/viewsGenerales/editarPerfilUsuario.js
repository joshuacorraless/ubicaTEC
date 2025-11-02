// Referencias del DOM
const form = document.getElementById('form-editar-perfil');
const status = document.getElementById('live-status');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const correoInput = document.getElementById('correo-electronico');
const usuarioInput = document.getElementById('nombre-usuario');
const passwordInput = document.getElementById('nueva-password');
const btnGuardar = document.querySelector('button[type="submit"]');

let idUsuario = null;

// Obtener datos de sesión
function obtenerDatosSesion() {
  const id = sessionStorage.getItem('id_usuario');
  
  if (!id) {
    // Si no hay sesión, redirigir al login
    window.location.href = 'login.html';
    return null;
  }
  
  return id;
}

// Cargar datos del perfil
async function cargarDatosActuales() {
  idUsuario = obtenerDatosSesion();
  if (!idUsuario) return;
  
  try {
    const response = await fetch(`https://ubicatec-production-bfb7.up.railway.app/api/perfil/${idUsuario}`);
    const data = await response.json();
    
    if (data.success) {
      // Llenar el formulario con los datos actuales
      nombreInput.value = data.data.nombre;
      apellidoInput.value = data.data.apellido;
      correoInput.value = data.data.correo;
      usuarioInput.value = data.data.usuario;
    } else {
      mostrarError('No se pudo cargar la información del perfil');
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    mostrarError('Error de conexión con el servidor');
  }
}

// Configurar validaciones en tiempo real
function setupValidaciones() {
  // Nombre - solo letras
  nombreInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    this.classList.remove('is-invalid');
  });

  // Apellido - solo letras
  apellidoInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    this.classList.remove('is-invalid');
  });

  // Usuario - solo letras
  usuarioInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-z]/g, '');
    this.classList.remove('is-invalid');
  });

  // Limpiar errores al escribir
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('is-invalid');
    });
  });
}

// Validar formulario
function validarFormulario() {
  let isValid = true;
  
  // Limpiar errores previos
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => input.classList.remove('is-invalid'));
  
  // Validar nombre
  if (!nombreInput.value.trim() || nombreInput.value.trim().length < 2) {
    nombreInput.classList.add('is-invalid');
    isValid = false;
  }
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombreInput.value)) {
    nombreInput.classList.add('is-invalid');
    isValid = false;
  }
  
  // Validar apellido
  if (!apellidoInput.value.trim() || apellidoInput.value.trim().length < 2) {
    apellidoInput.classList.add('is-invalid');
    isValid = false;
  }
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellidoInput.value)) {
    apellidoInput.classList.add('is-invalid');
    isValid = false;
  }
  
  // Validar correo
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validExtensions = /\.(com|cr|org|net|edu|es|mx|co|gov|info)$/i;
  const acCrExtension = /@[a-zA-Z0-9.-]+\.ac\.cr$/i;
  
  if (!correoInput.value.trim()) {
    correoInput.classList.add('is-invalid');
    isValid = false;
  } else if (!emailRegex.test(correoInput.value)) {
    correoInput.classList.add('is-invalid');
    isValid = false;
  } else if (!acCrExtension.test(correoInput.value) && !validExtensions.test(correoInput.value)) {
    correoInput.classList.add('is-invalid');
    isValid = false;
  }
  
  // Validar usuario
  if (!usuarioInput.value.trim() || usuarioInput.value.length < 3) {
    usuarioInput.classList.add('is-invalid');
    isValid = false;
  }
  if (!/^[a-zA-Z]+$/.test(usuarioInput.value)) {
    usuarioInput.classList.add('is-invalid');
    isValid = false;
  }
  
  // Validar contraseña si se ingresó
  if (passwordInput.value && passwordInput.value.length < 8) {
    passwordInput.classList.add('is-invalid');
    isValid = false;
  }
  
  return isValid;
}

// Manejar el envío del formulario
async function handleSubmit(e) {
  e.preventDefault();
  
  if (!validarFormulario()) {
    anunciar('Por favor corrige los errores en el formulario');
    return;
  }
  
  // Estado de carga
  setLoadingState(true);
  
  try {
    const datos = {
      nombre: nombreInput.value.trim(),
      apellido: apellidoInput.value.trim(),
      correo: correoInput.value.trim(),
      usuario: usuarioInput.value.trim(),
      nueva_contrasena: passwordInput.value || null
    };
    
    const response = await fetch(`https://ubicatec-production-bfb7.up.railway.app/api/perfil/${idUsuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    const data = await response.json();
    
    if (data.success) {
      mostrarExito();
      setTimeout(() => {
        window.location.href = 'viewPerfilUsuario.html';
      }, 2000);
    } else {
      mostrarError(data.message || 'Error al actualizar el perfil');
    }
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    mostrarError('Error de conexión con el servidor');
  } finally {
    setLoadingState(false);
  }
}

// Estado de carga
function setLoadingState(loading) {
  if (loading) {
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
  } else {
    btnGuardar.disabled = false;
    btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i>Guardar cambios';
  }
}

// Mostrar éxito
function mostrarExito() {
  btnGuardar.classList.remove('btn-primary');
  btnGuardar.classList.add('btn-success');
  btnGuardar.innerHTML = '<i class="bi bi-check-circle me-1"></i>¡Perfil actualizado!';
  anunciar('Perfil actualizado exitosamente');
}

// Mostrar error
function mostrarError(mensaje) {
  anunciar(mensaje);
  status.textContent = mensaje;
  status.classList.remove('visually-hidden');
  
  setTimeout(() => {
    status.classList.add('visually-hidden');
  }, 5000);
}

// Anunciar a lectores de pantalla
function anunciar(mensaje) {
  status.textContent = mensaje;
  status.classList.remove('visually-hidden');
  
  setTimeout(() => {
    status.classList.add('visually-hidden');
  }, 3000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  cargarDatosActuales();
  setupValidaciones();
  form.addEventListener('submit', handleSubmit);
  document.getElementById('year').textContent = new Date().getFullYear();
});

// Función de cierre de sesión
function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Exponer la función globalmente
window.cerrarSesion = cerrarSesion;
