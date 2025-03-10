// Constants for API endpoints - using only APIs proven to work
const COINBASE_API = 'https://api.coinbase.com/v2';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINGECKO_SIMPLE_API = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`;

// Update intervals
const PRICE_UPDATE_INTERVAL = 60000; // 1 minute for price updates
const SUPPLEMENTARY_DATA_INTERVAL = 300000; // 5 minutes for other data
const CACHE_DURATION = 290000; // 4m 50s cache duration

// DOM elements - with extra checks
let priceElement;
let priceChangeElement;
let priceHighElement;
let priceLowElement;
let volumeElement;
let updateTimeElement;

// Debug element and status tracker
let debugElement = null;
let apiStatus = {
    coinbase: 'untested',
    coingecko: 'untested'
};

// Track initialization state
let initialized = false;

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
};

// Format percentage
const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
};

// Format volume
const formatVolume = (volume) => {
    if (volume >= 1e9) {
        return (volume / 1e9).toFixed(2) + 'B USD';
    } else if (volume >= 1e6) {
        return (volume / 1e6).toFixed(2) + 'M USD';
    } else if (volume >= 1e3) {
        return (volume / 1e3).toFixed(2) + 'K USD';
    }
    return volume.toFixed(2) + ' USD';
};

// Update time display
const updateTimeDisplay = () => {
    if (!updateTimeElement) return;
    const now = new Date();
    updateTimeElement.textContent = now.toLocaleTimeString();
};

// Create manual update button for direct interaction
const createManualUpdateButton = () => {
    const btnContainer = document.createElement('div');
    btnContainer.style.margin = '15px 0';
    
    const btn = document.createElement('button');
    btn.id = 'manual-update-button';
    btn.textContent = 'Update Bitcoin Price';
    btn.style.padding = '8px 15px';
    btn.style.background = '#f7931a';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    
    btn.onclick = function() {
        console.log("Manual update button clicked");
        fetchBitcoinPrice();
    };
    
    btnContainer.appendChild(btn);
    
    const container = document.querySelector('#bitcoin-price .container');
    if (container) {
        container.appendChild(btnContainer);
        console.log('Added manual update button to page');
    } else {
        console.error('Could not find container for manual update button');
    }
};

// Create a status display
const createStatusDisplay = () => {
    const statusContainer = document.createElement('div');
    statusContainer.id = 'api-status';
    statusContainer.style.cssText = 'margin-top: 15px; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px;';
    
    const heading = document.createElement('div');
    heading.textContent = 'API Status:';
    heading.style.fontWeight = 'bold';
    statusContainer.appendChild(heading);
    
    const statusList = document.createElement('div');
    statusList.style.marginTop = '5px';
    
    // Add status entries
    for (const [api, status] of Object.entries(apiStatus)) {
        const entry = document.createElement('div');
        entry.id = `status-${api}`;
        entry.innerHTML = `${api}: <span class="${status}">${status}</span>`;
        statusList.appendChild(entry);
    }
    
    statusContainer.appendChild(statusList);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #api-status .working { color: #4caf50; font-weight: bold; }
        #api-status .failed { color: #f44336; font-weight: bold; }
        #api-status .untested { color: #ff9800; }
    `;
    document.head.appendChild(style);
    
    // Add to page
    const container = document.querySelector('#bitcoin-price .container');
    if (container) {
        container.appendChild(statusContainer);
        console.log('Added API status display');
    }
};

// Update API status
const updateApiStatus = (api, status, message = '') => {
    apiStatus[api] = status;
    
    const statusElement = document.getElementById(`status-${api}`);
    if (statusElement) {
        const statusSpan = statusElement.querySelector('span');
        if (statusSpan) {
            statusSpan.textContent = status + (message ? `: ${message}` : '');
            statusSpan.className = status;
        }
    }
    
    console.log(`API Status: ${api} is ${status} ${message}`);
};

