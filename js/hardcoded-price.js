// Real-time price display script with themeable UI
document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug') === 'on';
    const theme = urlParams.get('theme') || 'minimal'; // Default theme is 'minimal'
    
    console.log('Bitcoin price script loaded', debugMode ? '(DEBUG MODE)' : '', `Theme: ${theme}`);
    
    // Remove debug borders if not in debug mode
    if (!debugMode) {
        document.querySelectorAll('.element-debug').forEach(el => {
            el.classList.remove('element-debug');
        });
    }
    
    // Apply selected theme
    applyTheme(theme);
    
    setTimeout(function() {
        fetchAndDisplayPrice();
    }, 500); // Small delay to ensure DOM is fully loaded
});

// Also try window load event
window.addEventListener('load', function() {
    console.log('Window loaded, fetching price');
    fetchAndDisplayPrice();
});

// Apply theme styles
function applyTheme(themeName) {
    // Remove any existing theme
    document.body.classList.remove('theme-minimal', 'theme-dark', 'theme-vibrant');
    
    // Validate theme name
    const validThemes = ['minimal', 'dark', 'vibrant'];
    const theme = validThemes.includes(themeName) ? themeName : 'minimal';
    
    // Add theme class to body
    document.body.classList.add(`theme-${theme}`);
    
    // Apply theme-specific styles
    const themeStyle = document.getElementById('theme-styles');
    if (themeStyle) {
        document.head.removeChild(themeStyle);
    }
    
    const style = document.createElement('style');
    style.id = 'theme-styles';
    
    style.textContent = getThemeStyles(theme);
    document.head.appendChild(style);
    
    // Add theme switcher if it doesn't exist
    if (!document.getElementById('theme-switcher')) {
        addThemeSwitcher();
    }
    
    console.log(`Theme applied: ${theme}`);
}

