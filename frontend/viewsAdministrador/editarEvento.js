document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos
  const nombreInput = document.getElementById('nombre-evento');
  const descripcionInput = document.getElementById('descripcion-editar');
  const fechaInput = document.getElementById('fecha-editar');
  const horaInput = document.getElementById('hora');
  const lugarSelect = document.getElementById('lugar-editar');
  const capacidadInput = document.getElementById('capacidad-editar');
  const costoInput = document.getElementById('costo-editar');
  const form = document.getElementById('form-editar');
  const warningsDiv = document.getElementById('warnings-evento');

  // Obtener ID del evento de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idEvento = urlParams.get('id');

  if (!idEvento) {
    showWarnings('No se especificó el ID del evento');
    setTimeout(() => window.location.href = 'listarEventos.html', 2000);
    return;
  }

  // Configurar fecha mínima (hoy)
  fechaInput.min = new Date().toISOString().split('T')[0];

  // Cargar datos del evento
  cargarEvento();

  // Validación de nombre
  nombreInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-:()]/g, '');
    if (this.value.length > 100) this.value = this.value.substring(0, 100);
  });

  // Validación de descripción
  descripcionInput.addEventListener('input', function() {
    if (this.value.length > 500) this.value = this.value.substring(0, 500);
  });

  // Validación de capacidad
  capacidadInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    const val = parseInt(this.value);
    if (val > 1000) this.value = '1000';
    else if (val < 1 && this.value !== '') this.value = '1';
  });

  // Validación de costo
  costoInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9.]/g, '');
    const parts = this.value.split('.');
    if (parts.length > 2) this.value = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 2) this.value = parts[0] + '.' + parts[1].substring(0, 2);
    const val = parseFloat(this.value);
    if (val > 999999) this.value = '999999';
  });

  costoInput.addEventListener('blur', function() {
    if (this.value === '' || this.value === '.') this.value = '0';
  });

  // Cargar evento
  async function cargarEvento() {
    try {
      const res = await fetch('http://localhost:3000/api/eventos/' + idEvento);
      const result = await res.json();
      if (result.success && result.data) {
        const evento = result.data;
        nombreInput.value = evento.titulo || evento.nombre || '';
        descripcionInput.value = evento.descripcion || '';
        fechaInput.value = evento.fecha ? evento.fecha.split('T')[0] : '';
        horaInput.value = evento.hora || '';
        lugarSelect.value = evento.lugar || '';
        capacidadInput.value = evento.capacidad || '';
        costoInput.value = evento.costo || evento.precio || '0';
      } else {
        showWarnings('No se pudo cargar el evento');
        setTimeout(() => window.location.href = 'listarEventos.html', 2000);
      }
    } catch (error) {
      showWarnings('Error de conexión al cargar el evento');
    }
  }

  // Submit
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = nombreInput.value.trim();
    if (nombre.length < 3) {
      showWarnings('El nombre debe tener al menos 3 caracteres');
      nombreInput.focus();
      return;
    }
    const descripcion = descripcionInput.value.trim();
    if (descripcion.length < 20 || descripcion.length > 500) {
      showWarnings('La descripción debe tener entre 20 y 500 caracteres');
      descripcionInput.focus();
      return;
    }
    const capacidad = parseInt(capacidadInput.value);
    if (isNaN(capacidad) || capacidad < 1 || capacidad > 1000) {
      showWarnings('La capacidad debe ser un número entre 1 y 1000');
      capacidadInput.focus();
      return;
    }
    const costo = parseFloat(costoInput.value || '0');
    if (isNaN(costo) || costo < 0) {
      showWarnings('El costo debe ser un número válido');
      costoInput.focus();
      return;
    }
    if (!lugarSelect.value) {
      showWarnings('Debe seleccionar un lugar');
      lugarSelect.focus();
      return;
    }

    const data = {
      nombre, descripcion,
      fecha: fechaInput.value,
      hora: horaInput.value,
      lugar: lugarSelect.value,
      capacidad, precio: costo,
      imagen_url: 'https://via.placeholder.com/800x400/0052CC/ffffff?text=Evento',
      alt_imagen: nombre
    };

    const btn = form.querySelector('button[type=\"submit\"]');
    const txt = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class=\"bi bi-spinner spinner-border spinner-border-sm\"></i> Guardando...';

    try {
      const res = await fetch('http://localhost:3000/api/administradores/eventos/' + idEvento, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        showSuccess('Evento actualizado exitosamente');
        setTimeout(() => window.location.href = 'listarEventos.html', 1500);
      } else {
        showWarnings(result.message);
      }
    } catch (err) {
      showWarnings('Error de conexión con el servidor');
    } finally {
      btn.disabled = false;
      btn.innerHTML = txt;
    }
  });

  function showWarnings(msg) {
    warningsDiv.innerHTML = '<div class=\"alert alert-danger alert-dismissible fade show mt-3\"><i class=\"bi bi-exclamation-triangle-fill me-2\"></i>' + msg + '<button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button></div>';
    warningsDiv.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showSuccess(msg) {
    warningsDiv.innerHTML = '<div class=\"alert alert-success alert-dismissible fade show mt-3\"><i class=\"bi bi-check-circle-fill me-2\"></i>' + msg + '<button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button></div>';
    warningsDiv.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
