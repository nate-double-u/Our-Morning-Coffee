# Our Morning Coffee — Development Summary

## Overview

A Firefox extension that modernizes the classic "Morning Coffee" concept: organize your daily websites by day of the week and open them all at once.

## Key Features

### User Features
1. **Daily Website Organization**
   - 8 separate lists: Every Day + 7 days of the week
   - Quick add from current tab
   - Quick opening of all sites
   - Keyboard shortcut (Ctrl+Shift+U on Windows/Linux, Cmd+Shift+U on Mac)

2. **User Interface**
   - Clean, modern popup interface
   - Comprehensive settings page with tabs
   - Coffee-themed branding (#6F4E37 color scheme)
   - Responsive design

3. **Data Management**
   - Export site lists as JSON
   - Import from JSON backups
   - All data stored locally
   - No cloud sync or external dependencies

4. **Privacy & Security**
   - Zero data collection
   - No external network requests
   - No analytics or tracking
   - Fully transparent open-source code

### Technical Implementation

**Core Files:**
- `manifest.json` - Extension configuration (WebExtension API v2)
- `background/background.js` - Background script for keyboard shortcuts
- `popup/` - Browser action popup (HTML/CSS/JS)
- `options/` - Settings page (HTML/CSS/JS)
- `icons/` - Extension icons (PNG + SVG)

**Technologies Used:**
- Vanilla JavaScript (ES6+)
- Firefox WebExtension APIs
- CSS3 with modern features
- No bundlers, transpilers, or runtime dependencies

**Browser APIs:**
- `browser.storage.local` - Local data storage
- `browser.tabs` - Tab management
- `browser.commands` - Keyboard shortcuts
- `browser.notifications` - User notifications
- `browser.runtime` - Extension lifecycle

### Documentation

**Comprehensive Guides:**
1. `README.md` - Main documentation with installation and usage
2. `CONTRIBUTING.md` - Developer contribution guidelines
3. `CHANGELOG.md` - Version history
4. `SCREENSHOTS.md` - Visual guide and examples
5. `LICENSE-APACHE-2.0` - Apache 2.0 license (code)
6. `LICENSE-CC-BY-4.0` - CC-BY-4.0 license (documentation)

### Quality Assurance

**Validation:**
- ✅ Passes `npx web-ext lint`
- ✅ Builds successfully with `npx web-ext build`
- ✅ Unit tests via `npm test`

### Code Quality

- Readable, unminified source
- Consistent formatting
- Modular structure
- No external dependencies

## Possible Future Work

- Customizable keyboard shortcuts in UI
- Tab randomization option
- Drag-and-drop site reordering
- Site categories/folders
- Time-based automation
- Multiple profiles
- Cross-device sync (optional)
- Dark mode

---

**Version:** 1.0.0
**License:** Apache-2.0 (code) / CC-BY-4.0 (documentation)
**Author:** nate-double-u
**Repository:** https://github.com/nate-double-u/Our-Morning-Coffee
