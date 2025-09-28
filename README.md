# Instagram Reel Farmer Chrome Extension

A simple Chrome extension that automatically captures Instagram reel URLs and thumbnails while you scroll through reels.

## Features

- 🎬 **Automatic Detection**: Detects when you're viewing Instagram reels
- 📸 **Thumbnail Capture**: Fetches high-quality thumbnails for each reel
- 💾 **Local Storage**: Stores data locally in Chrome storage (no external servers)
- 🚫 **Duplicate Prevention**: Automatically prevents duplicate URL entries
- 📊 **Simple Interface**: Clean popup interface to view stats and export data
- 📁 **Export Functionality**: Export all captured reels as JSON file

## Installation

1. **Download the Extension**
   - Download or clone this repository
   - Navigate to the `reel_farmer_chrome_ext` folder

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `reel_farmer_chrome_ext` folder

3. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Instagram Reel Farmer" and click the pin icon

## Usage

1. **Navigate to Instagram Reels**
   - Go to `https://www.instagram.com/reels/`
   - Or navigate to any Instagram reel URL

2. **Start Scrolling**
   - The extension automatically detects when you scroll to new reels
   - Each new reel URL and thumbnail is captured automatically
   - No manual action required!

3. **View Captured Data**
   - Click the extension icon in your toolbar
   - View total count of captured reels
   - See recent reels with timestamps
   - Export all data as JSON file

## How It Works

### URL Detection
- Monitors URL changes using multiple methods:
  - `popstate` events for browser back/forward
  - `MutationObserver` for DOM changes
  - Override `history.pushState` and `history.replaceState` for SPA navigation

### Thumbnail Fetching
- Fetches the Instagram page using mobile user agent
- Extracts thumbnail URL from meta tags:
  - First tries `twitter:image` meta tag
  - Falls back to `og:image` meta tag
- Handles URL encoding properly

### Data Storage
- Uses Chrome's local storage API
- Prevents duplicate URLs automatically
- Stores: URL, Post ID, Thumbnail URL, Timestamps

## Data Format

The extension stores data in this format:

```json
[
  {
    "url": "https://www.instagram.com/reels/DLAx4aJB7Zq/",
    "postId": "DLAx4aJB7Zq",
    "thumbnailUrl": "https://scontent.cdninstagram.com/v/...",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "processedAt": "2024-01-15T10:30:05.123Z"
  }
]
```

## Permissions

The extension requires these permissions:
- `activeTab`: To detect URL changes on Instagram
- `storage`: To save captured data locally
- `scripting`: To inject content scripts
- `https://www.instagram.com/*`: To access Instagram pages

## Troubleshooting

### Extension Not Working
1. Make sure you're on Instagram reels page
2. Check if extension is enabled in `chrome://extensions/`
3. Refresh the Instagram page
4. Check browser console for error messages

### No Thumbnails Captured
1. Instagram may have changed their meta tag structure
2. Check if the reel URL is accessible
3. Some private/restricted reels may not have thumbnails

### Data Not Saving
1. Check Chrome storage quota
2. Try clearing extension data and starting fresh
3. Ensure you have sufficient disk space

## Development

### File Structure
```
reel_farmer_chrome_ext/
├── manifest.json          # Extension configuration
├── content.js            # Content script for URL detection
├── background.js         # Background script for data processing
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
└── README.md            # This file
```

### Key Functions
- `content.js`: Detects URL changes and sends messages to background
- `background.js`: Fetches thumbnails and manages data storage
- `popup.js`: Provides user interface for viewing and exporting data

## Privacy

- **No External Servers**: All data stays on your device
- **No Tracking**: No analytics or user tracking
- **Local Storage Only**: Data stored in Chrome's local storage
- **No Data Collection**: Extension doesn't collect any personal information

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure you're using the latest version of Chrome
3. Try reloading the extension
4. Check that Instagram hasn't changed their page structure

---

**Note**: This extension is for personal use only. Please respect Instagram's Terms of Service and use responsibly.
