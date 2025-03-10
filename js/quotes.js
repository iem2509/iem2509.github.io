// Bitcoin quotes collection
const bitcoinQuotes = [
    {
        text: "Bitcoin is a remarkable cryptographic achievement and the ability to create something that is not duplicable in the digital world has enormous value.",
        author: "Eric Schmidt",
        role: "Former CEO of Google",
        year: "2014"
    },
    {
        text: "Bitcoin is a technological tour de force.",
        author: "Bill Gates",
        role: "Co-founder of Microsoft",
        year: "2013"
    },
    {
        text: "Bitcoin is the beginning of something great: a currency without a government, something necessary and imperative.",
        author: "Nassim Taleb",
        role: "Author and Statistician",
        year: "2013"
    },
    {
        text: "Bitcoin is a techno tour de force.",
        author: "Bill Gates",
        role: "Co-founder of Microsoft",
        year: "2014"
    },
    {
        text: "Bitcoin is a swarm of cyber hornets serving the goddess of wisdom, feeding on the fire of truth, exponentially growing ever smarter, faster, and stronger behind a wall of encrypted energy.",
        author: "Michael Saylor",
        role: "CEO of MicroStrategy",
        year: "2020"
    },
    {
        text: "I do think Bitcoin is the first [encrypted money] that has the potential to do something like change the world.",
        author: "Peter Thiel",
        role: "Co-founder of PayPal",
        year: "2014"
    },
    {
        text: "Bitcoin actually has the balance and incentives right, and that is why it is starting to take off.",
        author: "Julian Assange",
        role: "Founder of WikiLeaks",
        year: "2013"
    },
    {
        text: "Bitcoin will do to banks what email did to the postal industry.",
        author: "Rick Falkvinge",
        role: "Founder of the Swedish Pirate Party",
        year: "2013"
    },
    {
        text: "Bitcoin, and the ideas behind it, will be a disrupter to the traditional notions of currency. In the end, currency will be better for it.",
        author: "Edmund Moy",
        role: "38th Director of the U.S. Mint",
        year: "2014"
    },
    {
        text: "Bitcoin is a very exciting development, it might lead to a world currency. I think over the next decade it will grow to become one of the most important ways to pay for things and transfer assets.",
        author: "Kim Dotcom",
        role: "Entrepreneur",
        year: "2014"
    },
    {
        text: "At its core, bitcoin is a smart currency, designed by very forward-thinking engineers. It eliminates the need for banks, gets rid of credit card fees, currency exchange fees, money transfer fees, and reduces the need for lawyers in transitions... all good things.",
        author: "Peter Diamandis",
        role: "Founder of X Prize Foundation",
        year: "2014"
    },
    {
        text: "Bitcoin is money without a central bank, credit cards with identity theft protection built-in at the protocol level. This matters.",
        author: "Naval Ravikant",
        role: "Co-founder of AngelList",
        year: "2017"
    },
    {
        text: "Bitcoin, and cryptocurrencies in general, are a new asset class that will change the economic and geopolitical landscape—completely and permanently.",
        author: "Brian Armstrong",
        role: "CEO of Coinbase",
        year: "2018"
    },
    {
        text: "Every informed person needs to know about Bitcoin because it might be one of the world's most important developments.",
        author: "Leon Louw",
        role: "Nobel Peace Prize Nominee",
        year: "2014"
    },
    {
        text: "We see bitcoin as potentially the greatest social network of all.",
        author: "Tyler Winklevoss",
        role: "Co-founder of Gemini",
        year: "2014"
    }
];

// DOM elements
const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');
const quoteDateElement = document.getElementById('quote-date');
const refreshButton = document.querySelector('.refresh-quote');

// Local storage keys
const LAST_QUOTE_KEY = 'lastQuoteIndex';
const QUOTES_CACHE_KEY = 'bitcoinQuotes';
const LAST_REFRESH_KEY = 'lastQuoteRefresh';

// Cache quotes in localStorage
const cacheQuotes = () => {
    try {
        localStorage.setItem(QUOTES_CACHE_KEY, JSON.stringify(bitcoinQuotes));
    } catch (e) {
        console.warn('Failed to cache quotes in localStorage:', e);
    }
};

// Get cached quotes
const getCachedQuotes = () => {
    try {
        const cached = localStorage.getItem(QUOTES_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn('Failed to retrieve cached quotes:', e);
    }
    return null;
};

// Get a random quote that isn't the same as the last one
const getRandomQuote = () => {
    const quotes = getCachedQuotes() || bitcoinQuotes;
    if (!quotes || quotes.length === 0) return null;
    
    let lastIndex = -1;
    try {
        lastIndex = parseInt(localStorage.getItem(LAST_QUOTE_KEY)) || -1;
    } catch (e) {
        console.warn('Failed to retrieve last quote index:', e);
    }
    
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === lastIndex && quotes.length > 1);
    
    try {
        localStorage.setItem(LAST_QUOTE_KEY, newIndex.toString());
        localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
    } catch (e) {
        console.warn('Failed to store quote index:', e);
    }
    
    return quotes[newIndex];
};

// Display a quote
const displayQuote = (quote) => {
    if (!quote) return;
    
    quoteTextElement.textContent = quote.text;
    quoteAuthorElement.textContent = quote.author;
    
    if (quote.role && quote.year) {
        quoteDateElement.textContent = `${quote.role}, ${quote.year}`;
    } else if (quote.year) {
        quoteDateElement.textContent = quote.year;
    } else if (quote.role) {
        quoteDateElement.textContent = quote.role;
    } else {
        quoteDateElement.textContent = '';
    }
    
    // Add fade-in animation
    quoteTextElement.classList.add('fade-in');
    setTimeout(() => quoteTextElement.classList.remove('fade-in'), 1000);
};

// Refresh quote
const refreshQuote = () => {
    const quote = getRandomQuote();
    displayQuote(quote);
};

// Initialize quotes
const initQuotes = () => {
    // Add fade-in animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
            animation: fadeIn 0.5s ease forwards;
        }
    `;
    document.head.appendChild(style);
    
    // Cache quotes for future use
    cacheQuotes();
    
    // Add click event for refresh button
    refreshButton.addEventListener('click', refreshQuote);
    
    // Display initial quote
    refreshQuote();
    
    // Auto-refresh quotes once per day if the page stays open
    setInterval(() => {
        try {
            const lastRefresh = parseInt(localStorage.getItem(LAST_REFRESH_KEY)) || 0;
            const now = Date.now();
            if (now - lastRefresh > 24 * 60 * 60 * 1000) { // 24 hours
                refreshQuote();
            }
        } catch (e) {
            console.warn('Error in auto-refresh check:', e);
        }
    }, 60 * 60 * 1000); // Check every hour
};

// Start quotes when DOM is loaded
document.addEventListener('DOMContentLoaded', initQuotes); 