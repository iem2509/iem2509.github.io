// Constants for API endpoints
const COINBASE_API = 'https://api.coinbase.com/v2';
const PRICE_UPDATE_INTERVAL = 30000; // 30 seconds

// DOM elements
const priceElement = document.getElementById('price');
const priceChangeElement = document.getElementById('price-change');
const priceHighElement = document.getElementById('price-high');
const priceLowElement = document.getElementById('price-low');
const volumeElement = document.getElementById('volume');
const updateTimeElement = document.getElementById('update-time');

// Price state
let lastPrice = null;

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

// Update time display
const updateTimeDisplay = () => {
    const now = new Date();
    updateTimeElement.textContent = now.toLocaleTimeString();
};

// Fetch current Bitcoin price
const fetchBitcoinPrice = async () => {
    try {
        const response = await fetch(`${COINBASE_API}/prices/BTC-USD/spot`);
        if (!response.ok) throw new Error('Failed to fetch price');
        
        const data = await response.json();
        const currentPrice = parseFloat(data.data.amount);
        
        // Update price display
        priceElement.textContent = formatCurrency(currentPrice);
        
        // Calculate and display price change
        if (lastPrice !== null) {
            const priceChange = ((currentPrice - lastPrice) / lastPrice) * 100;
            const changeText = formatPercentage(priceChange);
            priceChangeElement.textContent = changeText;
            priceChangeElement.classList.remove('positive', 'negative');
            priceChangeElement.classList.add(priceChange >= 0 ? 'positive' : 'negative');
        }
        
        lastPrice = currentPrice;
        updateTimeDisplay();
        
        // Add animation class
        priceElement.classList.add('price-update');
        setTimeout(() => priceElement.classList.remove('price-update'), 1000);
        
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        priceElement.textContent = 'Price Unavailable';
    }
};

// Fetch 24h stats
const fetch24hStats = async () => {
    try {
        const response = await fetch(`${COINBASE_API}/products/BTC-USD/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        
        // Update stats display
        priceHighElement.textContent = formatCurrency(parseFloat(data.high));
        priceLowElement.textContent = formatCurrency(parseFloat(data.low));
        volumeElement.textContent = parseFloat(data.volume).toFixed(2) + ' BTC';
        
    } catch (error) {
        console.error('Error fetching 24h stats:', error);
        [priceHighElement, priceLowElement, volumeElement].forEach(el => {
            el.textContent = 'Unavailable';
        });
    }
};

// Initialize price updates
const initPriceUpdates = () => {
    // Initial fetch
    fetchBitcoinPrice();
    fetch24hStats();
    
    // Set up intervals
    setInterval(fetchBitcoinPrice, PRICE_UPDATE_INTERVAL);
    setInterval(fetch24hStats, PRICE_UPDATE_INTERVAL * 2);
};

// Start updates when DOM is loaded
document.addEventListener('DOMContentLoaded', initPriceUpdates); 