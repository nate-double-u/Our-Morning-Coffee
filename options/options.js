// Options page script for Our Morning Coffee

let currentDay = 'everyday';
const { listLabelByKey: dayNames, validListKeys: validDays, addSiteToList, moveSite } = OurMorningCoffeeSiteLists;
const { loadSiteLists, saveSiteLists, loadSettings, saveSettings } = OurMorningCoffeeStorage;

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  // Set up tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.day);
    });
  });
  
  // Set up add URL button
  document.getElementById('add-url-btn').addEventListener('click', addSite);
  
  // Allow Enter key in URL input
  document.getElementById('new-url').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });
  
  // Set up export/import buttons
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importData);
  
  // Display version info
  const manifest = browser.runtime.getManifest();
  document.getElementById('version-info').textContent = `v${manifest.version}`;

  // Load initial data
  await loadSites();
  await loadSettingsIntoForm();

  // Save on change, only once the form reflects stored values
  document.getElementById('fill-empty-tab').addEventListener('change', saveSettingsFromForm);
  document.getElementById('open-order').addEventListener('change', saveSettingsFromForm);
});

async function loadSettingsIntoForm() {
  const settings = await loadSettings();
  document.getElementById('fill-empty-tab').checked = settings.fillEmptyTab;
  document.getElementById('open-order').value = settings.openOrder;
}

async function saveSettingsFromForm() {
  await saveSettings({
    fillEmptyTab: document.getElementById('fill-empty-tab').checked,
    openOrder: document.getElementById('open-order').value
  });
}

async function switchTab(day) {
  currentDay = day;
  
  // Update active tab button
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.dataset.day === day);
  });
  
  // Update title
  document.getElementById('current-day-title').textContent = dayNames[day];
  
  // Load sites for this day
  await loadSites();
  
  // Clear input
  document.getElementById('new-url').value = '';
}

async function loadSites() {
  const listKey = currentDay;
  const siteLists = await loadSiteLists();
  const sites = siteLists[listKey] || [];
  
  const container = document.getElementById('sites-container');
  const countSpan = document.getElementById('site-count');
  
  countSpan.textContent = sites.length;
  
  if (sites.length === 0) {
    container.innerHTML = '<li class="empty-state">No sites added yet</li>';
    return;
  }
  
  container.innerHTML = '';
  
  sites.forEach((url, index) => {
    const li = document.createElement('li');
    
    const urlDiv = document.createElement('div');
    urlDiv.className = 'site-url';
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.textContent = url;
    urlDiv.appendChild(link);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'site-actions';
    
    const upBtn = makeMoveButton('\u2191', 'Move up', index === 0, () => moveSiteBy(listKey, index, -1));
    const downBtn = makeMoveButton('\u2193', 'Move down', index === sites.length - 1, () => moveSiteBy(listKey, index, 1));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteSite(index));
    
    actionsDiv.appendChild(upBtn);
    actionsDiv.appendChild(downBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(urlDiv);
    li.appendChild(actionsDiv);
    
    container.appendChild(li);
  });
}

function makeMoveButton(label, title, disabled, onClick) {
  const button = document.createElement('button');
  button.className = 'move-btn';
  button.textContent = label;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

// Moves are disabled until the list re-renders, so rapid clicks cannot race
// each other's read-modify-write. listKey is the list the row was rendered for.
async function moveSiteBy(listKey, index, delta) {
  document.querySelectorAll('.move-btn').forEach((button) => { button.disabled = true; });
  const { siteLists, moved } = moveSite(await loadSiteLists(), listKey, index, delta);
  if (moved) {
    await saveSiteLists(siteLists);
  }
  await loadSites();
}

async function addSite() {
  const input = document.getElementById('new-url');
  let url = input.value.trim();
  
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    alert('Please enter a valid URL');
    return;
  }
  
  const { siteLists, added } = addSiteToList(await loadSiteLists(), currentDay, url);
  
  if (!added) {
    alert('This site is already in the list');
    return;
  }
  
  await saveSiteLists(siteLists);
  
  // Clear input and reload
  input.value = '';
  await loadSites();
}

async function deleteSite(index) {
  if (!confirm('Are you sure you want to delete this site?')) {
    return;
  }
  
  const siteLists = await loadSiteLists();
  
  // Remove the site
  if (siteLists[currentDay]) {
    siteLists[currentDay].splice(index, 1);
  }
  
  await saveSiteLists(siteLists);
  
  // Reload sites
  await loadSites();
}

async function exportData() {
  const siteLists = await loadSiteLists();
  
  const dataStr = JSON.stringify(siteLists, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `morning-coffee-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  
  try {
    const text = await file.text();
    const importedData = JSON.parse(text);
    
    // Validate the data structure
    for (const day of validDays) {
      if (importedData[day] && !Array.isArray(importedData[day])) {
        throw new Error('Invalid data format');
      }
    }
    
    // Ask for confirmation
    if (!confirm('This will replace all your current sites. Are you sure?')) {
      return;
    }
    
    // Save the imported data
    await saveSiteLists(importedData);
    
    // Reload the current view
    await loadSites();
    
    alert('Data imported successfully!');
  } catch (e) {
    alert('Error importing data: ' + e.message);
  }
  
  // Reset the file input
  event.target.value = '';
}
