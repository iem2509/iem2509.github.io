// Constants for API endpoints
const COINBASE_API = 'https://api.coinbase.com/v2';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINGECKO_SIMPLE_API = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;

// Update intervals (different for price vs supplementary data)
const PRICE_UPDATE_INTERVAL = 60000; // 1 minute for price updates
const SUPPLEMENTARY_DATA_INTERVAL = 300000; // 5 minutes for other data
const CACHE_DURATION = 290000; // 4m 50s cache duration

// DOM elements
const priceElement = document.getElementById('price');
const priceChangeElement = document.getElementById('price-change');
const priceHighElement = document.getElementById('price-high');
const priceLowElement = document.getElementById('price-low');
const volumeElement = document.getElementById('volume');
const updateTimeElement = document.getElementById('update-time');

// Debug element (will create if needed)
let debugElement = null;

// Cached data
let cachedPrice = null;
let cachedSupplementaryData = null;
let lastPriceUpdate = 0;
let lastSupplementaryUpdate = 0;

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
    const now = new Date();
    updateTimeElement.textContent = now.toLocaleTimeString();
};

// Set loading state
const setLoadingState = (element, isLoading) => {
    if (isLoading) {
        element.classList.add('loading');
        element.dataset.previousText = element.textContent;
        element.textContent = 'Loading...';
    } else {
        element.classList.remove('loading');
        if (element.dataset.previousText) {
            element.textContent = element.dataset.previousText;
        }
    }
};

// Add debug output for troubleshooting
const addDebugOutput = (message) => {
    if (!debugElement) {
        debugElement = document.createElement('div');
        debugElement.style.cssText = 'padding: 10px; border: 1px solid #ccc; margin-top: 20px; font-size: 12px; white-space: pre-wrap; max-height: 200px; overflow-y: auto; color: #333; background: #f5f5f5;';
        debugElement.id = 'debug-output';
        const container = document.querySelector('#bitcoin-price .container');
        if (container) {
            container.appendChild(debugElement);
        }
    }
    
    const timestamp = new Date().toISOString().substring(11, 19);
    const entry = document.createElement('div');
    entry.textContent = `[${timestamp}] ${message}`;
    debugElement.appendChild(entry);
    debugElement.scrollTop = debugElement.scrollHeight;
    
    // Limit entries
    while (debugElement.children.length > 20) {
        debugElement.removeChild(debugElement.firstChild);
    }

    // Also log to console for additional debugging
    console.log(`[Bitcoin Price] ${message}`);
};

// Cache data in localStorage
const cacheData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
        addDebugOutput(`Data cached successfully for ${key}`);
    } catch (e) {
        addDebugOutput(`Failed to cache data for ${key}: ${e.message}`);
    }
};

// Get cached data from localStorage
const getCachedData = (key, maxAge) => {
    try {
        const cached = localStorage.getItem(key);
        if (cached) {
            const parsedCache = JSON.parse(cached);
            const cacheAge = Date.now() - parsedCache.timestamp;
            
            if (cacheAge < maxAge) {
                addDebugOutput(`Using cached ${key} (${Math.round(cacheAge / 1000)}s old)`);
                return parsedCache.data;
            } else {
                addDebugOutput(`Cache expired for ${key} (${Math.round(cacheAge / 1000)}s old)`);
            }
        } else {
            addDebugOutput(`No cache found for ${key}`);
        }
    } catch (e) {
        addDebugOutput(`Error retrieving cache for ${key}: ${e.message}`);
    }
    return null;
};

// Display the Bitcoin price from Coinbase
const displayPrice = (price) => {
    priceElement.textContent = formatCurrency(price);
    
    // Add animation
    priceElement.classList.add('price-update');
    setTimeout(() => priceElement.classList.remove('price-update'), 1000);
    
    // Update time display
    updateTimeDisplay();
    
    // Store the price
    cachedPrice = price;
    lastPriceUpdate = Date.now();
    cacheData('bitcoinPrice', price);
};

// Display supplementary data from CoinGecko
const displaySupplementaryData = (data) => {
    // Update price change
    priceChangeElement.textContent = formatPercentage(data.priceChange);
    priceChangeElement.classList.remove('positive', 'negative');
    priceChangeElement.classList.add(data.priceChange >= 0 ? 'positive' : 'negative');
    
    // Update high/low and volume
    priceHighElement.textContent = formatCurrency(data.high);
    priceLowElement.textContent = formatCurrency(data.low);
    volumeElement.textContent = formatVolume(data.volume);
    
    // Store the data
    cachedSupplementaryData = data;
    lastSupplementaryUpdate = Date.now();
    cacheData('bitcoinSupplementary', data);
};