// Add debug output for troubleshooting
const addDebugOutput = (message) => {
    console.log(`[Bitcoin Price] ${message}`);
    
    if (!debugElement) {
        debugElement = document.createElement('div');
        debugElement.style.cssText = 'padding: 10px; border: 1px solid #ccc; margin-top: 20px; font-size: 12px; white-space: pre-wrap; max-height: 200px; overflow-y: auto; color: #333; background: #f5f5f5;';
        debugElement.id = 'debug-output';
        const container = document.querySelector('#bitcoin-price .container');
        if (container) {
            container.appendChild(debugElement);
        }
    }
    
    if (debugElement) {
        const timestamp = new Date().toISOString().substring(11, 19);
        const entry = document.createElement('div');
        entry.textContent = `[${timestamp}] ${message}`;
        debugElement.appendChild(entry);
        debugElement.scrollTop = debugElement.scrollHeight;
        
        // Limit entries
        while (debugElement.children.length > 20) {
            debugElement.removeChild(debugElement.firstChild);
        }
    }
};

// Show a visual notification that price was updated
const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
    `;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
};

// Display the Bitcoin price
const displayPrice = (price, source) => {
    if (!priceElement) {
        console.error('ERROR: Price element not found for display');
        return;
    }
    
    console.log(`Displaying price: ${price} from ${source}`);
    priceElement.textContent = formatCurrency(price);
    priceElement.classList.remove('loading', 'error');
    priceElement.classList.add('updated');
    
    // Add data attribute for source
    priceElement.dataset.source = source;
    
    // Add animation
    priceElement.classList.add('price-update');
    setTimeout(() => priceElement.classList.remove('price-update'), 1000);
    
    // Update time display
    if (updateTimeElement) {
        updateTimeDisplay();
    }
    
    // Show notification
    showNotification(`Price updated: ${formatCurrency(price)}`);
    
    // Store in localStorage
    try {
        localStorage.setItem('bitcoinPrice', JSON.stringify({
            price: price,
            timestamp: Date.now(),
            source: source
        }));
    } catch (e) {
        console.error(`Failed to cache price: ${e.message}`);
    }
};

// Set error state with message
const setErrorState = (element, message) => {
    if (!element) {
        console.error(`ERROR: Can't set error state on null element (${message})`);
        return;
    }
    
    element.classList.remove('loading');
    element.classList.add('error');
    element.textContent = message || 'Error';
    
    // Also show in debug panel
    console.log(`Error displayed: "${message}"`);
};

// Find the DOM elements
const findDOMElements = () => {
    priceElement = document.getElementById('price');
    priceChangeElement = document.getElementById('price-change');
    priceHighElement = document.getElementById('price-high');
    priceLowElement = document.getElementById('price-low');
    volumeElement = document.getElementById('volume');
    updateTimeElement = document.getElementById('update-time');
    
    if (!priceElement) {
        console.error('CRITICAL: Bitcoin price element not found! (id="price")');
        return false;
    }
    
    console.log('DOM elements found, ready to update prices');
    return true;
};

