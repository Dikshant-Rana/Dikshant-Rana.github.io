// Initialize AOS
AOS.init({
    duration: 400,
    easing: 'ease-out',
    once: true,
    offset: 50,
    delay: 0,
    disable: 'phone'
});

// Mobile Menu Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
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
    button.addEventListener('click', function() {
        const serviceCard = this.closest('.service-card-detailed');
        const packageList = serviceCard.querySelector('.package-list');
        
        packageList.classList.toggle('active');
        
        if (packageList.classList.contains('active')) {
            this.textContent = 'Hide Packages';
        } else {
            this.textContent = 'View Packages';
        }
    });
});
