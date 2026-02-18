# ☕ Our Morning Coffee

An open-source Firefox extension that opens your favorite websites with a single click. Organize sites by day of the week to automate your daily browsing routine.

## Features

- **Daily Website Lists**: Create lists for Every Day, Weekdays, Weekends, and each day of the week (Sunday - Saturday)
- **Every Day List**: Sites that open every day, regardless of the day of the week
- **One-Click Access**: Open all of today's sites with a single click
- **Bookmark Toolbar Friendly**: Open a bookmarkable tab view with the extension icon favicon
- **Keyboard Shortcut**: Press `Ctrl+Shift+O` (Windows/Linux) or `Cmd+Shift+M` (Mac) to open today's sites
- **Easy Management**: Add sites directly from the popup or manage them in the settings page
- **Import/Export**: Backup and restore your site lists as JSON files
- **Privacy-Focused**: All data is stored locally in your browser
- **Open Source**: Fully transparent and trustable code

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/nate-double-u/Our-Morning-Coffee.git
   ```

2. Open Firefox and navigate to `about:debugging`

3. Click "This Firefox" in the left sidebar

4. Click "Load Temporary Add-on"

5. Navigate to the extension directory and select the `manifest.json` file

The extension will now be loaded temporarily (until you restart Firefox).

### Permanent Installation

For permanent installation, the extension needs to be signed by Mozilla:

1. Package the extension:
   ```bash
   cd Our-Morning-Coffee
   zip -r our-morning-coffee.zip * -x "*.git*"
   ```

2. Submit to [Mozilla Add-ons](https://addons.mozilla.org/developers/) for review and signing

## Usage

### Adding Sites

**From the Popup:**
1. Click the Our Morning Coffee icon in the toolbar
2. Select the day from the dropdown (default is today)
3. Click "Add Current Tab" to add the currently open website

**From the Settings Page:**
1. Click the Our Morning Coffee icon and select "Manage Sites"
2. Select the day tab you want to add sites to
3. Enter a URL in the text field
4. Click "Add Site"

### Opening Sites

**Using the Toolbar Icon:**
1. Click the Our Morning Coffee icon in the toolbar
2. Click "Open Today's Sites"

**Using a Bookmark Toolbar Shortcut:**
1. Click the Our Morning Coffee toolbar icon
2. Click "Open in Tab"
3. Bookmark that tab to your bookmarks toolbar for quick access

**Using the Keyboard Shortcut:**
- Windows/Linux: Press `Ctrl+Shift+O`
- Mac: Press `Command+Shift+M` (or `Cmd+Shift+M`)

### Managing Your Lists

- **Switch Days**: Click the day tabs to view and manage different day lists
- **Delete Sites**: Click the "Delete" button next to any site
- **Export Data**: Click "Export Data" to save your lists as a JSON file
- **Import Data**: Click "Import Data" to restore lists from a backup

## How It Works

Our Morning Coffee stores your website lists locally using Firefox's storage API. It supports an "Every Day" list, grouped "Weekdays"/"Weekends" lists, and each day of the week.

When you click "Open Our Morning Coffee" or use the keyboard shortcut:
1. The extension checks what day it is
2. It combines the "Every Day" list, today's group list (Weekdays/Weekends), and today's specific day list
3. All URLs are opened in new tabs (in the background)

## Privacy

- **No Data Collection**: This extension does not collect any user data
- **Local Storage**: All your website lists are stored locally in your browser
- **No Network Requests**: The extension doesn't make any external network requests
- **No Analytics**: No tracking or analytics of any kind

## Development

The extension is built with vanilla JavaScript using Firefox's WebExtension APIs:

- `browser.storage.local` - For storing site lists
- `browser.tabs` - For opening tabs
- `browser.commands` - For keyboard shortcuts
- `browser.notifications` - For user feedback

No build tools are required - the code runs directly in the browser.

### Testing

Run the unit tests with:

```bash
npm test
```

Tests use Node's built-in test runner and cover shared site-list logic plus background behavior.

### CI

GitHub Actions runs tests automatically for every pull request and for pushes to `main` via `.github/workflows/tests.yml`.

### File Structure

```
Our-Morning-Coffee/
├── manifest.json       # Extension manifest
├── background.js       # Background script (handles shortcuts)
├── shared/             # Shared extension logic
│   └── site-lists.js
├── icons/              # Extension icons
│   ├── coffee-48.png
│   └── coffee-96.png
├── popup/              # Popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── test/               # Unit tests
│   ├── background.test.js
│   └── site-lists.test.js
└── options/            # Settings page
    ├── options.html
    ├── options.css
    └── options.js
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Inspiration

This extension is inspired by the original [Morning Coffee](https://en.wikipedia.org/wiki/Morning_Coffee_(Firefox_extension)) Firefox extension and [Morning Coffee Quantum](https://addons.mozilla.org/en-US/firefox/addon/morning-coffee-quantum/).

## Icons

Extension icons based on the [Hot Tea Icon](https://uxwing.com/hot-tea-icon/) from UXWing, resized using [MyImageTools](https://myimagetools.com) online conversion tool. UXWing icons are free for personal and commercial use without attribution, but we're happy to credit them for their excellent work.

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/nate-double-u/Our-Morning-Coffee/issues) on GitHub.
