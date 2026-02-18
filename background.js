// Background script for Our Morning Coffee extension

const defaultLists = {
  everyday: [],
  weekdays: [],
  weekends: [],
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: []
};

function normalizeSiteLists(siteLists = {}) {
  const normalized = {};
  for (const key of Object.keys(defaultLists)) {
    normalized[key] = Array.isArray(siteLists[key]) ? siteLists[key] : [];
  }
  return normalized;
}

// Initialize storage with default empty lists if not present
browser.runtime.onInstalled.addListener(async () => {
  const result = await browser.storage.local.get('siteLists');

  if (!result.siteLists) {
    await browser.storage.local.set({ siteLists: defaultLists });
    return;
  }

  const normalized = normalizeSiteLists(result.siteLists);
  if (JSON.stringify(normalized) !== JSON.stringify(result.siteLists)) {
    await browser.storage.local.set({ siteLists: normalized });
  }
});

// Listen for keyboard shortcut
browser.commands.onCommand.addListener((command) => {
  if (command === 'open-morning-coffee') {
    openTodaysSites();
  }
});

// Function to open today's sites
async function openTodaysSites() {
  const result = await browser.storage.local.get('siteLists');
  const siteLists = normalizeSiteLists(result.siteLists);
  
  // Get current day of the week (0 = Sunday, 6 = Saturday)
  const today = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today];
  
  const categoryKey = today === 0 || today === 6 ? 'weekends' : 'weekdays';

  // Combine everyday, grouped category, and today's sites.
  const sitesToOpen = [...new Set([...siteLists.everyday, ...siteLists[categoryKey], ...siteLists[todayName]])];
  
  if (sitesToOpen.length === 0) {
    // Show a notification if no sites are configured
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/coffee-48.png'),
      title: 'Our Morning Coffee',
      message: 'No sites configured for today. Add some in the options page!'
    });
    return;
  }
  
  // Open each site in a new tab
  for (const url of sitesToOpen) {
    await browser.tabs.create({ url: url, active: false });
  }
  
  // Show success notification
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('icons/coffee-48.png'),
    title: 'Our Morning Coffee',
    message: `Opened ${sitesToOpen.length} site(s) for ${todayName}`
  });
}

// Export function for use in popup
if (typeof module !== 'undefined') {
  module.exports = { openTodaysSites };
}
