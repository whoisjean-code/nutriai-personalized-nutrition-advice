// Configuration for NutriAI Chat System
const CONFIG = {
    // OpenRouter API Configuration
    API_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions',
    API_KEY: '', // Will be set by user
    MODEL: 'openai/gpt-4o',
    
    // Default System Prompt for Nutritional AI
    DEFAULT_SYSTEM_PROMPT: `Eres un asesor nutricional experto y amable especializado en crear planes alimenticios personalizados. Tu objetivo es proporcionar consejos nutricionales precisos, seguros y adaptados a las necesidades individuales de cada usuario.

Características de tu personalidad:
- Profesional pero cercano y comprensible
- Basas tus recomendaciones en evidencia científica
- Siempre consideras las restricciones dietéticas y condiciones médicas
- Fomentas hábitos alimenticios sostenibles a largo plazo
- Respondes en español de manera clara y estructurada

Cuando un usuario te consulte:
1. Analiza sus necesidades específicas (objetivos, restricciones, preferencias)
2. Proporciona recomendaciones prácticas y realizables
3. Explica el "por qué" detrás de tus sugerencias
4. Ofrece alternativas cuando sea apropiado
5. Recuerda siempre que no reemplazas la consulta médica profesional

Mantén un tono profesional pero amigable, y estructura tus respuestas de manera clara con puntos específicos cuando sea necesario.`,

    // Chat Settings
    MAX_MESSAGES: 50,
    TYPING_DELAY: 1000,
    
    // Validation
    validateConfig: function() {
        if (!this.API_KEY || this.API_KEY.trim() === '') {
            console.warn('⚠️ API Key no configurada. El chat AI no funcionará hasta que se configure.');
            return false;
        }
        return true;
    },
    
    // Get current system prompt (from localStorage or default)
    getSystemPrompt: function() {
        return localStorage.getItem('nutriai_system_prompt') || this.DEFAULT_SYSTEM_PROMPT;
    },
    
    // Save system prompt to localStorage
    setSystemPrompt: function(prompt) {
        localStorage.setItem('nutriai_system_prompt', prompt);
    },
    
    // Get API key from localStorage
    getApiKey: function() {
        return localStorage.getItem('nutriai_api_key') || this.API_KEY;
    },
    
    // Save API key to localStorage
    setApiKey: function(key) {
        localStorage.setItem('nutriai_api_key', key);
        this.API_KEY = key;
    }
};

// Initialize configuration on load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved API key if exists
    const savedApiKey = CONFIG.getApiKey();
    if (savedApiKey) {
        CONFIG.API_KEY = savedApiKey;
    }
    
    // Validate configuration
    CONFIG.validateConfig();
});

// Export for use in other modules
window.CONFIG = CONFIG;
