// Service Filter and Search System
export default class ServiceFilter {
    constructor({ onFilter = null } = {}) {
        this.searchInput = document.getElementById('serviceSearch');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.serviceCards = document.querySelectorAll('.service-card-detailed');
        this.currentCategory = 'all';

        // Callback for pagination
        this.onFilter = onFilter;

        this.init();
    }

    init() {
        // --- Search input: updates without scrolling ---
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                this.filterServices(searchTerm, this.currentCategory, false); // scroll = false
            });
        }

        // --- Filter buttons: updates with scrolling ---
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active button
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update category
                this.currentCategory = btn.dataset.category;

                const searchTerm = this.searchInput ? this.searchInput.value : '';
                this.filterServices(searchTerm, this.currentCategory, true); // scroll = true
            });
        });
    }

    /**
     * Filters services by search term and category
     * @param {string} searchTerm 
     * @param {string} category 
     * @param {boolean} scroll - whether to scroll to first visible card
     */
    filterServices(searchTerm = '', category = 'all', scroll = false) {
        const search = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        if (search) {
            const matchingCategories = new Set();
            const matchingCards = [];
            const nonMatchingCards = [];

            this.serviceCards.forEach(card => {
                const serviceName = card.dataset.service || '';
                const serviceCategory = card.dataset.category || '';
                const searchMatch = serviceName.toLowerCase().includes(search);

                if (searchMatch) {
                    matchingCategories.add(serviceCategory);
                    matchingCards.push(card);
                } else {
                    nonMatchingCards.push({ card, category: serviceCategory });
                }
            });

            // Hide all cards first
            this.serviceCards.forEach(card => {
                card.style.display = 'none';
                card.style.order = '';
            });

            // Show matching cards first
            matchingCards.forEach(card => {
                const categoryMatch = category === 'all' || card.dataset.category === category;
                if (categoryMatch) {
                    card.style.display = 'block';
                    card.style.order = '1';
                    visibleCount++;
                }
            });

            // Show related cards from same category (order 2)
            nonMatchingCards.forEach(({ card, category: cardCategory }) => {
                const categoryMatch = category === 'all' || cardCategory === category;
                if (matchingCategories.has(cardCategory) && categoryMatch) {
                    card.style.display = 'block';
                    card.style.order = '2';
                    visibleCount++;
                }
            });

        } else {
            // No search term, filter only by category
            this.serviceCards.forEach(card => {
                const serviceCategory = card.dataset.category || '';
                const categoryMatch = category === 'all' || serviceCategory === category;
                card.style.order = '';
                if (categoryMatch) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Show "no results" message if needed
        this.showNoResultsMessage(visibleCount);

        // Notify pagination callback
        if (this.onFilter) {
            const visibleCards = Array.from(this.serviceCards).filter(
                card => card.style.display === 'block'
            );
            this.onFilter(visibleCards, scroll);
        }
    }

    showNoResultsMessage(count) {
        const container = document.querySelector('.services-grid-detailed');
        let noResultsMsg = document.getElementById('no-results-message');

        if (count === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-results-message';
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No services found</h3>
                    <p>Try a different search term or category</p>
                `;
                container.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}
