console.log('🚀 [CineVerse] login.js v9.0 Loaded with Premium Animations & Bulletproof Auth');

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
function showToast(message, type) {
    var existing = document.querySelector('.login-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'login-toast ' + (type || 'info');
    toast.innerHTML = '<div class="toast-content"><i class="' + getToastIcon(type) + '"></i><span>' + message + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    
    // Auto remove
    var timeoutId = setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 400);
    }, 4000);

    toast.addEventListener('click', function() {
        clearTimeout(timeoutId);
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 400);
    });
}

function getToastIcon(type) {
    if (type === 'success') return 'fas fa-check-circle';
    if (type === 'error') return 'fas fa-exclamation-circle';
    if (type === 'warning') return 'fas fa-exclamation-triangle';
    return 'fas fa-info-circle';
}

// ============================================
// INTERACTIVE GOOGLE DEV BYPASS MODAL
// ============================================
function showBypassModal() {
    let modal = document.getElementById('cineverseBypassModal');
    if (modal) {
        modal.classList.add('active');
        return;
    }
    
    modal = document.createElement('div');
    modal.id = 'cineverseBypassModal';
    modal.className = 'bypass-modal-overlay';
    
    modal.innerHTML = `
        <div class="bypass-modal-card" id="bypassModalCard">
            <div class="bypass-modal-content-main" id="bypassMainView">
                <div class="bypass-modal-icon">
                    <i class="fab fa-google"></i>
                </div>
                <h2>Google Sign-In Restriction</h2>
                <p>Google OAuth logins are restricted by default under the local <code>file://</code> protocol. Host CineVerse on a local server or use our developer bypass.</p>
                <div class="bypass-options">
                    <button class="bypass-btn primary" id="bypassEnterBtn">
                        <i class="fas fa-magic"></i> Enter Dev Guest Mode
                    </button>
                    <button class="bypass-btn secondary" id="bypassLearnBtn">
                        <i class="fas fa-server"></i> How to Run Server
                    </button>
                </div>
            </div>
            
            <div class="server-guide-content" id="serverGuideView" style="display: none;">
                <div class="bypass-modal-icon">
                    <i class="fas fa-server"></i>
                </div>
                <h2>Local Server Setup</h2>
                <p>To enable real Google Authentication, run CineVerse using a web server in your terminal:</p>
                <ul class="server-guide-steps">
                    <li>1. Open terminal in the <code>saiproject</code> directory</li>
                    <li>2. Install developer modules: <br><code>npm install</code></li>
                    <li>3. Start development server: <br><code>npm run dev</code></li>
                    <li>4. Open the address in your browser: <br><code>http://localhost:3000</code></li>
                </ul>
                <div class="bypass-options">
                    <button class="bypass-btn primary" id="bypassBackBtn">
                        <i class="fas fa-arrow-left"></i> Back to Login Options
                    </button>
                </div>
            </div>
            
            <button class="bypass-close-btn" id="bypassCloseBtn">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate active state
    setTimeout(() => modal.classList.add('active'), 50);
    
    // Handlers
    document.getElementById('bypassEnterBtn').addEventListener('click', () => {
        showToast('🔑 Initializing Google Dev Bypass...', 'success');
        localStorage.setItem('cineverse_logged_in', 'true');
        localStorage.setItem('cineverse_mock_name', 'Google Developer');
        localStorage.setItem('cineverse_mock_avatar', 'assets/logo.png');
        // Send simulated email for dev bypass
        if (window.sendCineVerseEmail) {
            window.sendCineVerseEmail('developer@cineverse.local', 'Google Developer', 'login_alert');
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
    
    document.getElementById('bypassLearnBtn').addEventListener('click', () => {
        document.getElementById('bypassMainView').style.display = 'none';
        document.getElementById('serverGuideView').style.display = 'block';
    });
    
    document.getElementById('bypassBackBtn').addEventListener('click', () => {
        document.getElementById('serverGuideView').style.display = 'none';
        document.getElementById('bypassMainView').style.display = 'block';
    });
    
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 400);
    };
    
    document.getElementById('bypassCloseBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ============================================
// INITIALIZE SYSTEMS ON DOM LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth System initializing...');
    var isActivelyLoggingIn = false;

    // 1. Particle Canvas Simulation
    initParticleCanvas();
    
    // 2. 3D Floating Poster Background
    initFloatingPosters();
    
    // 3. 3D Interactive Card Tilting
    init3DTilt();
    
    // 4. Spectacular 3D Card Flipping Swap
    initCardFlip();
    
    // 5. Password Strength Meter
    initPasswordStrength();

    // ------------------------------------------
    // GOOGLE SIGN IN TRIGGERS
    // ------------------------------------------
    var googleBtns = document.querySelectorAll('#googleLoginBtn, #googleSignupBtn');
    
    function resetGoogleButtons() {
        googleBtns.forEach(function(btn) {
            btn.style.opacity = '1';
            btn.querySelector('i').className = 'fab fa-google google-icon-color';
        });
    }

    googleBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            isActivelyLoggingIn = true;
            console.log('🚀 Google button clicked!');

            // Visual feedback
            btn.style.opacity = '0.6';
            btn.querySelector('i').className = 'fas fa-spinner fa-spin';

            // Protocol checks
            if (window.location.protocol === 'file:') {
                console.warn('⚠️ Google Auth is restricted under file:// protocol.');
                showBypassModal();
                resetGoogleButtons();
                return;
            }

            if (typeof firebase === 'undefined' || !firebase.apps || firebase.apps.length === 0) {
                showToast('⚠️ Firebase not initialized. Triggering dev bypass...', 'warning');
                showBypassModal();
                resetGoogleButtons();
                return;
            }

            try {
                var provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');

                console.log('🔄 Attempting Google popup sign-in...');
                firebase.auth().signInWithPopup(provider)
                    .then(function(result) {
                        if (result && result.user) {
                            console.log('✅ Google login success via popup:', result.user.email);
                            localStorage.setItem('cineverse_logged_in', 'true');
                            showToast('Welcome, ' + (result.user.displayName || result.user.email) + '!', 'success');
                            // Send login email notification and wait for dispatch before redirecting
                            if (window.sendCineVerseEmail) {
                                window.sendCineVerseEmail(
                                    result.user.email,
                                    result.user.displayName || result.user.email,
                                    result.additionalUserInfo && result.additionalUserInfo.isNewUser ? 'welcome' : 'login_alert'
                                ).then(function() {
                                    window.location.href = 'index.html';
                                }).catch(function() {
                                    window.location.href = 'index.html';
                                });
                            } else {
                                window.location.href = 'index.html';
                            }
                        }
                    })
                    .catch(function(error) {
                        console.error('❌ Google popup error:', error.code, error.message);
                        
                        // Fall back to redirect if popup is blocked
                        if (error.code === 'auth/popup-blocked' || 
                            error.code === 'auth/cancelled-popup-request' ||
                            error.code === 'auth/internal-error') {
                            console.log('🔄 Popup blocked — executing redirect fallback...');
                            showToast('Popup blocked. Redirecting to Google...', 'info');
                            firebase.auth().signInWithRedirect(provider);
                            return;
                        }
                        
                        resetGoogleButtons();
                        if (error.code === 'auth/popup-closed-by-user') {
                            showToast('Login cancelled', 'info');
                        } else {
                            showToast('Login failed: ' + error.message, 'error');
                        }
                    });
            } catch(err) {
                console.error('❌ Google Setup Error:', err);
                resetGoogleButtons();
                showToast('Google Sign-In is restricted locally. Opening Dev Bypass...', 'warning');
                showBypassModal();
            }
        });
    });

    // ------------------------------------------
    // COMING SOON BUTTONS
    // ------------------------------------------
    var comingSoonBtns = document.querySelectorAll('.social-btn.phone, .social-btn.github, .social-btn.twitter');
    comingSoonBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showToast('🎬 Coming Soon! This login method will be available shortly.', 'info');
        });
    });

    // ------------------------------------------
    // REDIRECT RESULT HANDLER
    // ------------------------------------------
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        firebase.auth().getRedirectResult()
            .then(function(result) {
                if (result && result.user) {
                    console.log('✅ Google redirect success:', result.user.email);
                    localStorage.setItem('cineverse_logged_in', 'true');
                    showToast('Welcome, ' + (result.user.displayName || result.user.email) + '!', 'success');
                    // Send login email notification and wait for dispatch before redirecting
                    if (window.sendCineVerseEmail) {
                        window.sendCineVerseEmail(
                            result.user.email,
                            result.user.displayName || result.user.email,
                            'login_alert'
                        ).then(function() {
                            window.location.href = 'index.html';
                        }).catch(function() {
                            window.location.href = 'index.html';
                        });
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            })
            .catch(function(error) {
                console.error('❌ Redirect error:', error);
                if (error.message) showToast('Login failed: ' + error.message, 'error');
            });

        // ------------------------------------------
        // DYNAMIC REDIRECT
        // ------------------------------------------
        firebase.auth().onAuthStateChanged(function(user) {
            if (user && !isActivelyLoggingIn) {
                console.log('👤 Already authenticated:', user.email);
                localStorage.setItem('cineverse_logged_in', 'true');
                window.location.href = 'index.html';
            }
        });
    }

    // ------------------------------------------
    // EMAIL LOGIN FORM SUBMIT
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
            btn.classList.add('loading');
            btn.querySelector('.btn-text').textContent = 'Signing in...';

            isActivelyLoggingIn = true;
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function(result) {
                    localStorage.setItem('cineverse_logged_in', 'true');
                    showToast('Welcome back!', 'success');
                    // Send login alert email and wait for dispatch before redirecting
                    if (window.sendCineVerseEmail) {
                        var user = result.user || {};
                        window.sendCineVerseEmail(user.email || email, user.displayName || email, 'login_alert')
                            .then(function() { window.location.href = 'index.html'; })
                            .catch(function() { window.location.href = 'index.html'; });
                    } else {
                        window.location.href = 'index.html';
                    }
                })
                .catch(function(error) {
                    btn.disabled = false;
                    btn.classList.remove('loading');
                    btn.querySelector('.btn-text').textContent = 'Sign In';
                    
                    var msg = 'Login failed';
                    if (error.code === 'auth/user-not-found') msg = 'No account found with this email';
                    else if (error.code === 'auth/wrong-password') msg = 'Incorrect password. Try again!';
                    else if (error.code === 'auth/invalid-email') msg = 'Invalid email address';
                    else if (error.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later!';
                    showToast(msg, 'error');
                });
        });
    }

    // ------------------------------------------
    // EMAIL SIGNUP FORM SUBMIT
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
            if (password.length < 6) { showToast('Password must be at least 6 characters long', 'error'); return; }
            if (terms && !terms.checked) { showToast('Accept terms first', 'error'); return; }

            btn.disabled = true;
            btn.classList.add('loading');
            btn.querySelector('.btn-text').textContent = 'Creating...';

            isActivelyLoggingIn = true;
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function(result) {
                    return result.user.updateProfile({ displayName: name }).then(function() { return result; });
                })
                .then(function(result) {
                    localStorage.setItem('cineverse_logged_in', 'true');
                    showToast('Account created! Welcome to CineVerse!', 'success');
                    // Send welcome email to new user and wait for dispatch before redirecting
                    if (window.sendCineVerseEmail) {
                        window.sendCineVerseEmail(email, name, 'welcome')
                            .then(function() { window.location.href = 'index.html'; })
                            .catch(function() { window.location.href = 'index.html'; });
                    } else {
                        window.location.href = 'index.html';
                    }
                })
                .catch(function(error) {
                    btn.disabled = false;
                    btn.classList.remove('loading');
                    btn.querySelector('.btn-text').textContent = 'Create Account';
                    
                    var msg = 'Signup failed';
                    if (error.code === 'auth/email-already-in-use') msg = 'This email is already in use!';
                    else if (error.code === 'auth/weak-password') msg = 'Password is too weak!';
                    else if (error.code === 'auth/invalid-email') msg = 'Invalid email address';
                    showToast(msg, 'error');
                });
        });
    }

    // ------------------------------------------
    // PASSWORD RESET
    // ------------------------------------------
    var forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value.trim();
            if (!email) { showToast('Enter your email address in the field first!', 'error'); return; }
            
            firebase.auth().sendPasswordResetEmail(email)
                .then(function() { showToast('Password reset email sent successfully!', 'success'); })
                .catch(function(err) { showToast(err.message, 'error'); });
        });
    }

    // ------------------------------------------
    // PASSWORD VISIBILITY TOGGLES
    // ------------------------------------------
    var toggleLogin = document.getElementById('toggleLoginPassword');
    var toggleSignup = document.getElementById('toggleSignupPassword');
    if (toggleLogin) {
        toggleLogin.addEventListener('click', function() {
            var input = document.getElementById('loginPassword');
            var icon = this.querySelector('i');
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    if (toggleSignup) {
        toggleSignup.addEventListener('click', function() {
            var input = document.getElementById('signupPassword');
            var icon = this.querySelector('i');
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
});

// ============================================
// DYNAMIC DUST & LIGHT CONSTELLATION CANVAS
// ============================================
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const colors = ['#00f5d4', '#ff3cac', '#ffd700', '#ffffff'];
    let mouse = { x: null, y: null, radius: 140 };
    
    const resizeCanvas = () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        initParticles();
    };
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = 1 + Math.random() * 2.2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.baseOpacity = 0.15 + Math.random() * 0.35;
            this.opacity = this.baseOpacity;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce on wall boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            
            // Constellation line connections to cursor
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    this.opacity = Math.min(1, this.baseOpacity + (1 - dist / mouse.radius) * 0.6);
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = this.color;
                    ctx.globalAlpha = (1 - dist / mouse.radius) * 0.12;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                } else {
                    this.opacity = this.baseOpacity;
                }
            } else {
                this.opacity = this.baseOpacity;
            }
            this.draw();
        }
    }
    
    function initParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 10000);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    resizeCanvas();
    animate();
}

// ============================================
// DYNAMIC 3D FLOATING MOVIE POSTERS
// ============================================
function initFloatingPosters() {
    const container = document.getElementById('floatingPosters');
    if (!container) return;

    const movies = [
        { title: "Venom: The Last Dance", colors: ['#1a1a2e', '#e94560'] },
        { title: "The Wild Robot", colors: ['#a8ff78', '#78ffd6'] },
        { title: "Deadpool & Wolverine", colors: ['#e74c3c', '#c0392b'] },
        { title: "Transformers One", colors: ['#2b86c5', '#00f5d4'] },
        { title: "Smile 2", colors: ['#f72585', '#b5179e'] },
        { title: "Alien: Romulus", colors: ['#141e30', '#243b55'] },
        { title: "Your Name", colors: ['#2b86c5', '#00f5d4'] },
        { title: "Spirited Away", colors: ['#8b5cf6', '#a855f7'] },
        { title: "Suzume", colors: ['#ff3cac', '#784ba0'] },
        { title: "Howl's Moving Castle", colors: ['#f7971e', '#ffd200'] },
        { title: "Atlas", colors: ['#434343', '#000000'] }
    ];

    container.innerHTML = '';

    movies.forEach(function(m, idx) {
        const poster = document.createElement('div');
        poster.className = 'floating-poster';

        // Escape SVG characters
        var escTitle = m.title.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
        
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'>
          <defs>
            <linearGradient id='g_${idx}' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stop-color='${m.colors[0]}'/>
              <stop offset='100%' stop-color='${m.colors[1]}'/>
            </linearGradient>
          </defs>
          <rect width='200' height='300' fill='url(#g_${idx})' rx='12' ry='12'/>
          <text x='100' y='140' font-family='"Outfit",sans-serif' font-size='15' fill='white' text-anchor='middle' font-weight='900'>${escTitle}</text>
          <text x='100' y='185' font-family='sans-serif' font-size='24' fill='rgba(255,255,255,0.4)' text-anchor='middle'>🎬</text>
        </svg>`;

        poster.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;

        // Mathematical positions
        const x = Math.random() * 92;
        const z = Math.floor(Math.random() * 200) - 100;
        const rot = (Math.random() * 26) - 13;
        const duration = 20 + Math.random() * 18;
        const delay = -(Math.random() * duration);
        const blur = Math.max(0, Math.min(4, Math.abs(z) / 30));
        const opacity = 0.08 + (1 - Math.abs(z) / 100) * 0.08;

        poster.style.setProperty('--x', `${x}%`);
        poster.style.setProperty('--z', `${z}px`);
        poster.style.setProperty('--rot', `${rot}deg`);
        poster.style.setProperty('--duration', `${duration}s`);
        poster.style.setProperty('--blur', `${blur}px`);
        poster.style.setProperty('--opacity', opacity);
        poster.style.animationDelay = `${delay}s`;

        container.appendChild(poster);
    });
}

