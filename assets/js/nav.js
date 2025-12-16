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

// Logout handlers - redirect to landing page (index.html) after sign out
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
        return;
    }

    // Clear any stored supplier selection
    localStorage.removeItem('selected_supplier_id');
    localStorage.removeItem('selected_supplier_name');

    // Redirect to landing page
    window.location.href = 'index.html';
});

document.getElementById('mobile-logout-btn')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
        return;
    }

    localStorage.removeItem('selected_supplier_id');
    localStorage.removeItem('selected_supplier_name');

    window.location.href = 'index.html';
});
