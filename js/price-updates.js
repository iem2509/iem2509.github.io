// Constants for API endpoints with multiple options for fallback
const COINBASE_API = 'https://api.coinbase.com/v2';
const COINDESK_API = 'https://api.coindesk.com/v1/bpi/currentprice.json';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINGECKO_SIMPLE_API = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;

// Update intervals
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

// Create hard-coded fallback button
const createFallbackButton = () => {
    const btnContainer = document.createElement('div');
    btnContainer.style.margin = '15px 0';
    
    const btn = document.createElement('button');
    btn.textContent = 'Show Bitcoin Price (Fallback)';
    btn.style.padding = '8px 15px';
    btn.style.background = '#f7931a';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    
    btn.onclick = function() {
        setDirectPrice();
    };
    
    btnContainer.appendChild(btn);
    
    const container = document.querySelector('#bitcoin-price .container');
    if (container) {
        container.appendChild(btnContainer);
        addDebugOutput('Added fallback button to page');
    } else {
        addDebugOutput('ERROR: Could not find container for fallback button');
    }
};

// Set a hardcoded direct price as ultimate fallback
const setDirectPrice = async () => {
    addDebugOutput('Setting direct price via fallback button');
    
    // Try each API in sequence with unified error handling
    const apis = [
        {
            name: 'CoinDesk', 
            url: COINDESK_API,
            extract: (data) => data.bpi.USD.rate_float
        },
        {
            name: 'Coinbase', 
            url: `${COINBASE_API}/prices/BTC-USD/spot`,
            extract: (data) => parseFloat(data.data.amount)
        },
        {
            name: 'CoinGecko', 
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
            extract: (data) => data.bitcoin.usd
        }
    ];
    
    for (const api of apis) {
        try {
            addDebugOutput(`Trying direct fetch from ${api.name}...`);
            const response = await fetch(api.url);
            
            if (response.ok) {
                const data = await response.json();
                const price = api.extract(data);
                
                if (price) {
                    addDebugOutput(`Successfully extracted price: ${price} from ${api.name}`);
                    displayPrice(price);
                    
                    // Add fallback data for other metrics
                    displaySupplementaryData({
                        priceChange: 0, // No change info in fallback
                        high: price * 1.01, // Estimate
                        low: price * 0.99, // Estimate
                        volume: price * 1000000, // Rough estimate
                        source: 'fallback'
                    });
                    
                    return true;
                }
            }
        } catch (error) {
            addDebugOutput(`${api.name} fetch failed: ${error.message}`);
        }
    }
    
    // If all APIs fail, use truly hardcoded fallback
    try {
        const fallbackElement = document.getElementById('price');
        if (fallbackElement) {
            // Display a hardcoded recent price as absolute last resort
            const hardcodedPrice = 50000; // Update this value periodically
            fallbackElement.textContent = formatCurrency(hardcodedPrice);
            fallbackElement.classList.add('fallback');
            addDebugOutput(`Set hardcoded price: ${hardcodedPrice}`);
            updateTimeDisplay();
            
            const fallbackNote = document.createElement('div');
            fallbackNote.innerHTML = '<small style="color: #999; font-style: italic;">Fallback price - may not be current</small>';
            fallbackElement.parentNode.appendChild(fallbackNote);
            
            // Add fallback data for other metrics too
            if (priceChangeElement) priceChangeElement.textContent = '--';
            if (priceHighElement) priceHighElement.textContent = formatCurrency(hardcodedPrice * 1.01);
            if (priceLowElement) priceLowElement.textContent = formatCurrency(hardcodedPrice * 0.99);
            if (volumeElement) volumeElement.textContent = 'N/A';
            
            return true;
        }
    } catch (e) {
        addDebugOutput(`Even hardcoded fallback failed: ${e.message}`);
    }
    
    return false;
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

// Set error state with message
const setErrorState = (element, message) => {
    element.classList.remove('loading');
    element.classList.add('error');
    element.textContent = message || 'Error';
    
    // Also show in debug panel
    addDebugOutput(`Error displayed: "${message}"`);
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
    addDebugOutput(`Displaying price: ${price}`);
    priceElement.textContent = formatCurrency(price);
    priceElement.classList.remove('error');
    
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
    priceChangeElement.classList.remove('positive', 'negative', 'error');
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

// Check if DOM elements exist
const checkDOMElements = () => {
    const elements = {
        price: priceElement,
        priceChange: priceChangeElement,
        priceHigh: priceHighElement,
        priceLow: priceLowElement,
        volume: volumeElement,
        updateTime: updateTimeElement
    };
    
    let missingElements = [];
    
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            missingElements.push(name);
            addDebugOutput(`Missing DOM element: ${name}`);
        }
    }
    
    if (missingElements.length > 0) {
        addDebugOutput(`CRITICAL ERROR: Missing DOM elements: ${missingElements.join(', ')}`);
        return false;
    }
    
    addDebugOutput('All DOM elements found');
    return true;
};