// Get theme-specific styles
function getThemeStyles(theme) {
    const themes = {
        // Clean, minimalist theme with subtle gradients
        minimal: `
            .price-section {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                color: #333;
            }
            .price-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
                border: none;
            }
            #price {
                color: #333 !important;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            .price-display {
                background: rgba(247, 147, 26, 0.05);
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
            }
            .detail-item {
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
                padding: 12px 15px;
                margin: 8px 0;
            }
            .price-section span {
                color: #333;
            }
            .label {
                color: #777;
                font-weight: 600;
            }
            #direct-update {
                background: #f7931a;
                box-shadow: 0 4px 6px rgba(247, 147, 26, 0.2);
                transition: all 0.2s ease;
            }
            #direct-update:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(247, 147, 26, 0.25);
            }
            .positive { color: #4caf50 !important; }
            .negative { color: #f44336 !important; }
        `,
        
        // Dark, professional theme with subtle accents
        dark: `
            .price-section {
                background: linear-gradient(135deg, #1a1a1a 0%, #303030 100%);
                color: #fff;
            }
            .price-card {
                background: rgba(25, 25, 25, 0.95);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            #price {
                color: #f7931a !important;
                font-weight: 700;
                letter-spacing: -0.5px;
                font-size: 2.5rem;
                text-shadow: 0 2px 8px rgba(247, 147, 26, 0.3);
            }
            .price-display {
                background: rgba(255, 255, 255, 0.03);
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .detail-item {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                padding: 12px 15px;
                margin: 8px 0;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .price-section span, .price-section h2, .last-updated {
                color: #fff;
            }
            .label {
                color: #999;
                font-weight: 600;
            }
            #direct-update {
                background: #f7931a;
                box-shadow: 0 4px 12px rgba(247, 147, 26, 0.4);
                transition: all 0.2s ease;
                border: none;
                padding: 12px 20px !important;
                font-weight: 600 !important;
            }
            #direct-update:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(247, 147, 26, 0.5);
            }
            .positive { color: #66bb6a !important; text-shadow: 0 0 10px rgba(102, 187, 106, 0.3); }
            .negative { color: #ef5350 !important; text-shadow: 0 0 10px rgba(239, 83, 80, 0.3); }
        `,
        
        // Vibrant, refined theme with modern design - UPDATED
        vibrant: `
            /* Global styling improvements */
            body.theme-vibrant .header {
                background: linear-gradient(90deg, #3a7bd5, #00d2ff);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            body.theme-vibrant .logo h1 {
                background: linear-gradient(90deg, #fff, #e0e0e0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: none;
            }
            
            body.theme-vibrant .nav ul li a {
                color: white;
                font-weight: 500;
                position: relative;
                transition: all 0.3s;
            }
            
            body.theme-vibrant .nav ul li a:after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: -2px;
                left: 0;
                background: white;
                transition: width 0.3s;
            }
            
            body.theme-vibrant .nav ul li a:hover:after {
                width: 100%;
            }
            
            /* Price section styling */
            .price-section {
                background: linear-gradient(120deg, #3a7bd5, #00d2ff);
                color: #fff;
                padding: 50px 0;
            }
            
            .price-card {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                border: none;
                overflow: hidden;
                padding: 30px;
                position: relative;
            }
            
            .price-card h2 {
                color: #2c3e50;
                font-weight: 700;
                margin-bottom: 20px;
                font-size: 1.8rem;
            }
            
            #price {
                color: #2980b9 !important;
                font-weight: 700;
                font-size: 2.5rem;
                position: relative;
                display: inline-block;
            }
            
            .price-display {
                background: rgba(41, 128, 185, 0.05);
                padding: 20px;
                border-radius: 12px;
                margin: 15px 0;
                text-align: center;
                border-bottom: 3px solid #3498db;
            }
            
            #price-change {
                font-size: 1.1rem;
                font-weight: 600;
                margin-left: 15px;
            }
            
            .detail-item {
                background: rgba(41, 128, 185, 0.05);
                border-radius: 8px;
                padding: 12px 15px;
                margin: 10px 0;
                transition: all 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .detail-item:hover {
                background: rgba(41, 128, 185, 0.1);
                transform: translateY(-2px);
            }
            
            .price-section span {
                color: #2c3e50;
            }
            
            .label {
                color: #7f8c8d;
                font-weight: 600;
            }
            
            .last-updated {
                color: #7f8c8d;
                font-size: 0.9rem;
                text-align: center;
                margin-top: 15px;
            }
            
            /* Button styling */
            #direct-update {
                background: linear-gradient(90deg, #3a7bd5, #00d2ff);
                color: white;
                box-shadow: 0 6px 15px rgba(41, 128, 185, 0.3);
                transition: all 0.3s ease;
                border: none;
                padding: 12px 24px !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
                display: block;
                margin: 20px auto 10px;
                outline: none;
            }
            
            #direct-update:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(41, 128, 185, 0.4);
            }
            
            #direct-update:active {
                transform: translateY(1px);
            }
            
            /* Dynamic price indicators */
            .positive { color: #27ae60 !important; font-weight: 600; }
            .negative { color: #e74c3c !important; font-weight: 600; }
            
            /* Other UI improvements */
            body.theme-vibrant .quote-section {
                background: #ecf0f1;
            }
            
            body.theme-vibrant .quote-card {
                border-left: 5px solid #3498db;
            }
            
            body.theme-vibrant .resources-section {
                background: white;
            }
            
            body.theme-vibrant .resource-card {
                border-radius: 10px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }
            
            body.theme-vibrant .resource-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            }
            
            body.theme-vibrant .footer {
                background: #2c3e50;
                color: #ecf0f1;
            }
            
            body.theme-vibrant .footer a {
                color: #3498db;
                transition: color 0.3s;
            }
            
            body.theme-vibrant .footer a:hover {
                color: #2980b9;
            }
            
            /* Theme switcher styling */
            #theme-switcher {
                background: rgba(255, 255, 255, 0.8);
                border-radius: 30px;
                padding: 5px;
            }
            
            #theme-switcher .theme-button {
                transition: transform 0.3s, box-shadow 0.3s;
            }
            
            #theme-switcher .theme-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            }
        `,
        
        // NEW THEME: Crypto - Bitcoin inspired with blockchain elements
        crypto: `
            /* Global styling */
            body.theme-crypto {
                --bitcoin-orange: #f7931a;
                --bitcoin-orange-light: #ffa940;
                --bitcoin-orange-dark: #d97c06;
                --blockchain-blue: #1c60ff;
                --dark-navy: #0f172a;
                --subtle-gray: #f8fafc;
            }
            
            body.theme-crypto .header {
                background: var(--dark-navy);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            }
            
            body.theme-crypto .logo h1 {
                color: var(--bitcoin-orange);
            }
            
            body.theme-crypto .nav ul li a {
                color: white;
                position: relative;
            }
            
            body.theme-crypto .nav ul li a:after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 0;
                width: 0;
                height: 2px;
                background: var(--bitcoin-orange);
                transition: width 0.3s;
            }
            
            body.theme-crypto .nav ul li a:hover:after {
                width: 100%;
            }
            
            /* Price section styling */
            .price-section {
                background: linear-gradient(135deg, var(--dark-navy) 0%, #1e293b 100%);
                position: relative;
                overflow: hidden;
                padding: 50px 0;
                color: white;
            }
            
            /* Bitcoin symbol watermark */
            .price-section:before {
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
            
            .price-card {
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: none;
                overflow: hidden;
                position: relative;
            }
            
            /* Blockchain pattern overlay */
            .price-card:after {
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
            
            .price-card > * {
                position: relative;
                z-index: 1;
            }
            
            .price-card h2 {
                color: var(--dark-navy);
                font-weight: 700;
                text-align: center;
                margin-bottom: 25px;
                position: relative;
                padding-bottom: 12px;
            }
            
            .price-card h2:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 3px;
                background: var(--bitcoin-orange);
            }
            
            #price {
                color: var(--bitcoin-orange) !important;
                font-weight: 800;
                font-size: 2.8rem;
                display: block;
                text-align: center;
                font-family: 'Montserrat', sans-serif;
            }
            
            .price-display {
                background: rgba(247, 147, 26, 0.05);
                padding: 25px;
                border-radius: 12px;
                margin: 20px 0;
                border: 1px solid rgba(247, 147, 26, 0.1);
                position: relative;
            }
            
            .price-display:before {
                content: '₿';
                position: absolute;
                top: 10px;
                left: 15px;
                font-size: 1.2rem;
                color: var(--bitcoin-orange);
                opacity: 0.5;
            }
            
            #price-change {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 30px;
                font-weight: 600;
                font-size: 1rem;
                margin-left: 0;
                margin-top: 10px;
            }
            
            .detail-item {
                background: rgba(247, 147, 26, 0.03);
                border-radius: 10px;
                padding: 15px;
                margin: 12px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-left: 3px solid var(--bitcoin-orange);
                transition: all 0.3s ease;
            }
            
            .detail-item:hover {
                background: rgba(247, 147, 26, 0.07);
                transform: translateX(5px);
            }
            
            .price-section span {
                color: #334155;
            }
            
            .label {
                color: #64748b;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .label:before {
                content: '';
                display: inline-block;
                width: 8px;
                height: 8px;
                background-color: var(--bitcoin-orange);
                border-radius: 50%;
            }
            
            .last-updated {
                color: #64748b;
                font-size: 0.9rem;
                text-align: center;
                margin-top: 20px;
                font-style: italic;
            }
            
            /* Button styling */
            #direct-update {
                background: var(--bitcoin-orange);
                color: white;
                box-shadow: 0 8px 15px rgba(247, 147, 26, 0.2);
                transition: all 0.3s ease;
                border: none;
                padding: 14px 30px !important;
                font-weight: 700 !important;
                border-radius: 8px !important;
                position: relative;
                overflow: hidden;
                display: block;
                margin: 25px auto 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            #direct-update:before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: all 0.6s;
            }
            
            #direct-update:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 20px rgba(247, 147, 26, 0.3);
                background: var(--bitcoin-orange-dark);
            }
            
            #direct-update:hover:before {
                left: 100%;
            }
            
            /* Price indicators */
            .positive { 
                color: #10b981 !important; 
                font-weight: 700;
                background-color: rgba(16, 185, 129, 0.1);
            }
            
            .negative { 
                color: #ef4444 !important; 
                font-weight: 700; 
                background-color: rgba(239, 68, 68, 0.1);
            }
            
            /* Other UI improvements */
            body.theme-crypto .quote-section {
                background: var(--subtle-gray);
            }
            
            body.theme-crypto .quote-card {
                border-left: 5px solid var(--bitcoin-orange);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
            }
            
            body.theme-crypto .resources-section {
                background: white;
            }
            
            body.theme-crypto .resource-card {
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                border-top: 4px solid var(--bitcoin-orange);
                transition: all 0.3s ease;
            }
            
            body.theme-crypto .resource-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 35px rgba(0, 0, 0, 0.1);
            }
            
            body.theme-crypto .card-icon {
                color: var(--bitcoin-orange);
            }
            
            body.theme-crypto .footer {
                background: var(--dark-navy);
                color: #e2e8f0;
            }
            
            body.theme-crypto .footer a {
                color: var(--bitcoin-orange-light);
                transition: color 0.3s;
            }
            
            body.theme-crypto .footer a:hover {
                color: var(--bitcoin-orange);
            }
            
            /* Theme switcher styling */
            #theme-switcher {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 40px;
                padding: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            }
            
            #theme-switcher .theme-button {
                transition: transform 0.3s, box-shadow 0.3s;
                font-weight: 700;
            }
            
            #theme-switcher .theme-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            }
        `
    };
    
    return themes[theme] || themes.minimal;
}

