# Our Morning Coffee — Dev Log

## Overview

A Firefox extension that modernizes the classic "Morning Coffee" concept: organize your daily websites by day of the week and open them all at once.

## Key Features

### User Features
1. **Daily Website Organization**
   - 10 separate lists: Every Day, Weekdays, Weekends, plus Sunday–Saturday
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
4. `DEVLOG.md` - Dev log, notes, and specifications
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

- Android Firefox support (see [specification below](#specification-android-firefox-support))
- Customizable keyboard shortcuts in UI
- Tab randomization option
- Drag-and-drop site reordering
- Site categories/folders
- Time-based automation
- Multiple profiles
- Cross-device sync (optional)
- Dark mode

## Specification: Android Firefox Support

### Goal

Make the extension work on Firefox for Android in addition to desktop Firefox,
shipped as a single extension. No Manifest V3 migration is required — Firefox
for Android supports both MV2 and MV3 with no deprecation timeline.

### What "Android compatible" means

1. Extension installs and runs on Firefox for Android 120+
2. Popup renders correctly on mobile viewports (minimum ~360px)
3. Options page is fully usable on mobile viewports
4. Core functionality works: open today's sites, add sites, manage lists,
   export/import
5. Features that don't apply on mobile (keyboard shortcuts) degrade gracefully
6. Notifications gracefully fall back if unsupported on the platform
7. No regressions on desktop Firefox

### Out of scope

- Manifest V3 migration (separate future effort)
- Chrome/Edge/Safari support
- Native Android UI patterns (bottom sheets, swipe gestures, etc.)
- Cross-device sync between desktop and mobile

### Implementation tasks

#### 1. Declare Android compatibility in manifest.json

Add `gecko_android` to `browser_specific_settings`:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "our-morning-coffee@nate-double-u",
    "data_collection_permissions": { "required": ["none"] }
  },
  "gecko_android": {
    "strict_min_version": "120.0"
  }
}
```

This is the flag that tells AMO to list the extension for Android users.

#### 2. Notification API fallback

`browser.notifications.create()` may not be available or may silently fail on
Android. Both calls in `background/background.js` (~lines 38–43 and 53–58) must
be wrapped in a try/catch so that failure never breaks the open-sites flow.
Introduce a `safeNotify()` helper:

```javascript
async function safeNotify(options) {
  try {
    if (browser.notifications?.create) {
      await browser.notifications.create(options);
    }
  } catch (e) {
    // Notifications not supported (e.g., Android); silently continue
  }
}
```

#### 3. Viewport meta tags

Both `popup/popup.html` and `options/options.html` are missing:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Without this, Android renders pages at a desktop-assumed zoom level.

#### 4. Popup responsive CSS

Current `popup/popup.css` sets `body { width: 300px; }`, which is correct for
the desktop popup panel but may cause issues on Android where the popup can
render full-width.

Changes:
- Replace `width: 300px` with `min-width: 300px; max-width: 100%;`
  (or use a media query to go full-width on narrow screens)
- Ensure buttons meet minimum 44px touch-target height
- Add `:active` states alongside all `:hover` rules for touch feedback
- Verify the day-selector `<select>` renders well at narrow widths

#### 5. Options page responsive CSS

`options/options.css` has several issues on a ~360px viewport:

- **Tab buttons:** 10 tabs with `padding: 10px 20px` overflow badly. Options:
  horizontal scroll container, or switch to a `<select>` dropdown on narrow
  screens via a CSS media query.
- **Add-site form:** The flex row (input + button) cramps at small widths.
  Stack vertically below a breakpoint (~480px).
- **Touch targets:** Delete buttons and list items need minimum 44px height.
- **`:hover` → `:active`:** Add `:active` states alongside all hover rules.

#### 6. Hide keyboard shortcut references on mobile

The options page footer shows `Ctrl+Shift+U` / `Cmd+Shift+U` instructions that
are meaningless on Android. Hide via a CSS media query at a reasonable breakpoint
(mobile = narrow, and the shortcut section adds no value there):

```css
@media (max-width: 600px) {
  .keyboard-shortcut-info { display: none; }
}
```

#### 7. Tests for notification fallback

Add test cases to `test/background.test.js` covering:
- `safeNotify()` when `browser.notifications` is `undefined`
- `safeNotify()` when `browser.notifications.create` throws
- `openTodaysSites()` still opens tabs successfully even when notifications fail

#### 8. Documentation updates

- **CONTRIBUTING.md:** Add Android testing instructions (emulator setup, `adb`,
  remote debugging workflow)
- **README.md:** Note Android compatibility and any caveats
- **CHANGELOG.md:** Add entry for the version that ships Android support

#### 9. Final validation

- `npm test` passes
- `npx web-ext lint` passes (validates `gecko_android` manifest field)
- Manual test on desktop Firefox via `npx web-ext run`
- Manual test on Android emulator (see testing strategy below)

### Task dependencies

```
manifest-android ─────────────────────────────┐
notifications-fallback ───┬───────────────────┤
                          │                   │
viewport-meta ────────────┼───────────────────┤
  ├── popup-responsive ───┤                   │
  └── options-responsive ─┤                   │
        └── keyboard-shortcut-ux ─────────────┤
                          │                   │
test-android-apis ────────┘                   │
                                              ▼
                                        update-docs
                                              │
                                              ▼
                                        lint-and-test
```

### Testing strategy

**Desktop (existing):**
- `npm test` — unit tests via Node's built-in test runner
- `npx web-ext lint` — manifest and extension validation
- `npx web-ext run` — run in a clean Firefox profile

**Android (new — requires setup once):**
1. Install [Android Studio](https://developer.android.com/studio) (free, works
   on Apple Silicon)
2. Create an AVD via AVD Manager (e.g., Pixel 7, API 34+)
3. Install Firefox for Android in the emulator (download APK or use Play Store)
4. Sideload the extension via `adb` or use a custom AMO collection in Firefox
   Nightly for Android
5. Connect desktop Firefox → `about:debugging` → remote device for live
   debugging of the extension running on the emulator

**Alternative:** BrowserStack or LambdaTest for real-device cloud testing
without local emulator setup.

### Technical notes

- The shared module (`shared/site-lists.js`) uses a UMD pattern and is fully
  platform-agnostic — no changes needed.
- The background script is already event-driven (not persistent) — good for
  Android battery and memory.
- `alert()` and `confirm()` dialogs work on Android but are poor UX. Replacing
  them with in-page UI would be a nice follow-up but is out of scope — they
  function correctly.
- File export/import (Blob + download, file input) works on Android Firefox but
  the download location may differ. Should be tested but likely works as-is.

---

**Version:** 1.1.0
**License:** Apache-2.0 (code) / CC-BY-4.0 (documentation)
**Author:** nate-double-u
**Repository:** https://github.com/nate-double-u/Our-Morning-Coffee
