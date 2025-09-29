module.exports = [
"[project]/.next-internal/server/app/api/crews/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/crews/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
// Use service role client to bypass RLS for crew member queries
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const offset = (page - 1) * per_page;
        const search = searchParams.get('search');
        const project_id = searchParams.get('project_id');
        const status = searchParams.get('status');
        // Build the query for crews with their members
        let query = supabase.from('crews').select(`
        id,
        name,
        description,
        status,
        leader_user_id,
        project_id,
        created_at,
        updated_at,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        crew_members(
          id,
          user_id,
          role,
          is_active,
          joined_at,
          user:users(
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `, {
            count: 'exact'
        }).eq('crew_members.is_active', true).order('created_at', {
            ascending: false
        }).range(offset, offset + per_page - 1);
        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (project_id) {
            query = query.eq('project_id', project_id);
        }
        const { data: crews, error, count } = await query;
        if (error) {
            console.error('Supabase crews query error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch crews data'
            }, {
                status: 500
            });
        }
        // Format response to ensure proper structure for frontend
        const formattedCrews = (crews || []).map((crew)=>({
                id: crew.id,
                name: crew.name,
                description: crew.description || '',
                status: crew.status || 'active',
                project_id: crew.project_id,
                foreman: crew.leader ? {
                    id: crew.leader.id,
                    full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
                    first_name: crew.leader.first_name,
                    last_name: crew.leader.last_name,
                    email: crew.leader.email,
                    role: crew.leader.role
                } : null,
                members: (crew.crew_members || []).map((member)=>({
                        id: member.id,
                        user_id: member.user_id,
                        role: member.role,
                        role_in_crew: member.role,
                        is_active: member.is_active,
                        joined_at: member.joined_at,
                        active_from: member.joined_at,
                        // Flatten user data to member level for frontend compatibility
                        first_name: member.user?.first_name || '',
                        last_name: member.user?.last_name || '',
                        full_name: member.user ? `${member.user.first_name} ${member.user.last_name}` : '',
                        email: member.user?.email || '',
                        // Keep nested user object for backward compatibility
                        user: member.user ? {
                            id: member.user.id,
                            first_name: member.user.first_name,
                            last_name: member.user.last_name,
                            full_name: `${member.user.first_name} ${member.user.last_name}`,
                            email: member.user.email,
                            role: member.user.role
                        } : null
                    })),
                member_count: crew.crew_members?.length || 0,
                created_at: crew.created_at,
                updated_at: crew.updated_at
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            crews: formattedCrews,
            pagination: {
                page,
                per_page,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / per_page)
            },
            summary: {
                total_crews: count || 0,
                active_crews: formattedCrews.filter((c)=>c.status === 'active').length,
                total_members: formattedCrews.reduce((sum, c)=>sum + c.member_count, 0)
            }
        });
    } catch (error) {
        console.error('Crews API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, leader_user_id, status = 'active' } = body;
        if (!name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Crew name is required'
            }, {
                status: 400
            });
        }
        // Create new crew
        const { data: newCrew, error: crewError } = await supabase.from('crews').insert({
            name,
            description: description || '',
            leader_user_id: leader_user_id || null,
            status
        }).select(`
        id,
        name,
        description,
        status,
        leader_user_id,
        created_at,
        updated_at,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `).single();
        if (crewError) {
            console.error('Supabase crew creation error:', crewError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create crew'
            }, {
                status: 500
            });
        }
        // Format response
        const formattedCrew = {
            id: newCrew.id,
            name: newCrew.name,
            description: newCrew.description || '',
            status: newCrew.status,
            foreman: newCrew.leader ? {
                id: newCrew.leader.id,
                full_name: `${newCrew.leader.first_name} ${newCrew.leader.last_name}`,
                email: newCrew.leader.email
            } : null,
            members: [],
            member_count: 0,
            created_at: newCrew.created_at,
            updated_at: newCrew.updated_at
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Crew created successfully',
            crew: formattedCrew
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Crews POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create crew'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ca641e8a._.js.map