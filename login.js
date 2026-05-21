console.log('🚀 [CineVerse] login.js v6.0 Loaded');

// ============================================
// STEP 1: Handle redirect result FIRST
// When user comes back from Google sign-in redirect,
// this catches the result and sends them to index.html
// ============================================
(function() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase not loaded yet!');
        return;
    }

    firebase.auth().getRedirectResult()
        .then(function(result) {
            if (result && result.user) {
                console.log('✅ Redirect login success:', result.user.email);
                showToast('Welcome, ' + (result.user.displayName || result.user.email) + '!', 'success');
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 500);
            }
        })
        .catch(function(error) {
            console.error('❌ Redirect result error:', error.code, error.message);
            if (error.code === 'auth/account-exists-with-different-credential') {
                showToast('An account already exists with this email using a different provider.', 'error');
            }
        });
})();

// ============================================
// STEP 2: Google Sign In — REDIRECT method (most reliable)
// ============================================
window.handleGoogleSignIn = function() {
    console.log('🚀 Google button clicked!');

    // Immediate visual feedback
    var allGoogleBtns = document.querySelectorAll('.social-btn.google');
    allGoogleBtns.forEach(function(btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
    });

    try {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');

        // Use redirect — this is the MOST RELIABLE method
        // It works on ALL browsers, mobile, and desktop
        // The user will be redirected to Google, then back to this page
        // where getRedirectResult() above catches the result
        console.log('🔄 Redirecting to Google...');
        firebase.auth().signInWithRedirect(provider);

    } catch(e) {
        console.error('❌ Google sign-in error:', e);
        // Reset buttons
        allGoogleBtns.forEach(function(btn) {
            btn.innerHTML = '<i class="fab fa-google"></i>';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
        showToast('Error: ' + e.message, 'error');
    }
};

// ============================================
// STEP 3: Other social sign-ins
// ============================================
window.handleGithubSignIn = function() {
    var provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithRedirect(provider);
};

window.handleTwitterSignIn = function() {
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithRedirect(provider);
};

window.handlePhoneSignIn = function() {
    var modal = document.getElementById('otpModal');
    if (modal) modal.style.display = 'flex';
};

// ============================================
// STEP 4: Toast notification system
// ============================================
function showToast(message, type) {
    var existing = document.querySelector('.login-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'login-toast ' + (type || 'info');
    toast.innerHTML = '<div class="toast-content"><span>' + message + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 400);
    }, 3000);
}

