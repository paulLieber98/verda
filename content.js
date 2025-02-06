// Configuration for supported e-commerce sites
const SUPPORTED_SITES = {
    'amazon': {
        productTitleSelector: '#productTitle, #title, .product-title-word-break, #titleSection',
        descriptionSelector: '#feature-bullets, #productDescription, #detailBullets_feature_div, .product-description-text, #productOverview_feature_div',
        materialSelector: '#productDetails_techSpec_section_1, #detailBullets_feature_div, .product-facts-table, #productDetails_db_sections, .fabric-type, #productOverview_feature_div, #technicalSpecifications_feature_div'
    },
    'hm': {
        productTitleSelector: 'h1.heading, h1[class*="heading"], h1[class*="title"], h1.item-heading, h1[class*="product-name"], h1[class*="product-title"]',
        descriptionSelector: '#description-text, button[id*="toggle-description"], [class*="description"]',
        materialSelector: '#section-materialsAndSuppliersAccordion, button[id*="toggle-materialsAndSuppliers"], .COMPOSITION, [class*="materials"], [class*="composition"]'
    },
    'zara': {
        productTitleSelector: '.product-detail-info h1, .product-name, .product-title, [data-qa-label="product-name-heading"], .product-detail-view__header',
        descriptionSelector: '.product-detail-description, .product-description, .description, [data-qa-label="product-details-description"], .product-detail-view__description',
        materialSelector: '.product-detail-info .composition-list, .product-composition, .composition, [data-qa-label="product-details-materials"], .product-detail-view__materials'
    },
    // Add more e-commerce sites as needed
};

// Enhanced keywords for sustainability scoring with detailed weights
const SUSTAINABLE_MATERIALS = [
    // Highly sustainable natural materials
    { material: 'organic cotton', weight: 20, category: 'natural' },
    { material: 'hemp', weight: 25, category: 'natural' },  // Hemp uses less water and pesticides
    { material: 'organic linen', weight: 22, category: 'natural' },
    { material: 'organic wool', weight: 18, category: 'natural' },
    
    // Recycled materials
    { material: 'recycled polyester', weight: 15, category: 'recycled' },
    { material: 'recycled cotton', weight: 18, category: 'recycled' },
    { material: 'recycled wool', weight: 16, category: 'recycled' },
    { material: 'deadstock', weight: 20, category: 'recycled' }, // Unused excess fabrics
    
    // Eco-friendly synthetics
    { material: 'tencel', weight: 18, category: 'eco-synthetic' },
    { material: 'lyocell', weight: 18, category: 'eco-synthetic' },
    { material: 'modal', weight: 15, category: 'eco-synthetic' },
    
    // Other sustainable materials
    { material: 'bamboo', weight: 15, category: 'natural' }, // Lower due to processing chemicals
    { material: 'cork', weight: 20, category: 'natural' },
    { material: 'piñatex', weight: 20, category: 'innovative' }, // Pineapple leather
    { material: 'mycelium', weight: 22, category: 'innovative' } // Mushroom leather
];

const UNSUSTAINABLE_MATERIALS = [
    // Highly unsustainable synthetics
    { material: 'polyester', weight: -25, category: 'synthetic' },
    { material: 'nylon', weight: -22, category: 'synthetic' },
    { material: 'acrylic', weight: -25, category: 'synthetic' },
    { material: 'polyurethane', weight: -25, category: 'synthetic' },
    { material: 'pvc', weight: -30, category: 'synthetic' }, // Most harmful
    
    // Problematic natural materials
    { material: 'conventional cotton', weight: -15, category: 'natural' }, // High water usage
    { material: 'rayon', weight: -18, category: 'semi-synthetic' },
    { material: 'viscose', weight: -18, category: 'semi-synthetic' },
    
    // Blends (usually harder to recycle)
    { material: 'poly blend', weight: -20, category: 'blend' },
    { material: 'synthetic blend', weight: -20, category: 'blend' },
    { material: 'spandex', weight: -15, category: 'blend' }, // Common in blends
    
    // Generic terms indicating potential issues
    { material: 'artificial', weight: -15, category: 'unknown' },
    { material: 'synthetic', weight: -15, category: 'unknown' }
];

