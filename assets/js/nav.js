// assets/js/nav.js - Complete Shared Navigation Script

import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.navInitialized) return;
    window.navInitialized = true;

    // Hamburger Menu Toggle
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

        mobileNav.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
    }

    // Dashboard Navigation
    document.getElementById('dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    document.getElementById('mobile-dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // Logout
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

    // Open Login Popup (index page specific)
    document.getElementById('login-btn')?.addEventListener('click', () => {
        const loginPopup = document.getElementById('login-popup');
        if (loginPopup) loginPopup.style.display = 'flex';
    });
    document.getElementById('mobile-login-btn')?.addEventListener('click', () => {
        const loginPopup = document.getElementById('login-popup');
        if (loginPopup) loginPopup.style.display = 'flex';
    });

    // Theme Toggle - Hidden on index page
    const isIndexPage =
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname.endsWith('/');

    if (isIndexPage) {
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.style.display = 'none';
            toggle.style.visibility = 'hidden';
            toggle.style.opacity = '0';
        });
    }

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

    // Language Selector
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

    document.querySelectorAll('.language-dropdown button[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            localStorage.setItem('preferred_language', lang);
            if (typeof applyTranslations === 'function') {
                applyTranslations();
            }
        });
    });

    // Active Supplier Display (only on internal pages)
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
