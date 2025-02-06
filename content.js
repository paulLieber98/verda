// Configuration for supported e-commerce sites
const SUPPORTED_SITES = {
    'amazon': {
        productTitleSelector: '#productTitle, #title, .product-title-word-break',
        descriptionSelector: '#feature-bullets, #productDescription, #detailBullets_feature_div, .product-description-text',
        materialSelector: '#productDetails_techSpec_section_1, #detailBullets_feature_div, .product-facts-table, #productDetails_db_sections, .fabric-type'
    },
    'hm': {
        productTitleSelector: '.product-item-headline',
        descriptionSelector: '.pdp-description-text',
        materialSelector: '.pdp-description-list, .product-composition-list'
    },
    'zara': {
        productTitleSelector: '.product-detail-info h1',
        descriptionSelector: '.product-detail-description',
        materialSelector: '.product-detail-info .composition-list'
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
const DEBOUNCE_DELAY = 1000; // 1 second delay

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

// Function to detect the current e-commerce platform
function detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('hm')) return 'hm';
    if (hostname.includes('zara')) return 'zara';
    return null;
}

// Function to extract product information
function extractProductInfo(platform) {
    try {
        const selectors = SUPPORTED_SITES[platform];
        if (!selectors) return null;

        const title = document.querySelector(selectors.productTitleSelector)?.textContent?.trim();
        const description = document.querySelector(selectors.descriptionSelector)?.textContent?.trim();
        const materials = document.querySelector(selectors.materialSelector)?.textContent?.trim();

        if (!title) return null;

        return {
            title: title || 'Unknown Product',
            description: description || '',
            materials: materials || '',
            url: window.location.href
        };
    } catch (error) {
        console.error('Error extracting product info:', error);
        return null;
    }
}

// Function to send analysis step update
function updateAnalysisStep(step) {
    chrome.runtime.sendMessage({
        type: 'ANALYSIS_STEP',
        step: step
    });
}

// Function to get ChatGPT analysis
async function getChatGPTAnalysis(productInfo) {
    try {
        updateAnalysisStep('Preparing sustainability analysis...');
        
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

        updateAnalysisStep('Analyzing product sustainability...');
        
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
                temperature: 0.5,  // Reduced temperature for more consistent scoring
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error('ChatGPT API request failed');
        }

        updateAnalysisStep('Processing sustainability data...');
        
        const data = await response.json();
        console.log('Raw GPT response:', data.choices[0].message.content);  // Debug log
        
        let analysis;
        try {
            analysis = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
            console.error('Error parsing GPT response:', parseError);
            throw new Error('Invalid response format from GPT');
        }

        // Validate the analysis object
        if (!analysis || typeof analysis !== 'object') {
            throw new Error('Invalid analysis object');
        }

        // Ensure all required scores exist and are numbers
        const requiredScores = ['score', 'materials', 'manufacturing', 'carbonFootprint', 'waterUsage'];
        for (const scoreKey of requiredScores) {
            if (!(scoreKey in analysis) || typeof analysis[scoreKey] !== 'number') {
                throw new Error(`Missing or invalid ${scoreKey} score`);
            }
        }

        // Process scores with validation
        const processScore = (score, category) => {
            const num = Number(score);
            if (isNaN(num)) {
                console.error(`Invalid ${category} score:`, score);
                throw new Error(`Invalid ${category} score`);
            }
            // Ensure the score is within bounds
            return Math.max(0, Math.min(100, num));
        };

        updateAnalysisStep('Finalizing results...');

        // Process all scores with validation
        const processedData = {
            score: processScore(analysis.score, 'overall'),
            materials: processScore(analysis.materials, 'materials'),
            manufacturing: processScore(analysis.manufacturing, 'manufacturing'),
            carbonFootprint: processScore(analysis.carbonFootprint, 'carbon'),
            waterUsage: processScore(analysis.waterUsage, 'water'),
            explanations: {
                materials: analysis.materials_explanation || 'Analysis unavailable',
                manufacturing: analysis.manufacturing_explanation || 'Analysis unavailable',
                carbonFootprint: analysis.carbonFootprint_explanation || 'Analysis unavailable',
                waterUsage: analysis.waterUsage_explanation || 'Analysis unavailable',
                overall: analysis.overall_explanation || 'Analysis unavailable'
            },
            productInfo: productInfo
        };

        // Validate final scores
        const hasAllDefaultScores = Object.values(processedData)
            .filter(val => typeof val === 'number')
            .every(score => score === 50);

        if (hasAllDefaultScores) {
            throw new Error('All scores defaulted to 50');
        }

        console.log('Processed sustainability data:', processedData);  // Debug log
        return processedData;

    } catch (error) {
        console.error('Error in sustainability analysis:', error);
        updateAnalysisStep('Error in analysis: ' + error.message);

        // Only default to 50 if we can't get any valid scores
        const defaultData = {
            score: 35,  // Default to slightly unsustainable for synthetic materials
            materials: 30,
            manufacturing: 40,
            carbonFootprint: 35,
            waterUsage: 35,
            explanations: {
                materials: 'Unable to analyze materials - likely synthetic based on product category',
                manufacturing: 'Standard mass production assumed',
                carbonFootprint: 'Typical manufacturing footprint assumed',
                waterUsage: 'Standard water usage patterns assumed',
                overall: 'Limited sustainability information available - scored conservatively'
            },
            productInfo: productInfo
        };

        // If we can detect synthetic materials in the product info, adjust scores
        const syntheticTerms = ['polyester', 'nylon', 'acrylic', 'spandex', 'synthetic'];
        const hasSynthetics = syntheticTerms.some(term => 
            productInfo.materials?.toLowerCase().includes(term) || 
            productInfo.description?.toLowerCase().includes(term)
        );

        if (hasSynthetics) {
            defaultData.score = 25;
            defaultData.materials = 20;
            defaultData.manufacturing = 30;
            defaultData.carbonFootprint = 25;
            defaultData.waterUsage = 25;
            defaultData.explanations.overall = 'Synthetic materials detected - lower sustainability score assigned';
        }

        return defaultData;
    }
}

// Function to analyze the page with debouncing
async function analyzePage() {
    try {
        const currentUrl = window.location.href;
        const platform = detectPlatform();
        
        if (!platform) {
            console.log('No supported platform detected');
            chrome.runtime.sendMessage({
                type: 'PRODUCT_DATA',
                data: null
            });
            return null;
        }

        // Get current product info
        const productInfo = extractProductInfo(platform);
        if (!productInfo) {
            console.log('No product detected');
            chrome.runtime.sendMessage({
                type: 'PRODUCT_DATA',
                data: null
            });
            return null;
        }

        // Check if we should re-analyze
        if (!shouldReanalyze(currentUrl, productInfo.title)) {
            console.log('Skipping analysis - same product');
            return null;
        }

        updateAnalysisStep('Starting sustainability analysis...');
        const sustainabilityData = await getChatGPTAnalysis(productInfo);
        console.log('Sustainability data:', sustainabilityData);
        
        chrome.runtime.sendMessage({
            type: 'PRODUCT_DATA',
            data: sustainabilityData
        });
        return sustainabilityData;
    } catch (error) {
        console.error('Error in analyzePage:', error);
        chrome.runtime.sendMessage({
            type: 'PRODUCT_DATA',
            data: null
        });
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