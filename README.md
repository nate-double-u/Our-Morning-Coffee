# ☕ Our Morning Coffee

An open-source Firefox extension that opens your favorite websites each morning. Organize sites by day of the week to automate your daily browsing routine.

## Features

- **Daily Website Lists**: Every Day, Weekdays, Weekends, and each day of the week
- **One Click or Keystroke**: Open today's sites from the popup, a bookmarkable tab, or `Ctrl+Shift+U` (`Cmd+Shift+U` on Mac)
- **Your Order or Random**: Sites open as arranged in your lists, or shuffled
- **No Stray Blank Tab**: If the current tab is empty, the first site loads there
- **Easy Management**: Add the current tab from the popup, or manage lists in the settings page
- **Import/Export**: Back up and restore your lists as JSON
- **Local and Private**: Everything stays in your browser; no accounts, no tracking
- **Open Source**: Apache-2.0 code, CC-BY-4.0 docs

## Installation

### From Mozilla Add-ons

Install directly from the [Mozilla Add-ons page](https://addons.mozilla.org/en-CA/firefox/addon/our-morning-coffee/).

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/nate-double-u/Our-Morning-Coffee.git
   ```

2. In Firefox, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json`. Click **Reload** on the card after editing source files. The add-on is removed when Firefox quits.

   Alternatively, `npx web-ext run` starts a separate Firefox profile with the extension loaded and auto-reload. It does not work well while your regular Firefox is running; use Firefox Developer Edition (`--firefox=deved`) or quit Firefox first.

### Building and Signing

If you want to self-host or distribute a signed build:

1. Package the extension:
   ```bash
   cd Our-Morning-Coffee
   npx web-ext build
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
- Windows/Linux: Press `Ctrl+Shift+U`
- Mac: Press `Cmd+Shift+U`

### Managing Your Lists

- **Switch Days**: Click the day tabs to view and manage different day lists
- **Reorder Sites**: Use the up and down arrows to arrange the order within a list
- **Delete Sites**: Click the "Delete" button next to any site
- **Export Data**: Click "Export Data" to save your lists as a JSON file
- **Import Data**: Click "Import Data" to restore lists from a backup

### Settings

On the settings page, below the lists:

- **Use the current tab if it is empty** (default on): load the first site into the active tab when it is a new or blank tab
- **Open order**: "As arranged in your lists" (default) or "Random"

## How It Works

Our Morning Coffee stores your website lists locally using Firefox's storage API. It supports an "Every Day" list, grouped "Weekdays"/"Weekends" lists, and each day of the week.

When you click "Open Today's Sites" or use the keyboard shortcut:
1. The extension checks what day it is
2. It combines the "Every Day" list, today's group list (Weekdays/Weekends), and today's specific day list, in that order
3. If open order is set to Random in settings, the combined list is shuffled
4. If the current tab is a new or blank tab, the first URL loads there (you can turn this off in settings)
5. The remaining URLs are opened in new tabs (in the background)

## Privacy

- **No Data Collection**: The extension does not collect or send any user data
- **Local Storage**: Your lists and settings live in your browser's local extension storage
- **No Network Requests of Its Own**: The only connections made are to the sites you open
- **No Analytics**: No tracking of any kind

## Development

Vanilla JavaScript on Firefox's WebExtension APIs:

- `browser.storage.local` - site lists and settings
- `browser.tabs` - opening and filling tabs
- `browser.commands` - keyboard shortcut
- `browser.notifications` - user feedback

No bundlers or transpilers; the code runs directly in the browser. `web-ext` handles linting and packaging.

### Testing

```bash
npm test
```

Tests use Node's built-in test runner and cover the shared modules and the background script. Tests tagged `// LOCKED:` guard released behavior; see `CONTRIBUTING.md`.

### CI

GitHub Actions runs tests automatically for every pull request and for pushes to `main` via `.github/workflows/tests.yml`.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

Project documentation (including this README, CHANGELOG, and user guides) is licensed under [CC-BY-4.0](LICENSE-CC-BY-4.0).
All original source code files (including JS, HTML, CSS, JSON, and test files) are licensed under [Apache-2.0](LICENSE-APACHE-2.0).
Third-party assets (such as the UXWing icons described below) are governed by their own licenses.

## Inspiration

This extension is inspired by the original [Morning Coffee](https://en.wikipedia.org/wiki/Morning_Coffee_(Firefox_extension)) Firefox extension and [Morning Coffee Quantum](https://addons.mozilla.org/en-US/firefox/addon/morning-coffee-quantum/).

## Icons

Extension icons based on the [Hot Tea Icon](https://uxwing.com/hot-tea-icon/) from UXWing, resized using [MyImageTools](https://myimagetools.com). See [`icons/README.md`](icons/README.md) for license details.

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/nate-double-u/Our-Morning-Coffee/issues) on GitHub.
