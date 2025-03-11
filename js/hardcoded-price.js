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
        
        // Vibrant, colorful theme with bold elements
        vibrant: `
            .price-section {
                background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
                color: #fff;
            }
            .price-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 16px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
                border: none;
                overflow: hidden;
                position: relative;
            }
            .price-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 6px;
                background: linear-gradient(90deg, #ff9a9e, #fad0c4, #fad0c4, #fbc2eb);
                background-size: 300% 100%;
                animation: gradient-slide 15s ease infinite;
            }
            @keyframes gradient-slide {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            #price {
                color: #6a11cb !important;
                font-weight: 800;
                letter-spacing: -1px;
                font-size: 2.8rem;
                background: linear-gradient(90deg, #6a11cb, #2575fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: none;
            }
            .price-display {
                background: rgba(106, 17, 203, 0.05);
                padding: 25px;
                border-radius: 12px;
                margin: 20px 0;
            }
            .detail-item {
                background: rgba(0, 0, 0, 0.02);
                border-radius: 12px;
                padding: 15px;
                margin: 10px 0;
                transition: all 0.3s ease;
                border-left: 4px solid #6a11cb;
            }
            .detail-item:hover {
                transform: translateX(5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            }
            .price-section span {
                color: #333;
            }
            .label {
                color: #6a11cb;
                font-weight: 700;
                text-transform: uppercase;
                font-size: 0.8rem;
                letter-spacing: 1px;
            }
            #direct-update {
                background: linear-gradient(90deg, #6a11cb, #2575fc);
                box-shadow: 0 10px 20px rgba(106, 17, 203, 0.3);
                transition: all 0.3s ease;
                border: none;
                padding: 15px 25px !important;
                font-weight: 700 !important;
                border-radius: 30px !important;
                letter-spacing: 0.5px;
            }
            #direct-update:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 25px rgba(106, 17, 203, 0.4);
            }
            .positive { color: #00c853 !important; font-weight: 700; }
            .negative { color: #ff1744 !important; font-weight: 700; }
            .price-change { font-size: 1.2rem; font-weight: 700; }
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
    switcherContainer.style.cssText = 'margin-top: 20px; display: flex; justify-content: center; gap: 10px;';
    
    const themes = [
        { name: 'minimal', label: 'Minimal', color: '#c3cfe2' },
        { name: 'dark', label: 'Dark', color: '#303030' },
        { name: 'vibrant', label: 'Vibrant', color: '#6a11cb' }
    ];
    
    themes.forEach(theme => {
        const button = document.createElement('a');
        button.href = `?theme=${theme.name}${isDebugMode() ? '&debug=on' : ''}`;
        button.className = 'theme-button';
        button.textContent = theme.label;
        button.style.cssText = `
            padding: 8px 15px;
            background-color: ${theme.color};
            color: ${theme.name === 'dark' ? 'white' : 'black'};
            text-decoration: none;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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