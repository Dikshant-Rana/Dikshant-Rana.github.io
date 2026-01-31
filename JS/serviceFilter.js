export default class ServiceFilter {
    constructor({ onFilter = null } = {}) {
        this.searchInput = document.getElementById('serviceSearch');
        this.searchBtn = document.querySelector('.search-box i'); // search icon
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.serviceCards = document.querySelectorAll('.service-card-detailed');
        this.currentCategory = 'all';
        this.onFilter = onFilter;

        this.init();
    }

    init() {
        // --- Search input: only on Enter ---
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters(true);
                }
            });
        }

        // --- Search icon click ---
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.applyFilters(true);
            });
        }
        this.clearBtn = document.querySelector('.clear-search');

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.searchInput.value = '';
                this.applyFilters(false); // reset filter
                this.searchInput.focus();
            });
        }


        // --- Filter buttons ---
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active button
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update category
                this.currentCategory = btn.dataset.category || 'all';

                // Apply filter (search term remains)
                this.applyFilters(true);
            });
        });
    }
    applyFilters(scroll = false) {
        const searchTerm = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
        const category = this.currentCategory;

        let visibleCount = 0;

        this.serviceCards.forEach(card => {
            const serviceName = (card.dataset.service || '').toLowerCase();
            const serviceCategory = card.dataset.category || '';

            const matchesSearch = searchTerm === '' || serviceName.includes(searchTerm);
            const matchesCategory = category === 'all' || serviceCategory === category;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        this.showNoResultsMessage(visibleCount);

        // Pagination callback
        if (this.onFilter) {
            const visibleCards = Array.from(this.serviceCards).filter(c => c.style.display === 'block');
            this.onFilter(visibleCards, scroll);
        }

        // Scroll to top of grid no matter what
        if (scroll) {
            const grid = document.querySelector('.services-grid-detailed');
            if (grid) {
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
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