// ============================================
// INTERACTIVE 3D TILT & GLOW REFLECTION
// ============================================
function init3DTilt() {
    const card = document.getElementById('authCard');
    if (!card) return;

    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Dynamic tilt (Max 8 deg)
        const tiltX = -(y / (rect.height / 2)) * 8;
        const tiltY = (x / (rect.width / 2)) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Spotlight glow coordinate mapping
        const glowX = (e.clientX - rect.left) / rect.width * 100;
        const glowY = (e.clientY - rect.top) / rect.height * 100;
        card.style.setProperty('--glow-x', `${glowX}%`);
        card.style.setProperty('--glow-y', `${glowY}%`);
    });

    card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.setProperty('--glow-x', '50%');
        card.style.setProperty('--glow-y', '50%');
    });
}

// ============================================
// SPECTACULAR 3D CARD SPIN FORM TOGGLING
// ============================================
function initCardFlip() {
    const card = document.getElementById('authCard');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (!card || !showSignup || !showLogin || !loginForm || !signupForm) return;
    
    const triggerFlip = (showForm, hideForm) => {
        card.classList.add('flipping');
        
        // Swap active classes exactly at 350ms (card rotated 90deg, edge-on)
        setTimeout(() => {
            hideForm.classList.remove('active');
            showForm.classList.add('active');
        }, 350);
        
        // Clear class after completion
        setTimeout(() => {
            card.classList.remove('flipping');
        }, 800);
    };
    
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        triggerFlip(signupForm, loginForm);
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        triggerFlip(loginForm, signupForm);
    });
}

