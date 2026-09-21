const { Resend } = require('resend');

function getResendClient() {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        console.warn('[RESEND CONFIG NOTICE] RESEND_API_KEY is not configured in environment variables');
        return null;
    }
    return new Resend(key);
}

function getFromEmail() {
    return process.env.FROM_EMAIL || 'Effission Gold <support@tattvamwithin.com>';
}

/**
 * Send 6-digit verification OTP email for Signup
 */
async function sendVerificationEmail(email, code, name) {
    const firstName = name ? name.split(' ')[0] : 'there';
    const subject = `${code} is your Effission Loyalty verification code`;
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f26522, #f36c14, #ea580c); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
                      EFFISSION
                    </h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0;">
                      Loyalty & Gold Vault Rewards
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
                      Verify your Email Address
                    </h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
                      Hi ${firstName},<br>
                      Welcome to <strong>Effission Loyalty Rewards</strong>. To complete your registration and activate your membership rewards, please enter this verification code:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #fff7ed; border: 2px dashed #f36c14; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
                      <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #ea580c; font-family: monospace; display: inline-block; margin-left: 12px;">
                        ${code}
                      </span>
                      <p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 1px;">
                        Valid for 15 minutes
                      </p>
                    </div>

                    <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0 0;">
                      If you did not request this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center;">
                    <p style="font-size: 11px; color: #94a3b8; margin: 0; font-weight: 600;">
                      &copy; ${new Date().getFullYear()} Effission Jewellery & Loyalty Platform. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    const resend = getResendClient();
    const from = getFromEmail();

    if (resend) {
        try {
            const response = await resend.emails.send({
                from,
                to: email,
                subject,
                html,
            });

            if (response.error) {
                console.error('[RESEND ERROR]', response.error);
            } else {
                console.log(`[RESEND EMAIL SENT] Verification code sent to ${email} (ID: ${response.data?.id})`);
                return { success: true, id: response.data?.id };
            }
        } catch (err) {
            console.error('[RESEND EMAIL ERROR]', err.message);
        }
    }

    // Local development / fallback: Log to server console
    console.log('=================================================');
    console.log('[EFFISSION EMAIL SERVICE] (Console Fallback)');
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`VERIFICATION CODE: ${code}`);
    console.log('=================================================');
    return { success: true, fallback: true };
}

/**
 * Send Password Reset Link Email
 */
async function sendPasswordResetEmail(email, resetUrl, name) {
    const firstName = name ? name.split(' ')[0] : 'there';
    const subject = `Reset your Effission Loyalty password`;
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f26522, #f36c14, #ea580c); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
                      EFFISSION
                    </h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0;">
                      Password Recovery Protocol
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
                      Reset Your Password
                    </h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
                      Hi ${firstName},<br>
                      We received a request to reset your password for your Effission Loyalty account. Click the button below to choose a new password:
                    </p>

                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${resetUrl}" style="background-color: #f36c14; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(243,108,20,0.25);">
                        Reset My Password
                      </a>
                    </div>

                    <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0 0;">
                      Or copy and paste this URL into your browser:<br>
                      <a href="${resetUrl}" style="color: #ea580c; word-break: break-all;">${resetUrl}</a>
                    </p>

                    <p style="font-size: 12px; color: #94a3b8; margin: 20px 0 0 0;">
                      This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center;">
                    <p style="font-size: 11px; color: #94a3b8; margin: 0; font-weight: 600;">
                      &copy; ${new Date().getFullYear()} Effission Jewellery & Loyalty Platform. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    const resend = getResendClient();
    const from = getFromEmail();

    if (resend) {
        try {
            const response = await resend.emails.send({
                from,
                to: email,
                subject,
                html,
            });

            if (response.error) {
                console.error('[RESEND ERROR]', response.error);
            } else {
                console.log(`[RESEND EMAIL SENT] Password reset email sent to ${email} (ID: ${response.data?.id})`);
                return { success: true, id: response.data?.id };
            }
        } catch (err) {
            console.error('[RESEND EMAIL ERROR]', err.message);
        }
    }

    // Local development / fallback: Log to server console
    console.log('=================================================');
    console.log('[EFFISSION EMAIL SERVICE] (Console Fallback)');
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`RESET URL: ${resetUrl}`);
    console.log('=================================================');
    return { success: true, fallback: true };
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
};
