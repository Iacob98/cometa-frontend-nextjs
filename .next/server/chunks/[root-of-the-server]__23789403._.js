module.exports = [
"[project]/.next-internal/server/app/api/transactions/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/app/api/transactions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request) {
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
        let costsQuery = supabase.from("costs").select(`
        id,
        project_id,
        cost_type,
        amount_eur,
        date,
        description,
        reference_type,
        reference_id,
        project:projects(id, name, status)
      `).order("date", {
            ascending: false
        });
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
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
                        rental_expenses: 0
                    }
                }
            });
        }
        // Transform costs data to unified transaction format
        const transactions = [];
        // Transform costs
        (costsData || []).forEach((cost)=>{
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
                status: "completed"
            });
        });
        // Sort by date and apply pagination
        transactions.sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
        // Apply transaction type filter
        const filteredTransactions = transaction_type ? transactions.filter((t)=>t.transaction_type === transaction_type) : transactions;
        const total = filteredTransactions.length;
        const paginatedTransactions = filteredTransactions.slice(offset, offset + per_page);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: paginatedTransactions,
            total,
            page,
            per_page,
            total_pages: Math.ceil(total / per_page),
            summary: {
                total_amount: transactions.reduce((sum, t)=>sum + (t.amount_eur || 0), 0),
                by_type: {
                    costs: transactions.filter((t)=>t.transaction_type === "cost").length,
                    material_orders: transactions.filter((t)=>t.transaction_type === "material_order").length,
                    rental_expenses: transactions.filter((t)=>t.transaction_type === "rental_expense").length
                }
            }
        });
    } catch (error) {
        console.error("Transactions API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { transaction_type, project_id, amount_eur, description, category } = body;
        // Validate required fields
        if (!transaction_type || !amount_eur) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "transaction_type and amount_eur are required"
            }, {
                status: 400
            });
        }
        // Validate transaction_type
        if (![
            "cost",
            "material_order",
            "rental_expense"
        ].includes(transaction_type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid transaction_type. Must be: cost, material_order, or rental_expense"
            }, {
                status: 400
            });
        }
        let result;
        // FIXED: Route to appropriate table based on transaction type
        switch(transaction_type){
            case "cost":
                if (!project_id) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "project_id is required for cost transactions"
                    }, {
                        status: 400
                    });
                }
                const { data: cost, error: costError } = await supabase.from("costs").insert([
                    {
                        project_id,
                        cost_type: category || "other",
                        amount_eur,
                        date: new Date().toISOString().split("T")[0],
                        description: description || "Manual cost entry"
                    }
                ]).select(`
            id,
            project_id,
            cost_type,
            amount_eur,
            date,
            description,
            project:projects(id, name, status)
          `).single();
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
                    project: cost.project
                };
                break;
            case "material_order":
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Material orders should be created via /api/materials/orders endpoint"
                }, {
                    status: 400
                });
            case "rental_expense":
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Rental expenses should be created via rental management endpoints"
                }, {
                    status: 400
                });
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid transaction type"
                }, {
                    status: 400
                });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Transaction created successfully",
            transaction: result
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Transaction creation error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create transaction"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__23789403._.js.map