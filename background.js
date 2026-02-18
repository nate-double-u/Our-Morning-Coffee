// Background script for Our Morning Coffee extension

// Initialize storage with default empty lists if not present
browser.runtime.onInstalled.addListener(async () => {
  const result = await browser.storage.local.get('siteLists');
  
  if (!result.siteLists) {
    const defaultLists = {
      everyday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    };
    
    await browser.storage.local.set({ siteLists: defaultLists });
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
  const siteLists = result.siteLists;
  
  if (!siteLists) {
    return;
  }
  
  // Get current day of the week (0 = Sunday, 6 = Saturday)
  const today = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today];
  
  // Combine everyday sites with today's sites
  const sitesToOpen = [...siteLists.everyday, ...siteLists[todayName]];
  
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
