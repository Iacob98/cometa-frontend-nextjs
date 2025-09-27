module.exports = [
"[project]/.next-internal/server/app/api/teams/crews/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/teams/crews/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        // FIXED: Build the main query with related data using correct field names (no project_id in crews)
        let query = supabase.from("crews").select(`
        id,
        name,
        leader_user_id,
        status,
        description,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        crew_members(
          crew_id,
          user_id,
          role,
          joined_at,
          left_at,
          is_active,
          user:users(
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `, {
            count: "exact"
        }).eq("crew_members.is_active", true).order("name", {
            ascending: true
        }).range(offset, offset + per_page - 1);
        // Apply filters
        if (status) {
            query = query.eq("status", status);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        const { data: crews, error, count } = await query;
        if (error) {
            console.error("Supabase crews query error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to fetch crews"
            }, {
                status: 500
            });
        }
        // Calculate pagination info
        const total_pages = Math.ceil((count || 0) / per_page);
        // Format response to match expected structure
        const response = {
            crews: crews || [],
            pagination: {
                total: count || 0,
                page,
                per_page,
                total_pages,
                has_next: page < total_pages,
                has_prev: page > 1
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error("Teams/crews API error:", error);
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
        // Validate required fields
        if (!body.name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Crew name is required"
            }, {
                status: 400
            });
        }
        // FIXED: Create crew data object with correct field names (no project_id field)
        const crewData = {
            name: body.name,
            description: body.description || null,
            status: body.status || "active",
            leader_user_id: body.leader_user_id || body.foreman_user_id || null
        };
        // FIXED: Insert new crew with correct field references (no project_id field)
        const { data: crew, error: crewError } = await supabase.from("crews").insert([
            crewData
        ]).select(`
        id,
        name,
        leader_user_id,
        status,
        description,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `).single();
        if (crewError) {
            console.error("Supabase crew creation error:", crewError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to create crew"
            }, {
                status: 500
            });
        }
        // FIXED: If initial members are provided, add them with correct field structure
        if (body.members && Array.isArray(body.members) && crew) {
            const memberData = body.members.map((member)=>({
                    crew_id: crew.id,
                    user_id: member.user_id,
                    role: member.role || "member",
                    is_active: true
                }));
            const { error: membersError } = await supabase.from("crew_members").insert(memberData);
            if (membersError) {
                console.error("Supabase crew members creation error:", membersError);
            // Don't fail the whole operation, just log the error
            }
        }
        // Return the created crew with success status
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Crew created successfully",
            crew
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Teams/crews POST API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__599267a7._.js.map