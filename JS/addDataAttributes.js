// Helper script to add data attributes to service cards
// Run this in browser console if needed, or use as reference

/**
 * This script helps add missing data-category and data-service attributes
 * to service cards that don't have them yet.
 * 
 * Usage in browser console:
 * 1. Open services.html in browser
 * 2. Open Developer Tools (F12)
 * 3. Copy and paste this script
 * 4. Right-click on the page and "Inspect" -> "Copy" -> "Outer HTML"
 * 5. Replace the HTML in your editor
 */

// Service name to category mapping
const serviceMapping = {
    'Haircut': { category: 'hair-care', keywords: 'haircut styling cut hair trim layers bob' },
    'Facial': { category: 'skin-care', keywords: 'facial treatment skin care hydra anti-aging' },
    'Makeup': { category: 'makeup', keywords: 'makeup professional engagement party' },
    'Bridal': { category: 'makeup', keywords: 'bridal wedding packages reception mehendi' },
    'Nail': { category: 'beauty', keywords: 'nail manicure pedicure art acrylic extension' },
    'Eye': { category: 'beauty', keywords: 'eye eyebrow threading lash extension lifting' },
    'Hair Coloring': { category: 'hair-care', keywords: 'hair coloring color highlights balayage dye' },
    'Hair Straightening': { category: 'hair-care', keywords: 'hair straightening keratin rebonding treatment' }
};

// Function to add attributes to cards without them
function addDataAttributes() {
    const cards = document.querySelectorAll('.service-card-detailed');
    let updated = 0;
    
    cards.forEach(card => {
        // Skip if already has attributes
        if (card.dataset.category && card.dataset.service) {
            return;
        }
        
        // Get service name from h3
        const h3 = card.querySelector('h3');
        if (!h3) return;
        
        const serviceName = h3.textContent.trim();
        
        // Find matching service in mapping
        for (const [key, value] of Object.entries(serviceMapping)) {
            if (serviceName.includes(key)) {
                card.dataset.category = value.category;
                card.dataset.service = value.keywords;
                updated++;
                console.log(`Updated: ${serviceName} -> ${value.category}`);
                break;
            }
        }
    });
    
    console.log(`Updated ${updated} service cards`);
    console.log('Now copy the outer HTML of .services-grid-detailed and update your HTML file');
}

// Run the function
// addDataAttributes();

// Manual addition guide
console.log('=== Service Card Data Attributes Guide ===');
console.log('Add these attributes to each service card:');
console.log('');
console.log('Hair Services (hair-care):');
console.log('  - Haircut & Styling: data-service="haircut styling cut hair trim"');
console.log('  - Hair Coloring: data-service="hair coloring color highlights balayage"');
console.log('  - Hair Straightening: data-service="hair straightening keratin rebonding"');
console.log('');
console.log('Skin Care (skin-care):');
console.log('  - Facial Treatment: data-service="facial treatment skin hydra anti-aging"');
console.log('');
console.log('Makeup & Bridal (makeup):');
console.log('  - Professional Makeup: data-service="makeup professional engagement"');
console.log('  - Bridal Packages: data-service="bridal wedding packages reception mehendi"');
console.log('');
console.log('Beauty Services (beauty):');
console.log('  - Nail Care: data-service="nail manicure pedicure art acrylic"');
console.log('  - Eye Beauty: data-service="eye eyebrow threading lash extension"');
