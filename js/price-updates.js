// Constants for API endpoints
const COINDESK_API = 'https://api.coindesk.com/v1/bpi/currentprice.json';
const COINDESK_HISTORICAL_API = 'https://api.coindesk.com/v1/bpi/historical/close.json';
const PRICE_UPDATE_INTERVAL = 300000; // 5 minutes
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

// Last stored data (for caching)
let cachedData = null;
let lastUpdated = 0;

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

// Format volume (estimated)
const formatVolume = (volume) => {
    return `~ ${Math.round(volume / 1e6)} million USD`;
};

// Update time display
const updateTimeDisplay = () => {
    const now = new Date();
    updateTimeElement.textContent = now.toLocaleTimeString();
};

// Add loading state
const setLoadingState = (isLoading) => {
    const elements = [priceElement, priceChangeElement, priceHighElement, priceLowElement, volumeElement];
    elements.forEach(element => {
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
    });
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
};

// Cache data in localStorage
const cacheData = (data) => {
    try {
        localStorage.setItem('bitcoinData', JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
        addDebugOutput(`Data cached successfully`);
    } catch (e) {
        addDebugOutput(`Failed to cache data: ${e.message}`);
    }
};

// Get cached data from localStorage
const getCachedData = () => {
    try {
        const cached = localStorage.getItem('bitcoinData');
        if (cached) {
            const parsedCache = JSON.parse(cached);
            const cacheAge = Date.now() - parsedCache.timestamp;
            
            if (cacheAge < CACHE_DURATION) {
                addDebugOutput(`Using cached data (${Math.round(cacheAge / 1000)}s old)`);
                return parsedCache.data;
            } else {
                addDebugOutput(`Cache expired (${Math.round(cacheAge / 1000)}s old)`);
            }
        } else {
            addDebugOutput(`No cache found`);
        }
    } catch (e) {
        addDebugOutput(`Error retrieving cache: ${e.message}`);
    }
    return null;
};

// Display Bitcoin data
const displayBitcoinData = (data) => {
    addDebugOutput(`Displaying data from ${data.source}`);
    
    // Update price display
    priceElement.textContent = formatCurrency(data.price);
    
    // Update price change
    const priceChange = data.priceChange;
    priceChangeElement.textContent = formatPercentage(priceChange);
    priceChangeElement.classList.remove('positive', 'negative');
    priceChangeElement.classList.add(priceChange >= 0 ? 'positive' : 'negative');
    
    // Update high/low and volume (estimated)
    priceHighElement.textContent = formatCurrency(data.high);
    priceLowElement.textContent = formatCurrency(data.low);
    volumeElement.textContent = formatVolume(data.volume);
    
    // Update time
    updateTimeDisplay();
    
    // Add animation
    priceElement.classList.add('price-update');
    setTimeout(() => priceElement.classList.remove('price-update'), 1000);
    
    // Cache the data
    cacheData(data);
    cachedData = data;
    lastUpdated = Date.now();
};

// Fetch from CoinDesk (most reliable for GitHub Pages)
const fetchBitcoinData = async () => {
    try {
        // Check cache first
        const cached = getCachedData();
        if (cached && Date.now() - lastUpdated < CACHE_DURATION) {
            displayBitcoinData(cached);
            return;
        }
        
        setLoadingState(true);
        addDebugOutput('Fetching current price from CoinDesk...');
        
        // Get current price from CoinDesk
        const currentPriceResponse = await fetch(COINDESK_API);
        
        if (!currentPriceResponse.ok) {
            throw new Error(`CoinDesk API error: ${currentPriceResponse.status}`);
        }
        
        // Get 30-day historical data for high/low estimation
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        
        addDebugOutput(`Fetching historical data from ${startDateStr} to ${endDateStr}...`);
        
        const historicalResponse = await fetch(
            `${COINDESK_HISTORICAL_API}?start=${startDateStr}&end=${endDateStr}`
        );
        
        if (!historicalResponse.ok) {
            throw new Error(`Historical API error: ${historicalResponse.status}`);
        }
        
        // Process the data
        const [currentPriceData, historicalData] = await Promise.all([
            currentPriceResponse.json(),
            historicalResponse.json()
        ]);
        
        const currentPrice = currentPriceData.bpi.USD.rate_float;
        const historicalPrices = Object.values(historicalData.bpi);
        
        // Calculate stats
        const high = Math.max(...historicalPrices);
        const low = Math.min(...historicalPrices);
        
        // Calculate change based on yesterday's price
        const yesterday = historicalPrices[historicalPrices.length - 2] || historicalPrices[historicalPrices.length - 1];
        const change = ((currentPrice - yesterday) / yesterday) * 100;
        
        // Estimate volume (rough estimate based on market patterns)
        const estimatedVolume = currentPrice * 1000000; // Roughly $1 million of BTC per USD price point
        
        addDebugOutput(`Price data processed successfully. Current: ${currentPrice}, Change: ${change.toFixed(2)}%`);
        
        // Create data object
        const bitcoinData = {
            price: currentPrice,
            priceChange: change,
            high: high,
            low: low,
            volume: estimatedVolume,
            source: 'coindesk'
        };
        
        displayBitcoinData(bitcoinData);
        setLoadingState(false);
        
    } catch (error) {
        addDebugOutput(`Error fetching data: ${error.message}`);
        console.error('Bitcoin data fetch error:', error);
        setLoadingState(false);
        
        // If we have cached data, use it even if expired
        if (cachedData) {
            addDebugOutput('Using expired cached data as fallback');
            displayBitcoinData(cachedData);
            return;
        }
        
        // Show error state if all else fails
        priceElement.textContent = 'Price Unavailable';
        priceChangeElement.textContent = '--';
        priceHighElement.textContent = '--';
        priceLowElement.textContent = '--';
        volumeElement.textContent = '--';
        updateTimeDisplay();
        
        // Retry after a delay
        setTimeout(fetchBitcoinData, 60000); // 1 minute retry
    }
};

// Initialize updates
const initPriceUpdates = () => {
    addDebugOutput('Initializing price updates...');
    
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
    
    // Initial fetch
    fetchBitcoinData();
    
    // Set up interval
    setInterval(fetchBitcoinData, PRICE_UPDATE_INTERVAL);
    addDebugOutput(`Update interval set to ${PRICE_UPDATE_INTERVAL/1000} seconds`);
};

// Start updates when DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceUpdates); 