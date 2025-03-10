// Constants for API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINDESK_API = 'https://api.coindesk.com/v1/bpi/currentprice.json';
const COINPAPRIKA_API = 'https://api.coinpaprika.com/v1';
const PRICE_UPDATE_INTERVAL = 300000; // 5 minutes
const CACHE_DURATION = 290000; // 4m 50s cache duration (slightly less than update interval)

// DOM elements
const priceElement = document.getElementById('price');
const priceChangeElement = document.getElementById('price-change');
const priceHighElement = document.getElementById('price-high');
const priceLowElement = document.getElementById('price-low');
const volumeElement = document.getElementById('volume');
const updateTimeElement = document.getElementById('update-time');

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

// Cache data in localStorage
const cacheData = (data) => {
    try {
        localStorage.setItem('bitcoinData', JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Failed to cache data in localStorage:', e);
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
                return parsedCache.data;
            }
        }
    } catch (e) {
        console.warn('Failed to retrieve cached data:', e);
    }
    return null;
};

// Display Bitcoin data
const displayBitcoinData = (data) => {
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

// Fetch from multiple sources with fallbacks
const fetchBitcoinData = async () => {
    try {
        // Check cache first
        const cached = getCachedData();
        if (cached && Date.now() - lastUpdated < CACHE_DURATION) {
            displayBitcoinData(cached);
            return;
        }
        
        setLoadingState(true);
        
        // Try Coinpaprika first (most comprehensive data)
        try {
            // Get current price and ticker
            const [priceResponse, tickerResponse] = await Promise.all([
                fetch(`${COINPAPRIKA_API}/coins/btc-bitcoin`),
                fetch(`${COINPAPRIKA_API}/tickers/btc-bitcoin`)
            ]);
            
            if (priceResponse.ok && tickerResponse.ok) {
                const [priceData, tickerData] = await Promise.all([
                    priceResponse.json(),
                    tickerResponse.json()
                ]);
                
                const data = {
                    price: tickerData.quotes.USD.price,
                    priceChange: tickerData.quotes.USD.percent_change_24h,
                    high: tickerData.quotes.USD.ath_price,
                    low: tickerData.quotes.USD.price - (tickerData.quotes.USD.price * Math.abs(tickerData.quotes.USD.percent_change_24h) / 200), // Estimate based on percent change
                    volume: tickerData.quotes.USD.volume_24h,
                    source: 'coinpaprika'
                };
                
                displayBitcoinData(data);
                setLoadingState(false);
                return;
            }
        } catch (error) {
            console.warn('Failed to fetch from Coinpaprika, trying fallback:', error);
        }
        
        // Fallback to CoinDesk (very reliable, basic data)
        try {
            const response = await fetch(COINDESK_API);
            
            if (response.ok) {
                const data = await response.json();
                
                // CoinDesk doesn't provide all data, so we'll use estimates
                const currentPrice = data.bpi.USD.rate_float;
                const estimatedChange = 0; // We don't have this from CoinDesk
                
                const bitcoinData = {
                    price: currentPrice,
                    priceChange: estimatedChange,
                    high: currentPrice * 1.01, // Approximate
                    low: currentPrice * 0.99, // Approximate
                    volume: 0, // Not available
                    source: 'coindesk'
                };
                
                displayBitcoinData(bitcoinData);
                setLoadingState(false);
                
                // Try to get more complete data from CoinGecko in the background
                fetchFromCoinGecko().catch(() => {});
                return;
            }
        } catch (error) {
            console.warn('Failed to fetch from CoinDesk, trying final fallback:', error);
        }
        
        // Final fallback to CoinGecko
        await fetchFromCoinGecko();
        
    } catch (error) {
        console.error('All API attempts failed:', error);
        setLoadingState(false);
        
        // If we have cached data, use it even if expired
        if (cachedData) {
            console.log('Using expired cached data as fallback');
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

// Fetch from CoinGecko
const fetchFromCoinGecko = async () => {
    const response = await fetch(
        `${COINGECKO_API}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
        throw new Error('CoinGecko API failed');
    }
    
    const data = await response.json();
    const marketData = data.market_data;
    
    const bitcoinData = {
        price: marketData.current_price.usd,
        priceChange: marketData.price_change_percentage_24h,
        high: marketData.high_24h.usd,
        low: marketData.low_24h.usd,
        volume: marketData.total_volume.usd,
        source: 'coingecko'
    };
    
    displayBitcoinData(bitcoinData);
    setLoadingState(false);
    return bitcoinData;
};

// Initialize updates
const initPriceUpdates = () => {
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
};

// Start updates when DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceUpdates); 