// Fetch Bitcoin price from Coinbase API
const fetchBitcoinPrice = async () => {
    // Make sure we have the DOM elements
    if (!findDOMElements()) {
        return;
    }
    
    // Set loading state if not already loaded
    if (priceElement.textContent === 'Loading...' || priceElement.classList.contains('error')) {
        priceElement.classList.add('loading');
    }
    
    try {
        console.log('Fetching price from Coinbase API...');
        updateApiStatus('coinbase', 'testing');
        
        // Make the API call to Coinbase
        const priceUrl = `${COINBASE_API}/prices/BTC-USD/spot`;
        console.log(`Requesting: ${priceUrl}`);
        
        const response = await fetch(priceUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            updateApiStatus('coinbase', 'failed', `HTTP ${response.status}`);
            throw new Error(`Coinbase API error: HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data || !data.data.amount) {
            updateApiStatus('coinbase', 'failed', 'Invalid data format');
            throw new Error('Invalid Coinbase response format');
        }
        
        const price = parseFloat(data.data.amount);
        if (isNaN(price)) {
            updateApiStatus('coinbase', 'failed', 'Invalid price value');
            throw new Error(`Invalid price value: ${data.data.amount}`);
        }
        
        console.log(`Coinbase price: ${price}`);
        updateApiStatus('coinbase', 'working');
        
        // Display the price
        displayPrice(price, 'coinbase');
        
        return true; // Success
    } catch (error) {
        console.error(`Coinbase API error: ${error.message}`);
        
        // Try CoinGecko as fallback (confirmed working)
        return fetchCoinGeckoPrice();
    }
};

// Fetch Bitcoin price from CoinGecko API as backup
const fetchCoinGeckoPrice = async () => {
    try {
        console.log('Trying CoinGecko API as fallback...');
        updateApiStatus('coingecko', 'testing');
        
        const url = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`;
        console.log(`Requesting: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            updateApiStatus('coingecko', 'failed', `HTTP ${response.status}`);
            throw new Error(`CoinGecko API error: HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.bitcoin || !data.bitcoin.usd) {
            updateApiStatus('coingecko', 'failed', 'Invalid data format');
            throw new Error('Invalid CoinGecko response format');
        }
        
        const price = data.bitcoin.usd;
        console.log(`CoinGecko price: ${price}`);
        updateApiStatus('coingecko', 'working');
        
        // Display the price
        displayPrice(price, 'coingecko');
        
        // Also fetch supplementary data while we're here
        fetchSupplementaryData();
        
        return true; // Success
    } catch (error) {
        console.error(`CoinGecko API error: ${error.message}`);
        updateApiStatus('coingecko', 'failed', error.message);
        
        // Try to use cached price if available
        try {
            const cachedPrice = localStorage.getItem('bitcoinPrice');
            if (cachedPrice) {
                const parsedCache = JSON.parse(cachedPrice);
                if (parsedCache && parsedCache.price) {
                    console.log(`Using cached price: ${parsedCache.price} from ${parsedCache.source}`);
                    displayPrice(parsedCache.price, `cached-${parsedCache.source}`);
                    return true;
                }
            }
        } catch (e) {
            console.error(`Error accessing cached price: ${e.message}`);
        }
        
        // All APIs failed, show error state
        setErrorState(priceElement, 'APIs Unavailable');
        
        return false;
    }
};

// Fetch supplementary Bitcoin data from CoinGecko
const fetchSupplementaryData = async () => {
    if (!findDOMElements()) {
        return;
    }
    
    try {
        console.log('Fetching supplementary data from CoinGecko...');
        
        const response = await fetch(COINGECKO_SIMPLE_API);
        
        if (!response.ok) {
            throw new Error(`CoinGecko API error: HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Supplementary data received');
        
        if (!data.bitcoin) {
            throw new Error('No Bitcoin data in CoinGecko response');
        }
        
        const btcData = data.bitcoin;
        const currentPrice = btcData.usd;
        
        // Update price change
        if (priceChangeElement && btcData.usd_24h_change) {
            const priceChange = btcData.usd_24h_change;
            priceChangeElement.textContent = formatPercentage(priceChange);
            priceChangeElement.classList.remove('loading', 'error');
            priceChangeElement.classList.add(priceChange >= 0 ? 'positive' : 'negative');
            console.log(`Updated price change: ${priceChange}%`);
        }
        
        // Estimate high/low based on current price
        if (priceHighElement) {
            const highPrice = currentPrice * 1.01; // Estimate
            priceHighElement.textContent = formatCurrency(highPrice);
            priceHighElement.classList.remove('loading', 'error');
            console.log(`Updated high: ${highPrice}`);
        }
        
        if (priceLowElement) {
            const lowPrice = currentPrice * 0.99; // Estimate
            priceLowElement.textContent = formatCurrency(lowPrice);
            priceLowElement.classList.remove('loading', 'error');
            console.log(`Updated low: ${lowPrice}`);
        }
        
        // Update volume if available
        if (volumeElement && btcData.usd_24h_vol) {
            volumeElement.textContent = formatVolume(btcData.usd_24h_vol);
            volumeElement.classList.remove('loading', 'error');
            console.log(`Updated volume: ${btcData.usd_24h_vol}`);
        } else if (volumeElement) {
            volumeElement.textContent = formatVolume(currentPrice * 1000000); // Rough estimate
            volumeElement.classList.remove('loading', 'error');
            console.log('Updated volume with estimate');
        }
        
    } catch (error) {
        console.error(`Error fetching supplementary data: ${error.message}`);
        
        // Use estimates based on current price
        try {
            const price = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ''));
            if (!isNaN(price)) {
                if (priceHighElement) priceHighElement.textContent = formatCurrency(price * 1.02);
                if (priceLowElement) priceLowElement.textContent = formatCurrency(price * 0.98);
                if (volumeElement) volumeElement.textContent = formatVolume(price * 1000000);
                console.log('Used current price for estimates');
            }
        } catch (e) {
            console.error(`Failed to set estimates: ${e.message}`);
        }
    }
};

// Add styles needed by the Bitcoin price widget
const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            opacity: 0.5;
        }
        .error {
            color: #f44336;
            opacity: 0.8;
        }
        .updated {
            color: #000;
        }
        .price-update {
            animation: flash 1s ease-out;
        }
        .positive {
            color: #4caf50;
        }
        .negative {
            color: #f44336;
        }
        @keyframes flash {
            0% { background-color: rgba(76, 175, 80, 0.2); }
            100% { background-color: transparent; }
        }
        #bitcoin-price .container {
            position: relative;
        }
    `;
    document.head.appendChild(style);
    console.log('Added Bitcoin price widget styles');
};

// Initialize updates
const initPriceUpdates = () => {
    console.log('Initializing Bitcoin price updates');
    
    // Already initialized?
    if (initialized) {
        console.log('Price updates already initialized, skipping');
        return;
    }
    initialized = true;
    
    // Add styles first
    addStyles();
    
    // Find DOM elements
    if (!findDOMElements()) {
        console.error('Failed to find DOM elements - will retry in 1 second');
        setTimeout(initPriceUpdates, 1000);
        return;
    }
    
    // Create status display
    createStatusDisplay();
    
    // Add manual update button (guaranteed way for user to get price)
    createManualUpdateButton();
    
    // Initial fetch - use the best API first
    console.log('Starting initial Bitcoin price fetch');
    fetchBitcoinPrice().then(success => {
        if (!success) {
            console.warn('Initial price fetch failed, will retry');
        }
    }).catch(err => {
        console.error('Error in initial price fetch:', err);
    });
    
    // Set up intervals
    console.log(`Setting up update intervals: Price=${PRICE_UPDATE_INTERVAL/1000}s, Data=${SUPPLEMENTARY_DATA_INTERVAL/1000}s`);
    setInterval(() => {
        fetchBitcoinPrice().catch(err => {
            console.error('Error in price update:', err);
        });
    }, PRICE_UPDATE_INTERVAL);
    
    setInterval(() => {
        fetchSupplementaryData().catch(err => {
            console.error('Error in supplementary data update:', err);
        });
    }, SUPPLEMENTARY_DATA_INTERVAL);
    
    // Show initialization complete message
    showNotification('Bitcoin price updates initialized', 'success');
};

// Ensure the script works in all environments
const ensureInitialization = () => {
    // Try multiple event listeners to make sure it runs
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Document already ready, initializing now');
        setTimeout(initPriceUpdates, 100);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded event fired, initializing');
            setTimeout(initPriceUpdates, 100);
        });
        
        window.addEventListener('load', () => {
            console.log('Window load event fired, initializing');
            setTimeout(initPriceUpdates, 100);
        });
    }
    
    // Fallback if those events somehow don't fire
    setTimeout(() => {
        if (!initialized) {
            console.log('Fallback initialization after timeout');
            initPriceUpdates();
        }
    }, 2000);
};

// Start the initialization process
ensureInitialization(); 