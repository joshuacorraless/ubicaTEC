document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos
  const fechaInput = document.getElementById('fecha');
  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const capacidadInput = document.getElementById('capacidad');
  const costoInput = document.getElementById('costo');
  const accesoSelect = document.getElementById('acceso');
  const escuelasContainer = document.getElementById('escuelas-container');
  const escuelasSelect = document.getElementById('escuelas');
  const escuelasError = document.getElementById('escuelas-error');
  const form = document.getElementById('form-registrar');
  const warningsDiv = document.getElementById('warnings-evento');


  // Configurar fecha mínima (hoy)
  fechaInput.min = new Date().toISOString().split('T')[0];

  // Validación de nombre: solo letras, números, espacios y caracteres básicos
  nombreInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-:()]/g, '');
    if (this.value.length > 100) {
      this.value = this.value.substring(0, 100);
    }
  });

  // Validación de descripción: longitud
  descripcionInput.addEventListener('input', function() {
    if (this.value.length > 500) {
      this.value = this.value.substring(0, 500);
    }
  });

  // Validación de capacidad: solo números positivos
  capacidadInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    const val = parseInt(this.value);
    if (val > 1000) {
      this.value = '1000';
    } else if (val < 1 && this.value !== '') {
      this.value = '1';
    }
  });

  capacidadInput.addEventListener('blur', function() {
    if (this.value === '' || parseInt(this.value) < 1) {
      this.value = '';
    }
  });

  // Validación de costo: solo números y punto decimal
  costoInput.addEventListener('input', function() {
    // Permitir solo números, un punto decimal y máximo 2 decimales
    this.value = this.value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos
    const parts = this.value.split('.');
    if (parts.length > 2) {
      this.value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar decimales a 2
    if (parts[1] && parts[1].length > 2) {
      this.value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Limitar valor máximo
    const val = parseFloat(this.value);
    if (val > 999999) {
      this.value = '999999';
    }
  });

  costoInput.addEventListener('blur', function() {
    if (this.value === '' || this.value === '.') {
      this.value = '0';
    } else {
      const val = parseFloat(this.value);
      if (val < 0) {
        this.value = '0';
      }
    }
  });

  // Toggle de escuelas según tipo de acceso
  accesoSelect.addEventListener('change', function() {
    escuelasContainer.style.display = this.value === 'solo_tec' ? 'block' : 'none';
    if (this.value !== 'solo_tec') {
      escuelasSelect.selectedIndex = -1;
      escuelasError.style.display = 'none';
    }
  });

  // Validación y envío del formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar nombre
    const nombre = nombreInput.value.trim();
    if (nombre.length < 3) {
      showWarnings('El nombre debe tener al menos 3 caracteres');
      nombreInput.focus();
      return;
    }

    // Validar descripción
    const descripcion = descripcionInput.value.trim();
    if (descripcion.length < 20) {
      showWarnings('La descripción debe tener al menos 20 caracteres');
      descripcionInput.focus();
      return;
    }
    if (descripcion.length > 500) {
      showWarnings('La descripción no puede exceder 500 caracteres');
      descripcionInput.focus();
      return;
    }

    // Validar capacidad
    const capacidad = parseInt(capacidadInput.value);
    if (isNaN(capacidad) || capacidad < 1 || capacidad > 1000) {
      showWarnings('La capacidad debe ser un número entre 1 y 1000');
      capacidadInput.focus();
      return;
    }

    // Validar costo
    const costo = parseFloat(costoInput.value || '0');
    if (isNaN(costo) || costo < 0) {
      showWarnings('El costo debe ser un número válido (0 o mayor)');
      costoInput.focus();
      return;
    }

    // Validar escuelas si es solo_tec
    if (accesoSelect.value === 'solo_tec' && escuelasSelect.selectedOptions.length === 0) {
      escuelasError.style.display = 'block';
      showWarnings('Debe seleccionar al menos una escuela');
      escuelasSelect.focus();
      return;
    }
    escuelasError.style.display = 'none';

    // Verificar usuario en sessionStorage
    const id_usuario = sessionStorage.getItem('id_usuario');
    const tipo_rol = sessionStorage.getItem('tipo_rol');
    
    if (!id_usuario || tipo_rol !== 'Administrador') {
      showWarnings('Debe iniciar sesión como administrador');
      setTimeout(() => window.location.href = '../viewsGenerales/login.html', 2000);
      return;
    }

    // Validar que haya imagen
    const imagenInput = document.getElementById('imagen');
    if (!imagenInput.files || imagenInput.files.length === 0) {
      showWarnings('Debe seleccionar una imagen para el evento');
      imagenInput.focus();
      return;
    }

    // Validar tamaño de imagen (5MB máximo)
    const imagenFile = imagenInput.files[0];
    if (imagenFile.size > 5 * 1024 * 1024) {
      showWarnings('La imagen no debe superar los 5MB');
      imagenInput.focus();
      return;
    }

    // Validar tipo de imagen
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!tiposPermitidos.includes(imagenFile.type)) {
      showWarnings('Solo se permiten imágenes JPG, PNG o WebP');
      imagenInput.focus();
      return;
    }

    // Preparar datos con FormData para enviar archivo
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('fecha', document.getElementById('fecha').value);
    formData.append('hora', document.getElementById('hora').value);
    formData.append('lugar', document.getElementById('lugar').value);
    formData.append('capacidad', capacidad);
    formData.append('precio', costo);
    formData.append('acceso', accesoSelect.value);
    formData.append('id_creador', parseInt(id_usuario));
    formData.append('alt_imagen', nombre);
    formData.append('imagen', imagenFile);

    // Agregar escuelas si es solo_tec
    if (accesoSelect.value === 'solo_tec') {
      const escuelasArray = Array.from(escuelasSelect.selectedOptions).map(o => parseInt(o.value));
      formData.append('escuelas', JSON.stringify(escuelasArray));
    }

    // Enviar formulario
    const btn = form.querySelector('button[type="submit"]');
    const txt = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-spinner spinner-border spinner-border-sm"></i> Subiendo imagen y registrando...';

    try {
      const res = await fetch('http://localhost:3000/api/administradores/eventos', {
        method: 'POST',
        body: formData
        // NO incluir Content-Type header, el navegador lo configura automáticamente con multipart/form-data
      });
      const result = await res.json();
      if (result.success) {
        showSuccess('Evento creado exitosamente con imagen subida a Cloudinary');
        setTimeout(() => window.location.href = 'listarEventos.html', 1500);
      } else {
        showWarnings(result.message);
      }
    } catch (err) {
      showWarnings('Error de conexión con el servidor');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.innerHTML = txt;
    }
  });

  function showWarnings(msg) {
    warningsDiv.innerHTML = '<div class="alert alert-danger alert-dismissible fade show mt-3"><i class="bi bi-exclamation-triangle-fill me-2"></i>' + msg + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
    warningsDiv.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showSuccess(msg) {
    warningsDiv.innerHTML = '<div class="alert alert-success alert-dismissible fade show mt-3"><i class="bi bi-check-circle-fill me-2"></i>' + msg + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
    warningsDiv.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