// Manufacturing process indicators
const MANUFACTURING_INDICATORS = [
    // Certifications (highest weight due to verification)
    { indicator: 'gots certified', weight: 25, category: 'certification' },
    { indicator: 'fair trade certified', weight: 25, category: 'certification' },
    { indicator: 'bluesign certified', weight: 22, category: 'certification' },
    { indicator: 'cradle to cradle', weight: 25, category: 'certification' },
    { indicator: 'sa8000', weight: 20, category: 'certification' },
    
    // Production methods
    { indicator: 'handmade', weight: 15, category: 'production' },
    { indicator: 'small batch', weight: 12, category: 'production' },
    { indicator: 'made to order', weight: 15, category: 'production' },
    { indicator: 'zero waste', weight: 20, category: 'production' },
    
    // Labor practices
    { indicator: 'fair labor', weight: 18, category: 'labor' },
    { indicator: 'living wage', weight: 18, category: 'labor' },
    { indicator: 'ethically made', weight: 15, category: 'labor' },
    
    // Location (considering transport emissions)
    { indicator: 'locally made', weight: 15, category: 'location' },
    { indicator: 'made in usa', weight: 12, category: 'location' },
    { indicator: 'made in europe', weight: 12, category: 'location' }
];

// Carbon footprint indicators
const CARBON_INDICATORS = [
    // Carbon neutrality
    { indicator: 'carbon neutral', weight: 25, category: 'neutrality' },
    { indicator: 'climate neutral', weight: 25, category: 'neutrality' },
    { indicator: 'net zero', weight: 25, category: 'neutrality' },
    
    // Energy usage
    { indicator: 'renewable energy', weight: 20, category: 'energy' },
    { indicator: 'solar powered', weight: 18, category: 'energy' },
    { indicator: 'wind powered', weight: 18, category: 'energy' },
    
    // Transportation
    { indicator: 'local production', weight: 15, category: 'transport' },
    { indicator: 'plastic free shipping', weight: 12, category: 'transport' },
    { indicator: 'eco packaging', weight: 10, category: 'transport' },
    
    // Lifecycle
    { indicator: 'biodegradable', weight: 18, category: 'lifecycle' },
    { indicator: 'compostable', weight: 18, category: 'lifecycle' },
    { indicator: 'recyclable', weight: 15, category: 'lifecycle' }
];

// Water usage indicators
const WATER_INDICATORS = [
    // Water conservation
    { indicator: 'water recycling', weight: 25, category: 'conservation' },
    { indicator: 'closed loop', weight: 25, category: 'conservation' },
    { indicator: 'waterless dyeing', weight: 22, category: 'conservation' },
    { indicator: 'water efficient', weight: 20, category: 'conservation' },
    
    // Water pollution
    { indicator: 'non toxic dyes', weight: 18, category: 'pollution' },
    { indicator: 'azo-free', weight: 18, category: 'pollution' },
    { indicator: 'natural dyes', weight: 15, category: 'pollution' },
    
    // Farming methods
    { indicator: 'rain fed', weight: 20, category: 'farming' },
    { indicator: 'dry farming', weight: 20, category: 'farming' },
    { indicator: 'organic farming', weight: 15, category: 'farming' }
];

// Store the last analyzed URL and debounce timer
let lastAnalyzedUrl = '';
let lastAnalyzedTitle = '';
let debounceTimer = null;
const DEBOUNCE_DELAY = 500; // Reduced from 1000 to 500ms

// Cache DOM queries and analysis results
const cache = {
    elements: new Map(),
    analysisResults: new Map(),
    lastUpdate: 0
};

