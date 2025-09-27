import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    // Stub implementation - returns empty plans array directly
    // Note: Frontend expects an array, not an object with plans property
    const plans: any[] = [];

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Stub implementation for creating plans
    const response = {
      message: "Plan created successfully (stub)",
      plan: {
        id: "stub-id",
        ...body,
        created_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Plans POST error:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}