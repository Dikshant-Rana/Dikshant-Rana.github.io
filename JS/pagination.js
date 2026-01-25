// pagination.js
export default class Pagination {
    constructor({ container, contentContainer, items, itemsPerPage = 5 }) {
        this.container = container; // ul element for pagination
        this.contentContainer = contentContainer; // div element to show items
        this.items = items; // array of items (DOM elements)
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);

        this.render();
    }

    renderItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;

        // Hide all items first
        this.items.forEach(item => {
            if (item instanceof HTMLElement) item.style.display = 'none';
        });

        // Show only items for current page
        this.items.slice(start, end).forEach(item => {
            if (item instanceof HTMLElement) item.style.display = 'block';
        });
    }

    renderPagination() {
        this.container.innerHTML = '';

        // Previous button
        const prevLi = document.createElement('li');
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '«';
        prevBtn.type = 'button';
        prevLi.classList.toggle('disabled', this.currentPage === 1);
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 1) {
                this.currentPage--;
                this.update({ scroll: true });
                prevBtn.blur();
            }
        });
        prevLi.appendChild(prevBtn);
        this.container.appendChild(prevLi);

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.type = 'button';
            li.classList.toggle('active', i === this.currentPage);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.update({ scroll: true });
                btn.blur();
            });
            li.appendChild(btn);
            this.container.appendChild(li);
        }

        // Next button
        const nextLi = document.createElement('li');
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '»';
        nextBtn.type = 'button';
        nextLi.classList.toggle('disabled', this.currentPage === this.totalPages);
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.update({ scroll: true });
                nextBtn.blur();
            }
        });
        nextLi.appendChild(nextBtn);
        this.container.appendChild(nextLi);
    }

    /**
     * Updates the pagination
     * @param {Object} options
     * @param {boolean} options.scroll - whether to scroll to content container (default true)
     */
    update({ scroll = true } = {}) {
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);

        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1;
        }

        this.renderItems();
        this.renderPagination();

        if (scroll && this.items.length > 0) {
            this.contentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    render() {
        this.update({ scroll: false }); // initial render, do not scroll
    }
}
