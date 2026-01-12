"use server";

import { UserType } from "@/models/User";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Types for better type safety
interface DecodedToken {
  user: {
    id: string;
    email: string;
    name: string;
    id_number: string;
    mobile_number: string;
    role: string;
    isActive: boolean;
  };
  iat?: number;
  exp?: number;
}

export async function setCookie(name: string, value: string, options: any) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, options);
}

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function updateCookie(user: UserType) {
  try {
    const cookieStore = await cookies();

    // Create a new JWT token with updated user data
    const session = jwt.sign({ user }, process.env.NEXTAUTH_SECRET as string, {
      expiresIn: "30d",
    });

    // Set the new session cookie
    cookieStore.set("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating cookie:", error);
    return { success: false, error: "Failed to update session" };
  }
}

export async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return null;
    }

    const decoded = jwtDecode<DecodedToken>(session);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      user: {
        id: decoded.user.id,
        email: decoded.user.email,
        name: decoded.user.name,
        id_number: decoded.user.id_number,
        mobile_number: decoded.user.mobile_number,
        role: decoded.user.role,
        isActive: decoded.user.isActive,
      },
    };
  } catch (error) {
    console.error("Error decoding session token:", error);
    return null;
  }
}

// Get just the session token string
export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value || null;
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getUserFromCookie();
  return user !== null;
}

// Get user role from session
export async function getUserRole() {
  const sessionData = await getUserFromCookie();
  return sessionData?.user?.role || null;
}

// Check if user has specific role
export async function hasRole(role: string) {
  const userRole = await getUserRole();
  return userRole === role;
}

export async function deleteCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

export async function hasCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.has(name);
}

// Clear session cookie (logout)
export async function clearSession() {
  await deleteCookie("session");
}

export async function isTokenExpired() {
  try {
    const token = await getSessionToken();
    if (!token) {
      return true;
    }
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.exp && decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}
