// Popup script for Our Morning Coffee

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const isTabMode = new URLSearchParams(window.location.search).get('mode') === 'tab';
const listLabelByKey = {
  everyday: 'Every Day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday'
};
const validListKeys = Object.keys(listLabelByKey);

function normalizeSiteLists(siteLists = {}) {
  const normalized = {};
  for (const key of validListKeys) {
    normalized[key] = Array.isArray(siteLists[key]) ? siteLists[key] : [];
  }
  return normalized;
}

function getCategoryKeyForDay(dayIndex) {
  return dayIndex === 0 || dayIndex === 6 ? 'weekends' : 'weekdays';
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await updatePopupInfo();
  
  // Set up event listeners
  document.getElementById('open-sites').addEventListener('click', openSites);
  document.getElementById('add-current').addEventListener('click', addCurrentTab);
  document.getElementById('open-options').addEventListener('click', openOptions);
  document.getElementById('open-bookmarkable').addEventListener('click', openBookmarkableTab);
  
  // Set default day to today
  const today = new Date().getDay();
  const todayName = dayNames[today].toLowerCase();
  document.getElementById('day-selector').value = todayName;
});

async function updatePopupInfo() {
  const result = await browser.storage.local.get('siteLists');
  const siteLists = normalizeSiteLists(result.siteLists || {});
  
  // Get current day
  const today = new Date().getDay();
  const todayName = dayNames[today];
  const todayKey = todayName.toLowerCase();
  const categoryKey = getCategoryKeyForDay(today);
  const categoryName = listLabelByKey[categoryKey];
  
  // Update today info
  document.getElementById('today-info').textContent = `Today is ${todayName}`;
  
  // Count sites for today
  const everydayCount = siteLists.everyday.length;
  const categoryCount = siteLists[categoryKey].length;
  const todayCount = siteLists[todayKey].length;
  const totalCount = new Set([...siteLists.everyday, ...siteLists[categoryKey], ...siteLists[todayKey]]).size;
  
  if (totalCount === 0) {
    document.getElementById('site-count').textContent = 'No sites configured for today';
    document.getElementById('open-sites').disabled = true;
  } else {
    const parts = [];
    if (everydayCount > 0) {
      parts.push(`${everydayCount} everyday`);
    }
    if (categoryCount > 0) {
      parts.push(`${categoryCount} for ${categoryName}`);
    }
    if (todayCount > 0) {
      parts.push(`${todayCount} for ${todayName}`);
    }
    document.getElementById('site-count').textContent = `${totalCount} site(s): ${parts.join(', ')}`;
    document.getElementById('open-sites').disabled = false;
  }
}

async function openSites() {
  const result = await browser.storage.local.get('siteLists');
  const siteLists = normalizeSiteLists(result.siteLists || {});
  
  // Get current day
  const today = new Date().getDay();
  const todayName = dayNames[today].toLowerCase();
  const categoryKey = getCategoryKeyForDay(today);
  
  // Combine everyday sites with today's sites
  const sitesToOpen = [...new Set([...siteLists.everyday, ...siteLists[categoryKey], ...siteLists[todayName]])];
  
  if (sitesToOpen.length === 0) {
    return;
  }
  
  // Open each site in a new tab
  for (const url of sitesToOpen) {
    await browser.tabs.create({ url: url, active: false });
  }
  
  // Keep the page open when launched in a normal tab so it can be bookmarked/reused.
  if (!isTabMode) {
    window.close();
  }
}

async function addCurrentTab() {
  // Get the currently active tab
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  if (!currentTab || !currentTab.url) {
    return;
  }
  
  // Don't add browser internal pages
  if (currentTab.url.startsWith('about:') || currentTab.url.startsWith('moz-extension:')) {
    alert('Cannot add internal browser pages');
    return;
  }
  
  // Get selected day
  const selectedDay = document.getElementById('day-selector').value;
  
  // Get current site lists
  const result = await browser.storage.local.get('siteLists');
  const siteLists = result.siteLists || {};
  
  // Initialize the list if it doesn't exist
  if (!siteLists[selectedDay]) {
    siteLists[selectedDay] = [];
  }
  
  // Check if URL already exists in this list
  if (siteLists[selectedDay].includes(currentTab.url)) {
    alert('This site is already in the list');
    return;
  }
  
  // Add the URL
  siteLists[selectedDay].push(currentTab.url);
  
  // Save back to storage
  await browser.storage.local.set({ siteLists });
  
  // Update the popup info
  await updatePopupInfo();
  
  // Show feedback
  const dayName = listLabelByKey[selectedDay] || selectedDay;
  alert(`Added to ${dayName} list!`);
}

function openOptions(e) {
  e.preventDefault();
  browser.runtime.openOptionsPage();
  // Keep the page open when launched in a normal tab so it can be bookmarked/reused.
  if (!isTabMode) {
    window.close();
  }
}

function openBookmarkableTab(e) {
  e.preventDefault();
  browser.tabs.create({ url: browser.runtime.getURL('popup/popup.html?mode=tab') });
  if (!isTabMode) {
    window.close();
  }
}
