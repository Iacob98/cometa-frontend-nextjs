import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sign } from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

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

    // Generate JWT token
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      exp:
        Math.floor(Date.now() / 1000) +
        (remember_me ? 30 * 24 * 60 * 60 : 8 * 60 * 60), // 30 days or 8 hours
    };

    const token = sign(tokenPayload, JWT_SECRET);

    // FIXED: Return authentication response with correct field mapping
    return NextResponse.json({
      message: "Authentication successful",
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        language_preference: user.language_preference,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
