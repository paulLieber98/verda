// Function to check if URL is accessible
function isAccessibleUrl(url) {
    return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://') && !url.startsWith('edge://');
}

// Function to inject and run the content script
async function injectContentScript(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!isAccessibleUrl(tab.url)) {
            console.log('Skipping injection for restricted URL:', tab.url);
            return false;
        }

        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
        console.log('Content script injected successfully');
        return true;
    } catch (error) {
        console.error('Failed to inject content script:', error);
        return false;
    }
}

// Function to analyze the current tab
async function analyzeCurrentTab(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!isAccessibleUrl(tab.url)) {
            console.log('Skipping analysis for restricted URL:', tab.url);
            notifyAllPorts({
                type: 'PRODUCT_DATA',
                data: null,
                error: 'Cannot analyze this page type'
            });
            return;
        }

        // First try to inject the content script
        await injectContentScript(tabId);
        
        // Then send the analysis request
        try {
            await chrome.tabs.sendMessage(tabId, { 
                type: 'ANALYZE_PAGE',
                tabId: tabId
            });
            console.log('Analysis request sent to tab:', tabId);
        } catch (error) {
            console.error('Error sending analysis request:', error);
            notifyAllPorts({
                type: 'PRODUCT_DATA',
                data: null,
                error: 'Failed to analyze page'
            });
        }
    } catch (error) {
        console.error('Error in analyzeCurrentTab:', error);
        notifyAllPorts({
            type: 'PRODUCT_DATA',
            data: null,
            error: error.message
        });
    }
}

// Store active ports
let activePorts = new Set();

// Function to notify all active ports
function notifyAllPorts(message) {
    activePorts.forEach(port => {
        try {
            port.postMessage(message);
        } catch (error) {
            console.error('Error sending message to port:', error);
            activePorts.delete(port);
        }
    });
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked');
    
    try {
        // Open the side panel
        await chrome.sidePanel.open({ windowId: tab.windowId });
        
        if (!isAccessibleUrl(tab.url)) {
            console.log('Skipping analysis for restricted URL:', tab.url);
            notifyAllPorts({
                type: 'PRODUCT_DATA',
                data: null,
                error: 'Cannot analyze this page type'
            });
            return;
        }

        // Always analyze the current tab when icon is clicked
        await analyzeCurrentTab(tab.id);
    } catch (error) {
        console.error('Error in extension initialization:', error);
        notifyAllPorts({
            type: 'PRODUCT_DATA',
            data: null,
            error: error.message
        });
    }
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
    console.log('Background received message:', message.type);
    
    if (message.type === 'PRODUCT_DATA' || message.type === 'ANALYSIS_STEP') {
        notifyAllPorts(message);
    }

    // Always send a response
    sendResponse({ received: true });
    return true;
});

// Handle port connections
chrome.runtime.onConnect.addListener((port) => {
    console.log('New connection established:', port.name);
    activePorts.add(port);
    
    port.onDisconnect.addListener(() => {
        console.log('Connection disconnected:', port.name);
        activePorts.delete(port);
        if (chrome.runtime.lastError) {
            console.error('Connection error:', chrome.runtime.lastError);
        }
    });

    // Listen for messages from the port
    port.onMessage.addListener((message) => {
        console.log('Received port message:', message);
        if (message.type === 'REQUEST_ANALYSIS') {
            const tabId = message.tabId;
            if (tabId) {
                analyzeCurrentTab(tabId);
            }
        }
    });
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