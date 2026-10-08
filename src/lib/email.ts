import crypto from "crypto";

const EMAIL_FROM = process.env.EMAIL_OTP_FROM || "auth@clashjudge.dev";
const RESEND_API_KEY = process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;

export function generateCryptoOtp(): string {
  // Cryptographically secure 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(otp: string, email: string): string {
  const secret = process.env.AUTH_SECRET || "clashjudge_otp_salt_secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${email.toLowerCase().trim()}:${otp.trim()}`)
    .digest("hex");
}

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  devOtp?: string; // only provided if running in local dev with no email provider key
}

export async function sendOtpEmail(email: string, otp: string): Promise<SendOtpResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // If Resend / Email provider key is configured, send real email
  if (RESEND_API_KEY && RESEND_API_KEY.trim() !== "") {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: normalizedEmail,
          subject: `Your ClashJudge Verification Code: ${otp}`,
          html: `
            <div style="font-family: monospace, sans-serif; background-color: #0a0a0b; color: #f4f4f5; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto; border: 1px solid #27272a;">
              <h2 style="color: #22d3ee; margin-top: 0;">ClashJudge Authentication</h2>
              <p style="color: #a1a1aa; font-size: 14px;">Enter the following one-time passcode to sign in. This code will expire in <strong>5 minutes</strong>.</p>
              <div style="background-color: #121214; border: 1px solid #3f3f46; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f4f4f5;">${otp}</span>
              </div>
              <p style="color: #71717a; font-size: 12px; margin-bottom: 0;">If you did not request this verification code, please ignore this message.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Email] Resend API error:", response.status, errorText);
        return {
          success: false,
          error: "Failed to dispatch email via provider",
        };
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (err: unknown) {
      console.error("[Email] Send exception:", err);
      return { success: false, error: (err as Error)?.message || "Email send failure" };
    }
  }

  // Development / Demo Fallback: Log directly to server console
  console.log("=================================================");
  console.log(`[CLASHJUDGE EMAIL OTP] Verification code for ${normalizedEmail}:`);
  console.log(`>>>  ${otp}  <<<`);
  console.log("(Expires in 5 minutes. Set EMAIL_PROVIDER_API_KEY to send live emails)");
  console.log("=================================================");

  return {
    success: true,
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  };
}
