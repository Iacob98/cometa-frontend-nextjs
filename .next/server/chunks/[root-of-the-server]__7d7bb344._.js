module.exports = [
"[project]/.next-internal/server/app/api/projects/[id]/stats/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/projects/[id]/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request, { params }) {
    try {
        const { id: projectId } = await params;
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID is required'
            }, {
                status: 400
            });
        }
        // Get project basic info
        const { data: project, error: projectError } = await supabase.from('projects').select('total_length_m, base_rate_per_m').eq('id', projectId).single();
        if (projectError) {
            if (projectError.code === 'PGRST116') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Project not found'
                }, {
                    status: 404
                });
            }
            console.error('Supabase project query error:', projectError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch project data'
            }, {
                status: 500
            });
        }
        const totalLength = project?.total_length_m || 0;
        const baseRate = project?.base_rate_per_m || 0;
        // Get work entries statistics with parallel queries
        const [workEntriesResult, teamResult, materialsResult, costsResult] = await Promise.all([
            // Work entries statistics
            supabase.from('work_entries').select('id, approved_by, meters_done_m').eq('project_id', projectId),
            // Team members count (using crews table)
            supabase.from('crew_members').select('user_id, crews!inner(project_id)').eq('crews.project_id', projectId).eq('is_active', true),
            // Material allocations count
            supabase.from('material_allocations').select('id', {
                count: 'exact'
            }).eq('project_id', projectId),
            // Financial data (costs/transactions)
            supabase.from('transactions').select('amount_eur').eq('project_id', projectId).eq('transaction_type', 'expense')
        ]);
        // Process work entries
        let workEntries = 0;
        let pendingApprovals = 0;
        let completedLength = 0;
        if (workEntriesResult.data) {
            workEntries = workEntriesResult.data.length;
            pendingApprovals = workEntriesResult.data.filter((entry)=>!entry.approved_by).length;
            completedLength = workEntriesResult.data.reduce((sum, entry)=>sum + (entry.meters_done_m || 0), 0);
        }
        // Process team members count
        const teamMembers = teamResult.data?.length || 0;
        // Process materials count
        const materialsCount = materialsResult.count || 0;
        // Process financial data
        const totalSpent = costsResult.data?.reduce((sum, transaction)=>sum + (transaction.amount_eur || 0), 0) || 0;
        // Calculate progress percentage
        const progressPercentage = totalLength > 0 ? Math.round(completedLength / totalLength * 100) : 0;
        const projectBudget = totalLength * baseRate;
        // Calculate preparation progress based on available data
        let preparationProgress = 0;
        if (teamMembers > 0) preparationProgress += 40;
        if (materialsCount > 0) preparationProgress += 30;
        if (workEntries > 0) preparationProgress += 30;
        // Determine current phase based on progress and completion
        let currentPhase = 1;
        let phaseName = "Project Initiation";
        if (preparationProgress >= 90) {
            currentPhase = 10;
            phaseName = "Project Execution";
        } else if (preparationProgress >= 80) {
            currentPhase = 9;
            phaseName = "Final Preparation";
        } else if (materialsCount > 0) {
            currentPhase = 6;
            phaseName = "Materials Procurement";
        } else if (teamMembers > 0) {
            currentPhase = 5;
            phaseName = "Team Assignment";
        } else if (preparationProgress > 30) {
            currentPhase = 3;
            phaseName = "Resource Planning";
        } else if (preparationProgress > 10) {
            currentPhase = 2;
            phaseName = "Site Assessment";
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            progress: {
                totalLength,
                completedLength,
                progressPercentage,
                workEntries,
                pendingApprovals,
                teamMembers,
                materialsCount
            },
            phase: {
                currentPhase,
                totalPhases: 10,
                phaseName,
                phaseProgress: preparationProgress
            },
            financial: {
                projectBudget,
                totalSpent,
                spentPercentage: projectBudget > 0 ? Math.round(totalSpent / projectBudget * 100) : 0,
                remainingBudget: projectBudget - totalSpent
            }
        });
    } catch (error) {
        console.error('Project stats API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7d7bb344._.js.map