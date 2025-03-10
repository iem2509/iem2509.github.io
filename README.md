# Quote Bitcoin

A modern, responsive website that displays real-time Bitcoin prices alongside inspirational quotes about Bitcoin and cryptocurrency.

## Features

- **Real-time Bitcoin Price**: Displays current price, 24h change, high, low, and volume
- **Featured Quotes**: Rotating collection of inspirational Bitcoin quotes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatically adapts to user's system preferences
- **Resource Hub**: Links to Bitcoin learning resources, history, and more
- **Offline Support**: Caches data for offline viewing

## Technologies Used

- HTML5, CSS3, and JavaScript (ES6+)
- Responsive design with Flexbox and CSS Grid
- Multiple API integrations with fallbacks
- LocalStorage for caching and persistence

## API Providers

The site uses several API providers with fallbacks to ensure reliability:
1. CoinPaprika API
2. CoinDesk API
3. CoinGecko API

## Deployment to GitHub Pages

### Setup Instructions

1. **Fork or Clone the Repository**
   ```
   git clone https://github.com/yourusername/quotebitcoin.com.git
   cd quotebitcoin.com
   ```

2. **Configure GitHub Pages**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to the "GitHub Pages" section
   - Select the branch you want to deploy (usually `main` or `master`)
   - Click "Save"

3. **Custom Domain Setup** (Optional)
   - Add your custom domain in the GitHub Pages settings
   - Create a file named `CNAME` in the root directory with your domain name:
     ```
     quotebitcoin.com
     ```
   - Update your domain's DNS settings:
     - A record: `185.199.108.153`
     - A record: `185.199.109.153`
     - A record: `185.199.110.153`
     - A record: `185.199.111.153`
     - CNAME record: `yourusername.github.io`

4. **Verify HTTPS** (if using custom domain)
   - Check "Enforce HTTPS" in the GitHub Pages settings

### Development

To run the site locally:

```bash
# Using Python's built-in server
python -m http.server

# Or using Node.js with http-server
npx http-server
```

Then open http://localhost:8000 in your browser.

## Structure

```
quotebitcoin.com/
├── index.html           # Main HTML file
├── styles.css           # Main CSS styles
├── js/
│   ├── main.js          # Core functionality
│   ├── price-updates.js # Bitcoin price updates
│   └── quotes.js        # Quote management
├── images/              # Images and icons
└── README.md            # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All the Bitcoin and cryptocurrency pioneers quoted on the site
- The API providers for making their data available 