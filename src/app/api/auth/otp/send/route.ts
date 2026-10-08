import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmailOtp } from "@/models/EmailOtp";
import { generateCryptoOtp, hashOtp, sendOtpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Rate limiting: Check if an active OTP was requested within the last 45 seconds
    const existing = await EmailOtp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (existing) {
      const diffMs = Date.now() - new Date(existing.createdAt).getTime();
      if (diffMs < 45000) {
        const waitSec = Math.ceil((45000 - diffMs) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec}s before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Generate fresh OTP
    const otp = generateCryptoOtp();
    const otpHash = hashOtp(otp, normalizedEmail);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store hashed OTP
    await EmailOtp.deleteMany({ email: normalizedEmail });
    await EmailOtp.create({
      email: normalizedEmail,
      otpHash,
      attempts: 0,
      expiresAt,
    });

    // Send email
    const emailResult = await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      devOtp: emailResult.devOtp, // Only in local development mode
    });
  } catch (err: unknown) {
    console.error("[OTP Send] Error:", err);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
