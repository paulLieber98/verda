// Configuration for supported e-commerce sites and global variables
const SUPPORTED_SITES = {
    'amazon': {
        productTitleSelector: '#productTitle, #title, .product-title-word-break, #titleSection',
        descriptionSelector: '.a-unordered-list, .product-facts-detail, .a-fixed-left-grid-inner, #feature-bullets, #productDescription, #detailBullets_feature_div',
        materialSelector: '#productDetails_techSpec_section_1, #detailBullets_feature_div, .product-facts-table, #productDetails_db_sections, .fabric-type, #productOverview_feature_div, #technicalSpecifications_feature_div'
    },
    'hm': {
        productTitleSelector: 'h1[class*="fa226d"], h1[class*="af6753"], h1[class*="d582fb"], .product-input-label, .product-detail-title',
        descriptionSelector: '[class*="cd5432"], [class*="b39f93"], [class*="fddca0"], [class*="description"], [class*="details"], [class*="product-text"]',
        materialSelector: '#toggle-materialsAndSuppliersAccordion, #section-materialsAndSuppliersAccordion, [class*="c6d0f7"], [class*="bc4534"], [class*="d873b0"]'
    },
    'zara': {
        productTitleSelector: 'h1[class*="product-name"], h1[class*="product-detail"], h1[class*="title"], [data-qa-heading="product-name"], [data-qa-label="product-name"], [data-qa-label="title"]',
        descriptionSelector: '[data-qa-label="description"], [data-qa-label="product-description"], [data-qa-label="product-details-description"], [class*="description"], [class*="details"]',
        materialSelector: '[data-qa-label="composition-section"], [data-qa-label="materials"], [data-qa-label="product-details-materials"], [data-qa-label="composition"], [class*="composition"], [class*="materials"]'
    }
};

const cache = {
    elements: new Map(),
    analysisResults: new Map(),
    lastUpdate: 0
};

let lastAnalyzedUrl = '';
let lastAnalyzedTitle = '';
let debounceTimer = null;
const DEBOUNCE_DELAY = 500;

// Enhanced keywords for sustainability scoring with detailed weights
const SUSTAINABLE_MATERIALS = [
    // Highly sustainable natural materials
    { material: 'organic cotton', weight: 20, category: 'natural', waterImpact: -10, carbonImpact: -5 },
    { material: 'hemp', weight: 25, category: 'natural', waterImpact: -15, carbonImpact: -10 },
    { material: 'organic linen', weight: 22, category: 'natural', waterImpact: -12, carbonImpact: -8 },
    { material: 'organic wool', weight: 18, category: 'natural', waterImpact: -5, carbonImpact: -5 },
    
    // Recycled materials
    { material: 'recycled polyester', weight: 15, category: 'recycled', waterImpact: -8, carbonImpact: -12 },
    { material: 'recycled cotton', weight: 18, category: 'recycled', waterImpact: -10, carbonImpact: -8 },
    { material: 'recycled wool', weight: 16, category: 'recycled', waterImpact: -8, carbonImpact: -8 },
    { material: 'deadstock', weight: 20, category: 'recycled', waterImpact: -15, carbonImpact: -15 },
    
    // Eco-friendly synthetics
    { material: 'tencel', weight: 18, category: 'eco-synthetic', waterImpact: -10, carbonImpact: -8 },
    { material: 'lyocell', weight: 18, category: 'eco-synthetic', waterImpact: -10, carbonImpact: -8 },
    { material: 'modal', weight: 15, category: 'eco-synthetic', waterImpact: -8, carbonImpact: -6 },
    
    // Other sustainable materials
    { material: 'bamboo', weight: 15, category: 'natural', waterImpact: -5, carbonImpact: -8 },
    { material: 'cork', weight: 20, category: 'natural', waterImpact: -12, carbonImpact: -10 },
    { material: 'piñatex', weight: 20, category: 'innovative', waterImpact: -10, carbonImpact: -12 },
    { material: 'mycelium', weight: 22, category: 'innovative', waterImpact: -15, carbonImpact: -15 }
];

