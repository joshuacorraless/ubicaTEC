/**
 * UbicaTEC Chatbot Universal Integration
 * Este archivo permite integrar fácilmente el chatbot en cualquier página
 * Simplemente incluye este archivo y llama a UbicaChatbot.init()
 */

window.UbicaChatbot = {
  
  /**
   * Inicializa el chatbot en la página actual
   * @param {Object} config - Configuración específica del chatbot
   * @param {Object} config.responses - Respuestas específicas del contexto
   * @param {Array} config.quickActions - Acciones rápidas personalizadas
   * @param {string} config.welcomeMessage - Mensaje de bienvenida personalizado
   */
  init: function(config = {}) {
    console.log('=== Inicializando UbicaChatbot Universal ===');
    
    // Default configuration
    const defaultConfig = {
      responses: {},
      quickActions: [
        { message: '¿Cómo usar la plataforma?', icon: 'bi-question-circle', text: 'Ayuda general' },
        { message: '¿Dónde está el Auditorio D3?', icon: 'bi-geo-alt', text: 'Ubicaciones' },
        { message: 'Ayuda con mi perfil', icon: 'bi-person', text: 'Mi perfil' },
        { message: 'Ver eventos disponibles', icon: 'bi-calendar-event', text: 'Eventos' }
      ],
      welcomeMessage: '¡Hola! Soy tu asistente virtual de ubicaTEC. ¿En qué puedo ayudarte hoy?'
    };
    
    // Merge configurations
    const finalConfig = { ...defaultConfig, ...config };
    
    // Load CSS if not already loaded
    this.loadCSS();
    
    // Load JS if not already loaded
    this.loadJS(() => {
      // Insert chatbot HTML
      this.insertChatbotHTML(finalConfig);
      
      // Wait for DOM insertion then configure
      setTimeout(() => {
        this.configureChatbot(finalConfig);
      }, 100);
    });
  },
  
  /**
   * Load chatbot CSS
   */
  loadCSS: function() {
    if (document.querySelector('link[href*="chatbot.css"]')) {
      console.log('Chatbot CSS ya está cargado');
      return;
    }
    
    console.log('Cargando Chatbot CSS...');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = this.getRelativePath() + 'viewsChatbot/chatbot.css';
    document.head.appendChild(link);
  },
  
  /**
   * Load chatbot JS
   */
  loadJS: function(callback) {
    if (window.openChatbot) {
      console.log('Chatbot JS ya está cargado');
      callback();
      return;
    }
    
    console.log('Cargando Chatbot JS...');
    const script = document.createElement('script');
    script.src = this.getRelativePath() + 'viewsChatbot/chatbot.js';
    script.onload = callback;
    script.onerror = function() {
      console.error('Error cargando chatbot.js');
      alert('Error cargando el chatbot. Por favor, recarga la página.');
    };
    document.body.appendChild(script);
  },
  
  /**
   * Get relative path to viewsChatbot directory based on current location
   */
  getRelativePath: function() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('viewsAdministrador')) return '../';
    if (currentPath.includes('viewsEstudiante')) return '../';
    if (currentPath.includes('viewsGenerales')) return '../';
    if (currentPath.includes('viewsChatbot')) return './';
    return './frontend/';
  },
  
  /**
   * Insert chatbot HTML into the page
   */
  insertChatbotHTML: function(config) {
    console.log('Insertando HTML del chatbot...');
    
    // Check if chatbot container already exists
    if (document.getElementById('chatbot')) {
      console.log('Chatbot ya existe en la página');
      return;
    }
    
    // Create chatbot HTML with full accessibility support
    const chatbotHTML = `
      <!-- Chatbot Container -->
      <div id="chatbot-container">
        <div id="chatbot" class="chatbot-container" role="dialog" aria-labelledby="chatbot-title" aria-describedby="chatbot-description" aria-modal="false">
          <!-- Screen reader only description -->
          <div id="chatbot-description" class="visually-hidden">
            Chatbot de asistencia virtual de ubicaTEC. Use las teclas Tab y Enter para navegar e interactuar.
          </div>
          
          <!-- Header -->
          <div class="chatbot-header">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-robot fs-5" aria-hidden="true"></i>
              <h6 id="chatbot-title">Asistente ubicaTEC</h6>
            </div>
            <button class="chatbot-close" onclick="closeChatbot()" aria-label="Cerrar ventana de chatbot" title="Cerrar chatbot">
              <i class="bi bi-x" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Chat Body -->
          <div class="chatbot-body" id="chatMessages" role="log" aria-live="polite" aria-atomic="false" aria-relevant="additions">
            <!-- Welcome Message -->
            <div class="message bot" role="article" aria-label="Mensaje del asistente">
              <div class="message-avatar" aria-hidden="true">
                <i class="bi bi-robot"></i>
              </div>
              <div class="message-content">
                ${config.welcomeMessage}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions" role="group" aria-label="Acciones rápidas sugeridas">
              ${config.quickActions.map(action => 
                `<button class="quick-action" onclick="window.sendQuickMessage('${action.message}')" type="button" aria-label="Pregunta rápida: ${action.text}">
                  <i class="bi ${action.icon} me-1" aria-hidden="true"></i>${action.text}
                </button>`
              ).join('')}
            </div>

            <!-- Typing Indicator -->
            <div class="message bot" id="typingIndicator" role="status" aria-live="polite" aria-label="El asistente está escribiendo">
              <div class="message-avatar" aria-hidden="true">
                <i class="bi bi-robot"></i>
              </div>
              <div class="typing-indicator">
                <div class="typing-dots">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
                <span class="visually-hidden">El asistente está escribiendo una respuesta</span>
              </div>
            </div>
          </div>

          <!-- Live region for screen reader announcements -->
          <div id="chatbot-sr-announcements" class="visually-hidden" role="status" aria-live="assertive" aria-atomic="true"></div>

          <!-- Input Area -->
          <div class="chatbot-input">
            <form onsubmit="event.preventDefault(); sendMessage();" aria-label="Formulario para enviar mensaje">
              <div class="input-group">
                <label for="messageInput" class="visually-hidden">Escribe tu mensaje para el asistente</label>
                <input 
                  type="text" 
                  id="messageInput" 
                  class="form-control" 
                  placeholder="Escribe tu mensaje aquí..." 
                  onkeypress="handleKeyPress(event)"
                  aria-label="Campo de texto para escribir mensaje"
                  aria-describedby="messageInputHelp"
                  autocomplete="off"
                  maxlength="500">
                <span id="messageInputHelp" class="visually-hidden">Presiona Enter para enviar tu mensaje</span>
                <button class="btn-send" type="submit" onclick="sendMessage()" aria-label="Enviar mensaje al asistente" title="Enviar mensaje">
                  <i class="bi bi-send-fill" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Insert at the end of body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    console.log('HTML del chatbot insertado exitosamente');
  },
  
  /**
   * Configure chatbot with specific responses and actions
   */
  configureChatbot: function(config) {
    console.log('Configurando chatbot...');
    
    // Update specific responses
    if (typeof window.updateSpecificResponses === 'function') {
      window.updateSpecificResponses(config.responses);
      console.log('Respuestas específicas actualizadas');
    }
    
    console.log('Chatbot configurado y listo');
  },
  
  /**
   * Utility function to detect current page context
   */
  detectPageContext: function() {
    const currentPath = window.location.pathname.toLowerCase();
    const currentFile = currentPath.split('/').pop().replace('.html', '');
    
    if (currentPath.includes('administrador')) {
      return 'admin';
    } else if (currentPath.includes('estudiante')) {
      return 'student';
    } else if (currentPath.includes('general')) {
      return 'general';
    }
    
    return 'general';
  },
  
  /**
   * Get context-specific configuration
   */
  getContextConfig: function(customConfig = {}) {
    const context = this.detectPageContext();
    const currentFile = window.location.pathname.split('/').pop().replace('.html', '');
    
    const contextConfigs = {
      admin: {
        responses: {
          "administrar": "Como administrador, puedes gestionar eventos, usuarios y configuraciones del sistema desde tu panel de control.",
          "crear evento": "Para crear un evento, ve a 'Gestión de eventos' > 'Crear nuevo evento' y completa todos los campos obligatorios.",
          "editar evento": "Para editar un evento, selecciona el evento desde 'Gestión de eventos', haz clic en 'Editar' y modifica los campos necesarios.",
          "listar eventos": "En 'Gestión de eventos' puedes ver todos los eventos, filtrar por estado, fecha, y realizar acciones como editar o eliminar."
        },
        quickActions: [
          { message: '¿Cómo gestionar eventos?', icon: 'bi-calendar-gear', text: 'Gestión eventos' },
          { message: '¿Dónde está el Auditorio D3?', icon: 'bi-geo-alt', text: 'Ubicaciones' },
          { message: 'Ayuda con configuración', icon: 'bi-gear', text: 'Configuración' },
          { message: 'Panel de administrador', icon: 'bi-speedometer2', text: 'Panel admin' }
        ]
      },
      student: {
        responses: {
          "estudiante": "Como estudiante, puedes ver eventos disponibles, inscribirte a eventos y gestionar tu perfil.",
          "inscribirse": "Para inscribirte a un evento, busca el evento que te interesa y haz clic en 'Inscribirse'.",
          "perfil": "Puedes editar tu perfil accediendo a 'Mi perfil' donde puedes actualizar tu información personal."
        },
        quickActions: [
          { message: '¿Cómo ver eventos?', icon: 'bi-calendar-event', text: 'Ver eventos' },
          { message: '¿Cómo inscribirme?', icon: 'bi-person-plus', text: 'Inscripciones' },
          { message: 'Ayuda con mi perfil', icon: 'bi-person-gear', text: 'Mi perfil' },
          { message: '¿Dónde están los eventos?', icon: 'bi-geo-alt', text: 'Ubicaciones' }
        ]
      },
      general: {
        responses: {
          "login": "Para acceder a tu cuenta, ingresa tu correo electrónico y contraseña. Si eres nuevo, puedes registrarte.",
          "registro": "Para crear una cuenta, completa todos los campos del formulario de registro con tu información personal.",
          "eventos": "Puedes ver todos los eventos disponibles en la página de eventos. Algunos requieren inscripción previa."
        },
        quickActions: [
          { message: '¿Cómo crear una cuenta?', icon: 'bi-person-plus', text: 'Registro' },
          { message: 'Ver eventos disponibles', icon: 'bi-calendar-event', text: 'Eventos' },
          { message: 'Ayuda para acceder', icon: 'bi-box-arrow-in-right', text: 'Acceso' },
          { message: '¿Dónde están los eventos?', icon: 'bi-geo-alt', text: 'Ubicaciones' }
        ]
      }
    };
    
    // Page-specific overrides
    const pageSpecificConfigs = {
      'editarEvento': {
        responses: {
          ...contextConfigs.admin.responses,
          "capacidad": "La capacidad máxima debe ser un número positivo que represente cuántas personas pueden asistir al evento.",
          "fecha": "Selecciona una fecha futura para tu evento. El sistema no permite crear eventos en fechas pasadas."
        },
        quickActions: [
          { message: '¿Cómo editar un evento?', icon: 'bi-calendar-check', text: 'Editar evento' },
          { message: '¿Dónde está el Auditorio D3?', icon: 'bi-geo-alt', text: 'Ubicaciones' },
          { message: 'Ayuda con campos', icon: 'bi-info-circle', text: 'Campos' },
          { message: 'Gestión de eventos', icon: 'bi-calendar-event', text: 'Ver eventos' }
        ]
      }
    };
    
    // Get base context config
    const baseConfig = contextConfigs[context] || contextConfigs.general;
    
    // Apply page-specific config if exists
    const pageConfig = pageSpecificConfigs[currentFile] || {};
    
    // Merge all configurations
    return {
      responses: { ...baseConfig.responses, ...(pageConfig.responses || {}), ...(customConfig.responses || {}) },
      quickActions: pageConfig.quickActions || customConfig.quickActions || baseConfig.quickActions,
      welcomeMessage: customConfig.welcomeMessage || "¡Hola! Soy tu asistente virtual de ubicaTEC. ¿En qué puedo ayudarte hoy?"
    };
  }
};

console.log('UbicaChatbot Universal Integration cargado exitosamente');