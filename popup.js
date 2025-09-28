// Instagram & TikTok Logger Popup - v9
console.log('Popup loaded');

// Load settings and pages
function loadSettings() {
  chrome.storage.local.get(['extensionEnabled', 'currentMode'], (settings) => {
    const isEnabled = settings.extensionEnabled !== false; // Default to true
    const mode = settings.currentMode || 'instagram';
    
    document.getElementById('enableToggle').checked = isEnabled;
    document.querySelector(`input[name="mode"][value="${mode}"]`).checked = true;
  });
}

function loadPages() {
  chrome.storage.local.get(['visitedPages', 'currentMode'], (result) => {
    const pages = result.visitedPages || [];
    const mode = result.currentMode || 'instagram';
    
    // Filter pages by current mode
    const filteredPages = pages.filter(page => page.type === mode);
    
    console.log('Pages found:', filteredPages.length, 'for mode:', mode);
    
    document.getElementById('count').textContent = `Pages: ${filteredPages.length}`;
    document.getElementById('status').textContent = filteredPages.length > 0 ? `Active (${mode})` : `No ${mode} pages visited`;
    
    // Show recent pages
    const recentPages = filteredPages.slice(-10).reverse();
    document.getElementById('pagesList').innerHTML = recentPages.map(page => {
      const isInstagram = page.type === 'instagram';
      return `<div class="page-item">
        <strong>${page.media_id || 'Unknown ID'}</strong><br>
        <small>ID: ${page.id}</small><br>
        ${isInstagram ? '' : `<small>Username: ${page.username || 'Unknown'}</small><br>`}
        <a href="${page.url}" target="_blank">${page.url}</a><br>
        <small>${new Date(page.createdAt).toLocaleString()}</small>
        ${page.thumbnail_url ? `<br><img src="${page.thumbnail_url}" style="max-width: 100%; height: auto; margin-top: 5px; border-radius: 4px;" alt="Thumbnail">` : '<br><small>No thumbnail</small>'}
      </div>`;
    }).join('');
  });
}

// Event listeners
document.getElementById('enableToggle').addEventListener('change', function() {
  const isEnabled = this.checked;
  chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
    console.log('Extension enabled:', isEnabled);
    loadPages();
  });
});

document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener('change', function() {
    if (this.checked) {
      const mode = this.value;
      chrome.storage.local.set({ currentMode: mode }, () => {
        console.log('Mode changed to:', mode);
        loadPages();
      });
    }
  });
});

// Buttons
document.getElementById('refreshBtn').onclick = loadPages;

// Custom stringify function that preserves field order
function customStringify(obj, indent = 2) {
  const spaces = ' '.repeat(indent);
  const spaces2 = ' '.repeat(indent * 2);
  
  if (Array.isArray(obj)) {
    const items = obj.map(item => customStringify(item, indent)).join(',\n');
    return `[\n${spaces}${items}\n${' '.repeat(indent - 2)}]`;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const orderedKeys = ['id', 'type', 'title', 'url', 'media_id', 'thumbnail_url', 'createdAt', 'categories'];
    const pairs = [];
    
    // Add ordered keys first
    orderedKeys.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        const value = typeof obj[key] === 'string' ? `'${obj[key]}'` : customStringify(obj[key], indent + 2);
        pairs.push(`${spaces}${key}: ${value}`);
      }
    });
    
    // Add any remaining keys
    Object.keys(obj).forEach(key => {
      if (!orderedKeys.includes(key)) {
        const value = typeof obj[key] === 'string' ? `'${obj[key]}'` : customStringify(obj[key], indent + 2);
        pairs.push(`${spaces}${key}: ${value}`);
      }
    });
    
    return `{\n${pairs.join(',\n')}\n${' '.repeat(indent - 2)}}`;
  }
  
  if (typeof obj === 'string') {
    return `'${obj}'`;
  }
  
  return JSON.stringify(obj);
}

document.getElementById('exportBtn').onclick = function() {
  chrome.storage.local.get(['visitedPages', 'currentMode'], (result) => {
    const pages = result.visitedPages || [];
    const mode = result.currentMode || 'instagram';
    
    // Filter pages by current mode
    const filteredPages = pages.filter(page => page.type === mode);
    
    const dataStr = customStringify(filteredPages);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}_data_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('📤 Exported', filteredPages.length, mode, 'items');
  });
};

document.getElementById('clearBtn').onclick = function() {
  if (confirm('Clear all pages?')) {
    chrome.storage.local.remove(['visitedPages'], () => {
      loadPages();
    });
  }
};

// Load on startup
loadSettings();
loadPages();

console.log('Popup ready');