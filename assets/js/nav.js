// assets/js/nav.js - Complete Shared Navigation Script
// Handles: Hamburger menu, mobile nav, theme toggle, logout, dashboard navigation
// Works on ALL pages that include this script (dashboard.html, form.html, customers.html, suppliers.html, etc.)

// Supabase client - must be loaded before this script
// Assuming <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is included earlier
const supabaseUrl = 'https://qxpaplabjocxaftqocgu.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cGFwbGFiam9jeGFmdHFvY2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTcyOTQsImV4cCI6MjA4MTIzMzI5NH0.VpoV9d2XGkRTv5UoZFKiA23IOOV2zasV18pW_9JmCj4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

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
    const dashboardBtn = document.getElementById('dashboard-btn');
    const mobileDashboardBtn = document.getElementById('mobile-dashboard-btn');

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    if (mobileDashboardBtn) {
        mobileDashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    // ================================
    // Logout (Desktop + Mobile) - Redirects to landing page (index.html)
    // ================================
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

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

    if (logoutBtn) {
        logoutBtn.addEventListener('click', performLogout);
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', performLogout);
    }

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

        const themeSwitch = document.getElementById('theme-switch');
        const mobileSwitch = document.getElementById('mobile-theme-switch');

        if (themeSwitch) themeSwitch.checked = isLight;
        if (mobileSwitch) mobileSwitch.checked = isLight;
    };

    const toggleTheme = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        const themeSwitch = document.getElementById('theme-switch');
        const mobileSwitch = document.getElementById('mobile-theme-switch');

        if (themeSwitch) themeSwitch.checked = isLight;
        if (mobileSwitch) mobileSwitch.checked = isLight;
    };

    // Initialize theme on load
    initTheme();

    // Attach theme toggle listeners
    document.getElementById('theme-switch')?.addEventListener('change', toggleTheme);
    document.getElementById('mobile-theme-switch')?.addEventListener('change', toggleTheme);

    // ================================
    // Language Selector (Globe Dropdown)
    // ================================
    const languageSelector = document.querySelector('.language-selector');
    const languageGlobe = document.querySelector('.language-globe-btn, .language-globe');

    if (languageSelector && languageGlobe) {
        languageGlobe.addEventListener('click', () => {
            languageSelector.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!languageSelector.contains(e.target)) {
                languageSelector.classList.remove('active');
            }
        });
    }

    // Language change handler (assumes i18n.js is loaded)
    document.querySelectorAll('.language-dropdown button[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            localStorage.setItem('preferred_language', lang);
            // Trigger translation update (from i18n.js)
            if (typeof applyTranslations === 'function') {
                applyTranslations();
            }
            // Optional: reload page to apply language fully
            // window.location.reload();
        });
    });

    // ================================
    // Active Supplier Display (if present)
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
