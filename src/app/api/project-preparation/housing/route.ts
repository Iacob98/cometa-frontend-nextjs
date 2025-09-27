import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    // Stub implementation - returns empty housing units array directly
    // Note: Frontend expects an array, not an object with housing_units property
    const housingUnits: any[] = [];

    return NextResponse.json(housingUnits);
  } catch (error) {
    console.error("Project preparation housing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch housing units" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Stub implementation for creating housing units
    const response = {
      message: "Housing unit created successfully (stub)",
      housing_unit: {
        id: "stub-id",
        ...body,
        created_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Project preparation housing POST error:", error);
    return NextResponse.json(
      { error: "Failed to create housing unit" },
      { status: 500 }
    );
  }
}