// Fetch Bitcoin price from Coinbase API
const fetchBitcoinPrice = async () => {
    try {
        // Check cache first for very recent updates
        const cachedPrice = getCachedData('bitcoinPrice', 30000); // 30 seconds max age
        if (cachedPrice && Date.now() - lastPriceUpdate < 30000) {
            displayPrice(cachedPrice);
            return;
        }
        
        setLoadingState(priceElement, true);
        addDebugOutput('Fetching price from Coinbase API...');
        
        // Make the API call to Coinbase
        const priceUrl = `${COINBASE_API}/prices/BTC-USD/spot`;
        addDebugOutput(`Requesting: ${priceUrl}`);
        
        const response = await fetch(priceUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            addDebugOutput(`Coinbase API Error (${response.status}): ${errorText}`);
            throw new Error(`Coinbase API error: ${response.status}`);
        }
        
        const data = await response.json();
        addDebugOutput('Price data received successfully from Coinbase');
        
        if (!data.data || !data.data.amount) {
            addDebugOutput('Invalid response format from Coinbase');
            throw new Error('Invalid response format from Coinbase');
        }
        
        const price = parseFloat(data.data.amount);
        addDebugOutput(`Current BTC price: ${price}`);
        
        displayPrice(price);
        setLoadingState(priceElement, false);
        
    } catch (error) {
        addDebugOutput(`Error fetching price: ${error.message}`);
        console.error('Bitcoin price fetch error:', error);
        
        setLoadingState(priceElement, false);
        
        // If we have cached price, use it
        const cachedPrice = getCachedData('bitcoinPrice', Infinity); // No max age for fallback
        if (cachedPrice) {
            addDebugOutput('Using cached price as fallback');
            displayPrice(cachedPrice);
        } else {
            priceElement.textContent = 'Price Unavailable';
        }
        
        // Retry after a shorter delay
        setTimeout(fetchBitcoinPrice, 30000); // 30 seconds retry
    }
};

// Fetch supplementary Bitcoin data from CoinGecko
const fetchSupplementaryData = async () => {
    try {
        // Check cache first
        const cachedData = getCachedData('bitcoinSupplementary', CACHE_DURATION);
        if (cachedData && Date.now() - lastSupplementaryUpdate < CACHE_DURATION) {
            displaySupplementaryData(cachedData);
            return;
        }
        
        const elements = [priceChangeElement, priceHighElement, priceLowElement, volumeElement];
        elements.forEach(el => setLoadingState(el, true));
        
        addDebugOutput('Fetching supplementary data from CoinGecko...');
        
        // Make the API call to CoinGecko
        addDebugOutput(`Requesting: ${COINGECKO_SIMPLE_API}`);
        const response = await fetch(COINGECKO_SIMPLE_API, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            addDebugOutput(`CoinGecko API Error (${response.status}): ${errorText}`);
            throw new Error(`CoinGecko API error: ${response.status}`);
        }
        
        const data = await response.json();
        addDebugOutput('Supplementary data received successfully from CoinGecko');
        
        if (!data.bitcoin) {
            addDebugOutput('No Bitcoin data in CoinGecko response');
            throw new Error('No Bitcoin data in CoinGecko response');
        }
        
        const btcData = data.bitcoin;
        
        // Create supplementary data object
        const supplementaryData = {
            priceChange: btcData.usd_24h_change || 0,
            high: btcData.usd * 1.01, // Estimate high (1% above current)
            low: btcData.usd * 0.99,  // Estimate low (1% below current)
            volume: btcData.usd_24h_vol || 0,
            lastUpdated: btcData.last_updated_at,
            source: 'coingecko'
        };
        
        addDebugOutput(`24h Change: ${supplementaryData.priceChange.toFixed(2)}%, Volume: ${formatVolume(supplementaryData.volume)}`);
        
        displaySupplementaryData(supplementaryData);
        elements.forEach(el => setLoadingState(el, false));
        
    } catch (error) {
        addDebugOutput(`Error fetching supplementary data: ${error.message}`);
        console.error('Supplementary data fetch error:', error);
        
        const elements = [priceChangeElement, priceHighElement, priceLowElement, volumeElement];
        elements.forEach(el => setLoadingState(el, false));
        
        // If we have cached supplementary data, use it
        const cachedData = getCachedData('bitcoinSupplementary', Infinity); // No max age for fallback
        if (cachedData) {
            addDebugOutput('Using cached supplementary data as fallback');
            displaySupplementaryData(cachedData);
        } else {
            priceChangeElement.textContent = '--';
            priceHighElement.textContent = '--';
            priceLowElement.textContent = '--';
            volumeElement.textContent = '--';
        }
        
        // Retry after a delay
        setTimeout(fetchSupplementaryData, 60000); // 1 minute retry
    }
};

// Initialize updates
const initPriceUpdates = () => {
    addDebugOutput('Initializing Bitcoin price updates with Coinbase and CoinGecko');
    
    // Add styles for loading state and price updates
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            opacity: 0.5;
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
    `;
    document.head.appendChild(style);
    
    // Initial fetches
    fetchBitcoinPrice();
    fetchSupplementaryData();
    
    // Set up intervals with different frequencies
    setInterval(fetchBitcoinPrice, PRICE_UPDATE_INTERVAL);
    setInterval(fetchSupplementaryData, SUPPLEMENTARY_DATA_INTERVAL);
    
    addDebugOutput(`Price update interval: ${PRICE_UPDATE_INTERVAL/1000}s, Supplementary data interval: ${SUPPLEMENTARY_DATA_INTERVAL/1000}s`);
};

// Start updates when DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceUpdates); 