const UNSUSTAINABLE_MATERIALS = [
    // Highly unsustainable synthetics
    { material: 'polyester', weight: -25, category: 'synthetic', waterImpact: 20, carbonImpact: 25 },
    { material: 'nylon', weight: -22, category: 'synthetic', waterImpact: 18, carbonImpact: 22 },
    { material: 'acrylic', weight: -25, category: 'synthetic', waterImpact: 20, carbonImpact: 25 },
    { material: 'polyurethane', weight: -25, category: 'synthetic', waterImpact: 22, carbonImpact: 25 },
    { material: 'pvc', weight: -30, category: 'synthetic', waterImpact: 25, carbonImpact: 30 },
    
    // Problematic natural materials
    { material: 'conventional cotton', weight: -15, category: 'natural', waterImpact: 25, carbonImpact: 15 },
    { material: 'rayon', weight: -18, category: 'semi-synthetic', waterImpact: 20, carbonImpact: 18 },
    { material: 'viscose', weight: -18, category: 'semi-synthetic', waterImpact: 20, carbonImpact: 18 },
    
    // Blends (usually harder to recycle)
    { material: 'poly blend', weight: -20, category: 'blend', waterImpact: 15, carbonImpact: 20 },
    { material: 'synthetic blend', weight: -20, category: 'blend', waterImpact: 15, carbonImpact: 20 },
    { material: 'spandex', weight: -15, category: 'blend', waterImpact: 12, carbonImpact: 15 },
    
    // Generic terms indicating potential issues
    { material: 'artificial', weight: -15, category: 'unknown', waterImpact: 15, carbonImpact: 15 },
    { material: 'synthetic', weight: -15, category: 'unknown', waterImpact: 15, carbonImpact: 15 }
];

