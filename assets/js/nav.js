import { supabase, supabaseClient } from './supabaseClient.js';
// assets/js/nav.js - Complete Shared Navigation Script
// Handles: Hamburger menu, mobile nav, theme toggle, logout (with redirect to index.html), dashboard navigation, language selector, active supplier display


document.addEventListener('DOMContentLoaded', () => {
    // Guard to prevent running multiple times (fixes duplicate listeners)
    if (window.navInitialized) return;
    window.navInitialized = true;


    // ================================
    // Hamburger Menu Toggle (SAFE - no duplicates)
    // ================================
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');

    if (hamburger && mobileNav) {
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');
        };

        hamburger.addEventListener('click', toggleMenu);

        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', toggleMenu);
        }

        // Close when clicking any button inside mobile nav
        mobileNav.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
    }

    // ================================
    // Dashboard Navigation (Desktop + Mobile) - SAFE
    // ================================
    document.getElementById('dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    document.getElementById('mobile-dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // ================================
    // Logout (Desktop + Mobile) - Redirects to index.html
    // ================================
    const performLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            alert('Error logging out: ' + error.message);
            return;
        }

        localStorage.removeItem('selected_supplier_id');
        localStorage.removeItem('selected_supplier_name');

        window.location.href = 'index.html';
    };

    document.getElementById('logout-btn')?.addEventListener('click', performLogout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', performLogout);

    // ================================
    // Theme Toggle (Desktop + Mobile) - SAFE
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

    initTheme();

    document.getElementById('theme-switch')?.addEventListener('change', toggleTheme);
    document.getElementById('mobile-theme-switch')?.addEventListener('change', toggleTheme);

    // ================================
    // Language Selector Dropdown
    // ================================
    document.querySelectorAll('.language-selector').forEach(selector => {
        const globeBtn = selector.querySelector('.language-globe-btn, .language-globe');
        if (globeBtn) {
            globeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selector.classList.toggle('active');
            });
        }
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.language-selector').forEach(s => s.classList.remove('active'));
    });

    // Language change
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
    // Active Supplier Display
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




