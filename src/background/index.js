console.log('background is running')

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

// Listen for messages from your popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getAuthToken") {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      if (token) {
        // Send the token back to the popup
        sendResponse({ success: true, token: token });
      } else {
        sendResponse({ success: false, error: "Failed to get auth token" });
      }
    });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Optional: Log when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed/updated:", details.reason);
  console.log("Extension ID:", chrome.runtime.id);
});

// You can also add this to your popup for easy access
console.log("Current extension ID:", chrome.runtime.id);