// Manufacturing practice indicators with weights and categories
const MANUFACTURING_INDICATORS = [
    // Certifications
    { indicator: 'gots certified', weight: 25, category: 'certification' },
    { indicator: 'fair trade', weight: 20, category: 'certification' },
    { indicator: 'bluesign', weight: 20, category: 'certification' },
    { indicator: 'cradle to cradle', weight: 25, category: 'certification' },
    { indicator: 'oeko-tex', weight: 15, category: 'certification' },
    
    // Production methods
    { indicator: 'zero waste', weight: 20, category: 'production' },
    { indicator: 'closed loop', weight: 25, category: 'production' },
    { indicator: 'water saving', weight: 15, category: 'production' },
    { indicator: 'renewable energy', weight: 20, category: 'production' },
    { indicator: 'local production', weight: 15, category: 'production' },
    
    // Ethical practices
    { indicator: 'living wage', weight: 15, category: 'ethical' },
    { indicator: 'ethical production', weight: 15, category: 'ethical' },
    { indicator: 'sustainable factory', weight: 15, category: 'ethical' },
    
    // Environmental initiatives
    { indicator: 'carbon neutral', weight: 20, category: 'environmental' },
    { indicator: 'biodegradable', weight: 15, category: 'environmental' },
    { indicator: 'recycling program', weight: 15, category: 'environmental' },
    { indicator: 'eco friendly', weight: 10, category: 'environmental' },
    { indicator: 'sustainable packaging', weight: 10, category: 'environmental' }
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

// Function to check if we should re-analyze
function shouldReanalyze(currentUrl, currentTitle) {
    // For Zara, always reanalyze when URL changes as they use dynamic page transitions
    if (window.location.hostname.includes('zara.com')) {
        const urlChanged = currentUrl !== lastAnalyzedUrl;
        if (urlChanged) {
            // Clear the cache for Zara when URL changes
            cache.analysisResults.clear();
            lastAnalyzedUrl = currentUrl;
            lastAnalyzedTitle = currentTitle;
            return true;
        }
    }

    // For other sites, use the existing logic
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
    
    console.log('Detecting platform for:', hostname, pathname);

    // Amazon detection
    if (hostname.includes('amazon')) {
        const isProductPage = pathname.includes('/dp/') || 
                            pathname.includes('/gp/product/') || 
                            pathname.includes('/product/') ||
                            pathname.match(/\/[A-Z0-9]{10}/);
        if (isProductPage) {
            console.log('Detected Amazon product page');
            return 'amazon';
        }
    }
    
    // H&M detection
    if (hostname.includes('hm.com') || hostname.includes('www2.hm.com')) {
        const isProductPage = pathname.includes('/productpage') || 
                            pathname.includes('/product') || 
                            pathname.match(/\d+\.html/) ||
                            (pathname.includes('/en_') && pathname.includes('html'));
        if (isProductPage) {
            console.log('Detected H&M product page');
            return 'hm';
        }
    }
    
    // Zara detection
    if (hostname.includes('zara.com')) {
        const isProductPage = pathname.match(/\/\d+\/\d+/) ||
                            pathname.includes('/product/') ||
                            pathname.match(/-p\d+\.html/) ||
                            (pathname.includes('.html') && pathname.includes('?v1=')) ||
                            document.querySelector('[data-qa-label="product-detail"]') !== null;
        
        if (isProductPage) {
            console.log('Detected Zara product page');
            return 'zara';
        }
    }
    
    console.log('No supported platform detected');
    return null;
}

// Enhanced findElement function with better material extraction
async function findElement(selectors, maxRetries = 5, retryDelay = 300) {
    return new Promise((resolve) => {
        let retryCount = 0;

        const tryFind = () => {
            let selectorList = Array.isArray(selectors) ? selectors : selectors.split(',');
            console.log('Trying selectors:', selectorList);
            
            for (let selector of selectorList) {
                selector = selector.trim();
                try {
                    const elements = document.querySelectorAll(selector);
                    console.log(`Found ${elements.length} elements for selector:`, selector);
                    
                    if (elements.length > 0) {
                        // Combine text content from all matching elements
                        const combinedText = Array.from(elements)
                            .map(el => {
                                // Get visible text content
                                const text = Array.from(el.childNodes)
                                    .filter(node => {
                                        // Only include text nodes and elements that are not hidden
                                        return (node.nodeType === 3 || 
                                               (node.nodeType === 1 && 
                                                window.getComputedStyle(node).display !== 'none' &&
                                                window.getComputedStyle(node).visibility !== 'hidden'));
                                    })
                                    .map(node => node.textContent)
                                    .join(' ');
                                return text.trim();
                            })
                            .filter(text => text.length > 0)
                            .join(' ');

                        if (combinedText.length > 0) {
                            console.log('Found text content:', combinedText.substring(0, 100) + '...');
                            resolve(combinedText);
                            return;
                        }
                    }
                } catch (error) {
                    console.warn(`Error finding element with selector ${selector}:`, error);
                }
            }

            retryCount++;
            if (retryCount < maxRetries) {
                console.log(`Retry ${retryCount}/${maxRetries} after ${retryDelay}ms`);
                setTimeout(tryFind, retryDelay);
            } else {
                console.log('Max retries reached, no elements found');
                resolve('');
            }
        };

        tryFind();
    });
}

// Enhanced product info extraction with better material analysis
async function extractProductInfo(platform) {
    console.log('Extracting product info for platform:', platform);
    try {
        const selectors = SUPPORTED_SITES[platform];
        if (!selectors) {
            console.error('No selectors found for platform:', platform);
            return null;
        }

        console.log('Using selectors:', selectors);

        // Wait for all elements with retry logic
        const [titleElement, descriptionElement, materialsElement] = await Promise.all([
            findElement(selectors.productTitleSelector),
            findElement(selectors.descriptionSelector),
            findElement(selectors.materialSelector)
        ]);

        // Process materials text to extract percentages
        const materialsText = materialsElement || '';
        const title = titleElement?.trim() || '';
        
        // Combine materials text with title for analysis
        const combinedText = `${materialsText} ${title}`;
        const materialBreakdown = analyzeMaterialComposition(combinedText);

        // Extract material keywords from title
        const titleMaterials = extractMaterialsFromTitle(title);
        
        // Combine material breakdowns, avoiding duplicates
        const combinedMaterials = [...materialBreakdown];
        titleMaterials.forEach(material => {
            if (!combinedMaterials.some(m => m.material === material.material)) {
                combinedMaterials.push(material);
            }
        });

        const productInfo = {
            title: title,
            description: descriptionElement?.trim() || '',
            materials: materialsText.trim(),
            materialBreakdown: combinedMaterials,
            titleMaterials: titleMaterials,
            url: window.location.href,
            platform: platform
        };

        console.log('Extracted product info:', productInfo);
        return productInfo;
    } catch (error) {
        console.error('Error extracting product info:', error);
        return null;
    }
}

// New function to extract materials from title
function extractMaterialsFromTitle(title) {
    const titleLower = title.toLowerCase();
    const materials = [];
    
    // Common material patterns in titles
    const patterns = [
        /(\d+)%\s*([a-zA-Z]+)/g,  // "80% Cotton"
        /([a-zA-Z]+)\s+blend/g,    // "Cotton blend"
        /made (?:of|from|with)\s+([a-zA-Z]+)/g,  // "Made of Cotton"
        /([a-zA-Z]+)\s+(?:shirt|dress|pants|jacket|sweater|hoodie)/g  // "Cotton shirt"
    ];

    // Check for exact material mentions in title
    [...SUSTAINABLE_MATERIALS, ...UNSUSTAINABLE_MATERIALS].forEach(item => {
        if (titleLower.includes(item.material)) {
            materials.push({
                material: item.material,
                percentage: 100,  // Assume 100% if mentioned in title without percentage
                fromTitle: true
            });
        }
    });

    // Try pattern matching
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(titleLower)) !== null) {
            const material = match[1] || match[2];
            // Skip common non-material words
            if (['the', 'and', 'with', 'for', 'men', 'women'].includes(material)) continue;
            
            // Check if it's a known material
            const isKnownMaterial = [...SUSTAINABLE_MATERIALS, ...UNSUSTAINABLE_MATERIALS]
                .some(item => material.includes(item.material));
            
            if (isKnownMaterial && !materials.some(m => m.material === material)) {
                materials.push({
                    material: material,
                    percentage: match[1] ? parseInt(match[1]) : 100,
                    fromTitle: true
                });
            }
        }
    });

    return materials;
}

