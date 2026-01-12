import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({
        status: false,
        error: "Please provide a valid email address",
      });
    }

    await connectToDatabase();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        status: false,
        error: "No account found with this email address",
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Store verification code in database
    await PasswordReset.create({
      email: email.toLowerCase(),
      code: verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      used: false,
    });

    // Send password reset email using the reusable email service
    await sendPasswordResetEmail(email.toLowerCase(), verificationCode);

    return NextResponse.json({
      status: true,
      message: "Verification code sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({
      status: false,
      error: "Failed to send verification code. Please try again.",
    });
  }
}
