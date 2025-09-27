module.exports = [
"[project]/.next-internal/server/app/api/activities/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/activities/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const per_page = parseInt(searchParams.get("per_page") || "50");
        const offset = (page - 1) * per_page;
        // Parse filtering parameters
        const activity_type = searchParams.get("activity_type");
        const user_id = searchParams.get("user_id");
        const project_id = searchParams.get("project_id");
        const object_type = searchParams.get("object_type");
        const search = searchParams.get("search");
        // Build the main query with related data - FIXED: Use activity_logs table
        let query = supabase.from("activity_logs").select(`
        id,
        user_id,
        project_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at,
        user:users(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        project:projects(
          id,
          name,
          status
        )
      `, {
            count: "exact"
        }).order("created_at", {
            ascending: false
        }).range(offset, offset + per_page - 1);
        // Apply filters - FIXED: Use correct field names
        if (activity_type) {
            query = query.eq("action", activity_type);
        }
        if (user_id) {
            query = query.eq("user_id", user_id);
        }
        if (project_id) {
            query = query.eq("project_id", project_id);
        }
        if (object_type) {
            // FIXED: object_type → entity_type
            query = query.eq("entity_type", object_type);
        }
        if (search) {
            // FIXED: Search in action field since description doesn't exist
            query = query.ilike("action", `%${search}%`);
        }
        const { data: activities, error, count } = await query;
        if (error) {
            console.error("Supabase activities query error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to fetch activities"
            }, {
                status: 500
            });
        }
        // Calculate pagination info
        const total_pages = Math.ceil((count || 0) / per_page);
        // Format response to match expected structure
        const response = {
            activities: activities || [],
            total: count || 0,
            page,
            per_page,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error("Activities API error:", error);
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
        // FIXED: Validate required fields - use action field from activity_logs
        if (!body.user_id || !body.action) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "user_id and action are required"
            }, {
                status: 400
            });
        }
        // Validate activity_type against allowed values
        const allowedActivityTypes = [
            "project",
            "work_entry",
            "material",
            "equipment",
            "user",
            "document",
            "auth"
        ];
        if (!allowedActivityTypes.includes(body.activity_type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid activity_type. Must be one of: " + allowedActivityTypes.join(", ")
            }, {
                status: 400
            });
        }
        // Extract client IP and User-Agent
        const forwarded = request.headers.get("x-forwarded-for");
        const ip_address = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || null;
        const user_agent = request.headers.get("user-agent") || null;
        // FIXED: Create activity data object with correct field mappings for activity_logs
        const activityData = {
            user_id: body.user_id,
            project_id: body.project_id || null,
            action: body.action,
            entity_type: body.object_type || body.entity_type || null,
            entity_id: body.object_id || body.entity_id || null,
            details: body.details || body.metadata || null,
            ip_address,
            user_agent
        };
        // FIXED: Insert new activity into activity_logs table
        const { data: activity, error } = await supabase.from("activity_logs").insert([
            activityData
        ]).select(`
        id,
        user_id,
        project_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at,
        user:users(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        project:projects(
          id,
          name,
          status
        )
      `).single();
        if (error) {
            console.error("Supabase activity creation error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to create activity log"
            }, {
                status: 500
            });
        }
        // Return the created activity log
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Activity log created successfully",
            activity
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Activities POST API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__692c4a2c._.js.map