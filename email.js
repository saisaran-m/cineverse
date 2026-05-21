/* ============================================
   CineVerse — Email Dispatch Engine v3.0
   Backend Serverless + Resend Secure Delivery
   ============================================ */

console.log('📧 [CineVerse] Email Dispatch Engine v3.0 Loaded (Resend Secure API)');

(function() {
    'use strict';

    // ──────────────────────────────────────────
    // INJECT CSS FOR EMAIL TOAST & MODAL
    // ──────────────────────────────────────────
    const emailStyles = document.createElement('style');
    emailStyles.textContent = `
        /* ═══ EMAIL NOTIFICATION TOAST ═══ */
        .cv-email-toast {
            position: fixed;
            bottom: 30px;
            right: -420px;
            width: 380px;
            max-width: 90vw;
            background: linear-gradient(135deg, rgba(18, 18, 52, 0.95), rgba(30, 20, 60, 0.95));
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 20px 22px;
            z-index: 999999;
            box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.6),
                0 0 30px rgba(255, 60, 172, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            cursor: pointer;
            transition: right 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.3s ease,
                        opacity 0.4s ease;
            font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
        }
        .cv-email-toast.visible {
            right: 30px;
        }
        .cv-email-toast:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow:
                0 25px 70px rgba(0, 0, 0, 0.7),
                0 0 40px rgba(255, 60, 172, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .cv-email-toast.hiding {
            right: -420px;
            opacity: 0;
        }

        .cv-email-toast-header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 12px;
        }
        .cv-email-toast-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, #ff3cac, #784ba0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
            box-shadow: 0 6px 20px rgba(255, 60, 172, 0.35);
            animation: cv-email-icon-pulse 2s ease-in-out infinite;
        }
        @keyframes cv-email-icon-pulse {
            0%, 100% { box-shadow: 0 6px 20px rgba(255, 60, 172, 0.35); }
            50% { box-shadow: 0 6px 30px rgba(255, 60, 172, 0.55); }
        }
        .cv-email-toast-title {
            font-size: 14px;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
            letter-spacing: -0.2px;
        }
        .cv-email-toast-sub {
            font-size: 11.5px;
            color: rgba(255, 255, 255, 0.45);
            margin: 3px 0 0;
        }
        .cv-email-toast-body {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 14px 16px;
        }
        .cv-email-toast-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2b86c5, #00f5d4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 700;
            color: white;
            flex-shrink: 0;
        }
        .cv-email-toast-info {
            flex: 1;
            min-width: 0;
        }
        .cv-email-toast-to {
            font-size: 13px;
            color: #ffffff;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .cv-email-toast-msg {
            font-size: 11.5px;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 2px;
        }
        .cv-email-toast-badge {
            font-size: 10px;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            flex-shrink: 0;
        }
        .cv-email-toast-badge.sent {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .cv-email-toast-badge.simulated {
            background: rgba(255, 215, 0, 0.1);
            color: #ffd700;
            border: 1px solid rgba(255, 215, 0, 0.15);
        }
        .cv-email-toast-hint {
            text-align: center;
            margin-top: 10px;
            font-size: 10.5px;
            color: rgba(255, 255, 255, 0.25);
            letter-spacing: 0.3px;
        }
        .cv-email-toast-shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
            animation: cv-email-shimmer 3s ease-in-out infinite;
            border-radius: 18px;
            pointer-events: none;
        }
        @keyframes cv-email-shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* ═══ EMAIL PREVIEW MODAL ═══ */
        .cv-email-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
            font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
        }
        .cv-email-modal-overlay.active {
            opacity: 1;
            pointer-events: all;
        }
        .cv-email-modal {
            width: 650px;
            max-width: 94vw;
            max-height: 88vh;
            background: linear-gradient(160deg, #12122a, #1a1a3e, #0d0d2b);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
            box-shadow:
                0 30px 80px rgba(0, 0, 0, 0.7),
                0 0 50px rgba(255, 60, 172, 0.1);
            transform: scale(0.9) translateY(30px);
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
        }
        .cv-email-modal-overlay.active .cv-email-modal {
            transform: scale(1) translateY(0);
        }
        .cv-email-modal-topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 18px 24px;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .cv-email-modal-dots {
            display: flex;
            gap: 7px;
        }
        .cv-email-modal-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        .cv-email-modal-dot.red { background: #ff5f57; }
        .cv-email-modal-dot.yellow { background: #ffbd2e; }
        .cv-email-modal-dot.green { background: #28c840; }
        .cv-email-modal-label {
            flex: 1;
            text-align: center;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.35);
            font-weight: 500;
        }
        .cv-email-modal-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.3);
            font-size: 18px;
            cursor: pointer;
            padding: 4px;
            transition: color 0.2s;
        }
        .cv-email-modal-close:hover {
            color: #ff3cac;
        }
        .cv-email-modal-meta {
            padding: 16px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .cv-email-modal-meta-row {
            display: flex;
            gap: 10px;
            font-size: 12.5px;
        }
        .cv-email-modal-meta-label {
            color: rgba(255, 255, 255, 0.3);
            min-width: 55px;
            font-weight: 500;
        }
        .cv-email-modal-meta-value {
            color: rgba(255, 255, 255, 0.7);
            font-weight: 600;
        }
        .cv-email-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }
        .cv-email-modal-body::-webkit-scrollbar {
            width: 6px;
        }
        .cv-email-modal-body::-webkit-scrollbar-track {
            background: transparent;
        }
        .cv-email-modal-body::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
        }
        .cv-email-modal-iframe {
            width: 100%;
            min-height: 500px;
            border: none;
            background: #0a0a1a;
        }

        @media (max-width: 600px) {
            .cv-email-toast {
                width: calc(100vw - 30px);
                right: -110vw;
                bottom: 15px;
            }
            .cv-email-toast.visible {
                right: 15px;
            }
            .cv-email-modal {
                border-radius: 16px;
            }
        }
    `;
    document.head.appendChild(emailStyles);

    // ──────────────────────────────────────────
    // EMAIL HTML TEMPLATE GENERATOR
    // ──────────────────────────────────────────
    function generateEmailHTML(email, name, type) {
        const userName = name || 'Movie Lover';
        const isWelcome = type === 'welcome';
        const currentTime = new Date().toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const heroTitle = isWelcome
            ? `Welcome to CineVerse, ${userName}!`
            : `Hey ${userName}, you just logged in!`;

        const heroMessage = isWelcome
            ? `Thank you for joining the CineVerse family! You now have access to thousands of movies from every language and genre — all completely free. Your cinematic journey starts now.`
            : `Thank you for logging into CineVerse! We noticed a new sign-in to your account. If this was you, enjoy your movies! If not, please secure your account immediately.`;

        return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 20px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#12122a 0%,#1a1a3e 50%,#0d0d2b 100%);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(255,60,172,0.1);">
                <tr><td style="background:linear-gradient(135deg,#ff3cac,#784ba0,#2b86c5);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:8px;">🎬</div>
                    <h1 style="margin:0;color:white;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Cine<span style="color:#ffd700;">Verse</span></h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Stream Movies in Every Language</p>
                </td></tr>
                <tr><td style="padding:40px 35px;">
                    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;">${heroTitle}</h2>
                    <p style="margin:0 0 28px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;">${heroMessage}</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;margin-bottom:30px;">
                        <tr><td style="padding:22px 25px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="color:rgba(255,255,255,0.45);font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;">Account</td>
                                    <td style="color:rgba(255,255,255,0.45);font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;text-align:right;">Time</td>
                                </tr>
                                <tr>
                                    <td style="color:#ffffff;font-size:14px;font-weight:600;">${email}</td>
                                    <td style="color:rgba(255,255,255,0.6);font-size:13px;text-align:right;">${currentTime}</td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                        <a href="https://cineverse-sai.vercel.app/" style="display:inline-block;background:linear-gradient(135deg,#ff3cac,#784ba0);color:white;text-decoration:none;padding:15px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;box-shadow:0 8px 25px rgba(255,60,172,0.35);">${isWelcome ? '🎬 Start Watching Now' : '🍿 Browse Movies'}</a>
                    </td></tr></table>
                </td></tr>
                ${isWelcome ? `<tr><td style="padding:0 35px 35px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:25px;">
                        <tr>
                            <td width="33%" style="text-align:center;padding:10px;">
                                <div style="font-size:28px;margin-bottom:8px;">🌍</div>
                                <div style="color:#ffffff;font-size:13px;font-weight:600;">Every Language</div>
                                <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:3px;">Global movies</div>
                            </td>
                            <td width="33%" style="text-align:center;padding:10px;">
                                <div style="font-size:28px;margin-bottom:8px;">⭐</div>
                                <div style="color:#ffffff;font-size:13px;font-weight:600;">Top Rated</div>
                                <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:3px;">Best films curated</div>
                            </td>
                            <td width="33%" style="text-align:center;padding:10px;">
                                <div style="font-size:28px;margin-bottom:8px;">🆓</div>
                                <div style="color:#ffffff;font-size:13px;font-weight:600;">100% Free</div>
                                <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:3px;">No hidden fees</div>
                            </td>
                        </tr>
                    </table>
                </td></tr>` : ''}
                <tr><td style="background:rgba(0,0,0,0.3);padding:25px 35px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:12px;">© ${new Date().getFullYear()} CineVerse — Stream Movies in Every Language</p>
                    <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">You received this email because you ${isWelcome ? 'created an account on' : 'signed into'} CineVerse.</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body></html>`;
    }

    // ──────────────────────────────────────────
    // SHOW EMAIL NOTIFICATION TOAST
    // ──────────────────────────────────────────
    function showEmailToast(email, name, type, wasSimulated) {
        const existing = document.querySelector('.cv-email-toast');
        if (existing) existing.remove();

        const isWelcome = type === 'welcome';
        const initial = (name || email || 'U').charAt(0).toUpperCase();

        const toast = document.createElement('div');
        toast.className = 'cv-email-toast';
        toast.innerHTML = `
            <div class="cv-email-toast-shimmer"></div>
            <div class="cv-email-toast-header">
                <div class="cv-email-toast-icon">📧</div>
                <div>
                    <p class="cv-email-toast-title">${isWelcome ? 'Welcome Email Sent!' : 'Login Alert Sent!'}</p>
                    <p class="cv-email-toast-sub">${wasSimulated ? 'Simulation Mode • Click to preview' : 'Delivered successfully to inbox'}</p>
                </div>
            </div>
            <div class="cv-email-toast-body">
                <div class="cv-email-toast-avatar">${initial}</div>
                <div class="cv-email-toast-info">
                    <div class="cv-email-toast-to">${email}</div>
                    <div class="cv-email-toast-msg">${isWelcome ? 'Welcome to CineVerse!' : 'Thanks for logging in!'}</div>
                </div>
                <span class="cv-email-toast-badge ${wasSimulated ? 'simulated' : 'sent'}">${wasSimulated ? 'Preview' : 'Sent ✓'}</span>
            </div>
            <div class="cv-email-toast-hint">Tap to ${wasSimulated ? 'preview email template' : 'view sent email'}</div>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('visible');
            });
        });

        toast.addEventListener('click', () => {
            showEmailPreviewModal(email, name, type, wasSimulated);
        });

        setTimeout(() => {
            toast.classList.add('hiding');
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 700);
        }, 8000);
    }

    // ──────────────────────────────────────────
    // EMAIL PREVIEW MODAL
    // ──────────────────────────────────────────
    function showEmailPreviewModal(email, name, type, wasSimulated) {
        const existingModal = document.querySelector('.cv-email-modal-overlay');
        if (existingModal) existingModal.remove();

        const isWelcome = type === 'welcome';
        const subject = isWelcome
            ? `🎬 Welcome to CineVerse, ${name || 'Movie Lover'}!`
            : `🔐 Login Alert — CineVerse`;

        const overlay = document.createElement('div');
        overlay.className = 'cv-email-modal-overlay';
        overlay.innerHTML = `
            <div class="cv-email-modal">
                <div class="cv-email-modal-topbar">
                    <div class="cv-email-modal-dots">
                        <div class="cv-email-modal-dot red"></div>
                        <div class="cv-email-modal-dot yellow"></div>
                        <div class="cv-email-modal-dot green"></div>
                    </div>
                    <div class="cv-email-modal-label">${wasSimulated ? '📋 Email Preview (Simulation)' : '✅ Email Delivered to Inbox'}</div>
                    <button class="cv-email-modal-close" id="cvEmailModalClose">✕</button>
                </div>
                <div class="cv-email-modal-meta">
                    <div class="cv-email-modal-meta-row">
                        <span class="cv-email-modal-meta-label">From:</span>
                        <span class="cv-email-modal-meta-value">CineVerse &lt;noreply@cineverse.app&gt;</span>
                    </div>
                    <div class="cv-email-modal-meta-row">
                        <span class="cv-email-modal-meta-label">To:</span>
                        <span class="cv-email-modal-meta-value">${email}</span>
                    </div>
                    <div class="cv-email-modal-meta-row">
                        <span class="cv-email-modal-meta-label">Subject:</span>
                        <span class="cv-email-modal-meta-value">${subject}</span>
                    </div>
                </div>
                <div class="cv-email-modal-body">
                    <iframe class="cv-email-modal-iframe" id="cvEmailIframe" sandbox="allow-same-origin"></iframe>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        });

        setTimeout(() => {
            const iframe = document.getElementById('cvEmailIframe');
            if (iframe) {
                const emailHTML = generateEmailHTML(email, name, type);
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                doc.open();
                doc.write(emailHTML);
                doc.close();
                setTimeout(() => {
                    try { iframe.style.height = doc.body.scrollHeight + 'px'; } catch(e) {}
                }, 200);
            }
        }, 100);

        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 450);
        };

        document.getElementById('cvEmailModalClose').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // ──────────────────────────────────────────
    // MAIN DISPATCH FUNCTION (Vercel Serverless Secure API)
    // ──────────────────────────────────────────
    window.sendCineVerseEmail = async function(email, name, type) {
        if (!email) {
            console.warn('📧 [CineVerse] Email dispatch skipped — no email provided');
            return;
        }

        type = type || 'login_alert';
        name = name || 'Movie Lover';

        console.log(`📧 [CineVerse] Dispatching ${type} email to ${email} via Serverless API...`);

        // Detect local file protocol to avoid fetch CORS blocking in raw files
        const isLocalFile = window.location.protocol === 'file:';
        if (isLocalFile) {
            console.log('📧 [CineVerse] Local file protocol detected — simulating email');
            showEmailToast(email, name, type, true);
            return { success: true, simulated: true };
        }

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, type })
            });

            const data = await response.json();

            if (data.simulated) {
                console.log('📧 [CineVerse] Server returned simulation mode:', data.message);
                showEmailToast(email, name, type, true);
            } else if (data.success) {
                console.log('📧 [CineVerse] ✅ Email sent successfully via secure Resend endpoint!', data);
                showEmailToast(email, name, type, false);
            } else {
                console.warn('📧 [CineVerse] Backend email dispatch issue, falling back:', data);
                showEmailToast(email, name, type, true);
            }

            return data;
        } catch (error) {
            console.warn('📧 [CineVerse] API fetch failed — falling back to simulation:', error.message);
            showEmailToast(email, name, type, true);
            return { success: true, simulated: true, error: error.message };
        }
    };

    console.log('📧 [CineVerse] Email engine ready — window.sendCineVerseEmail() available');
})();
