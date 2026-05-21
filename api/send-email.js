import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name, type } = req.body || {};

    if (!email) {
        return res.status(400).json({ error: 'Missing email address' });
    }

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS; // Gmail App Password (16 characters)

    if (!EMAIL_USER || !EMAIL_PASS) {
        return res.status(200).json({
            success: false,
            simulated: true,
            message: 'EMAIL_USER or EMAIL_PASS not configured in Vercel. Simulated on client.',
            email,
            name: name || 'CineVerse User',
            type: type || 'login_alert'
        });
    }

    // Build beautiful HTML email
    const userName = name || 'Movie Lover';
    const isWelcome = type === 'welcome';
    const currentTime = new Date().toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });

    const subject = isWelcome
        ? `🎬 Welcome to CineVerse, ${userName}!`
        : `🔐 Login Alert — CineVerse`;

    const heroTitle = isWelcome
        ? `Welcome to CineVerse, ${userName}!`
        : `Hey ${userName}, you just logged in!`;

    const heroMessage = isWelcome
        ? `Thank you for joining the CineVerse family! You now have access to thousands of movies from every language and genre — all completely free. Your cinematic journey starts now.`
        : `Thank you for logging into CineVerse! We noticed a new sign-in to your account. If this was you, enjoy your movies! If not, please secure your account immediately.`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 20px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#12122a 0%,#1a1a3e 50%,#0d0d2b 100%);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(255,60,172,0.1);">
                
                <!-- Header Banner -->
                <tr><td style="background:linear-gradient(135deg,#ff3cac,#784ba0,#2b86c5);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:8px;">🎬</div>
                    <h1 style="margin:0;color:white;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                        Cine<span style="color:#ffd700;">Verse</span>
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                        Stream Movies in Every Language
                    </p>
                </td></tr>

                <!-- Main Content -->
                <tr><td style="padding:40px 35px;">
                    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;">
                        ${heroTitle}
                    </h2>
                    <p style="margin:0 0 28px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;">
                        ${heroMessage}
                    </p>

                    <!-- Info Card -->
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

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td align="center">
                            <a href="https://cineverse-sai.vercel.app/" style="display:inline-block;background:linear-gradient(135deg,#ff3cac,#784ba0);color:white;text-decoration:none;padding:15px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;box-shadow:0 8px 25px rgba(255,60,172,0.35);">
                                ${isWelcome ? '🎬 Start Watching Now' : '🍿 Browse Movies'}
                            </a>
                        </td></tr>
                    </table>
                </td></tr>

                <!-- Features Row (Welcome only) -->
                ${isWelcome ? `
                <tr><td style="padding:0 35px 35px;">
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
                </td></tr>
                ` : ''}

                <!-- Footer -->
                <tr><td style="background:rgba(0,0,0,0.3);padding:25px 35px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:12px;">
                        © ${new Date().getFullYear()} CineVerse — Stream Movies in Every Language
                    </p>
                    <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">
                        You received this email because you ${isWelcome ? 'created an account on' : 'signed into'} CineVerse.
                    </p>
                </td></tr>

            </table>
        </td></tr>
    </table>
</body>
</html>`;

    try {
        // Create a Nodemailer transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS // Generated Gmail App Password
            }
        });

        // Send mail with custom details
        await transporter.sendMail({
            from: `"CineVerse" <${EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlBody
        });

        return res.status(200).json({
            success: true,
            simulated: false,
            message: `Email sent successfully to ${email} from ${EMAIL_USER}`
        });
    } catch (error) {
        console.error('Nodemailer SMTP Dispatch Error:', error);
        return res.status(200).json({
            success: false,
            simulated: true,
            message: 'Gmail SMTP dispatch failed. Simulated on client.',
            error: error.message || error
        });
    }
}
