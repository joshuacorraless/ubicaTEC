/**
 * Chatbot ubicaTEC - Integración con Botsonic
 * Usa REST API de Botsonic para respuestas inteligentes
 */

// Configuración de Botsonic
const BOTSONIC_CONFIG = {
    apiUrl: 'https://api-bot.writesonic.com/v1/botsonic/generate',
    token: 'c646fb25-a9dd-4053-b556-9ec444bc52b5',
    botName: 'ubicatec'
};

// Variables globales
let conversationHistory = [];
let isTyping = false;

/**
 * Inicializar chatbot cuando se carga la página
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chatbot ubicaTEC inicializado');
    hideTypingIndicator();
    
    // Ocultar chatbot por defecto
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.style.display = 'none';
    }
    
    // Configurar navegación por teclado
    setupKeyboardNavigation();
    
    // Configurar escape key para cerrar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const chatbot = document.getElementById('chatbot');
            if (chatbot && chatbot.style.display === 'flex') {
                closeChatbot();
            }
        }
    });
});

/**
 * Abrir el chatbot
 */
function openChatbot() {
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        // Guardar elemento que tenía el foco
        window.chatbotPreviousFocus = document.activeElement;
        
        chatbot.style.display = 'flex';
        chatbot.classList.add('chatbot-open');
        chatbot.setAttribute('aria-modal', 'true');
        
        // Anunciar apertura para lectores de pantalla
        announceToScreenReader('Chatbot abierto. Puede escribir su mensaje o usar las acciones rápidas.');
        
        // Focus en el input
        const input = document.getElementById('messageInput');
        if (input) {
            setTimeout(() => {
                input.focus();
                // Trap focus dentro del chatbot
                trapFocus(chatbot);
            }, 300);
        }
    }
}

/**
 * Cerrar el chatbot
 */
function closeChatbot() {
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.classList.remove('chatbot-open');
        chatbot.setAttribute('aria-modal', 'false');
        
        // Anunciar cierre
        announceToScreenReader('Chatbot cerrado');
        
        setTimeout(() => {
            chatbot.style.display = 'none';
            
            // Restaurar foco al elemento anterior
            if (window.chatbotPreviousFocus && window.chatbotPreviousFocus.focus) {
                window.chatbotPreviousFocus.focus();
            }
        }, 300);
    }
}

/**
 * Manejar Enter en el input
 */
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * Enviar mensaje rápido (quick actions)
 */
function sendQuickMessage(message) {
    const input = document.getElementById('messageInput');
    if (input) {
        input.value = message;
        sendMessage();
    }
}

/**
 * Enviar mensaje del usuario
 */
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Anunciar que se está enviando el mensaje
    announceToScreenReader('Enviando mensaje: ' + message);
    
    // Limpiar input
    input.value = '';
    
    // Mostrar mensaje del usuario
    addUserMessage(message);
    
    // Ocultar quick actions después del primer mensaje
    hideQuickActions();
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    // Enviar a Botsonic y esperar respuesta
    try {
        const response = await sendToBotsonic(message);
        hideTypingIndicator();
        addBotMessage(response);
        
        // Anunciar respuesta recibida
        announceToScreenReader('Respuesta recibida del asistente');
        
        // Devolver foco al input
        setTimeout(() => {
            input.focus();
        }, 500);
    } catch (error) {
        console.error('Error al obtener respuesta:', error);
        hideTypingIndicator();
        const errorMsg = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o contacta a soporte en ubicatecoficial@gmail.com';
        addBotMessage(errorMsg);
        announceToScreenReader('Error: ' + errorMsg);
    }
}

/**
 * Enviar mensaje a Botsonic API
 */
