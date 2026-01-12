import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    // Validate required fields
    if (!email || !code || !newPassword) {
      return NextResponse.json({
        status: false,
        error: "Email, verification code, and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json({
        status: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Validate verification code format
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({
        status: false,
        error: "Invalid verification code format",
      });
    }

    await connectToDatabase();

    // Find the password reset record
    const resetRecord = await PasswordReset.findOne({
      email: email.toLowerCase(),
      code: code,
      used: false,
    });

    if (!resetRecord) {
      return NextResponse.json({
        status: false,
        error: "Invalid or expired verification code",
      });
    }

    // Check if the code has expired
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json({
        status: false,
        error: "Verification code has expired. Please request a new one.",
      });
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        status: false,
        error: "User not found",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Mark the reset code as used
    await PasswordReset.findByIdAndUpdate(resetRecord._id, {
      used: true,
    });

    // Clean up any other unused reset codes for this email
    await PasswordReset.deleteMany({
      email: email.toLowerCase(),
      used: false,
    });

    return NextResponse.json({
      status: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({
      status: false,
      error:
        "An error occurred while resetting your password. Please try again.",
    });
  }
}
