/* ============================================
   CineVerse — Robust Login & Authentication
   ============================================ */

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

const initAuthSystem = () => {
    console.log('🔐 Auth System initializing...');

    const googleBtn = document.getElementById('googleLoginBtn');
    const loginForm = document.getElementById('loginFormElement'); // Fixed ID



    // === Google Login Logic (Robust) ===
    const setupGoogleLogins = () => {
        const googleBtns = document.querySelectorAll('.social-btn.google');
        console.log(`🔍 Found ${googleBtns.length} Google buttons`);

        googleBtns.forEach(btn => {
            const initiateLogin = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🚀 [UI] Google Login triggered via', e.type);
                setBtnLoading(btn, true);

                try {
                    if (!window.signInWithPopup) {
                        throw new Error("Auth helpers not loaded. Please refresh.");
                    }
                    
                    const result = await window.signInWithPopup();
                    console.log('✅ [UI] Login success:', result.user.email);
                    showLoginToast('Welcome to CineVerse!', 'success');
                } catch (error) {
                    console.error('❌ [UI] Login error:', error);
                    let msg = error.message || 'Login failed';
                    if (error.code === 'auth/popup-blocked') {
                        msg = "Please allow popups for this site to login.";
                    }
                    showLoginToast(msg, 'error');
                    setBtnLoading(btn, false);
                }
            };

            // Listen for both click and pointerdown for maximum responsiveness
            btn.addEventListener('click', initiateLogin);
            btn.style.cursor = 'pointer';
            console.log('✅ [UI] Google Login listener attached to a button');
        });
    };

    setupGoogleLogins();


    // === Email/Password Login Logic ===
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput')?.value.trim();
            const password = document.getElementById('passwordInput')?.value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) {
                showLoginToast('Please fill all fields', 'error');
                return;
            }

            setBtnLoading(submitBtn, true, 'Logging in...');

            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                showLoginToast('Successfully logged in!', 'success');
            } catch (error) {
                console.error('❌ Login error:', error);
                showLoginToast(error.message, 'error');
                setBtnLoading(submitBtn, false);
            }
        });
    }

    // === Global Auth State Observer ===
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 User identified:', user.email);
                // Wait a moment for the toast to be seen
                setTimeout(() => {
                    window.location.replace('index.html');
                }, 1000);
            }
        });
    }

    // === UI Form Toggling ===
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginFormEl = document.getElementById('loginForm');
    const signupFormEl = document.getElementById('signupForm');

    if (showSignup && showLogin && loginFormEl && signupFormEl) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormEl.style.display = 'none';
            signupFormEl.style.display = 'block';
        });

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupFormEl.style.display = 'none';
            loginFormEl.style.display = 'block';
        });
    }

    setupPhoneAuth();
}; // End of initAuthSystem

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}

// === Phone Auth Logic (Robust) ===
function setupPhoneAuth() {
    const phoneBtn = document.getElementById('sendOtpBtn');
    if (!phoneBtn) return;

    phoneBtn.addEventListener('click', async () => {
        const phone = document.getElementById('phoneInput')?.value.trim();
        if (!phone) {
            showLoginToast('Enter a valid phone number', 'error');
            return;
        }

        setBtnLoading(phoneBtn, true, 'Sending Code...');

        try {
            if (!window.RecaptchaVerifier) throw new Error("Recaptcha not ready");
            
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                    'size': 'invisible'
                });
            }

            const confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            
            document.getElementById('phoneStep1').style.display = 'none';
            document.getElementById('phoneStep2').style.display = 'block';
            showLoginToast('Code sent!', 'success');
        } catch (error) {
            console.error('❌ Phone error:', error);
            showLoginToast(error.message, 'error');
            setBtnLoading(phoneBtn, false);
        }
    });

    const verifyBtn = document.getElementById('verifyOtpBtn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const code = document.getElementById('otpInput')?.value.trim();
            if (!code || !window.confirmationResult) return;

            setBtnLoading(verifyBtn, true, 'Verifying...');

            try {
                await window.confirmationResult.confirm(code);
                showLoginToast('Phone verified!', 'success');
            } catch (error) {
                console.error('❌ OTP error:', error);
                showLoginToast('Invalid code', 'error');
                setBtnLoading(verifyBtn, false);
            }
        });
    }
}

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

// Add simple CSS for the toast if not already in styles
const style = document.createElement('style');
style.textContent = `
    .login-toast {
        position: fixed; top: 20px; right: 20px; padding: 12px 24px;
        background: rgba(18, 18, 42, 0.95); color: white; border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10000;
        transform: translateY(-20px); opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255,255,255,0.1);
    }
    .login-toast.show { transform: translateY(0); opacity: 1; }
    .login-toast.success { border-left: 4px solid #00f5d4; }
    .login-toast.error { border-left: 4px solid #ff3cac; }
    .toast-content { display: flex; align-items: center; gap: 10px; font-weight: 500; }
`;
document.head.appendChild(style);