// New function to analyze material composition with better pattern matching
function analyzeMaterialComposition(materialsText) {
    const composition = [];
    const text = materialsText.toLowerCase();
    
    // Multiple patterns to match different material formats
    const patterns = [
        /(\d+)%\s*([a-zA-Z\s]+?)(?=\d+%|$)/g,  // "80% Cotton, 20% Polyester"
        /([a-zA-Z\s]+?):\s*(\d+)%/g,           // "Cotton: 80%, Polyester: 20%"
        /made (?:of|from|with)\s+(\d+)%\s+([a-zA-Z\s]+)/g  // "Made of 80% Cotton"
    ];

    console.log('Analyzing materials text:', text);

    // Try each pattern
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const percentage = parseInt(match[1] || match[2]);
            const material = (match[2] || match[1]).trim().toLowerCase();
            
            // Skip invalid matches
            if (isNaN(percentage) || !material) continue;
            
            composition.push({ material, percentage });
            console.log('Found material:', { material, percentage });
        }
    }

    // If no percentages found, try to extract just materials
    if (composition.length === 0) {
        const materialMentions = [];
        
        // Check for sustainable materials
        SUSTAINABLE_MATERIALS.forEach(item => {
            if (text.includes(item.material)) {
                materialMentions.push({ material: item.material, type: 'sustainable' });
            }
        });
        
        // Check for unsustainable materials
        UNSUSTAINABLE_MATERIALS.forEach(item => {
            if (text.includes(item.material)) {
                materialMentions.push({ material: item.material, type: 'unsustainable' });
            }
        });

        if (materialMentions.length > 0) {
            // Estimate percentages based on mention order
            const totalMaterials = materialMentions.length;
            materialMentions.forEach((mention, index) => {
                const estimatedPercentage = Math.round(100 / totalMaterials);
                composition.push({
                    material: mention.material,
                    percentage: estimatedPercentage,
                    estimated: true
                });
            });
        }
    }

    return composition;
}

// Enhanced isProductPage function with more reliable detection
function isProductPage() {
    const platform = detectPlatform();
    console.log('Checking if product page for platform:', platform);

    if (!platform) {
        console.log('Not a supported platform');
        return false;
    }

    const selectors = SUPPORTED_SITES[platform];
    if (!selectors) {
        console.log('No selectors found for platform');
        return false;
    }

    // Platform-specific checks
    switch (platform) {
        case 'zara':
            const zaraIndicators = [
                '[data-qa-label="product-name-header"]',
                '[data-qa-label="product-detail"]',
                '[data-qa-label="composition"]',
                '[data-qa-action="size-selector"]',
                '[data-qa-action="add-to-cart"]',
                '.product-detail',
                '.product-detail-info',
                '[data-qa-label="price"]',
                '.price__amount'
            ];

            const zaraMatches = zaraIndicators.filter(selector => 
                document.querySelector(selector) !== null
            ).length;
            console.log('Zara indicators found:', zaraMatches);
            if (zaraMatches >= 2) return true;
            break;

        case 'hm':
            const hmIndicators = [
                'button[id*="toggle-materialsAndSuppliers"]',
                'button[id*="toggle-description"]',
                '[class*="fa226d"]',
                '[class*="af6753"]',
                '[class*="d582fb"]',
                'button[class*="add"]',
                'select[data-testid*="size"]',
                '.COMPOSITION',
                '[class*="product-detail"]',
                '[class*="product-description"]'
            ];

            const hmMatches = hmIndicators.filter(selector => 
                document.querySelector(selector) !== null
            ).length;
            console.log('H&M indicators found:', hmMatches);
            if (hmMatches >= 1) return true;
            break;

        case 'amazon':
            const amazonIndicators = [
                '#productTitle',
                '#title',
                '.product-title-word-break',
                '#titleSection',
                '#feature-bullets',
                '#productDescription',
                '#buybox',
                '#addToCart',
                '#price'
            ];

            const amazonMatches = amazonIndicators.filter(selector => 
                document.querySelector(selector) !== null
            ).length;
            console.log('Amazon indicators found:', amazonMatches);
            if (amazonMatches >= 2) return true;
            break;
    }

    // Generic checks as fallback
    const hasTitle = document.querySelector(selectors.productTitleSelector) !== null;
    const hasDescription = document.querySelector(selectors.descriptionSelector) !== null;
    const hasMaterials = document.querySelector(selectors.materialSelector) !== null;
    const hasPrice = document.querySelector('[data-qa-label="price"], [class*="price"], .price-value, [data-price]') !== null;

    console.log('Generic checks:', { hasTitle, hasDescription, hasMaterials, hasPrice });
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
        
        // Validate input data
        if (!productInfo.title || !productInfo.materials) {
            console.warn('Insufficient product information for analysis');
            return getDefaultAnalysis(productInfo);
        }

        const prompt = `As a sustainability expert specializing in fashion and textiles, provide a concise sustainability analysis of this clothing item. Be direct and use simple language.

Product: ${productInfo.title}
Description: ${productInfo.description}
Materials: ${productInfo.materials}
Platform: ${productInfo.platform}

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
}`;

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
                temperature: 0.3,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            console.error('ChatGPT API request failed:', response.status, response.statusText);
            throw new Error('ChatGPT API request failed');
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response format:', data);
            throw new Error('Invalid API response format');
        }

        let analysis;
        try {
            analysis = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
            console.error('Failed to parse API response:', parseError);
            throw new Error('Failed to parse API response');
        }

        // Validate analysis data
        if (!analysis.score || !analysis.materials || !analysis.manufacturing || 
            !analysis.carbonFootprint || !analysis.waterUsage) {
            console.error('Incomplete analysis data:', analysis);
            throw new Error('Incomplete analysis data');
        }

        const processedData = {
            score: Math.round(Number(analysis.score)),
            materials: Math.round(Number(analysis.materials)),
            manufacturing: Math.round(Number(analysis.manufacturing)),
            carbonFootprint: Math.round(Number(analysis.carbonFootprint)),
            waterUsage: Math.round(Number(analysis.waterUsage)),
            explanations: {
                materials: analysis.materials_explanation || 'Analysis unavailable',
                manufacturing: analysis.manufacturing_explanation || 'Analysis unavailable',
                carbonFootprint: analysis.carbonFootprint_explanation || 'Analysis unavailable',
                waterUsage: analysis.waterUsage_explanation || 'Analysis unavailable',
                overall: analysis.overall_explanation || 'Analysis unavailable'
            },
            productInfo: productInfo
        };

        // Validate processed data
        if (isNaN(processedData.score) || isNaN(processedData.materials) || 
            isNaN(processedData.manufacturing) || isNaN(processedData.carbonFootprint) || 
            isNaN(processedData.waterUsage)) {
            throw new Error('Invalid numerical values in analysis');
        }

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

