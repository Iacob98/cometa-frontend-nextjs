import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const MaterialOrderSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  material_id: z.string().uuid("Invalid material ID"),
  quantity: z.number().positive("Quantity must be positive"),
  unit_price: z.number().positive("Unit price must be positive").optional(),
  status: z.enum(['pending', 'ordered', 'delivered', 'cancelled']).default('pending'),
  order_date: z.string().optional(),
  delivery_date: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const project_id = searchParams.get("project_id");
    const material_id = searchParams.get("material_id");
    const status = searchParams.get("status");
    const supplier = searchParams.get("supplier");

    let query = supabase
      .from("material_orders")
      .select(
        `
        id,
        project_id,
        material_id,
        quantity,
        unit_price,
        total_price,
        status,
        order_date,
        delivery_date,
        supplier,
        notes,
        created_at,
        updated_at,
        projects(id, name, city),
        materials(id, name, category, unit)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (material_id) {
      query = query.eq("material_id", material_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (supplier) {
      query = query.ilike("supplier", `%${supplier}%`);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch material orders from database" },
        { status: 500 }
      );
    }

    // Calculate totals and enhance data
    const enhancedOrders = (orders || []).map(order => ({
      ...order,
      total_price: order.total_price || (order.quantity * (order.unit_price || 0)),
      project_name: order.projects?.name || "Unknown Project",
      project_city: order.projects?.city || "Unknown City",
      material_name: order.materials?.name || "Unknown Material",
      material_category: order.materials?.category || "Unknown Category",
      material_unit: order.materials?.unit || "pcs"
    }));

    // Calculate summary statistics
    const totalValue = enhancedOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const statusCounts = enhancedOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      items: enhancedOrders,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary: {
        total_value: totalValue,
        status_counts: statusCounts
      }
    });
  } catch (error) {
    console.error("Material orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch material orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = MaterialOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", validatedData.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Verify material exists and get current price if not provided
    const { data: material, error: materialError } = await supabase
      .from("materials")
      .select("id, name, unit_price_eur, supplier_name")
      .eq("id", validatedData.material_id)
      .single();

    if (materialError || !material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Calculate order details
    const unit_price = validatedData.unit_price || material.unit_price_eur || 0;
    const total_price = validatedData.quantity * unit_price;
    const supplier = validatedData.supplier || material.supplier_name || null;

    // Create material order in Supabase
    const { data: order, error } = await supabase
      .from("material_orders")
      .insert([
        {
          project_id: validatedData.project_id,
          material_id: validatedData.material_id,
          quantity: validatedData.quantity,
          unit_price: unit_price,
          total_price: total_price,
          status: validatedData.status,
          order_date: validatedData.order_date || new Date().toISOString().split('T')[0],
          delivery_date: validatedData.delivery_date || null,
          supplier: supplier,
          notes: validatedData.notes || null
        },
      ])
      .select(
        `
        id,
        project_id,
        material_id,
        quantity,
        unit_price,
        total_price,
        status,
        order_date,
        delivery_date,
        supplier,
        notes,
        created_at,
        updated_at,
        projects(id, name, city),
        materials(id, name, category, unit)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating material order:", error);
      return NextResponse.json(
        { error: "Failed to create material order in database" },
        { status: 500 }
      );
    }

    // Enhanced response data
    const enhancedOrder = {
      ...order,
      project_name: order.projects?.name || "Unknown Project",
      project_city: order.projects?.city || "Unknown City",
      material_name: order.materials?.name || "Unknown Material",
      material_category: order.materials?.category || "Unknown Category",
      material_unit: order.materials?.unit || "pcs"
    };

    return NextResponse.json({
      message: "Material order created successfully",
      order: enhancedOrder
    }, { status: 201 });

  } catch (error) {
    console.error("Create material order error:", error);
    return NextResponse.json(
      { error: "Failed to create material order" },
      { status: 500 }
    );
  }
}