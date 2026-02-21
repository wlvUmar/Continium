/**
 * Global UI Utilities
 * Reusable toast notifications, loading spinner, error messages
 */

// ============ TOAST NOTIFICATIONS ============

const Toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info') {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#4299e1',
            warning: '#ed8936'
        };
        
        toast.style.cssText = `
            background: white;
            color: #333;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-left: 4px solid ${colors[type]};
            animation: slideIn 0.3s ease;
            min-width: 250px;
        `;
        
        toast.textContent = message;
        this.container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    info(message) {
        this.show(message, 'info');
    },
    
    warning(message) {
        this.show(message, 'warning');
    }
};


// ============ LOADING SPINNER ============

const Spinner = {
    overlay: null,
    
    show(message = 'Loading...') {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'loading-overlay';
            this.overlay.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                ">
                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div class="spinner"></div>
                        <p style="margin-top: 15px; color: #666;">${message}</p>
                    </div>
                </div>
            `;
            document.body.appendChild(this.overlay);
        }
        this.overlay.style.display = 'block';
    },
    
    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }
};


// ============ ERROR MESSAGE RENDERER ============

const ErrorMessage = {
    render(message, container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #fff5f5;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        errorDiv.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            <span>${message}</span>
        `;
        
        if (container) {
            // Clear previous errors
            const oldErrors = container.querySelectorAll('.error-message');
            oldErrors.forEach(el => el.remove());
            
            container.insertBefore(errorDiv, container.firstChild);
        }
        
        return errorDiv;
    },
    
    clear(container) {
        if (container) {
            const errors = container.querySelectorAll('.error-message');
            errors.forEach(el => el.remove());
        }
    }
};


// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #4ECDC4;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);


// Export globally
window.Toast = Toast;
window.Spinner = Spinner;
window.ErrorMessage = ErrorMessage;
