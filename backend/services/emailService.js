const nodemailer = require("nodemailer");

/**
 * Create Nodemailer Transporter
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

/**
 * Send Security OTP Email via Gmail / SMTP
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} purpose - 'register' or 'login'
 */
const sendOTPEmail = async (toEmail, otpCode, purpose = "register") => {
  const title = purpose === "register" ? "Account Registration" : "Account Login";
  
  // Terminal Dev Log (Guarantees testing never gets stuck)
  console.log("\n=======================================================");
  console.log(`🔑 [DEV GMAIL OTP LOG] ${purpose.toUpperCase()} CODE for ${toEmail}:`);
  console.log(`👉 OTP CODE:  ${otpCode}`);
  console.log("=======================================================\n");

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      `⚠️ EMAIL_USER or EMAIL_PASS not set in .env. OTP logged to console above for ${toEmail}.`
    );
    return { success: true, delivered: "console_fallback" };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #ffffff; padding: 40px 20px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #2563eb); display: inline-block; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 20px; color: #ffffff;">
          SkillBridge AI
        </div>
      </div>

      <h2 style="color: #ffffff; text-align: center; font-size: 22px; margin-bottom: 10px;">
        Gmail Security Code
      </h2>
      <p style="color: #94a3b8; text-align: center; font-size: 14px; margin-bottom: 28px;">
        Use the 6-digit verification code below to complete your SkillBridge AI ${title}.
      </p>

      <div style="background-color: #1e293b; border: 2px dashed #7c3aed; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; display: block;">
          ${otpCode}
        </span>
        <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; display: block;">
          Valid for 5 minutes only
        </span>
      </div>

      <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.5;">
        If you did not request this verification code, please ignore this email. Do not share this OTP with anyone.
      </p>

      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 30px; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b;">
        © ${new Date().getFullYear()} SkillBridge AI Platform. All rights reserved.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SkillBridge AI Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🔑 Your SkillBridge AI Verification Code: ${otpCode}`,
      html: htmlContent,
    });

    console.log(`✅ Real Gmail OTP delivered successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, delivered: "gmail_smtp", messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Gmail SMTP delivery failed for ${toEmail}:`, err.message);
    return { success: true, delivered: "console_fallback", error: err.message };
  }
};

module.exports = {
  sendOTPEmail,
};
