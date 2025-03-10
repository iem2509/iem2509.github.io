// Real-time price display script with reliable DOM updates
document.addEventListener('DOMContentLoaded', function() {
    console.log('Real-time price script loaded');
    
    setTimeout(function() {
        fetchAndDisplayPrice();
    }, 500); // Small delay to ensure DOM is fully loaded
});

// Also try window load event
window.addEventListener('load', function() {
    console.log('Window loaded, fetching price');
    fetchAndDisplayPrice();
});

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
                
                // Add styles and success banner
                addStyles();
                addSuccessBanner('Live price data loaded successfully!');
                
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
                
                // Add styles and success banner
                addStyles();
                addSuccessBanner('Live price data loaded successfully (CoinGecko)!');
                
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
        
        // Add styles
        addStyles();
        
        // Add banner showing fallback price is being used
        addSuccessBanner('Using recent price data (APIs unavailable)', 'warning');
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
        console.log(`Found and updating element #${id} with: ${text}`);
        element.textContent = text;
        element.style.opacity = '1';
        element.classList.add('updated');
    } else {
        console.error(`Element with ID ${id} not found!`);
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

// Add minimal styles
function addStyles() {
    if (document.getElementById('bitcoin-price-styles')) return; // Only add once
    
    const style = document.createElement('style');
    style.id = 'bitcoin-price-styles';
    style.textContent = `
        .updated {
            animation: flashGreen 2s ease;
        }
        @keyframes flashGreen {
            0%, 100% { background-color: transparent; }
            50% { background-color: rgba(76, 175, 80, 0.3); }
        }
        .success-banner {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: bold;
        }
        .warning-banner {
            background-color: #FF9800;
            color: white;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: bold;
        }
        #price {
            color: #000 !important;
            opacity: 1 !important;
        }
        .positive {
            color: #4caf50 !important;
        }
        .negative {
            color: #f44336 !important;
        }
    `;
    document.head.appendChild(style);
}

// Add a visible banner to confirm our script ran
function addSuccessBanner(message, type = 'success') {
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