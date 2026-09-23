// Popup script for Our Morning Coffee

const isTabMode = new URLSearchParams(window.location.search).get('mode') === 'tab';
const {
  listLabelByKey,
  getCategoryKeyForDay,
  getDayKey,
  getSitesToOpen,
  addSiteToList
} = OurMorningCoffeeSiteLists;
const { loadSiteLists, saveSiteLists } = OurMorningCoffeeStorage;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await updatePopupInfo();
  
  // Set up event listeners
  document.getElementById('open-sites').addEventListener('click', openSites);
  document.getElementById('add-current').addEventListener('click', addCurrentTab);
  document.getElementById('open-options').addEventListener('click', openOptions);
  document.getElementById('open-bookmarkable').addEventListener('click', openBookmarkableTab);
  
  // Set default day to today
  document.getElementById('day-selector').value = getDayKey(new Date().getDay());
});

async function updatePopupInfo() {
  const siteLists = await loadSiteLists();
  
  // Get current day
  const today = new Date().getDay();
  const todayKey = getDayKey(today);
  const todayName = listLabelByKey[todayKey];
  const categoryKey = getCategoryKeyForDay(today);
  const categoryName = listLabelByKey[categoryKey];
  
  // Update today info
  document.getElementById('today-info').textContent = `Today is ${todayName}`;
  
  // Count sites for today
  const everydayCount = siteLists.everyday.length;
  const categoryCount = siteLists[categoryKey].length;
  const todayCount = siteLists[todayKey].length;
  const totalCount = getSitesToOpen(siteLists, today).length;
  
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
  const opened = await browser.runtime.sendMessage({ type: 'open-todays-sites', notify: false });
  
  if (!opened) {
    return;
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
  
  const { siteLists, added } = addSiteToList(await loadSiteLists(), selectedDay, currentTab.url);
  
  if (!added) {
    alert('This site is already in the list');
    return;
  }
  
  await saveSiteLists(siteLists);
  
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
