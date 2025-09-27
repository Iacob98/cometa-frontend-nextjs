import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    // Stub implementation - returns empty facilities array directly
    // Note: Frontend expects an array, not an object with facilities property
    const facilities: any[] = [];

    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Facilities API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Stub implementation for creating facilities
    const response = {
      message: "Facility created successfully (stub)",
      facility: {
        id: "stub-id",
        ...body,
        created_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Facilities POST error:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 }
    );
  }
}