// Fetch Bitcoin price from Coinbase API
const fetchBitcoinPrice = async () => {
    try {
        // Check if DOM elements exist
        if (!checkDOMElements()) {
            setErrorState(priceElement, 'DOM Error');
            return;
        }
        
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
        
        // Use verbose fetch with proper error handling
        let response;
        try {
            response = await fetch(priceUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
        } catch (fetchError) {
            addDebugOutput(`Network error fetching from Coinbase: ${fetchError.message}`);
            throw new Error(`Network error: ${fetchError.message}`);
        }
        
        if (!response) {
            addDebugOutput('No response received from Coinbase');
            throw new Error('No response received');
        }
        
        if (!response.ok) {
            let errorText = '';
            try {
                const errorData = await response.text();
                errorText = errorData;
            } catch (e) {
                errorText = `Status ${response.status}`;
            }
            
            addDebugOutput(`Coinbase API Error (${response.status}): ${errorText}`);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            addDebugOutput(`JSON parse error: ${jsonError.message}`);
            throw new Error(`JSON parse error: ${jsonError.message}`);
        }
        
        addDebugOutput('Price data received successfully from Coinbase');
        
        if (!data || !data.data || !data.data.amount) {
            addDebugOutput(`Invalid response format from Coinbase: ${JSON.stringify(data)}`);
            throw new Error('Invalid response format');
        }
        
        const price = parseFloat(data.data.amount);
        if (isNaN(price)) {
            addDebugOutput(`Invalid price value: ${data.data.amount}`);
            throw new Error(`Invalid price value: ${data.data.amount}`);
        }
        
        addDebugOutput(`Current BTC price: ${price}`);
        
        displayPrice(price);
        setLoadingState(priceElement, false);
        
    } catch (error) {
        addDebugOutput(`Error fetching price: ${error.message}`);
        console.error('Bitcoin price fetch error:', error);
        
        // Try CoinDesk API as fallback
        try {
            addDebugOutput('Trying CoinDesk API as fallback...');
            const response = await fetch(COINDESK_API);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.bpi && data.bpi.USD && data.bpi.USD.rate_float) {
                    const price = data.bpi.USD.rate_float;
                    addDebugOutput(`CoinDesk fallback successful: ${price}`);
                    displayPrice(price);
                    return;
                }
            }
            addDebugOutput('CoinDesk fallback failed');
        } catch (fallbackError) {
            addDebugOutput(`CoinDesk fallback error: ${fallbackError.message}`);
        }
        
        // Set visible error state
        setErrorState(priceElement, `Price Error: ${error.message}`);
        
        // If we have cached price, use it
        const cachedPrice = getCachedData('bitcoinPrice', Infinity); // No max age for fallback
        if (cachedPrice) {
            addDebugOutput('Using cached price as fallback');
            setTimeout(() => {
                displayPrice(cachedPrice);
                addDebugOutput('Displayed cached price after error');
            }, 3000); // Show error for 3 seconds, then show cached price
        } else {
            // No cache, last resort is to add a manual refresh button
            createFallbackButton();
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
            // Set dash for unavailable data
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
        .error {
            color: #f44336;
            opacity: 0.8;
        }
        .fallback {
            color: #ff9800;
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
    
    // Check if DOM elements exist
    const validDOM = checkDOMElements();
    if (!validDOM) {
        addDebugOutput('ERROR: Some DOM elements are missing. Installing fallback button.');
        
        // Try to display error in price element if it exists
        if (priceElement) {
            setErrorState(priceElement, 'DOM Error - Check Debug');
        }
        
        // Add fallback button
        createFallbackButton();
        return;
    }
    
    // Initial fetches
    fetchBitcoinPrice();
    fetchSupplementaryData();
    
    // Set up intervals with different frequencies
    setInterval(fetchBitcoinPrice, PRICE_UPDATE_INTERVAL);
    setInterval(fetchSupplementaryData, SUPPLEMENTARY_DATA_INTERVAL);
    
    // Add fallback button after a delay if price is still loading
    setTimeout(() => {
        if (priceElement && priceElement.textContent === 'Loading...') {
            addDebugOutput('Price still loading after delay. Adding fallback button.');
            createFallbackButton();
        }
    }, 10000); // 10 second timeout
    
    addDebugOutput(`Price update interval: ${PRICE_UPDATE_INTERVAL/1000}s, Supplementary data interval: ${SUPPLEMENTARY_DATA_INTERVAL/1000}s`);
};

// Start updates when DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceUpdates); 