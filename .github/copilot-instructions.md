# Copilot instructions

Guidance for AI coding agents working in this repository. Read alongside
`CONTRIBUTING.md`.

## Working mode

- Propose before changing. Walk the maintainer through the plan and the diff;
  do not commit without explicit approval.
- One small change per branch and PR (see `git log` for the pattern).
- Keep refactoring and behavior changes in separate commits.

## Commands

```bash
npm test            # unit tests (Node built-in runner, test/*.test.js)
npx web-ext lint    # manifest and extension validation
npx web-ext run     # load the extension in a clean Firefox profile
```

CI runs `npm test` and `web-ext lint` on every PR
(`.github/workflows/tests.yml`).

## Locked tests

Locked tests keep working behavior from silently changing. Treat a locked
test as immutable.

A locked test is tagged with a greppable comment naming what it guards:

```js
// LOCKED: regression for <issue/PR/tag>
test('...', () => { /* ... */ });
```

List them with `grep -rn "LOCKED:" test/`.

Rules:

- **Do not** edit, weaken, skip, rename, or delete a locked test, or change
  the behavior it asserts, without the maintainer's explicit approval first.
  This applies in automated/agent modes too.
- If a change appears to require touching a locked test, stop and ask. Add
  new tests alongside; leave the locked one intact.
- Shared test helpers (for example `makeBrowserMock` in
  `test/background.test.js`) may be extended additively. Changing what an
  existing locked test observes counts as changing the test.

### Baseline lock

Every test that existed at v1.1.0 is tagged
`// LOCKED: regression for v1.1.0 baseline`. They define the behavior
existing users rely on: list normalization, the everyday > weekdays/weekends
> day open order, deduplication, notifications, and the keyboard command.

### Locking a bug fix (fix-first TDD)

1. Write a test that reproduces the bug and confirm it fails (red) *before*
   fixing. A test that passes before the fix proves nothing.
2. Make the minimum change to turn it green.
3. Tag it `// LOCKED: regression for <issue/PR>`.

New features get ordinary tests, written first (red, green, refactor). They
are not locked unless the maintainer asks.

## Layout

- `shared/site-lists.js`: pure list logic, UMD (CommonJS for tests, global
  `OurMorningCoffeeSiteLists` in the browser). Put testable logic here.
- `shared/settings.js`: `defaultSettings` and `normalizeSettings()`. Add a
  new setting here with a default; storage applies defaults on read.
- `shared/storage.js`: `loadSiteLists()` / `saveSiteLists()` and
  `loadSettings()` / `saveSettings()`; the only place that reads or writes
  `browser.storage.local`. Always normalizes.
- `shared/tabs.js`: `isEmptyTabUrl()`, the list of `about:` pages that count
  as an empty tab. Unknown urls are not empty.
- `background/background.js`: keyboard command, popup messages, and
  `openTodaysSites`. The popup opens sites by messaging the background, not
  by calling `tabs.create` itself. Loads every `shared/` module; the manifest
  `background.scripts` order must list dependencies first.
- `popup/`, `options/`: UI; both load `shared/site-lists.js`,
  `shared/settings.js`, and `shared/storage.js`.
- `test/`: Node built-in test runner. `background.test.js` mocks the
  `browser` global.

## Compatibility

The extension has users on AMO. Stored data (`browser.storage.local` keys
and their shape) and the export JSON format are a public contract.

- Prefer additive changes: new keys with defaults applied on read.
- If a shape must change, add a migration in `shared/storage.js`, call it
  from the `onInstalled` handler (it runs on update too), and add a test that
  loads data written by the previous release.
- Import must keep accepting export files from every earlier release.

## Style

- Vanilla ES6+, no bundler, no runtime dependencies.
- Commit subjects: `type: short description` (`docs:`, `ci:`, `cleanup:`,
  `test:`, `feat:`, `fix:`, `release:`). Bodies are a line or two at most.
- Plain hyphens in prose; no em-dashes.
