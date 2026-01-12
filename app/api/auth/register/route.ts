// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { status: false, error: "All required fields must be filled" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { status: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: false,
          error: "alreadyTaken",
          field: email || name,
        },
        { status: 409 }
      );
    }

    // Hash password
    const pwSalt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, pwSalt);

    // Create user (do NOT persist passwordConfirm)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isActive: true, // ensure default
    });

    if (!newUser) {
      return NextResponse.json(
        { status: false, error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create session (optional — you might block access until verified)
    const sessionData = {
      user: {
        id: newUser._id.toString(),
        email: newUser!.email,
        name: newUser!.name,
        role: newUser!.role,
      },
    };

    const session = jwt.sign(
      sessionData,
      process.env.NEXTAUTH_SECRET as string,
      {
        expiresIn: "30d",
      }
    );

    // Send welcome email
    await sendWelcomeEmail(newUser.email, newUser.name);

    return NextResponse.json(
      {
        status: true,
        message:
          "Registration successful! Please check your email to verify your account.",
        user: {
          id: newUser._id,
          email: newUser!.email,
          name: newUser!.name,
          role: newUser!.role,
          isActive: newUser!.isActive,
        },
      },
      {
        headers: {
          // 30 days
          "Set-Cookie": `session=${session}; HttpOnly; Path=/; Max-Age=${2592000}; SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        status: false,
        error: "An error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
