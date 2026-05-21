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
        : `🍿 Thanks for logging in to CineVerse!`;

    const heroTitle = isWelcome
        ? `Welcome to CineVerse, ${userName}! 🚀`
        : `Welcome Back, ${userName}! 🍿`;

    const heroMessage = isWelcome
        ? `Thank you for joining the CineVerse family! You now have access to thousands of movies from every language and genre — all completely free, with zero ads or hidden fees. Your ultimate cinematic journey starts now.`
        : `Thank you for logging in to CineVerse! We are absolutely thrilled to have you back. Grab your popcorn, settle in, and explore our newly added collection of movies from all around the world.`;

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
            <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#12122a 0%,#1a1a3e 50%,#0d0d2b 100%);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(255,60,172,0.1);border:1px solid rgba(255,255,255,0.06);">
                
                <!-- Header Banner with Cinema Background -->
                <tr><td style="background: linear-gradient(135deg, rgba(255, 60, 172, 0.3) 0%, rgba(120, 75, 160, 0.6) 50%, rgba(10, 10, 26, 0.95) 100%), url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'); background-size: cover; background-position: center; padding: 60px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-size:50px;margin-bottom:10px;filter:drop-shadow(0 0 10px rgba(255,60,172,0.5));">🎬</div>
                    <h1 style="margin:0;color:white;font-size:32px;font-weight:900;letter-spacing:-0.5px;text-shadow: 0 4px 12px rgba(0,0,0,0.8);">
                        Cine<span style="color:#ffd700;">Verse</span>
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-shadow: 0 2px 6px rgba(0,0,0,0.8);">
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
                                    <td style="color:rgba(255,255,255,0.45);font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;text-align:right;">Date & Time</td>
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
                            <a href="https://cineverse-sai.vercel.app/" style="display:inline-block;background:linear-gradient(135deg,#ff3cac,#784ba0);color:white;text-decoration:none;padding:15px 45px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;box-shadow:0 8px 25px rgba(255,60,172,0.35);">
                                ${isWelcome ? '🎬 Start Watching Now' : '🍿 Stream Movies Now'}
                            </a>
                        </td></tr>
                    </table>
                </td></tr>

                <!-- Features Row (Shown for BOTH Welcome & Login!) -->
                <tr><td style="padding:0 35px 35px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:25px;">
                        <tr>
                            <td width="33%" style="text-align:center;padding:10px;vertical-align:top;">
                                <div style="font-size:32px;margin-bottom:8px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🌍</div>
                                <div style="color:#ffffff;font-size:13px;font-weight:700;">Every Language</div>
                                <div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:4px;line-height:1.4;">Watch global movies in your native tongue</div>
                            </td>
                            <td width="33%" style="text-align:center;padding:10px;vertical-align:top;">
                                <div style="font-size:32px;margin-bottom:8px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">⭐</div>
                                <div style="color:#ffffff;font-size:13px;font-weight:700;">Top Curated</div>
                                <div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:4px;line-height:1.4;">The finest handpicked blockbusters</div>
                            </td>
                            <td width="33%" style="text-align:center;padding:10px;vertical-align:top;">
                                <div style="font-size:32px;margin-bottom:8px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🆓</div>
                                <div style="color:#ffffff;font-size:13px;font-weight:700;">100% Free</div>
                                <div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:4px;line-height:1.4;">No subscriptions, no ads, just pure cinema</div>
                            </td>
                        </tr>
                    </table>
                </td></tr>

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
