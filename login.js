console.log('🚀 [CineVerse] login.js v7.0 Loaded');

// ============================================
// TOAST NOTIFICATION
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
// WAIT FOR EVERYTHING TO LOAD, THEN ATTACH HANDLERS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth System v7.0 initializing...');

    // ------------------------------------------
    // GOOGLE SIGN IN — using addEventListener (not onclick)
    // Uses signInWithRedirect ONLY — most reliable
    // ------------------------------------------
    var googleBtns = document.querySelectorAll('#googleLoginBtn, #googleSignupBtn');
    googleBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 Google button clicked!');

            // Visual feedback
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.style.opacity = '0.6';

            try {
                var provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');

                // signInWithRedirect — works on ALL browsers
                // Cannot be blocked by popup blockers or tracking prevention
                console.log('🔄 Redirecting to Google sign-in...');
                firebase.auth().signInWithRedirect(provider);
            } catch(err) {
                console.error('❌ Error:', err);
                btn.innerHTML = '<i class="fab fa-google"></i>';
                btn.style.opacity = '1';
                showToast('Error: ' + err.message, 'error');
            }
        });
    });
    console.log('✅ Google buttons attached:', googleBtns.length);

    // ------------------------------------------
    // PHONE, GITHUB, TWITTER — "Coming Soon"
    // ------------------------------------------
    var comingSoonBtns = document.querySelectorAll('#phoneLoginBtn, #phoneSignupBtn, #githubLoginBtn, #githubSignupBtn, #twitterLoginBtn, #twitterSignupBtn');
    comingSoonBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showToast('🎬 Coming Soon! This login method will be available shortly.', 'info');
        });
    });
    console.log('✅ Coming Soon buttons attached:', comingSoonBtns.length);

    // ------------------------------------------
    // REDIRECT RESULT HANDLER
    // When user comes back from Google, catch the result
    // ------------------------------------------
    firebase.auth().getRedirectResult()
        .then(function(result) {
            if (result && result.user) {
                console.log('✅ Google login success:', result.user.email);
                localStorage.setItem('cineverse_logged_in', 'true');
                showToast('Welcome, ' + (result.user.displayName || result.user.email) + '!', 'success');
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 800);
            }
        })
        .catch(function(error) {
            console.error('❌ Redirect error:', error.code, error.message);
            if (error.code === 'auth/account-exists-with-different-credential') {
                showToast('This email is already linked to another sign-in method.', 'error');
            } else if (error.message) {
                showToast('Login failed: ' + error.message, 'error');
            }
        });

    // ------------------------------------------
    // AUTH STATE — auto-redirect if already logged in
    // ------------------------------------------
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('👤 Already logged in:', user.email);
            localStorage.setItem('cineverse_logged_in', 'true');
            window.location.href = 'index.html';
        }
    });

    // ------------------------------------------
    // EMAIL LOGIN
    // ------------------------------------------
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

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function() {
                    localStorage.setItem('cineverse_logged_in', 'true');
                    showToast('Welcome back!', 'success');
                    setTimeout(function() { window.location.href = 'index.html'; }, 1000);
                })
                .catch(function(error) {
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

    // ------------------------------------------
    // EMAIL SIGNUP
    // ------------------------------------------
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

            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function(result) {
                    return result.user.updateProfile({ displayName: name });
                })
                .then(function() {
                    localStorage.setItem('cineverse_logged_in', 'true');
                    showToast('Account created! Welcome!', 'success');
                    setTimeout(function() { window.location.href = 'index.html'; }, 1000);
                })
                .catch(function(error) {
                    btn.disabled = false;
                    var msg = 'Signup failed';
                    if (error.code === 'auth/email-already-in-use') msg = 'Email already in use';
                    else if (error.code === 'auth/weak-password') msg = 'Password too weak';
                    showToast(msg, 'error');
                });
        });
    }

    // ------------------------------------------
    // FORM TOGGLE (Login <-> Signup)
    // ------------------------------------------
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

    // ------------------------------------------
    // PASSWORD TOGGLE
    // ------------------------------------------
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

    // ------------------------------------------
    // FORGOT PASSWORD
    // ------------------------------------------
    var forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value.trim();
        if (!email) { showToast('Enter your email first', 'error'); return; }
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() { showToast('Reset email sent!', 'success'); })
            .catch(function(err) { showToast(err.message, 'error'); });
    });

    // ------------------------------------------
    // OTP MODAL (for future phone auth)
    // ------------------------------------------
    var closeOtp = document.getElementById('closeOtpModal');
    var otpModal = document.getElementById('otpModal');
    if (closeOtp) closeOtp.addEventListener('click', function(e) {
        e.preventDefault();
        if (otpModal) otpModal.style.display = 'none';
    });
});

// Toast CSS injection
var toastStyle = document.createElement('style');
toastStyle.textContent = '.login-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-20px);padding:14px 28px;background:rgba(18,18,42,0.97);color:white;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,0.6);z-index:10000;opacity:0;transition:all 0.4s ease;border:1px solid rgba(255,255,255,0.1);max-width:90%;text-align:center;font-size:0.95rem}.login-toast.show{transform:translateX(-50%) translateY(0);opacity:1}.login-toast.success{border-bottom:3px solid #00f5d4}.login-toast.error{border-bottom:3px solid #ff3cac}.login-toast.info{border-bottom:3px solid #3b82f6}.toast-content{display:flex;align-items:center;gap:10px;font-weight:500}';
document.head.appendChild(toastStyle);
