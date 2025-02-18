document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    const loadingElement = document.getElementById('loading');
    const noProductElement = document.getElementById('no-product');
    const contentElement = document.getElementById('content');
    const productTitleElement = document.getElementById('product-title');
    const scoreElement = document.getElementById('score');
    const statusElement = document.getElementById('status-text');
    const lastUpdateElement = document.getElementById('last-update');

    let hasReceivedData = false;
    let loadingTimeout = null;
    let port = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    function updateStatus(status) {
        if (statusElement) {
            statusElement.textContent = status;
            lastUpdateElement.textContent = new Date().toLocaleTimeString();
        }
    }

    function updateLoadingStep(step) {
        const loadingStepElement = document.getElementById('loading-step');
        if (loadingStepElement) {
            loadingStepElement.textContent = step;
        }
    }

    // Function to establish connection with background script
    function connectToBackground() {
        try {
            port = chrome.runtime.connect({ name: 'sidepanel-connection' });
            console.log('Connected to background script');
            
            port.onMessage.addListener(handleMessage);
            
            port.onDisconnect.addListener(() => {
                console.log('Disconnected from background script');
                port = null;
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
                    setTimeout(connectToBackground, 1000);
                } else {
                    console.error('Max retries reached, showing error state');
                    showNoProduct();
                    updateStatus('Connection failed - please refresh the page');
                }
            });

            // Reset retry count on successful connection
            retryCount = 0;
            
            // Request initial analysis
            requestAnalysis();
        } catch (error) {
            console.error('Error connecting to background:', error);
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(connectToBackground, 1000);
            }
        }
    }

    // Function to handle incoming messages
    function handleMessage(message) {
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'PRODUCT_DATA':
                clearTimeout(loadingTimeout);
                if (message.error) {
                    console.error('Analysis error:', message.error);
                    updateStatus('Error: ' + message.error);
                    showNoProduct();
                } else if (message.data) {
                    hasReceivedData = true;
                    updateSustainabilityInfo(message.data);
                } else {
                    showNoProduct();
                }
                break;
            case 'ANALYSIS_STEP':
                updateLoadingStep(message.step);
                break;
            case 'UNSUPPORTED_SITE':
                showNoProduct();
                updateStatus('Unsupported website');
                break;
        }
    }

    // Function to update the sustainability score and factors
    function updateSustainabilityInfo(data) {
        hasReceivedData = true;
        clearTimeout(loadingTimeout);
        updateStatus('Received product data');
        
        if (!data) {
            showNoProduct();
            return;
        }

        // Update product title
        if (data.productInfo && data.productInfo.title) {
            productTitleElement.textContent = data.productInfo.title;
        }

        // Update main score
        scoreElement.textContent = Math.round(data.score);
        updateScoreColors(); // Update color coding

        // Update factor scores and progress bars
        updateFactor('materials', data.materials, data.explanations.materials);
        updateFactor('manufacturing', data.manufacturing, data.explanations.manufacturing);
        updateFactor('carbon', data.carbonFootprint, data.explanations.carbonFootprint);
        updateFactor('water', data.waterUsage, data.explanations.waterUsage);

        // Update overall explanation
        const overallExplanationText = document.getElementById('overall-explanation-text');
        if (overallExplanationText && data.explanations.overall) {
            overallExplanationText.textContent = data.explanations.overall;
        }

        showContent();
    }

    // Helper function to update a single factor's score and progress bar
    function updateFactor(factorId, score, explanation) {
        const scoreElement = document.getElementById(`${factorId}-score`);
        const progressElement = document.getElementById(`${factorId}-progress`);
        const explanationElement = document.getElementById(`${factorId}-explanation`);
        
        if (scoreElement && progressElement) {
            const roundedScore = Math.round(score);
            scoreElement.textContent = roundedScore;
            scoreElement.setAttribute('data-score', getScoreCategory(roundedScore));
            
            // Animate the progress bar
            progressElement.style.transition = 'width 0.5s ease-out';
            progressElement.style.width = '0%';
            
            requestAnimationFrame(() => {
                progressElement.style.width = `${roundedScore}%`;
                progressElement.setAttribute('data-score', getScoreCategory(roundedScore));
            });

            // Update explanation if available
            if (explanationElement && explanation) {
                explanationElement.textContent = explanation;
                explanationElement.setAttribute('data-score', getScoreCategory(roundedScore));
            }
        }
    }

    function getScoreCategory(score) {
        if (score >= 70) return 'good';
        if (score >= 40) return 'moderate';
        return 'bad';
    }

    // Function to show loading state
    function showLoading() {
        updateStatus('Loading...');
        loadingElement.style.display = 'block';
        noProductElement.style.display = 'none';
        contentElement.style.display = 'none';
        updateLoadingStep('Gathering product information...');

        // Set a timeout to show no-product state if loading takes too long
        clearTimeout(loadingTimeout);
        loadingTimeout = setTimeout(() => {
            if (!hasReceivedData) {
                showNoProduct();
                updateStatus('Loading timed out');
            }
        }, 30000); // 30 second timeout
    }

    // Function to show no product state
    function showNoProduct() {
        updateStatus('No product found');
        loadingElement.style.display = 'none';
        noProductElement.style.display = 'block';
        contentElement.style.display = 'none';
    }

    // Function to show content
    function showContent() {
        updateStatus('Showing product sustainability info');
        loadingElement.style.display = 'none';
        noProductElement.style.display = 'none';
        contentElement.style.display = 'block';
    }

    // Function to request analysis from background script
    async function requestAnalysis() {
        updateStatus('Requesting analysis...');
        showLoading();
        hasReceivedData = false;

        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                updateStatus('No active tab found');
                showNoProduct();
                return;
            }

            // Send analysis request through port
            if (port) {
                port.postMessage({ 
                    type: 'REQUEST_ANALYSIS',
                    tabId: tab.id
                });
                
                // Set a timeout to show no-product state if loading takes too long
                clearTimeout(loadingTimeout);
                loadingTimeout = setTimeout(() => {
                    if (!hasReceivedData) {
                        showNoProduct();
                        updateStatus('Analysis timed out - please try again');
                    }
                }, 15000); // 15 second timeout
            } else {
                throw new Error('No connection to background script');
            }
        } catch (error) {
            console.error('Error requesting analysis:', error);
            updateStatus('Error: ' + error.message);
            showNoProduct();
        }
    }

    // Establish initial connection
    connectToBackground();

    // Set up automatic refresh on tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {
            requestAnalysis();
        }
    });
}); 