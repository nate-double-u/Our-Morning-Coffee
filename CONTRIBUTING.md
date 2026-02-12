# Contributing to Our Morning Coffee

Thank you for your interest in contributing to Our Morning Coffee! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and considerate in all interactions. We aim to maintain a welcoming and inclusive community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Firefox version and operating system
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any potential implementation ideas

### Submitting Code

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Our-Morning-Coffee.git
   cd Our-Morning-Coffee
   ```

3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**:
   - Follow the existing code style
   - Keep changes focused and minimal
   - Test your changes thoroughly

5. **Test the extension**:
   ```bash
   # Validate the extension
   npx web-ext lint
   
   # Build the extension
   npx web-ext build
   ```

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** on GitHub

## Development Guidelines

### Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use modern JavaScript (ES6+) features

### File Organization

```
Our-Morning-Coffee/
├── manifest.json       # Extension configuration
├── background.js       # Background script
├── icons/             # Extension icons
├── popup/             # Popup UI files
└── options/           # Options page files
```

### Testing

Before submitting a PR:

1. Load the extension in Firefox (`about:debugging`)
2. Test all features:
   - Adding sites
   - Opening sites
   - Keyboard shortcut
   - Export/import
   - All day tabs
3. Check browser console for errors
4. Verify no warnings from `web-ext lint`

### Extension APIs Used

- `browser.storage.local` - Local storage
- `browser.tabs` - Tab management
- `browser.commands` - Keyboard shortcuts
- `browser.notifications` - User notifications
- `browser.runtime` - Extension runtime

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Check existing issues and documentation
- Review the source code (it's well commented!)

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
