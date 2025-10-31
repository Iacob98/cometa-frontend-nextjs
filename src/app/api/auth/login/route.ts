import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sign } from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Helper function to get permissions based on role
function getPermissionsByRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      "projects.create",
      "projects.read",
      "projects.update",
      "projects.delete",
      "users.create",
      "users.read",
      "users.update",
      "users.delete",
      "materials.create",
      "materials.read",
      "materials.update",
      "materials.delete",
      "equipment.create",
      "equipment.read",
      "equipment.update",
      "equipment.delete",
      "work_entries.approve",
      "work_entries.create",
      "work_entries.read",
      "work_entries.update",
      "work_entries.delete",
      "teams.create",
      "teams.read",
      "teams.update",
      "teams.delete",
    ],
    pm: [
      "projects.create",
      "projects.read",
      "projects.update",
      "work_entries.approve",
      "work_entries.create",
      "work_entries.read",
      "work_entries.update",
      "materials.read",
      "equipment.read",
      "teams.read",
    ],
    foreman: [
      "projects.read",
      "work_entries.create",
      "work_entries.read",
      "work_entries.update",
      "materials.read",
      "equipment.read",
      "teams.read",
    ],
    crew: [
      "projects.read",
      "work_entries.create",
      "work_entries.read",
      "materials.read",
      "equipment.read",
    ],
    worker: [
      "projects.read",
      "work_entries.create",
      "work_entries.read",
      "materials.read",
      "equipment.read",
    ],
    viewer: [
      "projects.read",
      "work_entries.read",
      "materials.read",
      "equipment.read",
      "teams.read",
    ],
  };

  return rolePermissions[role] || [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, pin_code, remember_me } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { message: "Email or phone required" },
        { status: 400 }
      );
    }

    if (!pin_code) {
      return NextResponse.json(
        { message: "PIN code required" },
        { status: 400 }
      );
    }

    // Validate PIN code format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin_code)) {
      return NextResponse.json(
        { message: "Invalid PIN code format" },
        { status: 400 }
      );
    }

    // FIXED: Query user from Supabase with correct field names
    let query = supabase
      .from("users")
      .select(
        "id, email, phone, first_name, last_name, role, is_active, language_preference, pin_code"
      )
      .eq("pin_code", pin_code);

    if (email) {
      query = query.eq("email", email);
    } else if (phone) {
      query = query.eq("phone", phone);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("Supabase authentication error:", error);
      return NextResponse.json(
        { message: "Authentication service error" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        { message: "Account is deactivated" },
        { status: 403 }
      );
    }

    // Generate JWT tokens
    const expiresIn = remember_me ? 30 * 24 * 60 * 60 : 8 * 60 * 60; // 30 days or 8 hours (in seconds)
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    };

    const accessToken = sign(tokenPayload, JWT_SECRET);

    // Generate refresh token (longer expiry)
    const refreshTokenPayload = {
      user_id: user.id,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    };
    const refreshToken = sign(refreshTokenPayload, JWT_SECRET);

    // Define permissions based on role
    const permissions = getPermissionsByRole(user.role);

    // Return authentication response with all required fields
    return NextResponse.json({
      message: "Authentication successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
      expires_in: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        language_preference: user.language_preference,
      },
      permissions,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