// Function to check if we should re-analyze
function shouldReanalyze(currentUrl, currentTitle) {
    // Don't re-analyze if URL and title haven't changed
    if (currentUrl === lastAnalyzedUrl && currentTitle === lastAnalyzedTitle) {
        return false;
    }
    
    // Update last analyzed values
    lastAnalyzedUrl = currentUrl;
    lastAnalyzedTitle = currentTitle;
    return true;
}

// Function to detect the current e-commerce platform with better URL handling
function detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    // Amazon detection
    if (hostname.includes('amazon')) {
        if (pathname.includes('/dp/') || pathname.includes('/gp/product/') || pathname.includes('/product/')) {
            return 'amazon';
        }
    }
    
    // H&M detection - simplified to work across all product pages
    if (hostname.includes('hm.com') || hostname.includes('www2.hm.com')) {
        // Match any product page URL pattern
        if (pathname.includes('/productpage') || 
            pathname.includes('/product') || 
            pathname.match(/\d+\.html/) ||
            (pathname.includes('/en_') && pathname.includes('html'))) {
            return 'hm';
        }
    }
    
    // Zara detection
    if (hostname.includes('zara.com')) {
        if (pathname.includes('/product/') || pathname.match(/\d+\/\d+/)) {
            return 'zara';
        }
    }
    
    return null;
}

// Enhanced findElement function with better H&M material extraction
function findElement(selectors, maxRetries = 5, retryDelay = 300) {
    return new Promise((resolve) => {
        let attempts = 0;

        const tryFind = () => {
            if (window.location.hostname.includes('hm.com')) {
                // Special handling for H&M product title
                if (selectors === SUPPORTED_SITES.hm.productTitleSelector) {
                    // Try to find the main product heading
                    const headings = document.getElementsByTagName('h1');
                    for (const heading of headings) {
                        const text = heading.textContent?.trim();
                        if (text && text.length > 0 && !text.includes('%')) {
                            return resolve(text);
                        }
                    }
                }
                
                // Special handling for H&M materials
                if (selectors === SUPPORTED_SITES.hm.materialSelector) {
                    const materialsButton = document.querySelector('button[id*="toggle-materialsAndSuppliers"]');
                    if (materialsButton) {
                        const materialsSection = document.querySelector('#section-materialsAndSuppliersAccordion');
                        if (materialsSection) {
                            const composition = materialsSection.querySelector('.COMPOSITION')?.textContent;
                            const additionalInfo = materialsSection.textContent.match(/(\d+%\s*[^,\n]+)/g);
                            
                            let materialText = '';
                            if (composition) materialText += composition + ' ';
                            if (additionalInfo) materialText += additionalInfo.join(' ');
                            
                            if (materialText.trim()) {
                                return resolve(materialText.trim());
                            }
                        }
                    }
                }

                // Try to find any element with the selectors
                const elements = document.querySelectorAll(selectors);
                for (const element of elements) {
                    const text = element.textContent?.trim();
                    if (text && text.length > 0) {
                        return resolve(text);
                    }
                }
            } else {
                // Normal element finding for other sites
                const elements = selectors.split(',').map(s => s.trim());
                for (const selector of elements) {
                    const element = document.querySelector(selector);
                    if (element?.textContent) {
                        const text = element.textContent.trim();
                        if (text.length > 0) {
                            return resolve(text);
                        }
                    }
                }
            }

            attempts++;
            if (attempts < maxRetries) {
                setTimeout(tryFind, retryDelay);
            } else {
                resolve(null);
            }
        };

        tryFind();
    });
}

// Enhanced product info extraction with better error handling
async function extractProductInfo(platform) {
    try {
        const selectors = SUPPORTED_SITES[platform];
        if (!selectors) return null;

        // Wait for all elements with retry logic
        const [title, description, materials] = await Promise.all([
            findElement(selectors.productTitleSelector),
            findElement(selectors.descriptionSelector),
            findElement(selectors.materialSelector)
        ]);

        // Only proceed if we have at least a title
        if (title) {
            return {
                title: title,
                description: description || '',
                materials: materials || '',
                url: window.location.href
            };
        }

        return null;
    } catch (error) {
        console.error('Error extracting product info:', error);
        return null;
    }
}

