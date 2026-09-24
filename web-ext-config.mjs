// Files excluded from the packaged extension (in addition to web-ext defaults:
// dotfiles, node_modules, *.zip, *.xpi).
export default {
  ignoreFiles: [
    'scratch',
    'test',
    'web-ext-artifacts',
    'package.json',
    'package-lock.json',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'DEVLOG.md',
  ],
};
