import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    // Stub implementation - returns empty cabinets array directly
    // Note: Frontend expects an array, not an object with cabinets property
    const cabinets: any[] = [];

    return NextResponse.json(cabinets);
  } catch (error) {
    console.error("Zone layout cabinets API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cabinets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Stub implementation for creating cabinets
    const response = {
      message: "Cabinet created successfully (stub)",
      cabinet: {
        id: "stub-id",
        ...body,
        created_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Zone layout cabinets POST error:", error);
    return NextResponse.json(
      { error: "Failed to create cabinet" },
      { status: 500 }
    );
  }
}