// Enhanced isProductPage function with more reliable detection
function isProductPage() {
    const platform = detectPlatform();
    if (!platform) return false;

    const selectors = SUPPORTED_SITES[platform];
    if (!selectors) return false;

    // For H&M specifically, check for any product indicators
    if (platform === 'hm') {
        // Common indicators across all H&M product pages
        const hmProductIndicators = [
            'button[id*="toggle-materialsAndSuppliers"]',
            'button[id*="toggle-description"]',
            '[class*="fa226d"]',
            '[class*="af6753"]',
            '[class*="d582fb"]',
            'button[class*="add"]',
            'select[data-testid*="size"]',
            '.COMPOSITION'
        ];

        for (const indicator of hmProductIndicators) {
            if (document.querySelector(indicator)) {
                return true;
            }
        }
    }

    // Generic product page detection
    const hasTitle = document.querySelector(selectors.productTitleSelector);
    const hasDescription = document.querySelector(selectors.descriptionSelector);
    const hasMaterials = document.querySelector(selectors.materialSelector);
    const hasPrice = document.querySelector('[class*="price"], .price-value, [data-price]');

    return hasTitle || (hasDescription && hasPrice) || (hasMaterials && hasPrice);
}

// Function to send analysis step update
function updateAnalysisStep(step) {
    chrome.runtime.sendMessage({
        type: 'ANALYSIS_STEP',
        step: step
    });
}

