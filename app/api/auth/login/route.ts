import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongo";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  // Check if the user exists
  // Find user by mobile number
  const { mobile_number, password, rememberMe } = await request.json();
  await connectToDatabase();

  const user = await User.findOne({ mobile_number });

  if (!user) {
    return NextResponse.json({
      status: false,
      error: "invalidMobileOrPassword",
    });
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return NextResponse.json({
      status: false,
      error: "invalidMobileOrPassword",
    });
  }

  if (!user.isActive) {
    return NextResponse.json({
      status: false,
      error: "userNotVerified",
    });
  }

  // Check if user is an admin
  if (user.role !== "admin") {
    return NextResponse.json({
      status: false,
      error: "notAdmin",
      message: "فقط المسؤولون يمكنهم تسجيل الدخول",
    });
  }

  await User.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } });

  // Create a shorter session token with minimal data
  const sessionData = {
    user: {
      id: user._id.toString(),
      email: user.email,
      id_number: user.id_number,
      mobile_number: user.mobile_number,
      role: user.role,
    },
  };

  let session;
  if (rememberMe) {
    session = jwt.sign(sessionData, process.env.NEXTAUTH_SECRET as string, {
      expiresIn: "30d",
    });
  } else {
    session = jwt.sign(sessionData, process.env.NEXTAUTH_SECRET as string, {
      expiresIn: "1d",
    });
  }

  // Return user object without password
  return NextResponse.json(
    {
      status: true,
      user: {
        id: user._id,
        email: user.email,
        id_number: user.id_number,
        mobile_number: user.mobile_number,
        role: user.role,
        isActive: user.isActive,
      },
    },
    {
      headers: {
        "Set-Cookie": `session=${session}; HttpOnly; Path=/; Max-Age=${
          // 30 days if remember me, 1 day if not
          rememberMe ? 2592000 : 3600
        }; SameSite=Lax`,
      },
    }
  );
}
