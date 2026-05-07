console.log('🚀 [CineVerse] login.js v4.4.1 Loaded');

window.handleGoogleSignIn = async function() {
    console.log('🚀 Google clicked!');
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        if (result.user) {
            window.location.replace('index.html');
        }
    } catch(e) {
        console.error(e);
        alert('Google login error: ' + e.message);
    }
};

// === Helper for UI Feedback ===
const setBtnLoading = (btn, isLoading, text = 'Connecting...') => {
    if (!btn) return;
    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${text}`;
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
};

// === Toast Utility ===
function showLoginToast(message, type = 'info') {
    const existing = document.querySelector('.login-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `login-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

const initAuthSystem = () => {
    console.log('🔐 Auth System initializing...');

    // =========================================
    // === GOOGLE LOGIN ===
    // =========================================
    const handleGoogleLogin = async (btn) => {
        console.log('🚀 Google Login initiated');
        setBtnLoading(btn, true);
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            // Use popup instead of redirect
            const result = await firebase.auth().signInWithPopup(provider);
            if (result.user) {
                showLoginToast('Welcome, ' + (result.user.displayName || result.user.email) + '!', 'success');
                setTimeout(() => window.location.replace('index.html'), 1000);
            }
        } catch (error) {
            console.error('❌ Google error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                showLoginToast('Google login failed: ' + error.message, 'error');
            }
            setBtnLoading(btn, false);
        }
    };


    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleLoginBtn) googleLoginBtn.onclick = () => handleGoogleLogin(googleLoginBtn);
    if (googleSignupBtn) googleSignupBtn.onclick = () => handleGoogleLogin(googleSignupBtn);


    // =========================================
    // === GITHUB LOGIN ===
    // =========================================
    const handleGithubLogin = async (btn) => {
        setBtnLoading(btn, true);
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            await firebase.auth().signInWithRedirect(provider);
        } catch (error) {
            showLoginToast('GitHub login failed: ' + error.message, 'error');
            setBtnLoading(btn, false);
        }
    };
    const githubLoginBtn = document.getElementById('githubLoginBtn');
    const githubSignupBtn = document.getElementById('githubSignupBtn');
    if (githubLoginBtn) githubLoginBtn.addEventListener('click', (e) => { e.preventDefault(); handleGithubLogin(githubLoginBtn); });
    if (githubSignupBtn) githubSignupBtn.addEventListener('click', (e) => { e.preventDefault(); handleGithubLogin(githubSignupBtn); });

    // =========================================
    // === TWITTER LOGIN ===
    // =========================================
    const handleTwitterLogin = async (btn) => {
        setBtnLoading(btn, true);
        try {
            const provider = new firebase.auth.TwitterAuthProvider();
            await firebase.auth().signInWithRedirect(provider);
        } catch (error) {
            showLoginToast('Twitter login failed: ' + error.message, 'error');
            setBtnLoading(btn, false);
        }
    };
    const twitterLoginBtn = document.getElementById('twitterLoginBtn');
    const twitterSignupBtn = document.getElementById('twitterSignupBtn');
    if (twitterLoginBtn) twitterLoginBtn.addEventListener('click', (e) => { e.preventDefault(); handleTwitterLogin(twitterLoginBtn); });
    if (twitterSignupBtn) twitterSignupBtn.addEventListener('click', (e) => { e.preventDefault(); handleTwitterLogin(twitterSignupBtn); });

    // =========================================
    // === PHONE LOGIN MODAL ===
    // =========================================
    const phoneLoginBtn = document.getElementById('phoneLoginBtn');
    const phoneSignupBtn = document.getElementById('phoneSignupBtn');
    const otpModal = document.getElementById('otpModal');
    const closeOtpModal = document.getElementById('closeOtpModal');

    if (phoneLoginBtn) phoneLoginBtn.addEventListener('click', (e) => { e.preventDefault(); if (otpModal) otpModal.style.display = 'flex'; });
    if (phoneSignupBtn) phoneSignupBtn.addEventListener('click', (e) => { e.preventDefault(); if (otpModal) otpModal.style.display = 'flex'; });
    if (closeOtpModal) closeOtpModal.addEventListener('click', (e) => { e.preventDefault(); if (otpModal) otpModal.style.display = 'none'; });

    // =========================================
    // === EMAIL/PASSWORD LOGIN ===
    // =========================================
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            const submitBtn = document.getElementById('loginBtn');

            if (!email || !password) { showLoginToast('Please fill all fields', 'error'); return; }
            setBtnLoading(submitBtn, true, 'Signing in...');

            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                showLoginToast('Successfully logged in!', 'success');
            } catch (error) {
                let msg = 'Login failed';
                if (error.code === 'auth/user-not-found') msg = 'No account found with this email';
                else if (error.code === 'auth/wrong-password') msg = 'Incorrect password';
                else if (error.code === 'auth/invalid-email') msg = 'Invalid email address';
                else if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later';
                showLoginToast(msg, 'error');
                setBtnLoading(submitBtn, false);
            }
        });
    }

    // =========================================
    // === EMAIL/PASSWORD SIGNUP ===
    // =========================================
    const signupFormElement = document.getElementById('signupFormElement');
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName')?.value.trim();
            const email = document.getElementById('signupEmail')?.value.trim();
            const password = document.getElementById('signupPassword')?.value;
            const confirm = document.getElementById('signupConfirm')?.value;
            const termsCheck = document.getElementById('termsCheck');
            const submitBtn = document.getElementById('signupBtn');

            if (!name || !email || !password || !confirm) { showLoginToast('Please fill all fields', 'error'); return; }
            if (password !== confirm) { showLoginToast('Passwords do not match', 'error'); return; }
            if (password.length < 6) { showLoginToast('Password must be at least 6 characters', 'error'); return; }
            if (termsCheck && !termsCheck.checked) { showLoginToast('Please accept the Terms of Service', 'error'); return; }

            setBtnLoading(submitBtn, true, 'Creating account...');
            try {
                const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
                await result.user.updateProfile({ displayName: name });
                showLoginToast('Account created! Welcome to CineVerse!', 'success');
            } catch (error) {
                let msg = 'Signup failed';
                if (error.code === 'auth/email-already-in-use') msg = 'Email already in use';
                else if (error.code === 'auth/invalid-email') msg = 'Invalid email address';
                else if (error.code === 'auth/weak-password') msg = 'Password is too weak';
                showLoginToast(msg, 'error');
                setBtnLoading(submitBtn, false);
            }
        });
    }

    // =========================================
    // === AUTH STATE OBSERVER ===
    // =========================================
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('👤 User logged in:', user.email);
            setTimeout(() => window.location.replace('index.html'), 1000);
        }
    });

    // =========================================
    // === FORM TOGGLE (Login <-> Signup) ===
    // =========================================
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginFormEl = document.getElementById('loginForm');
    const signupFormEl = document.getElementById('signupForm');

    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginFormEl) loginFormEl.classList.remove('active');
            if (signupFormEl) signupFormEl.classList.add('active');
        });
    }
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupFormEl) signupFormEl.classList.remove('active');
            if (loginFormEl) loginFormEl.classList.add('active');
        });
    }

    // =========================================
    // === PASSWORD TOGGLE ===
    // =========================================
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');

    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener('click', () => {
            const input = document.getElementById('loginPassword');
            const icon = toggleLoginPassword.querySelector('i');
            if (input.type === 'password') { input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
            else { input.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
        });
    }
    if (toggleSignupPassword) {
        toggleSignupPassword.addEventListener('click', () => {
            const input = document.getElementById('signupPassword');
            const icon = toggleSignupPassword.querySelector('i');
            if (input.type === 'password') { input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
            else { input.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
        });
    }

    // =========================================
    // === FORGOT PASSWORD ===
    // =========================================
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim();
            if (!email) { showLoginToast('Enter your email first, then click Forgot Password', 'error'); return; }
            try {
                await firebase.auth().sendPasswordResetEmail(email);
                showLoginToast('Password reset email sent! Check your inbox.', 'success');
            } catch (error) {
                showLoginToast('Error: ' + error.message, 'error');
            }
        });
    }

    setupPhoneAuth();
};

