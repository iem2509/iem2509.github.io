// Constants for API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const API_KEY = 'CG-GjbMF5QQTbK2kvV2XkL1ZR5t';
const PRICE_UPDATE_INTERVAL = 30000; // 30 seconds

// DOM elements
const priceElement = document.getElementById('price');
const priceChangeElement = document.getElementById('price-change');
const priceHighElement = document.getElementById('price-high');
const priceLowElement = document.getElementById('price-low');
const volumeElement = document.getElementById('volume');
const updateTimeElement = document.getElementById('update-time');

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

// Fetch Bitcoin data
const fetchBitcoinData = async () => {
    try {
        setLoadingState(true);
        
        const response = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`,
            {
                headers: {
                    'x-cg-pro-api-key': API_KEY
                }
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch market data');
        }
        
        const [btcData] = await response.json();
        
        if (!btcData) {
            throw new Error('No data received from API');
        }
        
        // Update price display
        priceElement.textContent = formatCurrency(btcData.current_price);
        
        // Update price change
        const priceChange = btcData.price_change_percentage_24h;
        priceChangeElement.textContent = formatPercentage(priceChange);
        priceChangeElement.classList.remove('positive', 'negative');
        priceChangeElement.classList.add(priceChange >= 0 ? 'positive' : 'negative');
        
        // Update high/low and volume
        priceHighElement.textContent = formatCurrency(btcData.high_24h);
        priceLowElement.textContent = formatCurrency(btcData.low_24h);
        volumeElement.textContent = formatVolume(btcData.total_volume);
        
        // Update time
        updateTimeDisplay();
        
        // Add animation
        priceElement.classList.add('price-update');
        setTimeout(() => priceElement.classList.remove('price-update'), 1000);
        
        setLoadingState(false);
    } catch (error) {
        console.error('Error fetching Bitcoin data:', error);
        setLoadingState(false);
        
        // Show error state
        priceElement.textContent = 'Price Unavailable';
        priceChangeElement.textContent = '--';
        priceHighElement.textContent = '--';
        priceLowElement.textContent = '--';
        volumeElement.textContent = '--';
        
        // Retry after a delay if there's an error
        setTimeout(fetchBitcoinData, 5000);
    }
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