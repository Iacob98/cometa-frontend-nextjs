import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    // Stub implementation - returns empty utility contacts array directly
    // Note: Frontend expects an array, not an object with utility_contacts property
    const utility_contacts: any[] = [];

    return NextResponse.json(utility_contacts);
  } catch (error) {
    console.error("Utility contacts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch utility contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Stub implementation for creating utility contacts
    const response = {
      message: "Utility contact created successfully (stub)",
      utility_contact: {
        id: "stub-id",
        ...body,
        created_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Utility contacts POST error:", error);
    return NextResponse.json(
      { error: "Failed to create utility contact" },
      { status: 500 }
    );
  }
}
