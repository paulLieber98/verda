// Function to inject and run the content script
async function injectContentScript(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
        console.log('Content script injected successfully');
    } catch (error) {
        console.error('Failed to inject content script:', error);
    }
}

// Function to analyze the current tab
async function analyzeCurrentTab(tabId) {
    try {
        await chrome.tabs.sendMessage(tabId, { type: 'ANALYZE_PAGE' });
        console.log('Analysis request sent to tab:', tabId);
    } catch (error) {
        console.error('Error sending analysis request:', error);
        // If the content script isn't ready, inject it and try again
        await injectContentScript(tabId);
        try {
            await chrome.tabs.sendMessage(tabId, { type: 'ANALYZE_PAGE' });
        } catch (retryError) {
            console.error('Retry failed:', retryError);
        }
    }
}

// Store for sustainability explanations
let sustainabilityExplanations = {};

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked');
    
    // Open the side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });
    
    // Analyze the current tab
    await analyzeCurrentTab(tab.id);
});

// Set up initial state when extension is installed or updated
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Extension installed/updated:', details.reason);
    
    // Enable the side panel for all URLs
    await chrome.sidePanel.setOptions({
        enabled: true
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'STORE_EXPLANATIONS') {
        // Store explanations for the current tab
        sustainabilityExplanations[sender.tab.id] = message.data;
    } else if (message.type === 'GET_EXPLANATIONS') {
        // Return explanations for the requesting tab
        sendResponse(sustainabilityExplanations[sender.tab.id] || null);
    }
    return true;
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if the URL matches our supported sites
        if (tab.url.match(/\.(amazon|hm|zara)\.com/)) {
            await injectContentScript(tabId);
            await analyzeCurrentTab(tabId);
        } else {
            // Notify side panel that we're on an unsupported site
            chrome.runtime.sendMessage({
                type: 'UNSUPPORTED_SITE'
            });
        }
    }
});

// Listen for tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    console.log('Tab activated:', tab.url);
    
    if (tab.url && tab.url.match(/\.(amazon|hm|zara)\.com/)) {
        await analyzeCurrentTab(tab.id);
    } else {
        // Notify side panel that we're on an unsupported site
        chrome.runtime.sendMessage({
            type: 'UNSUPPORTED_SITE'
        });
    }
}); 