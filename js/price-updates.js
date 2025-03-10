// Constants for API endpoints - using CoinGecko's public API
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const PRICE_UPDATE_INTERVAL = 300000; // 5 minutes (to stay within rate limits)
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

    // Also log to console for additional debugging
    console.log(`[Bitcoin Price] ${message}`);
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
    
    // Update high/low and volume
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

// Fetch Bitcoin data from CoinGecko public API
const fetchBitcoinData = async () => {
    try {
        // Check cache first
        const cached = getCachedData();
        if (cached && Date.now() - lastUpdated < CACHE_DURATION) {
            displayBitcoinData(cached);
            return;
        }
        
        setLoadingState(true);
        addDebugOutput('Fetching data from CoinGecko Public API...');
        
        // Fetch Bitcoin market data - using the recommended endpoint from docs
        const marketDataUrl = `${COINGECKO_API}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        
        addDebugOutput(`Requesting: ${marketDataUrl}`);
        const response = await fetch(marketDataUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            addDebugOutput(`API Error (${response.status}): ${errorText}`);
            throw new Error(`CoinGecko API error: ${response.status}`);
        }
        
        const data = await response.json();
        addDebugOutput('Data received successfully');
        
        // Extract the relevant data from the response
        const marketData = data.market_data;
        
        const bitcoinData = {
            price: marketData.current_price.usd,
            priceChange: marketData.price_change_percentage_24h,
            high: marketData.high_24h.usd,
            low: marketData.low_24h.usd,
            volume: marketData.total_volume.usd,
            source: 'coingecko'
        };
        
        addDebugOutput(`Price: ${bitcoinData.price}, Change: ${bitcoinData.priceChange.toFixed(2)}%`);
        
        displayBitcoinData(bitcoinData);
        setLoadingState(false);
        
    } catch (error) {
        addDebugOutput(`Error fetching data: ${error.message}`);
        console.error('Bitcoin data fetch error:', error);
        
        // Try simple price endpoint as fallback
        try {
            addDebugOutput('Trying simple price endpoint as fallback...');
            const simplePriceUrl = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
            
            addDebugOutput(`Requesting: ${simplePriceUrl}`);
            const simpleResponse = await fetch(simplePriceUrl);
            
            if (!simpleResponse.ok) {
                throw new Error(`Simple API error: ${simpleResponse.status}`);
            }
            
            const simpleData = await simpleResponse.json();
            const btcData = simpleData.bitcoin;
            
            // Create a data object from the simple API (less comprehensive but should work)
            const fallbackData = {
                price: btcData.usd,
                priceChange: btcData.usd_24h_change,
                high: btcData.usd * 1.01, // Estimate
                low: btcData.usd * 0.99,  // Estimate
                volume: btcData.usd_24h_vol,
                source: 'coingecko-simple'
            };
            
            addDebugOutput(`Fallback data retrieved. Price: ${fallbackData.price}`);
            displayBitcoinData(fallbackData);
            setLoadingState(false);
            return;
            
        } catch (fallbackError) {
            addDebugOutput(`Fallback also failed: ${fallbackError.message}`);
        }
        
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
        addDebugOutput('Will retry in 60 seconds...');
        setTimeout(fetchBitcoinData, 60000); // 1 minute retry
    }
};

// Initialize updates
const initPriceUpdates = () => {
    addDebugOutput('Initializing Bitcoin price updates with CoinGecko API');
    
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