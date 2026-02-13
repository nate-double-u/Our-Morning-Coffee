// Options page script for Our Morning Coffee

let currentDay = 'everyday';
const dayNames = {
  'everyday': 'Every Day',
  'sunday': 'Sunday',
  'monday': 'Monday',
  'tuesday': 'Tuesday',
  'wednesday': 'Wednesday',
  'thursday': 'Thursday',
  'friday': 'Friday',
  'saturday': 'Saturday'
};

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
  
  // Load initial data
  await loadSites();
});

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
  const result = await browser.storage.local.get('siteLists');
  const siteLists = result.siteLists || {};
  const sites = siteLists[currentDay] || [];
  
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
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteSite(index));
    
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(urlDiv);
    li.appendChild(actionsDiv);
    
    container.appendChild(li);
  });
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
  
  // Get current site lists
  const result = await browser.storage.local.get('siteLists');
  const siteLists = result.siteLists || {};
  
  // Initialize the list if it doesn't exist
  if (!siteLists[currentDay]) {
    siteLists[currentDay] = [];
  }
  
  // Check if URL already exists
  if (siteLists[currentDay].includes(url)) {
    alert('This site is already in the list');
    return;
  }
  
  // Add the URL
  siteLists[currentDay].push(url);
  
  // Save back to storage
  await browser.storage.local.set({ siteLists });
  
  // Clear input and reload
  input.value = '';
  await loadSites();
}

async function deleteSite(index) {
  if (!confirm('Are you sure you want to delete this site?')) {
    return;
  }
  
  // Get current site lists
  const result = await browser.storage.local.get('siteLists');
  const siteLists = result.siteLists || {};
  
  // Remove the site
  if (siteLists[currentDay]) {
    siteLists[currentDay].splice(index, 1);
  }
  
  // Save back to storage
  await browser.storage.local.set({ siteLists });
  
  // Reload sites
  await loadSites();
}

async function exportData() {
  const result = await browser.storage.local.get('siteLists');
  const siteLists = result.siteLists || {};
  
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
    const validDays = ['everyday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
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
    await browser.storage.local.set({ siteLists: importedData });
    
    // Reload the current view
    await loadSites();
    
    alert('Data imported successfully!');
  } catch (e) {
    alert('Error importing data: ' + e.message);
  }
  
  // Reset the file input
  event.target.value = '';
}
