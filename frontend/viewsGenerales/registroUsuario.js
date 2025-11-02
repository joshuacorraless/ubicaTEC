//* Lógica del formulario de registro de usuarios

// Referencias del DOM
const form = document.getElementById('form-register');
const btnRegister = document.getElementById('btn-register');
const statusDiv = document.getElementById('live-status');
const tipoUsuarioSelect = document.getElementById('tipoUsuario');
const carreraGroup = document.getElementById('carrera-group');
const codigoGroup = document.getElementById('codigo-group');
const carreraSelect = document.getElementById('carrera');
const codigoInput = document.getElementById('codigoAdministrador');

// Función para anunciar cambios a lectores de pantalla
function anunciar(mensaje) {
  statusDiv.textContent = mensaje;
  setTimeout(() => {
    statusDiv.textContent = '';
  }, 1000);
}

// Manejo de campos condicionales
tipoUsuarioSelect.addEventListener('change', function() {
  const tipo = this.value;
  
  // Reset todos los campos condicionales
  carreraGroup.classList.remove('enabled');
  codigoGroup.classList.remove('enabled');
  
  carreraSelect.disabled = true;
  carreraSelect.removeAttribute('required');
  carreraSelect.removeAttribute('aria-required');
  
  codigoInput.disabled = true;
  codigoInput.removeAttribute('required');
  codigoInput.removeAttribute('aria-required');
  
  // Limpiar valores
  carreraSelect.value = '';
  codigoInput.value = '';
  
  // Habilitar campos según tipo
  if (tipo === 'estudiante') {
    carreraGroup.classList.add('enabled');
    carreraSelect.disabled = false;
    carreraSelect.setAttribute('required', '');
    carreraSelect.setAttribute('aria-required', 'true');
    anunciar('Campo de escuela habilitado. Por favor seleccione su escuela.');
  } 
  else if (tipo === 'administrativo') {
    codigoGroup.classList.add('enabled');
    codigoInput.disabled = false;
    codigoInput.setAttribute('required', '');
    codigoInput.setAttribute('aria-required', 'true');
    anunciar('Campo de código de administrador habilitado. El código es 777.');
  }
  else if (tipo === 'visitante') {
    anunciar('Registro como visitante. Los campos de escuela y código quedan deshabilitados.');
  }
});

// Validación en tiempo real - solo limpiar errores al escribir
function setupRealTimeValidation() {
  const inputs = form.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('is-invalid');
    });
  });

  // Validación específica para nombre (solo letras)
  const nombreInput = document.getElementById('nombre');
  nombreInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  });

  // Validación específica para apellido (solo letras)
  const apellidoInput = document.getElementById('apellido');
  apellidoInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  });

  // Validación específica para nombre de usuario (solo letras)
  const usuarioInput = document.getElementById('nombreUsuario');
  usuarioInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-z]/g, '');
  });
}

// Manejo del formulario
function setupFormHandler() {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      announceToScreenReader('Por favor corrige los errores en el formulario');
      return;
    }

    // Estado de carga
    setLoadingState(true);
    
    try {
      // Llamar al API de registro
      const response = await fetch('https://ubicatec-production-bfb7.up.railway.app//api/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: document.getElementById('nombre').value.trim(),
          apellido: document.getElementById('apellido').value.trim(),
          correo: document.getElementById('correo').value.trim(),
          usuario: document.getElementById('nombreUsuario').value.trim(),
          contrasena: document.getElementById('contraseña').value,
          tipoUsuario: document.getElementById('tipoUsuario').value,
          idEscuela: carreraSelect.value || null,
          codigoAdministrador: codigoInput.value || null
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess();
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showError(data.message || 'Error al crear la cuenta');
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      showError('Error de conexión con el servidor');
    } finally {
      setLoadingState(false);
    }
  });
}

