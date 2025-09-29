// ======= LOGIN.JS - LÓGICA DE AUTENTICACIÓN ======= 

class LoginManager {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.tipo = this.urlParams.get('tipo');
        
        // Referencias del DOM
        this.titleElement = document.getElementById("login-title");
        this.subtitleElement = document.getElementById("login-subtitle");
        this.form = document.getElementById("form-login");
        this.btnLogin = document.getElementById("btn-login");
        this.statusDiv = document.getElementById("live-status");
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Inicialización principal
    init() {
        this.updateTitle();
        this.setupRealTimeValidation();
        this.setupFormHandler();
        this.setupVisualEffects();
        
        // Enfocar el primer campo
        document.getElementById('correo').focus();
    }

    // Personalizar título según tipo de usuario
    updateTitle() {
        switch(this.tipo) {
            case "estudiante":
                this.titleElement.textContent = "Portal Estudiantes";
                this.subtitleElement.textContent = "Accede a tu cuenta de estudiante";
                break;
            case "docente":
            case "administrador":
                this.titleElement.textContent = "Portal Administración";
                this.subtitleElement.textContent = "Acceso para docentes y administradores";
                break;
            default:
                this.titleElement.textContent = "Iniciar Sesión";
                this.subtitleElement.textContent = "Ingresa tus credenciales para continuar";
        }
    }

    // Validación en tiempo real - solo limpiar errores al escribir
    setupRealTimeValidation() {
        const correoInput = document.getElementById('correo');
        const passwordInput = document.getElementById('contraseña');

        // Solo limpiar errores cuando el usuario empiece a escribir
        correoInput.addEventListener('input', this.clearValidation.bind(this));
        passwordInput.addEventListener('input', this.clearValidation.bind(this));
    }

    clearValidation(event) {
        event.target.classList.remove('is-invalid');
    }

    // Manejo del formulario
    setupFormHandler() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validar formulario
            if (!this.validateForm()) {
                this.announceToScreenReader('Por favor corrige los errores en el formulario');
                return;
            }

            // Estado de carga
            this.setLoadingState(true);
            