// ============================================
// REAL-TIME PASSWORD STRENGTH INDICATOR
// ============================================
function initPasswordStrength() {
    const pwdInput = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    const strengthFill = document.getElementById('strengthFill');
    
    if (!pwdInput || !strengthBar || !strengthText || !strengthFill) return;
    
    pwdInput.addEventListener('input', function() {
        const val = pwdInput.value;
        if (!val) {
            strengthBar.className = 'password-strength';
            strengthText.textContent = '';
            strengthFill.style.width = '0%';
            return;
        }
        
        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        
        strengthBar.className = 'password-strength'; // Reset
        
        if (score <= 2) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (score <= 4) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Medium';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    });
}

// Inject Toast CSS styles dynamically
var toastStyle = document.createElement('style');
toastStyle.textContent = '.login-toast{position:fixed;top:25px;left:50%;transform:translateX(-50%) translateY(-20px);padding:14px 28px;background:rgba(18,18,42,0.98);color:white;border-radius:15px;box-shadow:0 12px 45px rgba(0,0,0,0.65);z-index:100000;opacity:0;transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);border:1px solid rgba(255,255,255,0.08);max-width:90%;text-align:center;font-size:0.95rem;cursor:pointer}.login-toast.show{transform:translateX(-50%) translateY(0);opacity:1}.login-toast.success{border-left:4px solid #10b981;box-shadow:0 12px 45px rgba(16,185,129,0.15)}.login-toast.error{border-left:4px solid #ef4444;box-shadow:0 12px 45px rgba(239,68,68,0.15)}.login-toast.info{border-left:4px solid #3b82f6;box-shadow:0 12px 45px rgba(59,130,246,0.15)}.login-toast.warning{border-left:4px solid #f59e0b;box-shadow:0 12px 45px rgba(245,158,11,0.15)}.toast-content{display:flex;align-items:center;justify-content:center;gap:12px;font-weight:600}.toast-content i{font-size:1.15rem;vertical-align:middle}.login-toast.success i{color:#10b981}.login-toast.error i{color:#ef4444}.login-toast.info i{color:#3b82f6}.login-toast.warning i{color:#f59e0b}';
document.head.appendChild(toastStyle);
