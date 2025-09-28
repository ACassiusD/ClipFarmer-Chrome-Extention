// Simple popup
console.log('Popup loaded');

function loadPages() {
  chrome.storage.local.get(['visitedPages'], (result) => {
    const pages = result.visitedPages || [];
    console.log('Pages found:', pages.length);
    
    document.getElementById('count').textContent = `Pages: ${pages.length}`;
    document.getElementById('status').textContent = pages.length > 0 ? 'Active' : 'No pages visited';
    
    // Show recent pages
    const recentPages = pages.slice(-10).reverse();
    document.getElementById('pagesList').innerHTML = recentPages.map(page => 
      `<div class="page-item">
        <strong>${page.media_id || 'Unknown ID'}</strong><br>
        <small>ID: ${page.id}</small><br>
        <a href="${page.url}" target="_blank">${page.url}</a><br>
        <small>${new Date(page.createdAt).toLocaleString()}</small>
        ${page.thumbnail_url ? `<br><img src="${page.thumbnail_url}" style="max-width: 100%; height: auto; margin-top: 5px; border-radius: 4px;" alt="Thumbnail">` : '<br><small>No thumbnail</small>'}
      </div>`
    ).join('');
  });
}

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
  chrome.storage.local.get(['visitedPages'], (result) => {
    const pages = result.visitedPages || [];
    const dataStr = customStringify(pages);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram_reels_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('📤 Exported', pages.length, 'reels');
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
loadPages();

console.log('Popup ready');