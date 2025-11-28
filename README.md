# Mikud - Israeli Zip Code Search Chrome Extension

A Chrome extension that allows users to search for Israeli zip codes (מיקוד) directly from their browser using the Israeli Post Office API.

## Features

- 🔍 Quick zip code search interface
- 📝 Search history with toggle option
- ✅ Input validation for cities and streets
- 🎨 Modern, user-friendly Hebrew RTL interface
- ⚙️ Customizable settings

## Installation

### Development Mode

1. **Download or clone this repository** to your computer
   ```bash
   git clone <repository-url>
   cd chrome-addon-mikud
   ```

2. **Open Chrome Extensions page**
   - Open Google Chrome browser
   - Navigate to `chrome://extensions/`
   - Or go to: Menu (☰) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click the "Load unpacked" button
   - Navigate to and select the `chrome-addon-mikud` folder
   - Click "Select Folder"

5. **Verify installation**
   - You should see "Mikud - Israeli Zip Code Search" in your extensions list
   - The extension icon should appear in your Chrome toolbar

### Requirements

- Chrome browser (Manifest V3 compatible - Chrome 88+)
- Internet connection (for API calls to Israeli Post Office)

## How to Use

### Basic Search

1. **Open the extension**
   - Click the Mikud icon in your Chrome toolbar
   - The popup window will open

2. **Enter address information**
   - **עיר (City)**: Enter the city name (required)
   - **רחוב (Street)**: Enter the street name (required)
   - **מספר בית (House Number)**: Enter the house/building number (required)
   - **כניסה (Entrance)**: Enter entrance number if applicable (optional)

3. **Search for zip code**
   - Click the "חפש מיקוד" (Search Zip Code) button
   - Wait for the results to appear
   - The zip code will be displayed below the search form

### Viewing Search History

- **Recent searches** are automatically saved (if enabled)
- Click on any item in the history to quickly reuse that search
- Use the "נקה היסטוריה" (Clear History) button to remove all saved searches

### Settings

1. **Open settings**
   - Click "הגדרות" (Settings) link at the bottom of the popup
   - Or right-click the extension icon → Options

2. **Configure options**
   - **Enable/Disable History**: Toggle search history on or off
   - **Max History Items**: Set how many searches to keep (10-200)

### Troubleshooting

**Extension not loading?**
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check that Developer Mode is enabled
- Look for error messages in the Extensions page

**Search not working?**
- Check your internet connection
- Open the browser console (F12) to see error messages
- Verify that all required fields are filled (City, Street, House Number)

**Can't see the extension icon?**
- Click the puzzle piece icon (🧩) in Chrome toolbar
- Pin the Mikud extension to your toolbar

### Console Logging

For debugging and observing API calls:
1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Go to the Console tab
3. Perform a search
4. You'll see detailed logs showing:
   - API request URL and parameters
   - API response status and headers
   - Raw response payload
   - Parsed zip code results

## Project Structure

```
chrome-addon-mikud/
├── manifest.json          # Extension manifest
├── popup.html             # Main popup interface
├── popup.js               # Popup logic
├── popup.css              # Popup styling
├── background.js           # Background service worker
├── options.html           # Settings page
├── options.js             # Settings logic
├── utils/                 # Utility functions
│   ├── api.js            # API integration
│   ├── validation.js     # Input validation
│   └── storage.js        # Storage management
├── icons/                 # Extension icons
└── tests/                 # Test scripts
```

## Development Status

This project is **production ready** and fully functional.

### Current Features ✅
- ✅ Complete UI with Hebrew RTL support
- ✅ API integration with Israeli Post Office
- ✅ Input validation
- ✅ Search history with toggle
- ✅ Settings page
- ✅ Error handling and logging
- ✅ Debug mode with test connection button
- ✅ Log export functionality

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy Policy

This extension respects your privacy. All data is stored locally on your device. For detailed information about data collection and usage, please see our [Privacy Policy](PRIVACY_POLICY.md).

The privacy policy is also available online at: `https://USERNAME.github.io/chrome-addon-mikud/privacy-policy.html` (replace USERNAME with your GitHub username after enabling GitHub Pages).

### Setting Up GitHub Pages for Privacy Policy

To host the privacy policy on GitHub Pages:

1. **Enable GitHub Pages** in your repository settings:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select "Deploy from a branch"
   - Choose branch: **main** (or **master**)
   - Choose folder: **/docs**
   - Click **Save**

2. **Update the privacy policy URL** in `manifest.json`:
   - Replace `USERNAME` in the privacy_policy URL with your actual GitHub username
   - The URL format is: `https://YOUR_USERNAME.github.io/chrome-addon-mikud/privacy-policy.html`

3. **Verify the privacy policy is accessible**:
   - After enabling GitHub Pages, wait a few minutes for it to deploy
   - Visit the URL to confirm it's working
   - This URL is required for Chrome Web Store submission

## Notes

- Hebrew RTL (right-to-left) support is implemented throughout the interface
- The extension uses the official Israeli Post Office API endpoint
- All data is stored locally on your device

