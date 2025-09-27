import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// FIXED: Add TypeScript interface for unified transactions
interface UnifiedTransaction {
  id: string;
  transaction_type: "cost" | "material_order" | "rental_expense";
  category: string;
  amount_eur: number;
  date: string;
  description: string;
  project_id?: string | null;
  project?: any;
  reference_type?: string;
  reference_id?: string;
  status: string;
  quantity?: number;
  unit_price_eur?: number;
  days?: number;
  daily_rate_eur?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;

    // Parse filtering parameters
    const project_id = searchParams.get("project_id");
    const transaction_type = searchParams.get("transaction_type");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    // Start with just costs for simplicity
    let costsQuery = supabase
      .from("costs")
      .select(
        `
        id,
        project_id,
        cost_type,
        amount_eur,
        date,
        description,
        reference_type,
        reference_id,
        project:projects(id, name, status)
      `
      )
      .order("date", { ascending: false });

    if (project_id) {
      costsQuery = costsQuery.eq("project_id", project_id);
    }
    if (date_from) {
      costsQuery = costsQuery.gte("date", date_from);
    }
    if (date_to) {
      costsQuery = costsQuery.lte("date", date_to);
    }

    const { data: costsData, error: costsError } = await costsQuery;

    if (costsError) {
      console.error("Costs query error:", costsError);
      // Return empty data instead of error
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        per_page,
        total_pages: 0,
        summary: {
          total_amount: 0,
          by_type: {
            costs: 0,
            material_orders: 0,
            rental_expenses: 0,
          },
        },
      });
    }

    // Transform costs data to unified transaction format
    const transactions: UnifiedTransaction[] = [];

    // Transform costs
    (costsData || []).forEach((cost: any) => {
      transactions.push({
        id: cost.id,
        transaction_type: "cost",
        category: cost.cost_type,
        amount_eur: cost.amount_eur,
        date: cost.date,
        description: cost.description || `${cost.cost_type} expense`,
        project_id: cost.project_id,
        project: cost.project,
        reference_type: cost.reference_type,
        reference_id: cost.reference_id,
        status: "completed",
      });
    });

    // Sort by date and apply pagination
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Apply transaction type filter
    const filteredTransactions = transaction_type
      ? transactions.filter((t) => t.transaction_type === transaction_type)
      : transactions;

    const total = filteredTransactions.length;
    const paginatedTransactions = filteredTransactions.slice(
      offset,
      offset + per_page
    );

    return NextResponse.json({
      items: paginatedTransactions,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
      summary: {
        total_amount: transactions.reduce(
          (sum, t) => sum + (t.amount_eur || 0),
          0
        ),
        by_type: {
          costs: transactions.filter((t) => t.transaction_type === "cost")
            .length,
          material_orders: transactions.filter(
            (t) => t.transaction_type === "material_order"
          ).length,
          rental_expenses: transactions.filter(
            (t) => t.transaction_type === "rental_expense"
          ).length,
        },
      },
    });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_type, project_id, amount_eur, description, category } =
      body;

    // Validate required fields
    if (!transaction_type || !amount_eur) {
      return NextResponse.json(
        { error: "transaction_type and amount_eur are required" },
        { status: 400 }
      );
    }

    // Validate transaction_type
    if (
      !["cost", "material_order", "rental_expense"].includes(transaction_type)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid transaction_type. Must be: cost, material_order, or rental_expense",
        },
        { status: 400 }
      );
    }

    let result;

    // FIXED: Route to appropriate table based on transaction type
    switch (transaction_type) {
      case "cost":
        if (!project_id) {
          return NextResponse.json(
            { error: "project_id is required for cost transactions" },
            { status: 400 }
          );
        }

        const { data: cost, error: costError } = await supabase
          .from("costs")
          .insert([
            {
              project_id,
              cost_type: category || "other",
              amount_eur,
              date: new Date().toISOString().split("T")[0],
              description: description || "Manual cost entry",
            },
          ])
          .select(
            `
            id,
            project_id,
            cost_type,
            amount_eur,
            date,
            description,
            project:projects(id, name, status)
          `
          )
          .single();

        if (costError) {
          throw costError;
        }

        result = {
          id: cost.id,
          transaction_type: "cost",
          category: cost.cost_type,
          amount_eur: cost.amount_eur,
          date: cost.date,
          description: cost.description,
          project_id: cost.project_id,
          project: cost.project,
        };
        break;

      case "material_order":
        return NextResponse.json(
          {
            error:
              "Material orders should be created via /api/materials/orders endpoint",
          },
          { status: 400 }
        );

      case "rental_expense":
        return NextResponse.json(
          {
            error:
              "Rental expenses should be created via rental management endpoints",
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          { error: "Invalid transaction type" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        message: "Transaction created successfully",
        transaction: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