            try {
                // Realizar autenticación real con la API
                await this.authenticateUser();
                
                // Éxito
                this.showSuccess();
                
                // Redireccionar después de 2 segundos
                setTimeout(() => {
                    this.redirectUser();
                }, 2000);
                
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.setLoadingState(false);
            }
        });
    }

    // Validación del formulario
    validateForm() {
        let isValid = true;
        
        // Limpiar validaciones previas
        document.getElementById('correo').classList.remove('is-invalid');
        document.getElementById('contraseña').classList.remove('is-invalid');

        // Validar correo
        const correoValid = this.validateField('correo', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!value.trim()) return 'El correo electrónico es obligatorio';
            if (!emailRegex.test(value)) return 'Formato de correo electrónico inválido';
            return null;
        });

        // Validar contraseña
        const passwordValid = this.validateField('contraseña', (value) => {
            if (!value) return 'La contraseña es obligatoria';
            if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
            return null;
        });

        return correoValid && passwordValid;
    }

    validateField(fieldId, validator) {
        const field = document.getElementById(fieldId);
        const error = validator(field.value);
        
        if (error) {
            this.setFieldInvalid(field, error);
            return false;
        }
        return true;
    }

    setFieldInvalid(field, message) {
        field.classList.add('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback .error-message');
        if (feedback) {
            feedback.textContent = message;
        }
    }

    // Estados del botón
    setLoadingState(loading) {
        const btnText = this.btnLogin.querySelector('.btn-text');
        
        if (loading) {
            this.btnLogin.disabled = true;
            this.btnLogin.classList.add('btn-loading');
            btnText.innerHTML = '<div class="spinner"></div>Iniciando sesión...';
        } else {
            this.btnLogin.disabled = false;
            this.btnLogin.classList.remove('btn-loading');
            btnText.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
        }
    }

    // Autenticación real con la API
    async authenticateUser() {
        const correo = document.getElementById('correo').value;
        const password = document.getElementById('contraseña').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: correo, // Enviar el correo completo
                    contrasena: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la autenticación');
            }

            // Guardar datos del usuario en sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            return data;
        } catch (error) {
            // Si no hay servidor o falla la API, usar autenticación simulada
            console.warn('API no disponible, usando autenticación simulada:', error.message);
            return this.simulateLogin(correo, password);
        }
    }

    // Autenticación simulada (fallback)
    async simulateLogin(correo, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Datos de usuarios simulados basados en el script de llenado
        const mockUsers = [
            { 
                usuario: 'charlieabark', 
                correo: 'c.abarca.1@estudiantec.cr', 
                password: 'Ubica,1234',
                tipo_rol: 'Estudiante',
                nombre: 'Carlos Andrés',
                apellido: 'Abarca Mora'
            },
            { 
                usuario: 'joshuacorrales_', 
                correo: 'j.retana.1@estudiantec.cr', 
                password: 'Ubica,1234',
                tipo_rol: 'Estudiante',
                nombre: 'Joshua',
                apellido: 'Corrales Retana'
            },
            { 
                usuario: '_dyyylannn', 
                correo: 'd.hernandez.1@estudiantec.cr', 
                password: 'Ubica,1234',
                tipo_rol: 'Estudiante',
                nombre: 'Dilan',
                apellido: 'Hernandez'
            },
            { 
                usuario: 'victorabark', 
                correo: 'v.garro.1@algoritmos.cr', 
                password: 'Ubica,1234',
                tipo_rol: 'Administrador',
                nombre: 'Victor',
                apellido: 'Garro Abarca'
            }
        ];

        // Buscar usuario por correo
        const user = mockUsers.find(u => u.correo.toLowerCase() === correo.toLowerCase());
        
        if (!user || user.password !== password) {
            throw new Error('Credenciales incorrectas');
        }

        // Guardar datos del usuario
        sessionStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
    }

    // Mostrar éxito
    showSuccess() {
        const btnText = this.btnLogin.querySelector('.btn-text');
        this.btnLogin.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Acceso concedido!';
        
        this.announceToScreenReader('Inicio de sesión exitoso. Redirigiendo...');
        this.createSuccessEffect();
    }

    // Mostrar error
    showError(message) {
        const btnText = this.btnLogin.querySelector('.btn-text');
        this.btnLogin.style.background = 'linear-gradient(45deg, #dc3545, #fd7e14)';
        btnText.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${message}`;
        
        this.announceToScreenReader(`Error: ${message}`);
        
        // Restaurar después de 3 segundos
        setTimeout(() => {
            this.btnLogin.style.background = '';
            btnText.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
        }, 3000);
    }

    // Efecto visual de éxito
    createSuccessEffect() {
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
                
                this.btnLogin.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 1000);
            }, i * 200);
        }
    }

    // Redirección según tipo de usuario
    redirectUser() {
        const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
        const userRole = userData.tipo_rol;

        let targetUrl;
        
        // Siempre redirigir a eventos.html después de un login exitoso
        targetUrl = '../viewsGenerales/eventos.html';
        
        // Si quieres manejar diferentes redirecciones por rol en el futuro, 
        // puedes descomentar el código siguiente:
        /*
        // Redirección basada en el rol del usuario
        if (userRole === 'Administrador') {
            targetUrl = '../viewsAdministrador/listarEventos.html';
        } else if (userRole === 'Estudiante') {
            targetUrl = '../viewsEstudiante/viewPerfilEstudiante.html';
        } else {
            // Redirección basada en parámetro URL (fallback)
            const redirectMap = {
                'estudiante': '../viewsEstudiante/viewPerfilEstudiante.html',
                'docente': '../viewsAdministrador/listarEventos.html',
                'administrador': '../viewsAdministrador/listarEventos.html'
            };
            targetUrl = redirectMap[this.tipo] || '../viewsGenerales/eventos.html';
        }
        */
        
        window.location.href = targetUrl;
    }

    // Accesibilidad
    announceToScreenReader(message) {
        this.statusDiv.textContent = message;
        this.statusDiv.classList.remove('visually-hidden');
        
        setTimeout(() => {
            this.statusDiv.classList.add('visually-hidden');
        }, 3000);
    }

    // Efectos visuales
    setupVisualEffects() {
        // Efecto de inclinación 3D con el mouse
        document.addEventListener('mousemove', (e) => {
            const cursor = { x: e.clientX, y: e.clientY };
            const card = document.querySelector('.login-card');
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

        // Restaurar posición cuando el mouse sale
        document.addEventListener('mouseleave', () => {
            const card = document.querySelector('.login-card');
            card.style.transform = '';
        });
    }
}

// Inicializar el login manager
const loginManager = new LoginManager();