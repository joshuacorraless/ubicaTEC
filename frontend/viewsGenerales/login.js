
//* en este archivo se maneja la lógica del login en el frontend (validacion de fomrulario, llamada a API, manejo de respuestas)




document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-login');
    const correoInput = document.getElementById('correo');
    const passwordInput = document.getElementById('contraseña');
    const btnLogin = document.getElementById('btn-login');

    // Limpiar errores al escribir de nuevo
    correoInput.addEventListener('input', () => {
        limpiarError(correoInput);
    });

    passwordInput.addEventListener('input', () => {
        limpiarError(passwordInput);
    });

    // Manejo del submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar formulario
        if (!validarFormulario()) {
            return;
        }

        // Mostrar estado de carga
        setLoadingState(true);

        try {
            // Llamar a la API de login
            const correo = correoInput.value.trim();
            const contrasena = passwordInput.value;

            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await response.json();

            if (data.success) {
                // Guardar en sessionStorage
                sessionStorage.setItem('id_usuario', data.data.id_usuario);
                sessionStorage.setItem('nombre', data.data.nombre);
                sessionStorage.setItem('apellido', data.data.apellido);
                sessionStorage.setItem('correo', data.data.correo);
                sessionStorage.setItem('tipo_rol', data.data.tipo_rol);
                sessionStorage.setItem('id_escuela', data.data.id_escuela || '');
                sessionStorage.setItem('escuela', data.data.escuela || '');

                // Mostrar mensaje de éxito
                mostrarExito();

                // Redireccionar a eventos.html
                setTimeout(() => {
                    window.location.href = 'eventos.html';
                }, 1500);
            } else {
                // Mostrar error del servidor
                mostrarErrorServidor(data.message);
            }

        } catch (error) {
            console.error('Error en login:', error);
            mostrarErrorServidor('Error de conexión con el servidor. Intenta nuevamente.');
        } finally {
            setTimeout(() => setLoadingState(false), 500);
        }
    });

    // Función de validación
    function validarFormulario() {
        let isValid = true;

        // Limpiar errores previos
        limpiarError(correoInput);
        limpiarError(passwordInput);

        // Validar correo
        const correo = correoInput.value.trim();
        if (!correo) {
            mostrarError(correoInput, 'El correo electrónico es obligatorio');
            isValid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                mostrarError(correoInput, 'El formato del correo no es válido');
                isValid = false;
            }
        }

        // Validar contraseña
        const password = passwordInput.value;
        if (!password) {
            mostrarError(passwordInput, 'La contraseña es obligatoria');
            isValid = false;
        } else if (password.length < 8) {
            mostrarError(passwordInput, 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }

        return isValid;
    }

    // Mostrar error en campo
    function mostrarError(input, mensaje) {
        input.classList.add('is-invalid');
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        const errorMessage = errorDiv.querySelector('.error-message');
        errorMessage.textContent = mensaje;
        errorDiv.style.display = 'block';
    }

    // Limpiar error de campo
    function limpiarError(input) {
        input.classList.remove('is-invalid');
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        errorDiv.style.display = 'none';
    }

    // Mostrar error del servidor
    function mostrarErrorServidor(mensaje) {
        // Mostrar error en ambos campos según el tipo de error
        if (mensaje.toLowerCase().includes('contraseña')) {
            mostrarError(passwordInput, mensaje);
        } else if (mensaje.toLowerCase().includes('usuario') || mensaje.toLowerCase().includes('correo')) {
            mostrarError(correoInput, mensaje);
        } else {
            // Error genérico - mostrar en el correo
            mostrarError(correoInput, mensaje);
        }
    }

    // Mostrar éxito
    function mostrarExito() {
        // Cambiar el botón a éxito
        const btnText = btnLogin.querySelector('.btn-text');
        btnLogin.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
        btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Login exitoso!';
    }

    // Estado de carga del botón
    function setLoadingState(loading) {
        const btnText = btnLogin.querySelector('.btn-text');
        
        if (loading) {
            btnLogin.disabled = true;
            btnLogin.style.opacity = '0.7';
            btnText.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Iniciando sesión...';
        } else {
            btnLogin.disabled = false;
            btnLogin.style.opacity = '1';
            btnText.textContent = 'Iniciar Sesión';
        }
    }
});