// === Phone Auth ===
function setupPhoneAuth() {
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const phoneInputGroup = document.getElementById('phoneInputGroup');
    const otpInputGroup = document.getElementById('otpInputGroup');

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const phone = document.getElementById('phoneNumber')?.value.trim();
            if (!phone || phone === '+') { showLoginToast('Enter a valid phone number with country code', 'error'); return; }
            setBtnLoading(sendOtpBtn, true, 'Sending Code...');
            try {
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' });
                }
                const confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, window.recaptchaVerifier);
                window.confirmationResult = confirmationResult;
                if (phoneInputGroup) phoneInputGroup.style.display = 'none';
                if (otpInputGroup) otpInputGroup.style.display = 'block';
                if (sendOtpBtn) sendOtpBtn.style.display = 'none';
                if (verifyOtpBtn) verifyOtpBtn.style.display = 'block';
                showLoginToast('Code sent! Check your phone.', 'success');
            } catch (error) {
                showLoginToast(error.message, 'error');
                setBtnLoading(sendOtpBtn, false);
            }
        });
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async () => {
            const code = document.getElementById('otpCode')?.value.trim();
            if (!code || !window.confirmationResult) { showLoginToast('Enter the OTP code', 'error'); return; }
            setBtnLoading(verifyOtpBtn, true, 'Verifying...');
            try {
                await window.confirmationResult.confirm(code);
                showLoginToast('Phone verified! Welcome!', 'success');
            } catch (error) {
                showLoginToast('Invalid code. Try again.', 'error');
                setBtnLoading(verifyOtpBtn, false);
            }
        });
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}

// === Toast CSS ===
const style = document.createElement('style');
style.textContent = `
    .login-toast {
        position: fixed; top: 20px; right: 20px; padding: 12px 24px;
        background: rgba(18, 18, 42, 0.95); color: white; border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10000;
        transform: translateY(-20px); opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255,255,255,0.1);
    }
    .login-toast.show { transform: translateY(0); opacity: 1; }
    .login-toast.success { border-left: 4px solid #00f5d4; }
    .login-toast.error { border-left: 4px solid #ff3cac; }
    .toast-content { display: flex; align-items: center; gap: 10px; font-weight: 500; }
`;
document.head.appendChild(style);