// Optimized ChatGPT analysis
async function getChatGPTAnalysis(productInfo) {
    // Check cache first
    const cacheKey = productInfo.url + productInfo.title;
    const cached = cache.analysisResults.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
        return cached.data;
    }

    try {
        updateAnalysisStep('Analyzing sustainability...');
        
        const prompt = `As a sustainability expert specializing in fashion and textiles, provide a concise sustainability analysis of this clothing item. Be direct and use simple language.

Product: ${productInfo.title}
Description: ${productInfo.description}
Materials: ${productInfo.materials}

Analyze and score each category from 0-100. For each score, provide a ONE-SENTENCE explanation focusing on the most important factor.

Scoring Guidelines:
0-20: Very Unsustainable (e.g., pure synthetic materials, clear environmental harm)
21-40: Unsustainable (e.g., conventional materials, no eco-initiatives)
41-60: Mixed Impact (e.g., blend of sustainable and unsustainable elements)
61-80: Sustainable (e.g., eco-friendly materials, good practices)
81-100: Highly Sustainable (e.g., organic materials, excellent practices)

Key Scoring Factors:
1. Materials (35%):
- Organic/recycled: +30-40
- Eco-friendly: +20-30
- Synthetic: -20-30

2. Manufacturing (30%):
- Local/certified: +20-30
- Standard: -10-20
- Fast fashion: -20-30

3. Carbon Footprint (20%):
- Low impact: +20-30
- High impact: -20-30

4. Water Usage (15%):
- Water efficient: +20-30
- Water intensive: -20-30

Format your response as JSON like this:
{
    "score": number,
    "materials": number,
    "materials_explanation": "One clear sentence about materials impact",
    "manufacturing": number,
    "manufacturing_explanation": "One clear sentence about production methods",
    "carbonFootprint": number,
    "carbonFootprint_explanation": "One clear sentence about emissions impact",
    "waterUsage": number,
    "waterUsage_explanation": "One clear sentence about water impact",
    "overall_explanation": "Two sentences maximum summarizing key sustainability aspects"
}

Keep all explanations short and focused on the most important factors.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.3, // Reduced for faster, more consistent responses
                max_tokens: 1000 // Reduced for faster responses
            })
        });

        if (!response.ok) throw new Error('ChatGPT API request failed');

        const data = await response.json();
        const analysis = JSON.parse(data.choices[0].message.content);

        const processedData = {
            score: Math.round(Number(analysis.score) || 35),
            materials: Math.round(Number(analysis.materials) || 30),
            manufacturing: Math.round(Number(analysis.manufacturing) || 40),
            carbonFootprint: Math.round(Number(analysis.carbonFootprint) || 35),
            waterUsage: Math.round(Number(analysis.waterUsage) || 35),
            explanations: {
                materials: analysis.materials_explanation || 'Analysis unavailable',
                manufacturing: analysis.manufacturing_explanation || 'Analysis unavailable',
                carbonFootprint: analysis.carbonFootprint_explanation || 'Analysis unavailable',
                waterUsage: analysis.waterUsage_explanation || 'Analysis unavailable',
                overall: analysis.overall_explanation || 'Analysis unavailable'
            },
            productInfo: productInfo
        };

        // Cache the result
        cache.analysisResults.set(cacheKey, {
            data: processedData,
            timestamp: Date.now()
        });

        return processedData;
    } catch (error) {
        console.error('Error in sustainability analysis:', error);
        return getDefaultAnalysis(productInfo);
    }
}

// Separate function for default analysis
function getDefaultAnalysis(productInfo) {
    const defaultData = {
        score: 35,
        materials: 30,
        manufacturing: 40,
        carbonFootprint: 35,
        waterUsage: 35,
        explanations: {
            materials: 'Unable to analyze materials',
            manufacturing: 'Standard production assumed',
            carbonFootprint: 'Average footprint assumed',
            waterUsage: 'Standard usage assumed',
            overall: 'Limited information available'
        },
        productInfo: productInfo
    };

    // Quick check for synthetics
    if (productInfo.materials?.toLowerCase().match(/polyester|nylon|acrylic|spandex|synthetic/)) {
        Object.assign(defaultData, {
            score: 25,
            materials: 20,
            manufacturing: 30,
            carbonFootprint: 25,
            waterUsage: 25
        });
    }

    return defaultData;
}

// Optimized page analysis
async function analyzePage() {
    try {
        const currentUrl = window.location.href;
        const platform = detectPlatform();
        
        if (!platform || !isProductPage()) {
            chrome.runtime.sendMessage({ type: 'PRODUCT_DATA', data: null });
            return null;
        }

        const productInfo = await extractProductInfo(platform);
        if (!productInfo?.title) {
            chrome.runtime.sendMessage({ type: 'PRODUCT_DATA', data: null });
            return null;
        }

        if (!shouldReanalyze(currentUrl, productInfo.title)) return null;

        const sustainabilityData = await getChatGPTAnalysis(productInfo);
        if (sustainabilityData) {
            chrome.runtime.sendMessage({
                type: 'PRODUCT_DATA',
                data: sustainabilityData
            });
        }
        
        return sustainabilityData;
    } catch (error) {
        console.error('Error in analyzePage:', error);
        chrome.runtime.sendMessage({ type: 'PRODUCT_DATA', data: null });
        return null;
    }
}

// Debounced function to handle page changes
function handlePageChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        analyzePage();
    }, DEBOUNCE_DELAY);
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANALYZE_PAGE') {
        handlePageChange();
        sendResponse({ success: true });
    }
    return true;
});

// Set up observers for page changes
let lastUrl = window.location.href;

// URL change observer
new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handlePageChange();
    }
}).observe(document, { subtree: true, childList: true });

// Product content change observer
const productObserver = new MutationObserver(() => {
    handlePageChange();
});

// Start observing with more specific targeting
function setupProductObserver() {
    const platform = detectPlatform();
    if (!platform || !SUPPORTED_SITES[platform]) return;

    const selectors = SUPPORTED_SITES[platform];
    const targets = [
        document.querySelector(selectors.productTitleSelector),
        document.querySelector(selectors.descriptionSelector),
        document.querySelector(selectors.materialSelector)
    ].filter(Boolean);

    targets.forEach(target => {
        productObserver.observe(target, {
            childList: true,
            characterData: true,
            subtree: true
        });
    });
}

// Initial setup
setTimeout(setupProductObserver, 1000); 