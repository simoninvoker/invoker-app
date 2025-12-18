import { supabase, supabaseClient } from './supabaseClient.js';

VANTA.NET({
    el: "#vanta-hero",
    color: 0x2563eb,
    backgroundColor: 0x070d18,
    points: 10,
    spacing: 20,
    mouseControls: true
});

const loginPopup = document.getElementById('login-popup');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const errorMessage = document.getElementById('error-message');
const createInvoiceBtn = document.getElementById('create-invoice-btn');
const popupTitle = document.getElementById('popup-title');
const toggleLogin = document.getElementById('toggle-login');
const forgotPasswordLink = document.getElementById('forgot-password');

// Section reveal on scroll
const sections = document.querySelectorAll('section');
const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
});
sections.forEach(section => reveal.observe(section));

// Toggle Login / Sign Up mode
let isLogin = true;
toggleLogin.addEventListener('click', () => {
    isLogin = !isLogin;
    popupTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    forgotPasswordLink.style.display = isLogin ? 'block' : 'none';
    document.getElementById('submit-login').style.display = isLogin ? 'block' : 'none';
    document.getElementById('submit-signup').style.display = isLogin ? 'none' : 'block';
    errorMessage.textContent = '';
    loginEmail.value = '';
    loginPassword.value = '';
});

// Close popup on backdrop click
loginPopup.addEventListener('click', (e) => {
    if (e.target === loginPopup) {
        loginPopup.style.display = 'none';
        errorMessage.textContent = '';
    }
});

// Form submit handler (Login or Sign Up)
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = isLogin
        ? document.getElementById('submit-login')
        : document.getElementById('submit-signup');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading...';
    errorMessage.textContent = '';

    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value;

    if (!email || !password) {
        errorMessage.textContent = 'Email and password are required';
        submitBtn.disabled = false;
        submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
        return;
    }

    let data, error;
    if (isLogin) {
        ({ data, error } = await supabaseClient.auth.signInWithPassword({ email, password }));
    } else {
        ({ data, error } = await supabaseClient.auth.signUp({ email, password }));
        if (!error) {
            errorMessage.textContent = 'Check your email for confirmation link.';
            errorMessage.style.color = 'var(--success)';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
            return;
        }
    }

    if (error) {
        errorMessage.textContent = error.message;
    } else {
        loginPopup.style.display = 'none';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
});

// Forgot password
forgotPasswordLink.addEventListener('click', async () => {
    const email = loginEmail.value.trim().toLowerCase();
    if (!email) {
        errorMessage.textContent = 'Please enter your email address first';
        return;
    }
    errorMessage.textContent = 'Sending password reset link...';
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/password-reset.html',
    });
    if (error) {
        errorMessage.textContent = error.message;
    } else {
        errorMessage.textContent = 'Password reset link sent! Check your email (including spam folder).';
        errorMessage.style.color = 'var(--success)';
    }
});

// Create Invoice button
createInvoiceBtn.addEventListener('click', async () => {
    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        loginPopup.style.display = 'flex';
        if (!isLogin) toggleLogin.click();
        errorMessage.textContent = 'Please log in to create invoices.';
        errorMessage.style.color = 'var(--accent)';
        loginEmail.focus();
        return;
    }

    window.location.href = 'dashboard.html';
});

// Update UI based on auth state
async function updateUI() {
    const { data } = await supabaseClient.auth.getSession();
    const user = data.session?.user;

    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
}

// Auth state change listener
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    }
    updateUI();
});

// Initial UI update
updateUI();