// Enhanced sustainability analysis
function analyzeSustainability(productInfo) {
    let materialScore = 50; // Base score
    let manufacturingScore = 40;
    let carbonScore = 35;
    let waterScore = 35;
    
    const materialsLower = productInfo.materials.toLowerCase();
    const materialBreakdown = productInfo.materialBreakdown;
    
    // Analyze material composition if available
    if (materialBreakdown.length > 0) {
        let totalScore = 0;
        let totalWaterImpact = 0;
        let totalCarbonImpact = 0;
        
        materialBreakdown.forEach(({ material, percentage }) => {
            // Check sustainable materials
            const sustainableMaterial = SUSTAINABLE_MATERIALS.find(m => material.includes(m.material));
            if (sustainableMaterial) {
                totalScore += (sustainableMaterial.weight * percentage) / 100;
                totalWaterImpact += (sustainableMaterial.waterImpact * percentage) / 100;
                totalCarbonImpact += (sustainableMaterial.carbonImpact * percentage) / 100;
            }
            
            // Check unsustainable materials
            const unsustainableMaterial = UNSUSTAINABLE_MATERIALS.find(m => material.includes(m.material));
            if (unsustainableMaterial) {
                totalScore += (unsustainableMaterial.weight * percentage) / 100;
                totalWaterImpact += (unsustainableMaterial.waterImpact * percentage) / 100;
                totalCarbonImpact += (unsustainableMaterial.carbonImpact * percentage) / 100;
            }
        });
        
        materialScore = Math.max(0, Math.min(100, 50 + totalScore));
        waterScore = Math.max(0, Math.min(100, 50 - totalWaterImpact));
        carbonScore = Math.max(0, Math.min(100, 50 - totalCarbonImpact));
    } else {
        // Fallback to text analysis if no percentage breakdown
        SUSTAINABLE_MATERIALS.forEach(item => {
            if (materialsLower.includes(item.material)) {
                materialScore += item.weight / 2;
                waterScore -= item.waterImpact;
                carbonScore -= item.carbonImpact;
            }
        });

        UNSUSTAINABLE_MATERIALS.forEach(item => {
            if (materialsLower.includes(item.material)) {
                materialScore += item.weight / 2;
                waterScore += item.waterImpact;
                carbonScore += item.carbonImpact;
            }
        });
    }

    // Analyze manufacturing practices
    MANUFACTURING_INDICATORS.forEach(item => {
        if (materialsLower.includes(item.indicator) || 
            productInfo.description.toLowerCase().includes(item.indicator)) {
            manufacturingScore += item.weight / 2;
            carbonScore -= 5;
            waterScore -= 5;
        }
    });

    // Normalize scores
    materialScore = Math.max(0, Math.min(100, materialScore));
    manufacturingScore = Math.max(0, Math.min(100, manufacturingScore));
    carbonScore = Math.max(0, Math.min(100, carbonScore));
    waterScore = Math.max(0, Math.min(100, waterScore));

    // Generate detailed explanations with productInfo
    const materialExplanation = getMaterialExplanation(materialScore, materialBreakdown, productInfo);
    const manufacturingExplanation = getManufacturingExplanation(manufacturingScore, productInfo);
    const carbonExplanation = getCarbonExplanation(carbonScore, materialBreakdown, productInfo);
    const waterExplanation = getWaterExplanation(waterScore, materialBreakdown, productInfo);

    return {
        score: Math.round((materialScore * 0.35) + (manufacturingScore * 0.30) + 
               (carbonScore * 0.20) + (waterScore * 0.15)),
        materials: Math.round(materialScore),
        manufacturing: Math.round(manufacturingScore),
        carbonFootprint: Math.round(carbonScore),
        waterUsage: Math.round(waterScore),
        explanations: {
            materials: materialExplanation,
            manufacturing: manufacturingExplanation,
            carbonFootprint: carbonExplanation,
            waterUsage: waterExplanation,
            overall: getOverallExplanation(materialScore, manufacturingScore, carbonScore, waterScore, productInfo)
        }
    };
}

