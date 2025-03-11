// Real-time price display script with themeable UI
document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug') === 'on';
    const skin = urlParams.get('skin') || 'minimal'; // Default skin is 'minimal'
    const theme = urlParams.get('theme') || 'classic'; // Default theme is 'classic'
    
    console.log('Bitcoin price script loaded', debugMode ? '(DEBUG MODE)' : '', `Theme: ${theme}, Skin: ${skin}`);
    
    // Remove debug borders if not in debug mode
    if (!debugMode) {
        document.querySelectorAll('.element-debug').forEach(el => {
            el.classList.remove('element-debug');
        });
    }
    
    // Apply selected theme and skin
    applyTheme(theme, skin);
    
    setTimeout(function() {
        fetchAndDisplayPrice();
    }, 500); // Small delay to ensure DOM is fully loaded
});

// Also try window load event
window.addEventListener('load', function() {
    console.log('Window loaded, fetching price');
    fetchAndDisplayPrice();
});

// Apply theme and skin styles
function applyTheme(themeName, skinName) {
    // Remove any existing theme and skin
    document.body.classList.remove('theme-classic', 'theme-modern', 'theme-terminal');
    document.body.classList.remove('skin-minimal', 'skin-dark', 'skin-vibrant', 'skin-crypto');
    
    // Validate theme name
    const validThemes = ['classic', 'modern', 'terminal', 'contemporary'];
    const theme = validThemes.includes(themeName) ? themeName : 'classic';
    
    // Validate skin name
    const validSkins = ['minimal', 'dark', 'vibrant', 'crypto'];
    const skin = validSkins.includes(skinName) ? skinName : 'minimal';
    
    // Add theme and skin classes to body
    document.body.classList.add(`theme-${theme}`);
    document.body.classList.add(`skin-${skin}`);
    
    // Apply theme-specific styles
    const themeStyle = document.getElementById('theme-styles');
    if (themeStyle) {
        document.head.removeChild(themeStyle);
    }
    
    const style = document.createElement('style');
    style.id = 'theme-styles';
    
    // Apply theme layout first, then skin colors
    style.textContent = getThemeLayout(theme) + getSkinStyles(skin);
    document.head.appendChild(style);
    
    // Add theme and skin switcher if it doesn't exist
    if (!document.getElementById('theme-skin-switcher')) {
        addThemeSkinSwitcher();
    }
    
    // Set current time for terminal theme
    if (theme === 'terminal') {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        document.querySelector('.price-card').setAttribute('data-time', `${dateString} ${timeString}`);
        
        // Update time every minute
        setInterval(() => {
            const now = new Date();
            document.querySelector('.price-card').setAttribute('data-time', 
                `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
        }, 60000);
    }
    
    console.log(`Theme applied: ${theme}, Skin: ${skin}`);
}

// Get theme-specific layout
function getThemeLayout(theme) {
    const themes = {
        // Classic theme - original layout
        classic: `
            /* Classic theme maintains the original layout */
            .theme-classic .price-section {
                padding: 40px 0;
            }
            
            .theme-classic .price-card {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .theme-classic .price-display {
                text-align: left;
            }
            
            .theme-classic #price {
                font-size: 2.5rem;
            }
            
            .theme-classic .price-details {
                margin-top: 20px;
            }
            
            .theme-classic .detail-item {
                display: flex;
                justify-content: space-between;
            }
        `,
        
        // Modern theme - completely different layout
        modern: `
            /* Modern theme with dashboard-style layout */
            .theme-modern .price-section {
                padding: 0;
                min-height: 500px;
                display: flex;
                align-items: center;
            }
            
            .theme-modern .price-section .container {
                width: 100%;
                max-width: 100%;
                padding: 0;
            }
            
            .theme-modern .price-card {
                max-width: 100%;
                margin: 0;
                padding: 0;
                display: grid;
                grid-template-columns: 1fr 2fr;
                grid-template-rows: auto 1fr;
                grid-template-areas:
                    "header header"
                    "price details";
                min-height: 500px;
                border-radius: 0;
            }
            
            .theme-modern .price-card h2 {
                grid-area: header;
                margin: 0;
                padding: 20px;
                text-align: center;
                font-size: 1.5rem;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }
            
            .theme-modern .price-display {
                grid-area: price;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 40px;
                margin: 0;
                height: 100%;
                border-right: 1px solid rgba(0,0,0,0.1);
            }
            
            .theme-modern #price {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            
            .theme-modern #price-change {
                font-size: 1.5rem;
                padding: 5px 15px;
                border-radius: 20px;
            }
            
            .theme-modern .price-details {
                grid-area: details;
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .theme-modern .detail-item {
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
            }
            
            .theme-modern .label {
                font-size: 1.2rem;
            }
            
            .theme-modern .last-updated {
                margin-top: auto;
                text-align: right;
                font-style: italic;
            }
            
            .theme-modern #direct-update {
                width: 100%;
                padding: 15px !important;
                margin-top: 20px;
                font-size: 1.1rem;
            }
            
            /* Responsive adjustments for modern theme */
            @media (max-width: 768px) {
                .theme-modern .price-card {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto auto auto;
                    grid-template-areas:
                        "header"
                        "price"
                        "details";
                }
                
                .theme-modern .price-display {
                    border-right: none;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    padding: 30px;
                }
                
                .theme-modern #price {
                    font-size: 3rem;
                }
            }
            
            /* Other sections in modern theme */
            .theme-modern .quote-section {
                padding: 60px 0;
            }
            
            .theme-modern .quote-card {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                position: relative;
            }
            
            .theme-modern .resources-section {
                padding: 60px 0;
            }
            
            .theme-modern .resources-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 30px;
            }
            
            .theme-modern .resource-card {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
        `,
        
        // Terminal theme - trading terminal style layout
        terminal: `
            /* Terminal theme with trading terminal style */
            .theme-terminal {
                --terminal-bg: #0a0e17;
                --terminal-text: #e2e8f0;
                --terminal-accent: #38bdf8;
                --terminal-grid: #1e293b;
                --terminal-positive: #10b981;
                --terminal-negative: #ef4444;
                --terminal-neutral: #94a3b8;
                --terminal-font: 'Courier New', monospace;
            }
            
            .theme-terminal .header {
                background: var(--terminal-bg);
                border-bottom: 1px solid var(--terminal-accent);
            }
            
            .theme-terminal .price-section {
                background: var(--terminal-bg);
                color: var(--terminal-text);
                padding: 0;
                font-family: var(--terminal-font);
            }
            
            .theme-terminal .price-section .container {
                width: 100%;
                max-width: 100%;
                padding: 0;
            }
            
            .theme-terminal .price-card {
                background: var(--terminal-bg);
                color: var(--terminal-text);
                max-width: 100%;
                margin: 0;
                padding: 0;
                border-radius: 0;
                box-shadow: none;
                border: none;
                display: grid;
                grid-template-columns: 1fr 2fr 1fr;
                grid-template-rows: auto 1fr;
                grid-template-areas:
                    "header header header"
                    "price chart details";
                min-height: 600px;
            }
            
            .theme-terminal .price-card h2 {
                grid-area: header;
                margin: 0;
                padding: 10px 20px;
                background: #0f172a;
                color: var(--terminal-accent);
                font-family: var(--terminal-font);
                font-size: 1.2rem;
                font-weight: normal;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-bottom: 1px solid var(--terminal-grid);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .theme-terminal .price-card h2:after {
                content: 'BTC/USD';
                font-size: 0.9rem;
                color: var(--terminal-neutral);
            }
            
            .theme-terminal .price-display {
                grid-area: price;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 30px;
                margin: 0;
                height: 100%;
                border-right: 1px solid var(--terminal-grid);
                background: #0f172a;
            }
            
            .theme-terminal #price {
                font-size: 3rem;
                font-family: var(--terminal-font);
                font-weight: bold;
                color: var(--terminal-accent) !important;
                margin-bottom: 15px;
                position: relative;
                padding-left: 15px;
            }
            
            .theme-terminal #price:before {
                content: '$';
                position: absolute;
                left: 0;
                top: 5px;
                font-size: 1.5rem;
                color: var(--terminal-neutral);
            }
            
            .theme-terminal #price-change {
                font-size: 1.2rem;
                padding: 5px 10px;
                border-radius: 4px;
                font-family: var(--terminal-font);
                letter-spacing: 1px;
            }
            
            /* Fake chart area */
            .theme-terminal .price-card:before {
                content: '';
                grid-area: chart;
                background-image: 
                    linear-gradient(rgba(10, 14, 23, 0.7), rgba(10, 14, 23, 0.7)),
                    url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%231e293b' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%230a0e17'/%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3Cpath d='M0,80 Q50,70 100,75 T200,85 T300,80 T400,70 T500,60 T600,80' stroke='%2338bdf8' fill='none' stroke-width='2'/%3E%3C/svg%3E");
                background-size: cover;
                border-right: 1px solid var(--terminal-grid);
            }
            
            .theme-terminal .price-details {
                grid-area: details;
                padding: 20px;
                display: flex;
                flex-direction: column;
                background: #0f172a;
            }
            
            .theme-terminal .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 12px;
                margin: 5px 0;
                background: var(--terminal-bg);
                border-left: none;
                border-radius: 0;
                border-bottom: 1px solid var(--terminal-grid);
                font-family: var(--terminal-font);
            }
            
            .theme-terminal .label {
                color: var(--terminal-neutral);
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .theme-terminal .label:before {
                display: none;
            }
            
            .theme-terminal .last-updated {
                margin-top: auto;
                color: var(--terminal-neutral);
                font-size: 0.8rem;
                text-align: right;
                font-family: var(--terminal-font);
            }
            
            .theme-terminal #direct-update {
                width: 100%;
                padding: 12px !important;
                margin-top: 20px;
                background: var(--terminal-bg);
                color: var(--terminal-accent);
                border: 1px solid var(--terminal-accent);
                font-family: var(--terminal-font);
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.2s;
            }
            
            .theme-terminal #direct-update:hover {
                background: var(--terminal-accent);
                color: var(--terminal-bg);
            }
            
            /* Add terminal-style blinking cursor */
            .theme-terminal .price-display:after {
                content: '|';
                display: inline-block;
                color: var(--terminal-accent);
                animation: blink 1s step-end infinite;
                font-size: 1.5rem;
                margin-top: 10px;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
            /* Positive/negative values */
            .theme-terminal .positive {
                color: var(--terminal-positive) !important;
                background: rgba(16, 185, 129, 0.1);
            }
            
            .theme-terminal .negative {
                color: var(--terminal-negative) !important;
                background: rgba(239, 68, 68, 0.1);
            }
            
            /* Add time markers like a real terminal */
            .theme-terminal .price-card:after {
                content: attr(data-time);
                position: absolute;
                bottom: 10px;
                right: 10px;
                font-size: 0.8rem;
                color: var(--terminal-neutral);
                font-family: var(--terminal-font);
            }
            
            /* Responsive adjustments */
            @media (max-width: 1024px) {
                .theme-terminal .price-card {
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto auto auto;
                    grid-template-areas:
                        "header header"
                        "price details"
                        "chart chart";
                }
                
                .theme-terminal .price-card:before {
                    min-height: 300px;
                }
            }
            
            @media (max-width: 768px) {
                .theme-terminal .price-card {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto auto auto auto;
                    grid-template-areas:
                        "header"
                        "price"
                        "details"
                        "chart";
                }
                
                .theme-terminal .price-display {
                    border-right: none;
                    border-bottom: 1px solid var(--terminal-grid);
                }
                
                .theme-terminal .price-card:before {
                    min-height: 200px;
                }
            }
            
            /* Other sections in terminal theme */
            .theme-terminal .quote-section {
                background: #0f172a;
                color: var(--terminal-text);
                padding: 40px 0;
                font-family: var(--terminal-font);
            }
            
            .theme-terminal .quote-section h2 {
                color: var(--terminal-accent);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .theme-terminal .quote-card {
                background: var(--terminal-bg);
                border-left: 2px solid var(--terminal-accent);
                color: var(--terminal-text);
                font-family: var(--terminal-font);
            }
            
            .theme-terminal .resources-section {
                background: #0f172a;
                color: var(--terminal-text);
                padding: 40px 0;
            }
            
            .theme-terminal .resources-section h2 {
                color: var(--terminal-accent);
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: var(--terminal-font);
            }
            
            .theme-terminal .resource-card {
                background: var(--terminal-bg);
                color: var(--terminal-text);
                border-top: 2px solid var(--terminal-accent);
                font-family: var(--terminal-font);
            }
            
            .theme-terminal .footer {
                background: var(--terminal-bg);
                color: var(--terminal-neutral);
                font-family: var(--terminal-font);
                border-top: 1px solid var(--terminal-grid);
            }
        `,
        
        // Contemporary theme - modern, clean design following current style guides
        contemporary: `
            /* Contemporary theme with modern design principles */
            .theme-contemporary {
                --font-primary: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                --font-secondary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                --spacing-unit: 8px;
                --radius-sm: 8px;
                --radius-md: 12px;
                --radius-lg: 16px;
                --shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);
                --shadow-md: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06);
                --shadow-lg: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
                --transition-all: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Add Inter font if not already included */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* Global styles */
            .theme-contemporary body {
                font-family: var(--font-primary);
                line-height: 1.5;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .theme-contemporary .header {
                padding: calc(var(--spacing-unit) * 2) 0;
                background: white;
                box-shadow: var(--shadow-sm);
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .theme-contemporary .logo h1 {
                font-weight: 700;
                font-size: 1.5rem;
                letter-spacing: -0.025em;
            }
            
            .theme-contemporary .nav ul {
                display: flex;
                gap: calc(var(--spacing-unit) * 3);
            }
            
            .theme-contemporary .nav ul li a {
                font-weight: 500;
                font-size: 0.9375rem;
                color: #374151;
                text-decoration: none;
                transition: var(--transition-all);
                padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
                border-radius: var(--radius-sm);
            }
            
            .theme-contemporary .nav ul li a:hover {
                background-color: #F3F4F6;
            }
            
            .theme-contemporary .nav ul li a[aria-current="page"] {
                color: #2563EB;
                font-weight: 600;
            }
            
            /* Price section */
            .theme-contemporary .price-section {
                padding: calc(var(--spacing-unit) * 8) 0;
                background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
            }
            
            .theme-contemporary .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 calc(var(--spacing-unit) * 3);
            }
            
            .theme-contemporary .price-card {
                background: white;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                overflow: hidden;
                max-width: 800px;
                margin: 0 auto;
                position: relative;
            }
            
            .theme-contemporary .price-card h2 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #111827;
                margin: 0;
                padding: calc(var(--spacing-unit) * 3);
                border-bottom: 1px solid #E5E7EB;
                letter-spacing: -0.025em;
            }
            
            .theme-contemporary .price-display {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                padding: calc(var(--spacing-unit) * 6) calc(var(--spacing-unit) * 3);
                background: #F9FAFB;
                position: relative;
            }
            
            .theme-contemporary #price {
                font-size: 3.5rem;
                font-weight: 700;
                color: #111827 !important;
                letter-spacing: -0.05em;
                line-height: 1;
                margin-bottom: calc(var(--spacing-unit) * 2);
            }
            
            .theme-contemporary #price-change {
                font-size: 1rem;
                font-weight: 600;
                padding: calc(var(--spacing-unit) * 0.75) calc(var(--spacing-unit) * 2);
                border-radius: 9999px;
            }
            
            .theme-contemporary .price-details {
                padding: calc(var(--spacing-unit) * 3);
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: calc(var(--spacing-unit) * 2);
            }
            
            .theme-contemporary .detail-item {
                background: #F9FAFB;
                border-radius: var(--radius-md);
                padding: calc(var(--spacing-unit) * 2);
                display: flex;
                flex-direction: column;
                gap: calc(var(--spacing-unit) * 1);
                transition: var(--transition-all);
            }
            
            .theme-contemporary .detail-item:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            
            .theme-contemporary .label {
                font-size: 0.875rem;
                font-weight: 500;
                color: #6B7280;
            }
            
            .theme-contemporary .detail-item span:not(.label) {
                font-size: 1.125rem;
                font-weight: 600;
                color: #111827;
            }
            
            .theme-contemporary .last-updated {
                padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
                border-top: 1px solid #E5E7EB;
                font-size: 0.875rem;
                color: #6B7280;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .theme-contemporary #direct-update {
                background: #2563EB;
                color: white;
                font-weight: 500;
                padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3) !important;
                border-radius: var(--radius-md);
                border: none;
                transition: var(--transition-all);
                box-shadow: var(--shadow-sm);
                cursor: pointer;
            }
            
            .theme-contemporary #direct-update:hover {
                background: #1D4ED8;
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }
            
            .theme-contemporary #direct-update:active {
                transform: translateY(1px);
            }
            
            /* Price indicators */
            .theme-contemporary .positive {
                color: #059669 !important;
                background-color: #ECFDF5;
            }
            
            .theme-contemporary .negative {
                color: #DC2626 !important;
                background-color: #FEF2F2;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .theme-contemporary .price-details {
                    grid-template-columns: 1fr;
                }
                
                .theme-contemporary #price {
                    font-size: 2.5rem;
                }
            }
            
            /* Quote section */
            .theme-contemporary .quote-section {
                padding: calc(var(--spacing-unit) * 8) 0;
                background: white;
            }
            
            .theme-contemporary .quote-section h2 {
                font-size: 1.5rem;
                font-weight: 700;
                color: #111827;
                margin-bottom: calc(var(--spacing-unit) * 4);
                text-align: center;
                letter-spacing: -0.025em;
            }
            
            .theme-contemporary .quote-card {
                background: #F9FAFB;
                border-radius: var(--radius-lg);
                padding: calc(var(--spacing-unit) * 6);
                box-shadow: var(--shadow-md);
                position: relative;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .theme-contemporary .quote-card::before {
                content: '"';
                position: absolute;
                top: calc(var(--spacing-unit) * 2);
                left: calc(var(--spacing-unit) * 3);
                font-size: 5rem;
                color: #E5E7EB;
                font-family: Georgia, serif;
                line-height: 1;
            }
            
            .theme-contemporary .quote {
                font-size: 1.25rem;
                line-height: 1.6;
                color: #1F2937;
                margin-bottom: calc(var(--spacing-unit) * 3);
                position: relative;
                z-index: 1;
            }
            
            .theme-contemporary .author {
                font-weight: 600;
                color: #111827;
            }
            
            .theme-contemporary .date {
                color: #6B7280;
            }
            
            /* Resources section */
            .theme-contemporary .resources-section {
                padding: calc(var(--spacing-unit) * 8) 0;
                background: #F3F4F6;
            }
            
            .theme-contemporary .resources-section h2 {
                font-size: 1.5rem;
                font-weight: 700;
                color: #111827;
                margin-bottom: calc(var(--spacing-unit) * 6);
                text-align: center;
                letter-spacing: -0.025em;
            }
            
            .theme-contemporary .resources-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: calc(var(--spacing-unit) * 3);
            }
            
            .theme-contemporary .resource-card {
                background: white;
                border-radius: var(--radius-lg);
                padding: calc(var(--spacing-unit) * 4);
                box-shadow: var(--shadow-md);
                transition: var(--transition-all);
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .theme-contemporary .resource-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
            }
            
            .theme-contemporary .card-icon {
                width: 48px;
                height: 48px;
                background: #EFF6FF;
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: calc(var(--spacing-unit) * 3);
            }
            
            .theme-contemporary .card-icon svg {
                width: 24px;
                height: 24px;
                color: #2563EB;
            }
            
            .theme-contemporary .resource-card h3 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #111827;
                margin-bottom: calc(var(--spacing-unit) * 2);
                letter-spacing: -0.025em;
            }
            
            .theme-contemporary .resource-card p {
                color: #4B5563;
                margin-bottom: calc(var(--spacing-unit) * 3);
                flex-grow: 1;
            }
            
            .theme-contemporary .btn-primary {
                background: #2563EB;
                color: white;
                font-weight: 500;
                padding: calc(var(--spacing-unit) * 1.25) calc(var(--spacing-unit) * 2.5);
                border-radius: var(--radius-md);
                text-decoration: none;
                display: inline-block;
                transition: var(--transition-all);
                text-align: center;
            }
            
            .theme-contemporary .btn-primary:hover {
                background: #1D4ED8;
            }
            
            /* Footer */
            .theme-contemporary .footer {
                background: #1F2937;
                color: #E5E7EB;
                padding: calc(var(--spacing-unit) * 8) 0 calc(var(--spacing-unit) * 4);
            }
            
            .theme-contemporary .footer-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: calc(var(--spacing-unit) * 6);
                margin-bottom: calc(var(--spacing-unit) * 6);
            }
            
            .theme-contemporary .footer h4 {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: calc(var(--spacing-unit) * 3);
                color: white;
            }
            
            .theme-contemporary .footer ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .theme-contemporary .footer ul li {
                margin-bottom: calc(var(--spacing-unit) * 1.5);
            }
            
            .theme-contemporary .footer a {
                color: #D1D5DB;
                text-decoration: none;
                transition: var(--transition-all);
            }
            
            .theme-contemporary .footer a:hover {
                color: white;
            }
            
            .theme-contemporary .footer-bottom {
                padding-top: calc(var(--spacing-unit) * 3);
                border-top: 1px solid #374151;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: calc(var(--spacing-unit) * 2);
            }
            
            .theme-contemporary .small-text {
                font-size: 0.875rem;
                color: #9CA3AF;
            }
            
            /* Theme switcher styling */
            .theme-contemporary #theme-skin-switcher {
                background: white;
                border-radius: var(--radius-lg);
                padding: calc(var(--spacing-unit) * 3);
                box-shadow: var(--shadow-md);
                margin-top: calc(var(--spacing-unit) * 4) !important;
            }
            
            .theme-contemporary .switcher-title {
                font-weight: 600;
                color: #111827;
                margin-bottom: calc(var(--spacing-unit) * 2);
            }
            
            .theme-contemporary .theme-button, 
            .theme-contemporary .skin-button {
                padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2) !important;
                border-radius: var(--radius-md) !important;
                font-weight: 500 !important;
                font-size: 0.875rem !important;
                transition: var(--transition-all) !important;
            }
            
            .theme-contemporary .theme-button:hover, 
            .theme-contemporary .skin-button:hover {
                transform: translateY(-2px) !important;
            }
            
            .theme-contemporary .active-button {
                box-shadow: 0 0 0 2px #2563EB !important;
            }
        `
    };
    
    return themes[theme] || themes.classic;
}

// Get skin-specific styles (renamed from getThemeStyles)
function getSkinStyles(skin) {
    const skins = {
        // Clean, minimalist skin with subtle gradients
        minimal: `
            .skin-minimal .price-section {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                color: #333;
            }
            .skin-minimal .price-card {
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
                border: none;
            }
            .skin-minimal #price {
                color: #333 !important;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            .skin-minimal .price-display {
                background: rgba(247, 147, 26, 0.05);
            }
            .skin-minimal .detail-item {
                background: rgba(0, 0, 0, 0.02);
            }
            .skin-minimal .price-section span {
                color: #333;
            }
            .skin-minimal .label {
                color: #777;
                font-weight: 600;
            }
            .skin-minimal #direct-update {
                background: #f7931a;
                box-shadow: 0 4px 6px rgba(247, 147, 26, 0.2);
                color: white;
            }
            .skin-minimal #direct-update:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(247, 147, 26, 0.25);
            }
            .skin-minimal .positive { color: #4caf50 !important; }
            .skin-minimal .negative { color: #f44336 !important; }
            
            /* Other sections */
            .skin-minimal .quote-section {
                background: #f8f9fa;
            }
            .skin-minimal .quote-card {
                background: white;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            }
            .skin-minimal .resources-section {
                background: white;
            }
            .skin-minimal .footer {
                background: #333;
                color: #f8f9fa;
            }
        `,
        
        // Dark, professional skin with subtle accents
        dark: `
            .skin-dark .price-section {
                background: linear-gradient(135deg, #1a1a1a 0%, #303030 100%);
                color: #fff;
            }
            .skin-dark .price-card {
                background: rgba(25, 25, 25, 0.95);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .skin-dark #price {
                color: #f7931a !important;
                font-weight: 700;
                text-shadow: 0 2px 8px rgba(247, 147, 26, 0.3);
            }
            .skin-dark .price-display {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .skin-dark .detail-item {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .skin-dark .price-section span, .skin-dark .price-section h2, .skin-dark .last-updated {
                color: #fff;
            }
            .skin-dark .label {
                color: #999;
                font-weight: 600;
            }
            .skin-dark #direct-update {
                background: #f7931a;
                box-shadow: 0 4px 12px rgba(247, 147, 26, 0.4);
                color: white;
                border: none;
            }
            .skin-dark #direct-update:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(247, 147, 26, 0.5);
            }
            .skin-dark .positive { color: #66bb6a !important; text-shadow: 0 0 10px rgba(102, 187, 106, 0.3); }
            .skin-dark .negative { color: #ef5350 !important; text-shadow: 0 0 10px rgba(239, 83, 80, 0.3); }
            
            /* Other sections */
            .skin-dark .quote-section {
                background: #222;
                color: #fff;
            }
            .skin-dark .quote-card {
                background: #333;
                color: #fff;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            .skin-dark .resources-section {
                background: #1a1a1a;
                color: #fff;
            }
            .skin-dark .resource-card {
                background: #333;
                color: #fff;
            }
            .skin-dark .footer {
                background: #111;
                color: #ccc;
            }
        `,
        
        // Vibrant, refined skin with modern design
        vibrant: `
            /* Global styling improvements */
            .skin-vibrant .header {
                background: linear-gradient(90deg, #3a7bd5, #00d2ff);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .skin-vibrant .logo h1 {
                background: linear-gradient(90deg, #fff, #e0e0e0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: none;
            }
            
            .skin-vibrant .nav ul li a {
                color: white;
                font-weight: 500;
                position: relative;
                transition: all 0.3s;
            }
            
            .skin-vibrant .nav ul li a:after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: -2px;
                left: 0;
                background: white;
                transition: width 0.3s;
            }
            
            .skin-vibrant .nav ul li a:hover:after {
                width: 100%;
            }
            
            /* Price section styling */
            .skin-vibrant .price-section {
                background: linear-gradient(120deg, #3a7bd5, #00d2ff);
                color: #fff;
            }
            
            .skin-vibrant .price-card {
                background: rgba(255, 255, 255, 0.9);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                border: none;
            }
            
            .skin-vibrant .price-card h2 {
                color: #2c3e50;
                font-weight: 700;
            }
            
            .skin-vibrant #price {
                color: #2980b9 !important;
                font-weight: 700;
            }
            
            .skin-vibrant .price-display {
                background: rgba(41, 128, 185, 0.05);
                border-bottom: 3px solid #3498db;
            }
            
            .skin-vibrant .detail-item {
                background: rgba(41, 128, 185, 0.05);
                transition: all 0.3s ease;
            }
            
            .skin-vibrant .detail-item:hover {
                background: rgba(41, 128, 185, 0.1);
                transform: translateY(-2px);
            }
            
            .skin-vibrant .price-section span {
                color: #2c3e50;
            }
            
            .skin-vibrant .label {
                color: #7f8c8d;
                font-weight: 600;
            }
            
            .skin-vibrant .last-updated {
                color: #7f8c8d;
            }
            
            /* Button styling */
            .skin-vibrant #direct-update {
                background: linear-gradient(90deg, #3a7bd5, #00d2ff);
                color: white;
                box-shadow: 0 6px 15px rgba(41, 128, 185, 0.3);
                border: none;
            }
            
            .skin-vibrant #direct-update:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(41, 128, 185, 0.4);
            }
            
            .skin-vibrant #direct-update:active {
                transform: translateY(1px);
            }
            
            /* Dynamic price indicators */
            .skin-vibrant .positive { color: #27ae60 !important; font-weight: 600; }
            .skin-vibrant .negative { color: #e74c3c !important; font-weight: 600; }
            
            /* Other UI improvements */
            .skin-vibrant .quote-section {
                background: #ecf0f1;
            }
            
            .skin-vibrant .quote-card {
                border-left: 5px solid #3498db;
            }
            
            .skin-vibrant .resources-section {
                background: white;
            }
            
            .skin-vibrant .resource-card {
                border-radius: 10px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }
            
            .skin-vibrant .resource-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            }
            
            .skin-vibrant .card-icon {
                color: var(--bitcoin-orange);
            }
            
            .skin-vibrant .footer {
                background: #2c3e50;
                color: #ecf0f1;
            }
            
            .skin-vibrant .footer a {
                color: var(--bitcoin-orange-light);
                transition: color 0.3s;
            }
            
            .skin-vibrant .footer a:hover {
                color: var(--bitcoin-orange);
            }
        `,
        
        // Crypto skin - Bitcoin inspired with blockchain elements
        crypto: `
            /* Global styling */
            .skin-crypto {
                --bitcoin-orange: #f7931a;
                --bitcoin-orange-light: #ffa940;
                --bitcoin-orange-dark: #d97c06;
                --blockchain-blue: #1c60ff;
                --dark-navy: #0f172a;
                --subtle-gray: #f8fafc;
            }
            
            .skin-crypto .header {
                background: var(--dark-navy);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            }
            
            .skin-crypto .logo h1 {
                color: var(--bitcoin-orange);
            }
            
            .skin-crypto .nav ul li a {
                color: white;
                position: relative;
            }
            
            .skin-crypto .nav ul li a:after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 0;
                width: 0;
                height: 2px;
                background: var(--bitcoin-orange);
                transition: width 0.3s;
            }
            
            .skin-crypto .nav ul li a:hover:after {
                width: 100%;
            }
            
            /* Price section styling */
            .skin-crypto .price-section {
                background: linear-gradient(135deg, var(--dark-navy) 0%, #1e293b 100%);
                position: relative;
                overflow: hidden;
                color: white;
            }
            
            /* Bitcoin symbol watermark */
            .skin-crypto .price-section:before {
                content: '₿';
                position: absolute;
                color: rgba(247, 147, 26, 0.03);
                font-size: 40rem;
                right: -100px;
                top: -100px;
                line-height: 1;
                font-weight: bold;
                pointer-events: none;
            }
            
            .skin-crypto .price-card {
                background: #ffffff;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: none;
                overflow: hidden;
                position: relative;
            }
            
            /* Blockchain pattern overlay */
            .skin-crypto .price-card:after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background-image: 
                    linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
                    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7931a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                z-index: 0;
                pointer-events: none;
            }
            
            .skin-crypto .price-card > * {
                position: relative;
                z-index: 1;
            }
            
            .skin-crypto .price-card h2 {
                color: var(--dark-navy);
                font-weight: 700;
                text-align: center;
                position: relative;
                padding-bottom: 12px;
            }
            
            .skin-crypto .price-card h2:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 3px;
                background: var(--bitcoin-orange);
            }
            
            .skin-crypto #price {
                color: var(--bitcoin-orange) !important;
                font-weight: 800;
                font-family: 'Montserrat', sans-serif;
            }
            
            .skin-crypto .price-display {
                background: rgba(247, 147, 26, 0.05);
                border: 1px solid rgba(247, 147, 26, 0.1);
                position: relative;
            }
            
            .skin-crypto .price-display:before {
                content: '₿';
                position: absolute;
                top: 10px;
                left: 15px;
                font-size: 1.2rem;
                color: var(--bitcoin-orange);
                opacity: 0.5;
            }
            
            .skin-crypto #price-change {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 30px;
                font-weight: 600;
            }
            
            .skin-crypto .detail-item {
                background: rgba(247, 147, 26, 0.03);
                border-left: 3px solid var(--bitcoin-orange);
                transition: all 0.3s ease;
            }
            
            .skin-crypto .detail-item:hover {
                background: rgba(247, 147, 26, 0.07);
                transform: translateX(5px);
            }
            
            .skin-crypto .price-section span {
                color: #334155;
            }
            
            .skin-crypto .label {
                color: #64748b;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .skin-crypto .label:before {
                content: '';
                display: inline-block;
                width: 8px;
                height: 8px;
                background-color: var(--bitcoin-orange);
                border-radius: 50%;
            }
            
            .skin-crypto .last-updated {
                color: #64748b;
                font-style: italic;
            }
            
            /* Button styling */
            .skin-crypto #direct-update {
                background: var(--bitcoin-orange);
                color: white;
                box-shadow: 0 8px 15px rgba(247, 147, 26, 0.2);
                transition: all 0.3s ease;
                border: none;
                text-transform: uppercase;
                position: relative;
                overflow: hidden;
            }
            
            .skin-crypto #direct-update:before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: all 0.6s;
            }
            
            .skin-crypto #direct-update:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 20px rgba(247, 147, 26, 0.3);
                background: var(--bitcoin-orange-dark);
            }
            
            .skin-crypto #direct-update:hover:before {
                left: 100%;
            }
            
            /* Price indicators */
            .skin-crypto .positive { 
                color: #10b981 !important; 
                font-weight: 700;
                background-color: rgba(16, 185, 129, 0.1);
            }
            
            .skin-crypto .negative { 
                color: #ef4444 !important; 
                font-weight: 700; 
                background-color: rgba(239, 68, 68, 0.1);
            }
            
            /* Other UI improvements */
            .skin-crypto .quote-section {
                background: var(--subtle-gray);
            }
            
            .skin-crypto .quote-card {
                border-left: 5px solid var(--bitcoin-orange);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
            }
            
            .skin-crypto .resources-section {
                background: white;
            }
            
            .skin-crypto .resource-card {
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                border-top: 4px solid var(--bitcoin-orange);
                transition: all 0.3s ease;
            }
            
            .skin-crypto .resource-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 35px rgba(0, 0, 0, 0.1);
            }
            
            .skin-crypto .card-icon {
                color: var(--bitcoin-orange);
            }
            
            .skin-crypto .footer {
                background: var(--dark-navy);
                color: #e2e8f0;
            }
            
            .skin-crypto .footer a {
                color: var(--bitcoin-orange-light);
                transition: color 0.3s;
            }
            
            .skin-crypto .footer a:hover {
                color: var(--bitcoin-orange);
            }
        `
    };
    
    return skins[skin] || skins.minimal;
}

// Add theme and skin switcher UI
function addThemeSkinSwitcher() {
    const container = document.querySelector('#bitcoin-price .container');
    if (!container) return;
    
    // Get current theme and skin from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentTheme = urlParams.get('theme') || 'classic';
    const currentSkin = urlParams.get('skin') || 'minimal';
    const isDebug = isDebugMode();
    
    // Create container for switchers
    const switcherContainer = document.createElement('div');
    switcherContainer.id = 'theme-skin-switcher';
    switcherContainer.style.cssText = 'margin-top: 20px; display: flex; flex-direction: column; gap: 15px;';
    
    // Theme switcher
    const themeSwitcherTitle = document.createElement('div');
    themeSwitcherTitle.textContent = 'Layout:';
    themeSwitcherTitle.style.cssText = 'font-weight: bold; margin-bottom: 5px; text-align: center;';
    
    const themeSwitcher = document.createElement('div');
    themeSwitcher.style.cssText = 'display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;';
    
    const themes = [
        { name: 'classic', label: 'Classic', color: '#f0f0f0' },
        { name: 'modern', label: 'Modern', color: '#333333' },
        { name: 'terminal', label: 'Terminal', color: '#0a0e17' },
        { name: 'contemporary', label: 'Contemporary', color: '#ffffff' }
    ];
    
    themes.forEach(theme => {
        const button = document.createElement('a');
        const isActive = currentTheme === theme.name;
        
        // Preserve current skin when switching themes
        button.href = `?theme=${theme.name}&skin=${currentSkin}${isDebug ? '&debug=on' : ''}`;
        button.className = 'theme-button';
        button.textContent = theme.label;
        
        button.style.cssText = `
            padding: 8px 16px;
            background-color: ${theme.color};
            color: ${theme.name === 'modern' ? 'white' : 'black'};
            text-decoration: none;
            border-radius: 20px;
            font-size: 12px;
            font-weight: ${isActive ? '700' : '600'};
            box-shadow: ${isActive ? '0 5px 10px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)'};
            border: ${isActive ? '2px solid white' : 'none'};
            transform: ${isActive ? 'scale(1.05)' : 'scale(1)'};
            transition: all 0.3s ease;
        `;
        themeSwitcher.appendChild(button);
    });
    
    switcherContainer.appendChild(themeSwitcherTitle);
    switcherContainer.appendChild(themeSwitcher);
    
    container.appendChild(switcherContainer);
}

// Check if debug mode is enabled
function isDebugMode() {
    return new URLSearchParams(window.location.search).get('debug') === 'on';
}

// Fetch and display price data from real API
async function fetchAndDisplayPrice() {
    console.log('Fetching real-time Bitcoin price...');
    
    // Set loading indicator
    updateElementById('price', 'Fetching price...');
    
    try {
        // First try Coinbase API (reliable and no CORS issues)
        const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data && data.data && data.data.amount) {
                const price = parseFloat(data.data.amount);
                console.log('Successfully fetched real-time price:', price);
                
                // Format as currency
                const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency', 
                    currency: 'USD'
                }).format(price);
                
                // Update the price
                updateElementById('price', formattedPrice);
                
                // Also fetch additional data
                fetchSupplementaryData(price);
                
                // Add styles and success banner (only in debug mode)
                if (isDebugMode()) {
                    addSuccessBanner('Live price data loaded successfully!');
                }
                
                return; // Success - exit function
            }
        }
        
        // If Coinbase fails, try CoinGecko simple API
        console.log('Coinbase API failed, trying CoinGecko...');
        const geckoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true');
        
        if (geckoResponse.ok) {
            const geckoData = await geckoResponse.json();
            
            if (geckoData && geckoData.bitcoin && geckoData.bitcoin.usd) {
                const price = geckoData.bitcoin.usd;
                console.log('Successfully fetched CoinGecko price:', price);
                
                // Format as currency
                const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency', 
                    currency: 'USD'
                }).format(price);
                
                // Update the price
                updateElementById('price', formattedPrice);
                
                // Update supplementary data if available
                if (geckoData.bitcoin.usd_24h_change) {
                    const changeValue = geckoData.bitcoin.usd_24h_change;
                    const formattedChange = new Intl.NumberFormat('en-US', {
                        style: 'percent',
                        minimumFractionDigits: 2
                    }).format(changeValue / 100);
                    
                    updateElementById('price-change', formattedChange);
                    
                    // Add appropriate color
                    const changeElement = document.getElementById('price-change');
                    if (changeElement) {
                        changeElement.classList.remove('positive', 'negative');
                        changeElement.classList.add(changeValue >= 0 ? 'positive' : 'negative');
                    }
                }
                
                // Use volume if available
                if (geckoData.bitcoin.usd_24h_vol) {
                    updateElementById('volume', formatVolume(geckoData.bitcoin.usd_24h_vol));
                }
                
                // Estimate high/low based on current price
                updateElementById('price-high', new Intl.NumberFormat('en-US', {
                    style: 'currency', 
                    currency: 'USD'
                }).format(price * 1.01));
                
                updateElementById('price-low', new Intl.NumberFormat('en-US', {
                    style: 'currency', 
                    currency: 'USD'
                }).format(price * 0.99));
                
                // Add success banner (only in debug mode)
                if (isDebugMode()) {
                    addSuccessBanner('Live price data loaded successfully (CoinGecko)!');
                }
                
                return; // Success - exit function
            }
        }
        
        // If all APIs fail, use fallback
        throw new Error('All APIs failed');
        
    } catch (error) {
        console.error('Error fetching price:', error);
        
        // Use fallback with yesterday's price as a last resort
        const fallbackPrice = 79200; // Update this periodically
        console.log('Using fallback price:', fallbackPrice);
        
        // Format as currency
        const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency', 
            currency: 'USD'
        }).format(fallbackPrice);
        
        // Update with fallback price
        updateElementById('price', formattedPrice);
        updateElementById('price-high', new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(fallbackPrice * 1.01));
        updateElementById('price-low', new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(fallbackPrice * 0.99));
        updateElementById('volume', '~40B USD');
        
        // Add banner showing fallback price is being used (only in debug mode)
        if (isDebugMode()) {
            addSuccessBanner('Using recent price data (APIs unavailable)', 'warning');
        }
    }
    
    // Always update the time
    updateElementById('update-time', new Date().toLocaleTimeString());
}

// Fetch supplementary data
async function fetchSupplementaryData(currentPrice) {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true');
        
        if (response.ok) {
            const data = await response.json();
            const btcData = data.bitcoin;
            
            // Update price change
            if (btcData && btcData.usd_24h_change) {
                const changeValue = btcData.usd_24h_change;
                const formattedChange = new Intl.NumberFormat('en-US', {
                    style: 'percent',
                    minimumFractionDigits: 2
                }).format(changeValue / 100);
                
                updateElementById('price-change', formattedChange);
                
                // Add appropriate color
                const changeElement = document.getElementById('price-change');
                if (changeElement) {
                    changeElement.classList.remove('positive', 'negative');
                    changeElement.classList.add(changeValue >= 0 ? 'positive' : 'negative');
                }
            }
            
            // Update volume if available
            if (btcData && btcData.usd_24h_vol) {
                updateElementById('volume', formatVolume(btcData.usd_24h_vol));
            } else {
                // Estimate volume based on price
                updateElementById('volume', formatVolume(currentPrice * 1000000));
            }
            
            // Estimate high/low
            updateElementById('price-high', new Intl.NumberFormat('en-US', {
                style: 'currency', 
                currency: 'USD'
            }).format(currentPrice * 1.01));
            
            updateElementById('price-low', new Intl.NumberFormat('en-US', {
                style: 'currency', 
                currency: 'USD'
            }).format(currentPrice * 0.99));
        }
    } catch (error) {
        console.error('Error fetching supplementary data:', error);
        
        // Use estimates based on current price
        updateElementById('price-change', '0%');
        updateElementById('volume', formatVolume(currentPrice * 1000000));
        updateElementById('price-high', new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(currentPrice * 1.01));
        updateElementById('price-low', new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(currentPrice * 0.99));
    }
    
    // Update time
    updateElementById('update-time', new Date().toLocaleTimeString());
}

// Format volume
function formatVolume(volume) {
    if (volume >= 1e9) {
        return (volume / 1e9).toFixed(2) + 'B USD';
    } else if (volume >= 1e6) {
        return (volume / 1e6).toFixed(2) + 'M USD';
    } else if (volume >= 1e3) {
        return (volume / 1e3).toFixed(2) + 'K USD';
    }
    return volume.toFixed(2) + ' USD';
}

// Helper function to safely update elements
function updateElementById(id, text) {
    const element = document.getElementById(id);
    if (element) {
        if (isDebugMode()) {
            console.log(`Found and updating element #${id} with: ${text}`);
        }
        element.textContent = text;
        element.style.opacity = '1';
        
        // Only add animation in non-debug mode to avoid flashiness
        if (!isDebugMode()) {
            element.classList.add('updated-subtle');
        } else {
            element.classList.add('updated');
        }
    } else {
        console.error(`Element with ID ${id} not found!`);
        
        // Only do alternative search in debug mode
        if (isDebugMode()) {
            // Try to find it by other means
            const elements = document.querySelectorAll(`[id="${id}"], [class="${id}"], [name="${id}"]`);
            if (elements.length > 0) {
                console.log(`Found ${elements.length} alternative elements matching ${id}`);
                elements.forEach(el => {
                    el.textContent = text;
                    el.style.opacity = '1';
                });
            }
        }
    }
}

// Add a visible banner to confirm our script ran
function addSuccessBanner(message, type = 'success') {
    // Only show banners in debug mode
    if (!isDebugMode()) return;
    
    // Remove any existing banners
    const existingBanners = document.querySelectorAll('.success-banner, .warning-banner');
    existingBanners.forEach(banner => banner.remove());
    
    const container = document.querySelector('#bitcoin-price .container');
    if (container) {
        const banner = document.createElement('div');
        banner.className = type === 'success' ? 'success-banner' : 'warning-banner';
        banner.textContent = message + ' - Updated: ' + new Date().toLocaleTimeString();
        container.appendChild(banner);
    } else {
        console.error('Cannot find container to add banner');
    }
}

// Set up refresh button
document.addEventListener('DOMContentLoaded', function() {
    const directUpdateButton = document.getElementById('direct-update');
    if (directUpdateButton) {
        directUpdateButton.textContent = 'Refresh Bitcoin Price';
        directUpdateButton.addEventListener('click', function() {
            console.log('Refresh button clicked');
            fetchAndDisplayPrice();
        });
    }
}); 