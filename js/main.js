// Main JavaScript for NutriAI Website
document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation Elements
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Chat Modal Elements
    const chatModal = document.getElementById('chatModal');
    const openChatBtns = document.querySelectorAll('#openChatBtn, #startChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    
    // Settings Elements
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const systemPromptTextarea = document.getElementById('systemPrompt');
    const saveSettingsBtn = document.getElementById('saveSettings');
    
    // Other Elements
    const cookieBtn = document.getElementById('cookieBtn');
    
    // Initialize
    init();
    
    function init() {
        setupNavigation();
        setupChatModal();
        setupSettings();
        setupSmoothScrolling();
        setupCookieConsent();
        loadUserSettings();
    }
    
    // Navigation Setup
    function setupNavigation() {
        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', toggleMobileMenu);
        }
        
        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Header scroll effect
        window.addEventListener('scroll', handleHeaderScroll);
    }
    
    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Animate hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.transform = navToggle.classList.contains('active') 
                ? `rotate(${index === 1 ? 0 : index === 0 ? 45 : -45}deg) translate(${index === 1 ? '0' : index === 0 ? '5px, 5px' : '-5px, -5px'})`
                : 'none';
        });
    }
    
    function closeMobileMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        
        // Reset hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
        });
    }
    
    function handleHeaderScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
    
    // Chat Modal Setup
    function setupChatModal() {
        // Open chat modal
        openChatBtns.forEach(btn => {
            btn.addEventListener('click', openChatModal);
        });
        
        // Close chat modal
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', closeChatModal);
        }
        
        // Close modal when clicking outside
        if (chatModal) {
            chatModal.addEventListener('click', function(e) {
                if (e.target === chatModal) {
                    closeChatModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && chatModal.style.display === 'flex') {
                closeChatModal();
            }
        });
    }
    
    function openChatModal() {
        if (chatModal) {
            chatModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on input
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                setTimeout(() => messageInput.focus(), 100);
            }
            
            // Check API key
            checkApiKeyStatus();
        }
    }
    
    function closeChatModal() {
        if (chatModal) {
            chatModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    function checkApiKeyStatus() {
        if (!CONFIG.getApiKey() || CONFIG.getApiKey().trim() === '') {
            showApiKeyPrompt();
        }
    }
    
    function showApiKeyPrompt() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const apiKeyMessage = document.createElement('div');
            apiKeyMessage.className = 'message ai-message';
            apiKeyMessage.innerHTML = `
                <p><strong>⚠️ Configuración requerida</strong></p>
                <p>Para usar el chat AI, necesitas configurar tu API key de OpenRouter:</p>
                <ol>
                    <li>Ve a <a href="https://openrouter.ai" target="_blank">OpenRouter.ai</a></li>
                    <li>Crea una cuenta y obtén tu API key</li>
                    <li>Haz clic en "Configurar Sistema" arriba</li>
                    <li>Pega tu API key en el campo correspondiente</li>
                </ol>
                <div style="margin-top: 1rem;">
                    <input type="password" id="quickApiKey" placeholder="Pega tu API key aquí..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                    <button onclick="setQuickApiKey()" style="background: #000; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Guardar API Key</button>
                </div>
            `;
            chatMessages.appendChild(apiKeyMessage);
        }
    }
    
    // Make setQuickApiKey available globally
    window.setQuickApiKey = function() {
        const input = document.getElementById('quickApiKey');
        if (input && input.value.trim()) {
            CONFIG.setApiKey(input.value.trim());
            input.value = '';
            
            // Remove the API key prompt message
            const apiKeyMessage = input.closest('.message');
            if (apiKeyMessage) {
                apiKeyMessage.remove();
            }
            
            // Add success message
            const chatMessages = document.getElementById('chatMessages');
            const successMessage = document.createElement('div');
            successMessage.className = 'message ai-message';
            successMessage.innerHTML = '<p>✅ API Key configurada correctamente. ¡Ya puedes hacer consultas nutricionales!</p>';
            chatMessages.appendChild(successMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };
    
    // Settings Setup
    function setupSettings() {
        if (settingsToggle) {
            settingsToggle.addEventListener('click', toggleSettings);
        }
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
    }
    
    function toggleSettings() {
        if (settingsPanel) {
            settingsPanel.classList.toggle('active');
            
            // Load current system prompt
            if (systemPromptTextarea) {
                systemPromptTextarea.value = CONFIG.getSystemPrompt();
            }
        }
    }
    
    function saveSettings() {
        if (systemPromptTextarea) {
            const newPrompt = systemPromptTextarea.value.trim();
            if (newPrompt) {
                CONFIG.setSystemPrompt(newPrompt);
                showNotification('Configuración guardada correctamente', 'success');
            }
        }
    }
    
    function loadUserSettings() {
        // Load system prompt into textarea if settings are open
        if (systemPromptTextarea) {
            systemPromptTextarea.value = CONFIG.getSystemPrompt();
        }
    }
    
    // Smooth Scrolling Setup
    function setupSmoothScrolling() {
        // Handle anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Handle CTA buttons
        const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
        ctaButtons.forEach(btn => {
            if (btn.textContent.includes('Ver características')) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.getElementById('caracteristicas');
                    if (target) {
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });
    }
    
    // Cookie Consent Setup
    function setupCookieConsent() {
        if (cookieBtn) {
            cookieBtn.addEventListener('click', function() {
                const footerLegal = document.querySelector('.footer-legal');
                if (footerLegal) {
                    footerLegal.style.display = 'none';
                }
                localStorage.setItem('nutriai_cookies_accepted', 'true');
            });
        }
        
        // Check if cookies were already accepted
        if (localStorage.getItem('nutriai_cookies_accepted') === 'true') {
            const footerLegal = document.querySelector('.footer-legal');
            if (footerLegal) {
                footerLegal.style.display = 'none';
            }
        }
    }
    
    // Utility Functions
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 3000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Error handling
    window.addEventListener('error', function(e) {
        console.error('Error en la aplicación:', e.error);
    });
    
    // Performance monitoring
    window.addEventListener('load', function() {
        console.log('✅ NutriAI cargado correctamente');
        
        // Add loading animation removal
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.remove());
    });
});

// Add CSS for mobile menu (injected via JavaScript)
const mobileMenuCSS = `
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 70px;
        left: 0;
        width: 100%;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        flex-direction: column;
        padding: 2rem;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        border-bottom: 1px solid var(--border-color);
    }
    
    .nav-menu.active {
        display: flex;
        transform: translateX(0);
    }
    
    .nav-menu .nav-link {
        margin: 0.5rem 0;
        font-size: 1.1rem;
    }
    
    .nav-menu .chat-btn {
        margin-top: 1rem;
        align-self: center;
    }
}
`;

// Inject mobile menu CSS
const style = document.createElement('style');
style.textContent = mobileMenuCSS;
document.head.appendChild(style);
