

// Mobile Menu Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent document click from immediately closing menu
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > 100) {
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backdropFilter = 'blur(0px)';
    }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
        });
    });
});

// Toggle Package Lists
document.querySelectorAll('.toggle-packages-btn').forEach(button => {
    button.addEventListener('click', function () {
        const serviceCard = this.closest('.service-card-detailed');
        const packageList = serviceCard.querySelector('.package-list');

        packageList.classList.toggle('active');

        if (packageList.classList.contains('active')) {
            this.textContent = 'Hide Services';
        } else {
            this.textContent = 'View Services';
        }
    });
});
