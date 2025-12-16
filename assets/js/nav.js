// assets/js/nav.js - Complete Shared Navigation Script
// Handles: Hamburger menu, mobile nav, theme toggle, logout (with redirect to index.html), dashboard navigation, language selector, active supplier display

// Supabase client - ensure this script loads after Supabase CDN in HTML
const supabase = window.supabase.createClient(
    'https://qxpaplabjocxaftqocgu.supabase.co',
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cGFwbGFiam9jeGFmdHFvY2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTcyOTQsImV4cCI6MjA4MTIzMzI5NH0.VpoV9d2XGkRTv5UoZFKiA23IOOV2zasV18pW_9JmCj4"
);

document.addEventListener('DOMContentLoaded', () => {
    // ================================
    // Hamburger Menu Toggle
    // ================================
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            mobileNav?.classList.remove('active');
        });
    }

    // Close mobile menu when clicking any button inside it
    mobileNav?.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            mobileNav?.classList.remove('active');
        });
    });

    // ================================
    // Dashboard Navigation (Desktop + Mobile)
    // ================================
    document.getElementById('dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    document.getElementById('mobile-dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // ================================
    // Logout (Desktop + Mobile) - FIXED: Redirects to index.html
    // ================================
    const performLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            alert('Error logging out: ' + error.message);
            return;
        }

        // Clear stored supplier selection
        localStorage.removeItem('selected_supplier_id');
        localStorage.removeItem('selected_supplier_name');

        // Redirect to landing page
        window.location.href = 'index.html';
    };

    document.getElementById('logout-btn')?.addEventListener('click', performLogout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', performLogout);

    // ================================
    // Theme Toggle (Desktop + Mobile)
    // ================================
    const initTheme = () => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isLight = saved === 'light' || (!saved && !prefersDark);

        if (isLight) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        document.getElementById('theme-switch')?.checked = isLight;
        document.getElementById('mobile-theme-switch')?.checked = isLight;
    };

    const toggleTheme = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        document.getElementById('theme-switch')?.checked = isLight;
        document.getElementById('mobile-theme-switch')?.checked = isLight;
    };

    initTheme();

    document.getElementById('theme-switch')?.addEventListener('change', toggleTheme);
    document.getElementById('mobile-theme-switch')?.addEventListener('change', toggleTheme);

    // ================================
    // Language Selector Dropdown
    // ================================
    const languageSelectors = document.querySelectorAll('.language-selector');
    languageSelectors.forEach(selector => {
        const globeBtn = selector.querySelector('.language-globe-btn, .language-globe');
        if (globeBtn) {
            globeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selector.classList.toggle('active');
            });
        }
    });

    // Close all language dropdowns when clicking outside
    document.addEventListener('click', () => {
        languageSelectors.forEach(selector => selector.classList.remove('active'));
    });

    // Language change (integrates with i18n.js if present)
    document.querySelectorAll('.language-dropdown button[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            localStorage.setItem('preferred_language', lang);
            if (typeof applyTranslations === 'function') {
                applyTranslations();
            }
        });
    });

    // ================================
    // Active Supplier Display in Header
    // ================================
    const activeSupplierSpan = document.getElementById('active-supplier');
    if (activeSupplierSpan) {
        const supplierName = localStorage.getItem('selected_supplier_name');
        if (supplierName) {
            activeSupplierSpan.textContent = `Active: ${supplierName}`;
        } else {
            activeSupplierSpan.innerHTML = 'No supplier selected — <a href="suppliers.html" style="color: var(--accent); text-decoration: underline;">Select one</a>';
        }
    }
});