// Enhanced explanation generators
function getMaterialExplanation(score, materialBreakdown, productInfo) {
    // First check material breakdown from composition
    if (materialBreakdown.length > 0) {
        const sustainableMaterials = materialBreakdown.filter(({ material }) => 
            SUSTAINABLE_MATERIALS.some(m => material.includes(m.material)));
        
        const unsustainableMaterials = materialBreakdown.filter(({ material }) => 
            UNSUSTAINABLE_MATERIALS.some(m => material.includes(m.material)));
        
        // Calculate total percentages
        const sustainablePercentage = sustainableMaterials.reduce((sum, { percentage }) => sum + percentage, 0);
        const unsustainablePercentage = unsustainableMaterials.reduce((sum, { percentage }) => sum + percentage, 0);
        
        if (sustainablePercentage > 0 || unsustainablePercentage > 0) {
            if (sustainablePercentage > unsustainablePercentage) {
                const mainMaterial = sustainableMaterials[0];
                return `Contains ${sustainablePercentage}% sustainable materials, primarily ${mainMaterial.percentage}% ${mainMaterial.material}`;
            } else {
                const mainMaterial = unsustainableMaterials[0];
                return `Contains ${unsustainablePercentage}% less sustainable materials, including ${mainMaterial.percentage}% ${mainMaterial.material}`;
            }
        }
    }

    // Check title materials if no breakdown found
    if (productInfo.titleMaterials && productInfo.titleMaterials.length > 0) {
        const materials = productInfo.titleMaterials.map(m => m.material).join(', ');
        return `Product title indicates use of ${materials}`;
    }
    
    // Check for material keywords in title and description
    const combinedText = `${productInfo.title} ${productInfo.description}`.toLowerCase();
    const sustainableMentions = SUSTAINABLE_MATERIALS.filter(m => combinedText.includes(m.material));
    const unsustainableMentions = UNSUSTAINABLE_MATERIALS.filter(m => combinedText.includes(m.material));
    
    if (sustainableMentions.length > 0) {
        return `Contains sustainable materials: ${sustainableMentions.map(m => m.material).join(', ')}`;
    } else if (unsustainableMentions.length > 0) {
        return `Contains less sustainable materials: ${unsustainableMentions.map(m => m.material).join(', ')}`;
    }
    
    // Platform-specific default explanations
    switch (productInfo.platform) {
        case 'amazon':
            return `Based on similar ${productInfo.title.split(' ')[0]} products on Amazon, likely uses conventional materials`;
        case 'hm':
            return `Typical H&M ${productInfo.title.split(' ')[0]} product, likely uses standard retail materials`;
        case 'zara':
            return `Common Zara ${productInfo.title.split(' ')[0]} composition, typically mixed materials`;
        default:
            return 'Material composition information not available';
    }
}

