// AI Chat functionality for NutriAI
class NutriAIChat {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.messageInput = null;
        this.sendBtn = null;
        this.chatMessages = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupChat());
        } else {
            this.setupChat();
        }
    }
    
    setupChat() {
        // Get DOM elements
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        
        if (!this.messageInput || !this.sendBtn || !this.chatMessages) {
            console.error('Chat elements not found');
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load chat history
        this.loadChatHistory();
        
        console.log('✅ NutriAI Chat initialized');
    }
    
    setupEventListeners() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        });
    }
    
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }
        
        // Check API key
        if (!CONFIG.getApiKey() || CONFIG.getApiKey().trim() === '') {
            this.addMessage('Por favor, configura tu API key de OpenRouter primero.', 'ai');
            return;
        }
        
        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to AI
            const response = await this.sendToAI(message);
            this.hideTypingIndicator();
            
            if (response) {
                this.addMessage(response, 'ai');
            } else {
                this.addMessage('Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.', 'ai');
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error sending message:', error);
            
            let errorMessage = 'Error de conexión. ';
            if (error.message.includes('401')) {
                errorMessage += 'Verifica tu API key de OpenRouter.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Límite de solicitudes alcanzado. Intenta más tarde.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Error del servidor. Intenta más tarde.';
            } else {
                errorMessage += 'Por favor, intenta de nuevo.';
            }
            
            this.addMessage(errorMessage, 'ai');
        }
        
        // Save chat history
        this.saveChatHistory();
    }
    
    async sendToAI(userMessage) {
        const apiKey = CONFIG.getApiKey();
        const systemPrompt = CONFIG.getSystemPrompt();
        
        // Prepare messages array
        const messages = [
            {
                role: 'system',
                content: [
                    { type: 'text', text: systemPrompt }
                ]
            },
            // Add recent conversation history (last 10 messages)
            ...this.messages.slice(-10).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: [
                    { type: 'text', text: msg.content }
                ]
            })),
            // Add current user message
            {
                role: 'user',
                content: [
                    { type: 'text', text: userMessage }
                ]
            }
        ];
        
        const requestBody = {
            model: CONFIG.MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
        
        console.log('Sending request to OpenRouter:', {
            endpoint: CONFIG.API_ENDPOINT,
            model: CONFIG.MODEL,
            messageCount: messages.length
        });
        
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'NutriAI'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('OpenRouter response:', data);
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            console.error('Unexpected response format:', data);
            throw new Error('Formato de respuesta inesperado');
        }
    }
    
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // Format content for display
        const formattedContent = this.formatMessageContent(content);
        messageDiv.innerHTML = `<p>${formattedContent}</p>`;
        
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        messageDiv.setAttribute('data-timestamp', timestamp);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({
            content: content,
            type: type,
            timestamp: Date.now()
        });
        
        // Limit message history
        if (this.messages.length > CONFIG.MAX_MESSAGES) {
            this.messages = this.messages.slice(-CONFIG.MAX_MESSAGES);
        }
    }
    
    formatMessageContent(content) {
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');
        
        // Convert **bold** to <strong>
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert numbered lists
        content = content.replace(/^\d+\.\s/gm, '<br>$&');
        
        // Convert bullet points
        content = content.replace(/^[-•]\s/gm, '<br>• ');
        
        return content;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.sendBtn.disabled = true;
        this.sendBtn.innerHTML = '<div class="loading"></div>';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<p>Escribiendo<span class="dots">...</span></p>';
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        // Animate dots
        this.animateTypingDots();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.sendBtn.disabled = false;
        this.sendBtn.textContent = 'Enviar';
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    animateTypingDots() {
        const dots = document.querySelector('.typing-indicator .dots');
        if (!dots) return;
        
        let dotCount = 0;
        const interval = setInterval(() => {
            if (!document.getElementById('typing-indicator')) {
                clearInterval(interval);
                return;
            }
            
            dotCount = (dotCount + 1) % 4;
            dots.textContent = '.'.repeat(dotCount);
        }, 500);
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    saveChatHistory() {
        try {
            const historyToSave = this.messages.slice(-20); // Save last 20 messages
            localStorage.setItem('nutriai_chat_history', JSON.stringify(historyToSave));
        } catch (error) {
            console.warn('Could not save chat history:', error);
        }
    }
    
    loadChatHistory() {
        try {
            const savedHistory = localStorage.getItem('nutriai_chat_history');
            if (savedHistory) {
                this.messages = JSON.parse(savedHistory);
                
                // Display last few messages
                const messagesToShow = this.messages.slice(-5);
                messagesToShow.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${msg.type}-message`;
                    messageDiv.innerHTML = `<p>${this.formatMessageContent(msg.content)}</p>`;
                    this.chatMessages.appendChild(messageDiv);
                });
                
                if (messagesToShow.length > 0) {
                    this.scrollToBottom();
                }
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
            this.messages = [];
        }
    }
    
    clearChatHistory() {
        this.messages = [];
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <p>¡Hola! Soy tu asistente nutricional AI. ¿En qué puedo ayudarte hoy?</p>
            </div>
        `;
        localStorage.removeItem('nutriai_chat_history');
    }
    
    // Public methods for external use
    isReady() {
        return !!(this.messageInput && this.sendBtn && this.chatMessages);
    }
    
    getMessageCount() {
        return this.messages.length;
    }
    
    getLastMessage() {
        return this.messages[this.messages.length - 1] || null;
    }
}

// Initialize chat when DOM is ready
let nutriAIChat;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat system
    nutriAIChat = new NutriAIChat();
    
    // Add clear chat button functionality
    const clearChatBtn = document.createElement('button');
    clearChatBtn.textContent = 'Limpiar Chat';
    clearChatBtn.className = 'btn btn-small';
    clearChatBtn.style.marginLeft = '10px';
    clearChatBtn.onclick = function() {
        if (confirm('¿Estás seguro de que quieres limpiar el historial del chat?')) {
            nutriAIChat.clearChatHistory();
        }
    };
    
    // Add to settings panel
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.appendChild(clearChatBtn);
    }
    
    // Add API key input to settings
    const apiKeyContainer = document.createElement('div');
    apiKeyContainer.style.marginTop = '1rem';
    apiKeyContainer.innerHTML = `
        <label for="apiKeyInput">API Key de OpenRouter:</label>
        <input type="password" id="apiKeyInput" placeholder="Pega tu API key aquí..." style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
        <button class="btn btn-small" id="saveApiKey">Guardar API Key</button>
    `;
    
    if (settingsPanel) {
        settingsPanel.insertBefore(apiKeyContainer, settingsPanel.firstChild);
        
        // Load existing API key
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        
        if (apiKeyInput) {
            apiKeyInput.value = CONFIG.getApiKey();
        }
        
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', function() {
                const newApiKey = apiKeyInput.value.trim();
                if (newApiKey) {
                    CONFIG.setApiKey(newApiKey);
                    
                    // Show success notification
                    if (window.showNotification) {
                        showNotification('API Key guardada correctamente', 'success');
                    } else {
                        alert('API Key guardada correctamente');
                    }
                }
            });
        }
    }
});

// Export for global access
window.NutriAIChat = NutriAIChat;
window.nutriAIChat = nutriAIChat;

// Error handling for chat
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection in chat:', event.reason);
    
    if (nutriAIChat && nutriAIChat.isTyping) {
        nutriAIChat.hideTypingIndicator();
        nutriAIChat.addMessage('Error inesperado. Por favor, intenta de nuevo.', 'ai');
    }
});
