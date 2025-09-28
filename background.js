// Instagram Reels Logger - v4
console.log('Background script loaded');

// Check if URL is Instagram reel
function isInstagramReel(url) {
  return url.includes('/reels/') && url.includes('instagram.com');
}

// Extract post ID from URL
function extractPostId(url) {
  const match = url.match(/\/reels\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Generate unique ID
function generateUniqueId(mediaId) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `instagram-${mediaId}-${timestamp}-${randomSuffix}`;
}

// Fetch Instagram thumbnail
async function fetchInstagramThumbnail(url) {
  try {
    console.log('🔄 Instagram Logger: Fetching thumbnail for:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      }
    });
    
    if (!response.ok) {
      console.log('⚠️ Instagram Logger: Page fetch failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Look for twitter:image meta tag first
    const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/);
    if (twitterImageMatch) {
      const thumbnailUrl = twitterImageMatch[1].replace(/&amp;/g, '&');
      console.log('✅ Instagram Logger: Thumbnail from twitter:image:', thumbnailUrl);
      return thumbnailUrl;
    }
    
    // Fallback to og:image
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch) {
      const thumbnailUrl = ogImageMatch[1].replace(/&amp;/g, '&');
      console.log('✅ Instagram Logger: Thumbnail from og:image:', thumbnailUrl);
      return thumbnailUrl;
    }
    
    console.log('❌ Instagram Logger: No thumbnail found');
    return null;
    
  } catch (error) {
    console.error('❌ Instagram Logger: Thumbnail fetch error:', error);
    return null;
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('PAGE VISITED:', tab.url);
    
    // Only process Instagram reels
    if (isInstagramReel(tab.url)) {
      console.log('INSTAGRAM REEL DETECTED:', tab.url);
      
      // Save to storage (no duplicates)
      chrome.storage.local.get(['visitedPages'], (result) => {
        const pages = result.visitedPages || [];
        
        // Check if URL already exists
        const exists = pages.some(page => page.url === tab.url);
        
        if (!exists) {
          // Extract post ID
          const postId = extractPostId(tab.url);
          console.log('🆔 Instagram Logger: Post ID:', postId);
          
          // Fetch thumbnail
          fetchInstagramThumbnail(tab.url).then(thumbnailUrl => {
            const uniqueId = generateUniqueId(postId);
            const createdAt = Date.now();
            
            const reelData = {
              categories: [],
              createdAt: createdAt,
              id: uniqueId,
              media_id: postId,
              thumbnail_url: thumbnailUrl,
              title: 'Instagram Reel',
              type: 'instagram',
              url: tab.url
            };
            
            pages.push(reelData);
            
            chrome.storage.local.set({ visitedPages: pages }, () => {
              console.log('✅ Instagram Logger: Saved unique reel with thumbnail:', reelData);
            });
          });
        } else {
          console.log('Reel already exists, skipping:', tab.url);
        }
      });
    } else {
      console.log('Not an Instagram reel, skipping:', tab.url);
    }
  }
});

console.log('Background script ready');