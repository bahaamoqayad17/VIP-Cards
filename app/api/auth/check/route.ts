import { NextResponse } from "next/server";
import { hasRole } from "@/lib/cookie";

export async function GET() {
  try {
    const isAdmin = await hasRole("admin");
    return NextResponse.json({ authenticated: isAdmin, isAdmin });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false, isAdmin: false });
  }
}