async function sendToBotsonic(userMessage) {
    try {
        // Generar un chat_id único si no existe
        if (!window.botsonicChatId) {
            window.botsonicChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Formatear historial ANTERIOR (sin incluir el nuevo mensaje del usuario)
        // porque input_text ya contiene el mensaje actual
        const formattedHistory = conversationHistory.map(msg => ({
            message: msg.content,
            sent: msg.role === 'user'
        }));
        
        console.log('📜 Historial anterior:', conversationHistory.length, 'mensajes');
        console.log('📤 Chat history formateado:', formattedHistory);
        
        const requestBody = {
            input_text: userMessage,
            chat_id: window.botsonicChatId,
            chat_history: formattedHistory
        };
        
        console.log('📤 Enviando a Botsonic:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(BOTSONIC_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'token': BOTSONIC_CONFIG.token
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Respuesta HTTP status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error de API:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        
        // Extraer respuesta del bot según el formato de Botsonic
        let botResponse = '';
        
        if (data.answer) {
            botResponse = data.answer;
        } else if (data.data && data.data.answer) {
            botResponse = data.data.answer;
        } else {
            console.error('❌ Estructura de respuesta desconocida:', data);
            botResponse = 'Lo siento, no pude generar una respuesta. ¿Podrías reformular tu pregunta?';
        }
        
        console.log('✅ Respuesta del bot:', botResponse);
        
        // NO agregar al historial - cada pregunta es independiente
        // Esto evita errores de acumulación en el historial
        console.log('📜 Modo sin historial - cada pregunta es independiente');
        
        return botResponse;
        
    } catch (error) {
        console.error('Error en la petición a Botsonic:', error);
        throw error;
    }
}

/**
 * Agregar mensaje del usuario al chat
 */
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.setAttribute('role', 'article');
    messageDiv.setAttribute('aria-label', 'Tu mensaje');
    messageDiv.innerHTML = `
        <div class="message-content">
            ${escapeHtml(message)}
        </div>
        <div class="message-avatar" aria-hidden="true">
            <i class="bi bi-person-circle"></i>
        </div>
    `;
    
    // Insertar antes del typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    chatMessages.insertBefore(messageDiv, typingIndicator);
    
    // Scroll al final
    scrollToBottom();
}

/**
 * Agregar mensaje del bot al chat
 */
function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.setAttribute('role', 'article');
    messageDiv.setAttribute('aria-label', 'Mensaje del asistente');
    messageDiv.innerHTML = `
        <div class="message-avatar" aria-hidden="true">
            <i class="bi bi-robot"></i>
        </div>
        <div class="message-content">
            ${formatBotMessage(message)}
        </div>
    `;
    
    // Insertar antes del typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    chatMessages.insertBefore(messageDiv, typingIndicator);
    
    // Scroll al final
    scrollToBottom();
}

/**
 * Formatear mensaje del bot (convertir markdown básico a HTML)
 */
function formatBotMessage(message) {
    let formatted = escapeHtml(message);
    
    // Convertir **bold** a <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convertir *italic* a <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convertir links [text](url) a <a>
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Convertir saltos de línea a <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Convertir listas con - o *
    formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    if (formatted.includes('<li>')) {
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    
    // Convertir números de lista 1. 2. etc
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    if (formatted.includes('<li>') && !formatted.includes('<ul>')) {
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    }
    
    return formatted;
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mostrar indicador de escritura
 */
function showTypingIndicator() {
    isTyping = true;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        announceToScreenReader('El asistente está escribiendo');
        scrollToBottom();
    }
}

/**
 * Ocultar indicador de escritura
 */
function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

/**
 * Ocultar acciones rápidas
 */
function hideQuickActions() {
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
        quickActions.style.display = 'none';
    }
}

/**
 * Scroll al final del chat
 */
function scrollToBottom() {
    const chatBody = document.getElementById('chatMessages');
    if (chatBody) {
        setTimeout(() => {
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 100);
    }
}

/**
 * Reiniciar conversación (útil para testing)
 */
function resetConversation() {
    conversationHistory = [];
    
    // Generar nuevo chat_id para empezar conversación fresca
    window.botsonicChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // Mantener solo el mensaje de bienvenida
        const messages = chatMessages.querySelectorAll('.message:not(#typingIndicator)');
        messages.forEach((msg, index) => {
            if (index > 0) { // Mantener el primer mensaje (bienvenida)
                msg.remove();
            }
        });
    }
    
    // Mostrar quick actions de nuevo
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
        quickActions.style.display = 'flex';
    }
    
    announceToScreenReader('Conversación reiniciada');
    console.log('🔄 Conversación reiniciada con nuevo chat_id:', window.botsonicChatId);
}

/**
 * Anunciar mensaje a lectores de pantalla
 */
function announceToScreenReader(message) {
    const announcer = document.getElementById('chatbot-sr-announcements');
    if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
        
        // Limpiar después de 3 segundos
        setTimeout(() => {
            announcer.textContent = '';
        }, 3000);
    }
}

/**
 * Configurar navegación por teclado
 */
function setupKeyboardNavigation() {
    // Esta función se ejecuta cuando el DOM está listo
    console.log('✓ Navegación por teclado configurada');
}

/**
 * Atrapar el foco dentro del chatbot (para navegación modal)
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    });
}

/**
 * Obtener texto plano de un mensaje HTML (para anuncios)
 */
function getPlainTextFromHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

// Exponer funciones globalmente
window.openChatbot = openChatbot;
window.closeChatbot = closeChatbot;
window.sendMessage = sendMessage;
window.sendQuickMessage = sendQuickMessage;
window.handleKeyPress = handleKeyPress;
window.resetConversation = resetConversation;
window.announceToScreenReader = announceToScreenReader;
