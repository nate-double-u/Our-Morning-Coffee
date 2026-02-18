# Changelog

All notable changes to the Our Morning Coffee extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Removed the address bar icon (`page_action`) entry point
- Added an "Open in Tab" link in the popup to make bookmark toolbar setup easier
- Added `Weekdays` and `Weekends` site categories that open in addition to today's day list

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

[1.0.0]: https://github.com/nate-double-u/Our-Morning-Coffee/releases/tag/v1.0.0