function validateForm() {
  let isValid = true;
  
  // Limpiar validaciones previas
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('is-invalid'));

  // Validar nombre
  const nombreValid = validateField('nombre', (value) => {
    if (!value.trim()) return 'El nombre es obligatorio';
    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return 'Solo se permiten letras';
    return null;
  });

  // Validar apellido
  const apellidoValid = validateField('apellido', (value) => {
    if (!value.trim()) return 'El apellido es obligatorio';
    if (value.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return 'Solo se permiten letras';
    return null;
  });

  // Validar nombre de usuario
  const usuarioValid = validateField('nombreUsuario', (value) => {
    if (!value.trim()) return 'El nombre de usuario es obligatorio';
    if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (!/^[a-zA-Z]+$/.test(value)) return 'Solo se permiten letras, sin números ni símbolos';
    return null;
  });

  // Validar correo
  const correoValid = validateField('correo', (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validExtensions = /\.(com|cr|org|net|edu|es|mx|co|gov|info)$/i;
    const acCrExtension = /@[a-zA-Z0-9.-]+\.ac\.cr$/i;
    
    if (!value.trim()) return 'El correo electrónico es obligatorio';
    if (!emailRegex.test(value)) return 'Formato de correo electrónico inválido';
    
    // Verificar si tiene extensión .ac.cr o una extensión válida
    if (!acCrExtension.test(value) && !validExtensions.test(value)) {
      return 'Extensión de correo no válida. Use .com, .cr, .ac.cr, .org, .net, .edu, etc.';
    }
    
    return null;
  });

  // Validar contraseña
  const passwordValid = validateField('contraseña', (value) => {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  });

  // Validar tipo de usuario
  const tipoValid = validateField('tipoUsuario', (value) => {
    if (!value) return 'Debe seleccionar un tipo de usuario';
    return null;
  });

  // Validar escuela (si está habilitada)
  let carreraValid = true;
  if (!carreraSelect.disabled && carreraSelect.hasAttribute('required')) {
    carreraValid = validateField('carrera', (value) => {
      if (!value) return 'Debe seleccionar una escuela';
      return null;
    });
  }

  // Validar código de administrador (si está habilitado)
  let codigoValid = true;
  if (!codigoInput.disabled && codigoInput.hasAttribute('required')) {
    codigoValid = validateField('codigoAdministrador', (value) => {
      if (!value) return 'El código de administrador es obligatorio';
      if (value !== '777') return 'Código de administrador incorrecto';
      return null;
    });
  }

  isValid = nombreValid && apellidoValid && usuarioValid && correoValid && passwordValid && tipoValid && carreraValid && codigoValid;
  return isValid;
}

function validateField(fieldId, validator) {
  const field = document.getElementById(fieldId);
  const error = validator(field.value);
  
  if (error) {
    setFieldInvalid(field, error);
    return false;
  }
  return true;
}

function setFieldInvalid(field, message) {
  field.classList.add('is-invalid');
  const feedback = field.parentNode.querySelector('.invalid-feedback .error-message');
  if (feedback) {
    feedback.textContent = message;
  }
}

function setLoadingState(loading) {
  const btnText = btnRegister.querySelector('.btn-text');
  
  if (loading) {
    btnRegister.disabled = true;
    btnRegister.classList.add('btn-loading');
    btnText.innerHTML = '<div class="spinner"></div>Creando cuenta...';
  } else {
    btnRegister.disabled = false;
    btnRegister.classList.remove('btn-loading');
    btnText.textContent = 'Crear Cuenta';
  }
}

function showSuccess() {
  const btnText = btnRegister.querySelector('.btn-text');
  btnRegister.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
  btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Cuenta creada exitosamente!';
  
  announceToScreenReader('Registro exitoso. Redirigiendo al login...');
  
  // Crear efecto de éxito
  createSuccessEffect();
}

function showError(message) {
  const btnText = btnRegister.querySelector('.btn-text');
  btnRegister.style.background = 'linear-gradient(45deg, #dc3545, #fd7e14)';
  btnText.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${message}`;
  
  announceToScreenReader(`Error: ${message}`);
  
  // Restaurar después de 3 segundos
  setTimeout(() => {
    btnRegister.style.background = '';
    btnText.textContent = 'Crear Cuenta';
  }, 3000);
}

function createSuccessEffect() {
  // Crear ondas de éxito
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple 1s ease-out;
        z-index: 1000;
      `;
      
      btnRegister.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 1000);
    }, i * 200);
  }
}

function announceToScreenReader(message) {
  statusDiv.textContent = message;
  statusDiv.classList.remove('visually-hidden');
  
  setTimeout(() => {
    statusDiv.classList.add('visually-hidden');
  }, 3000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  setupRealTimeValidation();
  setupFormHandler();
  
  // Enfocar el primer campo
  document.getElementById('nombreUsuario').focus();
});

// Efectos adicionales (mismo que el login)
document.addEventListener('mousemove', function(e) {
  const cursor = { x: e.clientX, y: e.clientY };
  const card = document.querySelector('.register-card');
  const rect = card.getBoundingClientRect();
  
  if (cursor.x >= rect.left && cursor.x <= rect.right && 
      cursor.y >= rect.top && cursor.y <= rect.bottom) {
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (cursor.x - centerX) / (rect.width / 2);
    const deltaY = (cursor.y - centerY) / (rect.height / 2);
    
    card.style.transform = `perspective(1000px) rotateY(${deltaX * 2}deg) rotateX(${-deltaY * 2}deg)`;
  }
});

document.addEventListener('mouseleave', function() {
  const card = document.querySelector('.register-card');
  card.style.transform = '';
});
