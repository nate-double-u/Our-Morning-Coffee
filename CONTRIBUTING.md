# Contributing to Our Morning Coffee

Thanks for considering a contribution! Here's how to get involved.

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
   - Add or update unit tests in `test/`
   - Tests tagged `// LOCKED:` are frozen; do not change them without
     maintainer approval (see `.github/copilot-instructions.md`)
   - Keep stored data and the export format backwards compatible; if a shape
     must change, add a migration in `onInstalled` and a test for old data

5. **Test the extension**:
   ```bash
   # Run unit tests
   npm test

   # Validate the extension
   npx web-ext lint

   # Build the extension
   npx web-ext build
   ```

   For manual testing, load the checkout as a temporary add-on via
   `about:debugging#/runtime/this-firefox` and click **Reload** after each
   change. `npx web-ext run` also works, but not alongside a running
   Firefox; use Developer Edition (`--firefox=deved`) or quit Firefox first.

6. **Commit your changes**. Keep messages short: a `type: description`
   subject line, and a body only if it adds something the diff doesn't say.
   ```bash
   git add .
   git commit -m "feat: add site reordering"
   ```

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** on GitHub

## Development Guidelines

Using an AI coding agent? It should read `.github/copilot-instructions.md`
first.

### Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use modern JavaScript (ES6+) features

### Testing

Before submitting a PR:

1. Load the extension as a temporary add-on (`about:debugging`)
2. Test all features:
   - Adding sites
   - Opening sites, with and without an empty current tab
   - Keyboard shortcut
   - Reordering sites and the open order setting
   - Export/import
   - All day tabs
3. Check browser console for errors
4. Verify no warnings from `npx web-ext lint`

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
- Browse the source code

## License

By contributing, you agree that your contributions will be licensed under the project's dual-license terms: [Apache-2.0](LICENSE-APACHE-2.0) for code and [CC-BY-4.0](LICENSE-CC-BY-4.0) for documentation.
