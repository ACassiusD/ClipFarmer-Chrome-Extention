// Instagram & TikTok Logger - v9
console.log('Background script loaded');

// Check if URL is Instagram reel
function isInstagramReel(url) {
  return url.includes('/reels/') && url.includes('instagram.com');
}

// Check if URL is TikTok video
function isTikTokVideo(url) {
  return url.includes('tiktok.com') || url.includes('vt.tiktok.com');
}

// Extract post ID from URL
function extractPostId(url) {
  const match = url.match(/\/reels\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Generate unique ID
function generateUniqueId(mediaId, type) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type}-${mediaId}-${timestamp}-${randomSuffix}`;
}

// Parse TikTok URL
async function parseTikTokUrl(url) {
  const fullTiktokRegex = /(?:https?:\/\/(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/([^\/\?]+))/;
  const shortTiktokRegex = /(?:https?:\/\/vt\.tiktok\.com\/([^\/\?]+))/;
  
  const fullMatch = url.match(fullTiktokRegex);
  if (fullMatch) {
    const username = fullMatch[1];
    const postId = fullMatch[2];
    return { postId, username };
  }
  
  const shortMatch = url.match(shortTiktokRegex);
  if (shortMatch) {
    const shortId = shortMatch[1];
    
    // Try to resolve the short URL to get the full URL
    try {
      console.log('🔍 Resolving TikTok short URL:', url);
      const response = await fetch(url, { 
        method: 'HEAD',
        redirect: 'follow'
      });
      const resolvedUrl = response.url;
      console.log('🔍 Resolved URL:', resolvedUrl);
      
      // Parse the resolved URL
      const resolvedMatch = resolvedUrl.match(fullTiktokRegex);
      if (resolvedMatch) {
        const username = resolvedMatch[1];
        const postId = resolvedMatch[2];
        console.log('🔍 Resolved to full URL:', { username, postId });
        return { postId, username };
      }
    } catch (error) {
      console.log('⚠️ Failed to resolve TikTok short URL:', error);
    }
    
    // Fallback to short URL format
    return { postId: shortId };
  }
  
  return null;
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
    
    // Check if extension is enabled
    chrome.storage.local.get(['extensionEnabled', 'currentMode'], (settings) => {
      const isEnabled = settings.extensionEnabled !== false; // Default to true
      const mode = settings.currentMode || 'instagram';
      
      if (!isEnabled) {
        console.log('Extension disabled, skipping:', tab.url);
        return;
      }
      
      if (mode === 'instagram' && isInstagramReel(tab.url)) {
        console.log('INSTAGRAM REEL DETECTED:', tab.url);
        processInstagramReel(tab.url);
      } else if (mode === 'tiktok' && isTikTokVideo(tab.url)) {
        console.log('TIKTOK VIDEO DETECTED:', tab.url);
        processTikTokVideo(tab.url);
      } else {
        console.log('Not a supported URL for current mode, skipping:', tab.url);
      }
    });
  }
});

// Process Instagram reel
function processInstagramReel(url) {
  chrome.storage.local.get(['visitedPages'], (result) => {
    const pages = result.visitedPages || [];
    
    // Check if URL already exists
    const exists = pages.some(page => page.url === url);
    
    if (!exists) {
      // Extract post ID
      const postId = extractPostId(url);
      console.log('🆔 Instagram Logger: Post ID:', postId);
      
      // Fetch thumbnail
      fetchInstagramThumbnail(url).then(thumbnailUrl => {
        const uniqueId = generateUniqueId(postId, 'instagram');
        const createdAt = Date.now();
        
        const reelData = {
          categories: [],
          createdAt: createdAt,
          id: uniqueId,
          media_id: postId,
          thumbnail_url: thumbnailUrl,
          title: 'Instagram Reel',
          type: 'instagram',
          url: url
        };
        
        pages.push(reelData);
        
        chrome.storage.local.set({ visitedPages: pages }, () => {
          console.log('✅ Instagram Logger: Saved unique reel with thumbnail:', reelData);
        });
      });
    } else {
      console.log('Instagram reel already exists, skipping:', url);
    }
  });
}

// Convert full TikTok URL to mobile format (closer to short URL)
function convertToMobileUrl(fullUrl) {
  try {
    // Convert www.tiktok.com to m.tiktok.com
    const mobileUrl = fullUrl.replace('www.tiktok.com', 'm.tiktok.com');
    console.log('📱 Converted to mobile URL:', mobileUrl);
    return mobileUrl;
  } catch (error) {
    console.log('⚠️ Could not convert to mobile URL:', error);
    return fullUrl;
  }
}

// Process TikTok video
async function processTikTokVideo(url) {
  chrome.storage.local.get(['visitedPages'], (result) => {
    const pages = result.visitedPages || [];
    
    // Check if URL already exists
    const exists = pages.some(page => page.url === url);
    
    if (!exists) {
      parseTikTokUrl(url).then(tiktokData => {
        if (tiktokData) {
          const uniqueId = generateUniqueId(tiktokData.postId, 'tiktok');
          const createdAt = Date.now();
          
          const videoData = {
            categories: [],
            createdAt: createdAt,
            id: uniqueId,
            media_id: tiktokData.postId,
            title: 'TikTok Video',
            type: 'tiktok',
            url: url,
            username: tiktokData.username
          };
          
          pages.push(videoData);
          
          chrome.storage.local.set({ visitedPages: pages }, () => {
            console.log('✅ TikTok Logger: Saved unique video:', videoData);
            
            // Convert to mobile URL if it's a full URL
            if (url.includes('www.tiktok.com')) {
              const mobileUrl = convertToMobileUrl(url);
              if (mobileUrl !== url) {
                console.log('📱 Converting to mobile URL:', mobileUrl);
                
                // Update the stored data with the mobile URL
                const updatedVideoData = {
                  ...videoData,
                  url: mobileUrl
                };
                
                // Update the stored data
                const updatedPages = pages.map(page => 
                  page.id === videoData.id ? updatedVideoData : page
                );
                
                chrome.storage.local.set({ visitedPages: updatedPages }, () => {
                  console.log('✅ Updated with mobile URL:', updatedVideoData);
                });
              }
            }
          });
        } else {
          console.log('❌ TikTok Logger: Could not parse TikTok URL:', url);
        }
      });
    } else {
      console.log('TikTok video already exists, skipping:', url);
    }
  });
}

console.log('Background script ready');