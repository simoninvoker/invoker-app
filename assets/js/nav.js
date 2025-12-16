// assets/js/nav.js
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');

    if (!hamburger || !mobileNav || !mobileNavClose) return;

    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
    };

    hamburger.addEventListener('click', toggleMenu);
    mobileNavClose.addEventListener('click', toggleMenu);

    // Close menu when clicking any link/button inside mobile nav
    mobileNav.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });
});

// Navigation: Dashboard buttons (desktop + mobile)
document.getElementById('dashboard-btn')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

document.getElementById('mobile-dashboard-btn')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});