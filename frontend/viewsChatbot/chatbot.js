// Chatbot JavaScript - ubicaTEC
// Este archivo contiene toda la lógica del chatbot
console.log('=== Iniciando carga de chatbot.js ===');

// Sample responses for demo purposes
const botResponses = [
  "Te ayudo con esa consulta. ¿Podrías darme más detalles?",
  "Perfecto, te guío paso a paso para resolver tu consulta.",
  "Esa es una excelente pregunta. Aquí tienes la información:",
  "¡Claro! Te explico cómo hacerlo de manera sencilla.",
  "Entiendo tu consulta. La respuesta es la siguiente:",
  "¡Por supuesto! Te comparto la información que necesitas:",
  "Esa función está disponible en tu panel de usuario.",
  "Te recomiendo revisar la sección de configuración para eso.",
  "¡Excelente pregunta! Esa información la encuentras en el menú principal."
];

// Default responses - can be overridden by parent page
let specificResponses = {
  "crear evento": "Para crear un evento, ve al menú 'Gestión de eventos' y haz clic en 'Crear nuevo evento'. Completa todos los campos obligatorios como nombre, fecha, hora, lugar y capacidad.",
  "auditorio d3": "El Auditorio D3 se encuentra en el edificio D, tercer piso. Es uno de nuestros espacios más grandes con capacidad para 300 personas.",
  "perfil": "Para editar tu perfil, haz clic en el ícono de usuario en la parte superior derecha y selecciona 'Configuración de perfil'.",
  "eventos": "Puedes ver todos los eventos disponibles en la sección 'Eventos' del menú principal. También puedes filtrar por fecha y categoría.",
  "editar evento": "Para editar un evento, selecciona el evento desde 'Gestión de eventos', haz clic en 'Editar' y modifica los campos necesarios. No olvides guardar los cambios.",
  "capacidad": "La capacidad máxima debe ser un número positivo que represente cuántas personas pueden asistir al evento.",
  "fecha": "Selecciona una fecha futura para tu evento. El sistema no permite crear eventos en fechas pasadas."
};

// Function to update specific responses (called by parent page)
window.updateSpecificResponses = function(newResponses) {
  console.log('Actualizando respuestas específicas:', newResponses);
  specificResponses = { ...specificResponses, ...newResponses };
};

// Function to update quick actions (called by parent page)
window.updateQuickActions = function(actions) {
  console.log('Actualizando acciones rápidas:', actions);
  const quickActionsContainer = document.querySelector('.quick-actions');
  if (quickActionsContainer && actions) {
    quickActionsContainer.innerHTML = actions.map(action => 
      `<div class="quick-action" onclick="window.sendQuickMessage('${action.message}')">
        <i class="bi ${action.icon} me-1"></i>${action.text}
      </div>`
    ).join('');
  }
};

// Main chatbot functions - make them global
window.openChatbot = function() {
  console.log('=== Abriendo chatbot ===');
  const chatbot = document.getElementById('chatbot');
  if (chatbot) {
    console.log('Chatbot encontrado, mostrando...');
    chatbot.classList.add('show');
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
      messageInput.focus();
      console.log('Input enfocado');
    } else {
      console.error('No se encontró el input del mensaje');
    }
  } else {
    console.error('No se encontró el elemento chatbot');
    alert('Error: No se pudo encontrar el chatbot en la página.');
  }
};

window.closeChatbot = function() {
  console.log('=== Cerrando chatbot ===');
  const chatbot = document.getElementById('chatbot');
  if (chatbot) {
    chatbot.classList.remove('show');
  }
};

window.sendMessage = function() {
  console.log('=== Enviando mensaje ===');
  const input = document.getElementById('messageInput');
  if (!input) {
    console.error('No se encontró el input');
    return;
  }
  
  const message = input.value.trim();
  console.log('Mensaje:', message);
  
  if (message) {
    addUserMessage(message);
    input.value = '';
    
    // Simulate bot thinking
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      addBotMessage(getBotResponse(message));
    }, 1500);
  }
};

window.sendQuickMessage = function(message) {
  console.log('=== Enviando mensaje rápido ===', message);
  addUserMessage(message);
  showTypingIndicator();
  
  setTimeout(() => {
    hideTypingIndicator();
    addBotMessage(getBotResponse(message));
  }, 1200);
};

function addUserMessage(message) {
  console.log('Agregando mensaje de usuario:', message);
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) {
    console.error('No se encontró chatMessages');
    return;
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <i class="bi bi-person"></i>
    </div>
    <div class="message-content">${message}</div>
  `;
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    chatMessages.insertBefore(messageDiv, typingIndicator);
  } else {
    chatMessages.appendChild(messageDiv);
  }
  scrollToBottom();
}

function addBotMessage(message) {
  console.log('Agregando mensaje del bot:', message);
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) {
    console.error('No se encontró chatMessages');
    return;
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <i class="bi bi-robot"></i>
    </div>
    <div class="message-content">${message}</div>
  `;
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    chatMessages.insertBefore(messageDiv, typingIndicator);
  } else {
    chatMessages.appendChild(messageDiv);
  }
  scrollToBottom();
}

function getBotResponse(userMessage) {
  const message = userMessage.toLowerCase();
  console.log('Generando respuesta para:', message);
  
  // Check for specific keywords
  for (const [key, response] of Object.entries(specificResponses)) {
    if (message.includes(key)) {
      console.log('Respuesta específica encontrada:', key);
      return response;
    }
  }
  
  // Return random response
  const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
  console.log('Respuesta aleatoria:', randomResponse);
  return randomResponse;
}

function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (!indicator) return;
  
  indicator.style.display = 'flex';
  const typingDiv = indicator.querySelector('.typing-indicator');
  if (typingDiv) typingDiv.style.display = 'block';
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (!indicator) return;
  
  indicator.style.display = 'none';
  const typingDiv = indicator.querySelector('.typing-indicator');
  if (typingDiv) typingDiv.style.display = 'none';
}

function scrollToBottom() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

window.handleKeyPress = function(event) {
  if (event.key === 'Enter') {
    window.sendMessage();
  }
};

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== DOM cargado, inicializando chatbot ===');
  // Wait a bit to ensure elements are loaded
  setTimeout(() => {
    hideTypingIndicator();
    console.log('Chatbot inicializado correctamente');
  }, 100);
});

console.log('=== Chatbot JavaScript cargado exitosamente ===');