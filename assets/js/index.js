VANTA.NET({
    el: "#vanta-hero",
    color: 0x2563eb,
    backgroundColor: 0x070d18,
    points: 10,
    spacing: 20,
    mouseControls: true
});

const supabaseUrl = 'https://qxpaplabjocxaftqocgu.supabase.co';
const supabaseAnonKey = "sb_publishable_he7X4Xjj74CcZfRue2RVTg_UsJSbyYC";
const { createClient } = window.supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const loginBtn = document.getElementById('login-btn');
const mobileLoginBtn = document.getElementById('mobile-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
const loginPopup = document.getElementById('login-popup');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const submitLogin = document.getElementById('submit-login');
const submitSignup = document.getElementById('submit-signup');
const errorMessage = document.getElementById('error-message');
const createInvoiceBtn = document.getElementById('create-invoice-btn');
const dashboardNav = document.getElementById('dashboard-nav');
const mobileDashboardNav = document.getElementById('mobile-dashboard-nav');
const adminNav = document.getElementById('admin-nav');
const popupTitle = document.getElementById('popup-title');
const toggleLogin = document.getElementById('toggle-login');
const forgotPasswordLink = document.getElementById('forgot-password');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

mobileNavClose.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
});

mobileNav.querySelectorAll('a, button').forEach(item => {
    item.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// Section reveal on scroll
const sections = document.querySelectorAll('section');
const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
});
sections.forEach(s => reveal.observe(s));

// Toggle between Login and Sign Up
let isLogin = true;
toggleLogin.addEventListener('click', () => {
    isLogin = !isLogin;
    popupTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    submitLogin.style.display = isLogin ? 'block' : 'none';
    submitSignup.style.display = isLogin ? 'none' : 'block';
    toggleLogin.textContent = isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login";
    forgotPasswordLink.style.display = isLogin ? 'block' : 'none';
    errorMessage.textContent = '';
    loginEmail.value = '';
    loginPassword.value = '';
});

// Initial state
forgotPasswordLink.style.display = isLogin ? 'block' : 'none';

// Open login popup
if (loginBtn) loginBtn.addEventListener('click', () => loginPopup.style.display = 'flex');
if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => loginPopup.style.display = 'flex');

// Close popup on backdrop click
loginPopup.addEventListener('click', (e) => {
    if (e.target === loginPopup) {
        loginPopup.style.display = 'none';
    }
});

// Login handler – fixed to avoid race condition
submitLogin.addEventListener('click', async () => {
    errorMessage.textContent = '';
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (!email || !password) {
        errorMessage.textContent = 'Email & password required';
        return;
    }
    // Show loading state
    submitLogin.disabled = true;
    submitLogin.textContent = 'Signing in...';
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    submitLogin.disabled = false;
    submitLogin.textContent = 'Sign In';
    if (error) {
        errorMessage.textContent = error.message;
        return;
    }
    // Close popup – redirect will happen via onAuthStateChange
    loginPopup.style.display = 'none';
});

// Sign Up handler
submitSignup.addEventListener('click', async () => {
    errorMessage.textContent = '';
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (!email || !password) {
        errorMessage.textContent = 'Email & password required';
        return;
    }
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        errorMessage.textContent = error.message;
        return;
    }
    alert('Sign-up successful! Please confirm your email to continue.');
    toggleLogin.click(); // Switch back to login
});

// Forgot Password
forgotPasswordLink.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
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
    }
});

// Logout
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', logout);
async function logout() {
    await supabaseClient.auth.signOut();
    updateUI();
}

// Create Invoice button – requires login
createInvoiceBtn.addEventListener('click', async () => {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session) {
        loginPopup.style.display = 'flex';
        return;
    }
    window.location.href = 'dashboard.html';
});

// Update navigation UI based on auth state
async function updateUI() {
    const { data } = await supabaseClient.auth.getSession();
    const user = data.session?.user;
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
        dashboardNav.style.display = 'inline-block';
        if (mobileDashboardNav) mobileDashboardNav.style.display = 'block';
        adminNav.style.display = (user.email === 'admin@example.com') ? 'inline-block' : 'none';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
        dashboardNav.style.display = 'none';
        if (mobileDashboardNav) mobileDashboardNav.style.display = 'none';
        adminNav.style.display = 'none';
    }
}

// Listen for auth changes – this reliably handles redirect after login
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Only redirect if we're currently on the index page
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    }
    updateUI();
});

// Initial UI update on page load

updateUI();
