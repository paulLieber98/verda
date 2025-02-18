// Function to handle dynamic color coding
function updateScoreColors() {
    const elements = document.querySelectorAll('[data-score]');
    elements.forEach(element => {
        const score = parseInt(element.textContent);
        if (score <= 40) {
            element.setAttribute('data-score', 'bad');
        } else if (score <= 70) {
            element.setAttribute('data-score', 'moderate');
        } else {
            element.setAttribute('data-score', 'good');
        }
    });
}

// Set up observer for score updates
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(updateScoreColors);
    observer.observe(document.body, { 
        subtree: true, 
        characterData: true, 
        childList: true 
    });
}); 