function getManufacturingExplanation(score, productInfo) {
    const combinedText = `${productInfo.title} ${productInfo.description} ${productInfo.materials}`.toLowerCase();
    
    const certifications = MANUFACTURING_INDICATORS.filter(item => 
        item.category === 'certification' && combinedText.includes(item.indicator)
    );
    
    const productionMethods = MANUFACTURING_INDICATORS.filter(item => 
        item.category === 'production' && combinedText.includes(item.indicator)
    );
    
    if (certifications.length > 0) {
        const mainCert = certifications[0].indicator.toUpperCase();
        if (productionMethods.length > 0) {
            return `${mainCert} certified with ${productionMethods[0].indicator} production methods`;
        }
        return `Certified with ${mainCert}, indicating responsible manufacturing practices`;
    }
    
    if (productionMethods.length > 0) {
        return `Uses ${productionMethods.map(m => m.indicator).join(' and ')} in production`;
    }
    
    // Platform-specific default explanations
    switch (productInfo.platform) {
        case 'amazon':
            return `Standard manufacturing processes typical for ${productInfo.title.split(' ')[0]} products on Amazon`;
        case 'hm':
            return `Uses H&M's standard fast-fashion production methods for ${productInfo.title.split(' ')[0]} items`;
        case 'zara':
            return `Manufactured using Zara's typical production processes for ${productInfo.title.split(' ')[0]} items`;
        default:
            return 'Manufacturing information not available';
    }
}

function getCarbonExplanation(score, materialBreakdown, productInfo) {
    if (materialBreakdown.length > 0) {
        const highImpactMaterials = materialBreakdown.filter(({ material }) =>
            UNSUSTAINABLE_MATERIALS.some(m => m.material.includes(material) && m.carbonImpact > 20)
        );
        
        if (highImpactMaterials.length > 0) {
            const totalHighImpact = highImpactMaterials.reduce((sum, { percentage }) => sum + percentage, 0);
            const mainMaterial = highImpactMaterials[0];
            return `Contains ${totalHighImpact}% high-carbon materials, including ${mainMaterial.percentage}% ${mainMaterial.material}`;
        }

        const lowImpactMaterials = materialBreakdown.filter(({ material }) =>
            SUSTAINABLE_MATERIALS.some(m => m.material.includes(material) && m.carbonImpact < -10)
        );

        if (lowImpactMaterials.length > 0) {
            const totalLowImpact = lowImpactMaterials.reduce((sum, { percentage }) => sum + percentage, 0);
            return `Uses ${totalLowImpact}% low-carbon materials, reducing overall carbon footprint`;
        }
    }
    
    if (score <= 30) return 'High carbon footprint due to synthetic material choices';
    if (score <= 60) return 'Moderate carbon impact with mixed material composition';
    return 'Lower carbon footprint from sustainable material choices';
}

function getWaterExplanation(score, materialBreakdown, productInfo) {
    if (materialBreakdown.length > 0) {
        const waterIntensiveMaterials = materialBreakdown.filter(({ material }) =>
            UNSUSTAINABLE_MATERIALS.some(m => m.material.includes(material) && m.waterImpact > 20)
        );
        
        if (waterIntensiveMaterials.length > 0) {
            const totalIntensive = waterIntensiveMaterials.reduce((sum, { percentage }) => sum + percentage, 0);
            const mainMaterial = waterIntensiveMaterials[0];
            return `Contains ${totalIntensive}% water-intensive materials, primarily ${mainMaterial.percentage}% ${mainMaterial.material}`;
        }

        const waterEfficientMaterials = materialBreakdown.filter(({ material }) =>
            SUSTAINABLE_MATERIALS.some(m => m.material.includes(material) && m.waterImpact < -10)
        );

        if (waterEfficientMaterials.length > 0) {
            const totalEfficient = waterEfficientMaterials.reduce((sum, { percentage }) => sum + percentage, 0);
            return `Uses ${totalEfficient}% water-efficient materials, reducing water consumption`;
        }
    }
    
    if (score <= 30) return 'High water usage from water-intensive materials';
    if (score <= 60) return 'Moderate water consumption from mixed material types';
    return 'Efficient water usage through water-conscious material choices';
}

function getOverallExplanation(materialScore, manufacturingScore, carbonScore, waterScore, productInfo) {
    const scores = [
        { name: 'materials', score: materialScore },
        { name: 'manufacturing', score: manufacturingScore },
        { name: 'carbon footprint', score: carbonScore },
        { name: 'water usage', score: waterScore }
    ];

    // Find best and worst aspects
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const bestAspect = sortedScores[0];
    const worstAspect = sortedScores[sortedScores.length - 1];

    if (bestAspect.score > 60 && worstAspect.score < 40) {
        return `Strong ${bestAspect.name} performance but needs improvement in ${worstAspect.name}. Consider alternatives with better overall sustainability.`;
    } else if (bestAspect.score > 60) {
        return `Good overall sustainability with particularly strong ${bestAspect.name}. Shows commitment to environmental responsibility.`;
    } else if (worstAspect.score < 40) {
        return `Limited sustainability with significant concerns in ${worstAspect.name}. Consider more eco-friendly alternatives.`;
    } else {
        return `Moderate sustainability across all factors. Room for improvement in overall environmental impact.`;
    }
}

