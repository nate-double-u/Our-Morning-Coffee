# Screenshots and Visual Guide

## Extension Popup

The popup provides quick access to opening your sites and adding new ones:

### Features:
- Shows current day and site count
- One-click button to open all today's sites
- Quick add button to add the current tab
- Day selector dropdown to choose which list to add to
- Link to manage all sites in the settings page

## Options/Settings Page

The settings page provides full control over your site lists:

### Features:
- Tab interface for each day of the week plus "Every Day"
- Add sites by entering URLs
- View all sites for each day
- Delete sites with one click
- Export/Import functionality for backups
- Keyboard shortcut reminder

## Usage Examples

### Example Daily Routine

**Every Day List:**
- Gmail: https://gmail.com
- Calendar: https://calendar.google.com
- News: https://news.ycombinator.com

**Monday:**
- Project management: https://linear.app
- Team standup notes: https://notion.so

**Wednesday:**
- Mid-week reports: https://analytics.yourcompany.com

**Friday:**
- Time tracking: https://toggl.com
- Weekly review: https://docs.google.com/spreadsheets/...

### Workflow

1. **Monday morning at 9am:**
   - Click the Our Morning Coffee icon or press Ctrl+Shift+O (Windows/Linux) or Cmd+Shift+M (Mac)
   - Extension opens: Gmail, Calendar, News (every day) + Linear and Notion (Monday)
   - All 5 tabs open automatically

2. **During the week:**
   - Find a useful site you visit regularly
   - Click the Our Morning Coffee icon
   - Select which day(s) from the dropdown
   - Click "Add Current Tab"

3. **End of month backup:**
   - Go to Settings (click Manage Sites)
   - Click "Export Data"
   - Save the JSON file to your backup location

## Keyboard Shortcut

- Windows/Linux: `Ctrl+Shift+O`
- Mac: `Cmd+Shift+M`

You can change this in Firefox:
1. Go to `about:addons`
2. Click the gear icon
3. Select "Manage Extension Shortcuts"
4. Find "Our Morning Coffee"
5. Click and set your preferred shortcut

## Data Format

The extension stores data in this format:

```json
{
  "everyday": [
    "https://gmail.com",
    "https://calendar.google.com"
  ],
  "monday": [
    "https://linear.app"
  ],
  "tuesday": [],
  "wednesday": [],
  "thursday": [],
  "friday": [
    "https://toggl.com"
  ],
  "saturday": [],
  "sunday": []
}
```

This format is used for both storage and export/import.
