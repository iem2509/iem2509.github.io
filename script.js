// Function to fetch Bitcoin price from CoinGecko API
async function fetchBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        const price = data.bitcoin.usd;
        const change = data.bitcoin.usd_24h_change.toFixed(2);
        updatePrice(price, change);
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
    }
}

// Function to update the price and percentage change on the page
function updatePrice(price, change) {
    const priceElement = document.getElementById('price');
    const changeElement = document.getElementById('price-change');
    priceElement.textContent = `$${price.toLocaleString()}`;
    changeElement.textContent = `${change > 0 ? '+' : ''}${change}%`;
    changeElement.style.color = change >= 0 ? '#4CAF50' : '#F44336'; // Green for positive, red for negative
}

// Fetch the price on page load
fetchBitcoinPrice();

// Set interval to fetch price every minute
setInterval(fetchBitcoinPrice, 60000);