// ============================================
// STEP 5: DOMContentLoaded — Email/Password auth, form toggling, etc.
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth System v6.0 initializing...');

    // Auth state listener
    var redirecting = false;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && !redirecting) {
            console.log('👤 Already logged in:', user.email);
            window.location.href = 'index.html';
        }
    });

    // Email Login
    var loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value.trim();
            var password = document.getElementById('loginPassword').value;
            var btn = document.getElementById('loginBtn');

            if (!email || !password) { showToast('Please fill all fields', 'error'); return; }

            btn.disabled = true;
            btn.querySelector('.btn-text').textContent = 'Signing in...';
            redirecting = true;

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function() {
                    showToast('Welcome back!', 'success');
                    setTimeout(function() { window.location.href = 'index.html'; }, 1000);
                })
                .catch(function(error) {
                    redirecting = false;
                    btn.disabled = false;
                    btn.querySelector('.btn-text').textContent = 'Sign In';
                    var msg = 'Login failed';
                    if (error.code === 'auth/user-not-found') msg = 'No account found';
                    else if (error.code === 'auth/wrong-password') msg = 'Incorrect password';
                    else if (error.code === 'auth/invalid-email') msg = 'Invalid email';
                    else if (error.code === 'auth/too-many-requests') msg = 'Too many attempts';
                    showToast(msg, 'error');
                });
        });
    }

    // Email Signup
    var signupForm = document.getElementById('signupFormElement');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('signupName').value.trim();
            var email = document.getElementById('signupEmail').value.trim();
            var password = document.getElementById('signupPassword').value;
            var confirm = document.getElementById('signupConfirm').value;
            var terms = document.getElementById('termsCheck');
            var btn = document.getElementById('signupBtn');

            if (!name || !email || !password) { showToast('Fill all fields', 'error'); return; }
            if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }
            if (password.length < 6) { showToast('Password too short', 'error'); return; }
            if (terms && !terms.checked) { showToast('Accept terms first', 'error'); return; }

            btn.disabled = true;
            redirecting = true;

            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function(result) {
                    return result.user.updateProfile({ displayName: name });
                })
                .then(function() {
                    showToast('Account created! Welcome!', 'success');
                    setTimeout(function() { window.location.href = 'index.html'; }, 1000);
                })
                .catch(function(error) {
                    redirecting = false;
                    btn.disabled = false;
                    var msg = 'Signup failed';
                    if (error.code === 'auth/email-already-in-use') msg = 'Email already in use';
                    else if (error.code === 'auth/weak-password') msg = 'Password too weak';
                    showToast(msg, 'error');
                });
        });
    }

    // Form Toggle (Login <-> Signup)
    var showSignup = document.getElementById('showSignup');
    var showLogin = document.getElementById('showLogin');
    var loginFormEl = document.getElementById('loginForm');
    var signupFormEl = document.getElementById('signupForm');

    if (showSignup) showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginFormEl.classList.remove('active');
        signupFormEl.classList.add('active');
    });
    if (showLogin) showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupFormEl.classList.remove('active');
        loginFormEl.classList.add('active');
    });

    // Password Toggle
    var toggleLogin = document.getElementById('toggleLoginPassword');
    var toggleSignup = document.getElementById('toggleSignupPassword');
    if (toggleLogin) toggleLogin.addEventListener('click', function() {
        var input = document.getElementById('loginPassword');
        var icon = this.querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    if (toggleSignup) toggleSignup.addEventListener('click', function() {
        var input = document.getElementById('signupPassword');
        var icon = this.querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Forgot Password
    var forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value.trim();
        if (!email) { showToast('Enter your email first', 'error'); return; }
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() { showToast('Reset email sent!', 'success'); })
            .catch(function(err) { showToast(err.message, 'error'); });
    });

    // OTP Modal Close
    var closeOtp = document.getElementById('closeOtpModal');
    var otpModal = document.getElementById('otpModal');
    if (closeOtp) closeOtp.addEventListener('click', function(e) {
        e.preventDefault();
        if (otpModal) otpModal.style.display = 'none';
    });

    // Phone Auth
    var sendOtpBtn = document.getElementById('sendOtpBtn');
    var verifyOtpBtn = document.getElementById('verifyOtpBtn');

    if (sendOtpBtn) sendOtpBtn.addEventListener('click', function() {
        var phone = document.getElementById('phoneNumber').value.trim();
        if (!phone || phone === '+') { showToast('Enter valid phone number', 'error'); return; }
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible' });
        }
        firebase.auth().signInWithPhoneNumber(phone, window.recaptchaVerifier)
            .then(function(result) {
                window.confirmationResult = result;
                document.getElementById('phoneInputGroup').style.display = 'none';
                document.getElementById('otpInputGroup').style.display = 'block';
                sendOtpBtn.style.display = 'none';
                if (verifyOtpBtn) verifyOtpBtn.style.display = 'block';
                showToast('Code sent!', 'success');
            })
            .catch(function(err) { showToast(err.message, 'error'); });
    });

    if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', function() {
        var code = document.getElementById('otpCode').value.trim();
        if (!code || !window.confirmationResult) { showToast('Enter the code', 'error'); return; }
        window.confirmationResult.confirm(code)
            .then(function() {
                showToast('Phone verified!', 'success');
                setTimeout(function() { window.location.href = 'index.html'; }, 1000);
            })
            .catch(function() { showToast('Invalid code', 'error'); });
    });
});

// Toast CSS injection
var style = document.createElement('style');
style.textContent = '.login-toast{position:fixed;top:20px;right:20px;padding:12px 24px;background:rgba(18,18,42,0.95);color:white;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:10000;transform:translateY(-20px);opacity:0;transition:all 0.4s ease;border:1px solid rgba(255,255,255,0.1)}.login-toast.show{transform:translateY(0);opacity:1}.login-toast.success{border-left:4px solid #00f5d4}.login-toast.error{border-left:4px solid #ff3cac}.login-toast.info{border-left:4px solid #3b82f6}.toast-content{display:flex;align-items:center;gap:10px;font-weight:500}';
document.head.appendChild(style);