// Debounced function to handle page changes
function handlePageChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        analyzePage();
    }, DEBOUNCE_DELAY);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    
    if (message.type === 'ANALYZE_PAGE') {
        console.log('Starting page analysis...');
        analyzePage().then(result => {
            console.log('Analysis complete:', result);
            sendResponse({ success: true, data: result });
        }).catch(error => {
            console.error('Analysis failed:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Will respond asynchronously
    }
});

// Set up observers for page changes
let lastUrl = window.location.href;

// Enhanced URL change observer for Zara's dynamic navigation
const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // For Zara, add a small delay to ensure the new content is loaded
        if (window.location.hostname.includes('zara.com')) {
            setTimeout(() => {
                cache.analysisResults.clear(); // Clear cache on URL change for Zara
                handlePageChange();
            }, 500);
        } else {
            handlePageChange();
        }
    }
});

// Start URL observer
urlObserver.observe(document, { subtree: true, childList: true });

// Enhanced product content observer for Zara
const productObserver = new MutationObserver((mutations) => {
    // For Zara, check if the mutation affects product content
    if (window.location.hostname.includes('zara.com')) {
        const hasRelevantChanges = mutations.some(mutation => {
            const target = mutation.target;
            return (
                target.matches('[data-qa-label="product-name"]') ||
                target.matches('[data-qa-label="composition"]') ||
                target.matches('[data-qa-label="description"]') ||
                target.closest('[data-qa-label="product-detail"]')
            );
        });

        if (hasRelevantChanges) {
            cache.analysisResults.clear(); // Clear cache when product content changes
            handlePageChange();
        }
    } else {
        handlePageChange();
    }
});

// Enhanced setupProductObserver function
function setupProductObserver() {
    const platform = detectPlatform();
    if (!platform || !SUPPORTED_SITES[platform]) return;

    const selectors = SUPPORTED_SITES[platform];
    
    // For Zara, observe the main product container
    if (platform === 'zara') {
        const productContainer = document.querySelector('[data-qa-label="product-detail"]') ||
                               document.querySelector('[class*="product-detail"]');
        if (productContainer) {
            productObserver.observe(productContainer, {
                childList: true,
                characterData: true,
                subtree: true,
                attributes: true
            });
        }
    } else {
        // For other sites, use the existing logic
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
}

// Initial setup
setTimeout(setupProductObserver, 1000);

// Optimized page analysis
async function analyzePage() {
    try {
        console.log('Starting page analysis...');
        const currentUrl = window.location.href;
        console.log('Current URL:', currentUrl);

        const platform = detectPlatform();
        console.log('Detected platform:', platform);
        
        if (!platform) {
            console.log('No supported platform detected');
            chrome.runtime.sendMessage({ 
                type: 'PRODUCT_DATA', 
                data: null,
                error: 'Not a supported product page'
            });
            return null;
        }

        // Wait a short time for dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Extracting product info...');
        const productInfo = await extractProductInfo(platform);
        console.log('Product info:', productInfo);

        if (!productInfo?.title) {
            console.log('No product title found');
            chrome.runtime.sendMessage({ 
                type: 'PRODUCT_DATA', 
                data: null,
                error: 'Could not find product information'
            });
            return null;
        }

        if (!shouldReanalyze(currentUrl, productInfo.title)) {
            console.log('Skipping analysis - already analyzed');
            const cached = cache.analysisResults.get(currentUrl + productInfo.title);
            if (cached) {
                chrome.runtime.sendMessage({
                    type: 'PRODUCT_DATA',
                    data: cached.data
                });
                return cached.data;
            }
        }

        // Perform sustainability analysis
        console.log('Performing sustainability analysis...');
        const sustainabilityData = analyzeSustainability(productInfo);
        
        // Add product info to the results
        sustainabilityData.productInfo = productInfo;

        console.log('Sustainability data:', sustainabilityData);

        // Cache the result
        cache.analysisResults.set(currentUrl + productInfo.title, {
            data: sustainabilityData,
            timestamp: Date.now()
        });

        // Send the results
        chrome.runtime.sendMessage({
            type: 'PRODUCT_DATA',
            data: sustainabilityData
        });
        
        return sustainabilityData;
    } catch (error) {
        console.error('Error in analyzePage:', error);
        chrome.runtime.sendMessage({ 
            type: 'PRODUCT_DATA', 
            data: null,
            error: error.message
        });
        return null;
    }
} 