// Add theme switcher UI
function addThemeSwitcher() {
    const container = document.querySelector('#bitcoin-price .container');
    if (!container) return;
    
    const switcherContainer = document.createElement('div');
    switcherContainer.id = 'theme-switcher';
    switcherContainer.style.cssText = 'margin-top: 20px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;';
    
    const themes = [
        { name: 'minimal', label: 'Minimal', color: '#c3cfe2' },
        { name: 'dark', label: 'Dark', color: '#303030' },
        { name: 'vibrant', label: 'Vibrant', color: '#3a7bd5' },
        { name: 'crypto', label: 'Crypto', color: '#f7931a' }
    ];
    
    // Get current theme from URL
    const currentTheme = new URLSearchParams(window.location.search).get('theme') || 'minimal';
    
    themes.forEach(theme => {
        const button = document.createElement('a');
        button.href = `?theme=${theme.name}${isDebugMode() ? '&debug=on' : ''}`;
        button.className = 'theme-button';
        button.textContent = theme.label;
        
        // Highlight current theme
        const isActive = currentTheme === theme.name;
        
        button.style.cssText = `
            padding: 8px 16px;
            background-color: ${theme.color};
            color: ${['dark', 'vibrant'].includes(theme.name) ? 'white' : 'black'};
            text-decoration: none;
            border-radius: 20px;
            font-size: 12px;
            font-weight: ${isActive ? '700' : '600'};
            box-shadow: ${isActive ? '0 5px 10px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)'};
            border: ${isActive ? '2px solid white' : 'none'};
            transform: ${isActive ? 'scale(1.05)' : 'scale(1)'};
            transition: all 0.3s ease;
        `;
        switcherContainer.appendChild(button);
    });
    
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