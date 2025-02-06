document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    const loadingElement = document.getElementById('loading');
    const noProductElement = document.getElementById('no-product');
    const contentElement = document.getElementById('content');
    const scoreElement = document.getElementById('score');
    const productTitleElement = document.getElementById('product-title');
    const debugInfo = document.getElementById('debug-info');
    const statusText = document.getElementById('status-text');
    const lastUpdate = document.getElementById('last-update');
    const loadingStep = document.getElementById('loading-step');

    // Enable debug info in development
    debugInfo.style.display = 'none';  // Hide debug info by default

    let hasReceivedData = false;
    let loadingTimeout = null;

    function updateLoadingStep(step) {
        if (loadingStep) {
            loadingStep.textContent = step;
        }
    }

    function updateStatus(status) {
        statusText.textContent = status;
        lastUpdate.textContent = new Date().toLocaleTimeString();
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
            
            // Animate the progress bar
            progressElement.style.transition = 'width 0.5s ease-out';
            progressElement.style.width = '0%';
            
            // Use requestAnimationFrame for smooth animation
            requestAnimationFrame(() => {
                progressElement.style.width = `${roundedScore}%`;
                
                // Update color based on score
                if (roundedScore >= 80) {
                    progressElement.style.backgroundColor = '#2ecc71'; // Green
                } else if (roundedScore >= 60) {
                    progressElement.style.backgroundColor = '#f1c40f'; // Yellow
                } else {
                    progressElement.style.backgroundColor = '#e74c3c'; // Red
                }
            });

            // Update explanation if available
            if (explanationElement && explanation) {
                explanationElement.textContent = explanation;
            }
        }
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

        // Update loading steps
        let stepIndex = 0;
        const loadingSteps = [
            'Gathering product information...',
            'Analyzing materials...',
            'Evaluating manufacturing process...',
            'Calculating environmental impact...',
            'Generating sustainability score...'
        ];

        // Cycle through loading steps
        const stepInterval = setInterval(() => {
            if (!hasReceivedData) {
                stepIndex = (stepIndex + 1) % loadingSteps.length;
                updateLoadingStep(loadingSteps[stepIndex]);
            } else {
                clearInterval(stepInterval);
            }
        }, 3000);
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

    // Listen for messages from the content script and background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'PRODUCT_DATA':
                updateSustainabilityInfo(message.data);
                break;
            case 'UNSUPPORTED_SITE':
                hasReceivedData = true;
                clearTimeout(loadingTimeout);
                updateStatus('Unsupported website');
                showNoProduct();
                break;
            case 'ANALYSIS_STEP':
                updateLoadingStep(message.step);
                break;
        }
    });

    // Function to request analysis from content script
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

            // Send message to content script
            chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    updateStatus('Error: ' + chrome.runtime.lastError.message);
                    showNoProduct();
                }
            });
        } catch (error) {
            console.error('Error requesting analysis:', error);
            updateStatus('Error: ' + error.message);
            showNoProduct();
        }
    }

    // Initial request
    requestAnalysis();

    // Set up automatic refresh on tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {
            requestAnalysis();
        }
    });

    // Set up automatic refresh on tab activation
    chrome.tabs.onActivated.addListener(() => {
        requestAnalysis();
    });
}); 