# Changelog

All notable changes to the Our Morning Coffee extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-02

### Added
- `Weekdays` and `Weekends` site categories that open in addition to today's day list
- "Open in Tab" link in the popup for bookmarkable toolbar access
- Mozilla Add-ons install link in README and settings page
- Version display in settings page footer
- Dual licensing: Apache-2.0 for code, CC-BY-4.0 for documentation
- Unit test suite (18 tests) covering shared site-list logic and background behavior
- CI: GitHub Actions runs tests and `web-ext lint` on every PR and push to main
- `npx web-ext run` documented as the primary development workflow

### Changed
- Keyboard shortcut normalized to `Ctrl+Shift+U` / `Cmd+Shift+U` across all platforms (previously `Ctrl+Shift+O` / `Cmd+Shift+M`, which conflicted with Firefox built-ins)
- Removed the address bar icon (`page_action`) entry point
- Moved `background.js` into `background/` directory for consistent project structure
- Refactored site-list logic into shared module (`shared/site-lists.js`)
- Documentation copy-edited for accuracy and tone across README, CONTRIBUTING, SUMMARY, and SCREENSHOTS

### Fixed
- `normalizeSiteLists` now filters non-string values from site arrays (previously would break `browser.tabs.create`)
- `normalizeSiteLists` now trims whitespace and filters empty strings
- Sites are deduplicated when merging everyday, category, and day lists

## [1.0.0] - 2026-02-12

### Added
- Initial release of Our Morning Coffee Firefox extension
- Daily website lists for each day of the week (Sunday-Saturday)
- "Every Day" list for sites that should open regardless of the day
- One-click opening of all sites for the current day
- Keyboard shortcut (Ctrl+Shift+O on Windows/Linux, Cmd+Shift+M on Mac) to open today's sites
- Browser action popup with:
  - Display of today's site count
  - Quick add current tab functionality
  - Day selector for adding sites
  - Link to settings page
- Comprehensive options/settings page with:
  - Tab interface for managing each day's sites
  - Add sites by URL
  - Delete sites functionality
  - Export data as JSON backup
  - Import data from JSON backup
- Background script to handle keyboard shortcuts
- Notifications when sites are opened
- Privacy-focused: all data stored locally, no external requests
- Open source under Apache License 2.0
- Full documentation in README.md
- Contributing guidelines in CONTRIBUTING.md

### Security
- No external network requests
- No data collection or tracking
- All data stored locally in browser storage

[1.1.0]: https://github.com/nate-double-u/Our-Morning-Coffee/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nate-double-u/Our-Morning-Coffee/releases/tag/v1.0.0
