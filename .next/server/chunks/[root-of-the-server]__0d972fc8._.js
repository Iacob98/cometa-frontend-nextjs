module.exports = [
"[project]/.next-internal/server/app/api/dashboard/stats/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/db-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getClient",
    ()=>getClient,
    "pool",
    ()=>pool,
    "query",
    ()=>query
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Create a PostgreSQL connection pool for Supabase
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
;
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', {
            text: text.substring(0, 100) + '...',
            duration,
            rows: res.rowCount
        });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function getClient() {
    const client = await pool.connect();
    return client;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/dashboard/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db-client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET(request) {
    try {
        console.log('Fetching dashboard statistics from database...');
        // Get project statistics
        const projectStatsQuery = `
      SELECT
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects
      FROM projects;
    `;
        // Get work entries statistics
        const workEntriesQuery = `
      SELECT
        COUNT(*) as total_work_entries,
        COUNT(CASE WHEN approved = false THEN 1 END) as pending_approvals,
        COUNT(CASE WHEN approved = true THEN 1 END) as approved_entries,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as entries_this_week
      FROM work_entries;
    `;
        // Get team statistics
        const teamStatsQuery = `
      SELECT
        COUNT(DISTINCT u.id) as total_workers,
        COUNT(DISTINCT CASE WHEN u.is_active = true THEN u.id END) as active_workers,
        COUNT(DISTINCT c.id) as total_crews,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_crews
      FROM users u
      LEFT JOIN crew_members cm ON u.id = cm.user_id
      LEFT JOIN crews c ON cm.crew_id = c.id
      WHERE u.role IN ('crew', 'worker', 'foreman');
    `;
        // Get material statistics
        const materialStatsQuery = `
      SELECT
        COUNT(*) as total_materials,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_materials,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_materials,
        COALESCE(AVG(unit_price_eur), 0) as avg_material_price
      FROM materials;
    `;
        // Get recent activity count
        const activityQuery = `
      SELECT COUNT(*) as recent_activities
      FROM activity_logs
      WHERE created_at >= NOW() - INTERVAL '24 hours';
    `;
        // Execute all queries in parallel
        const [projectResult, workResult, teamResult, materialResult, activityResult] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(projectStatsQuery),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(workEntriesQuery),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(teamStatsQuery),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(materialStatsQuery),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(activityQuery)
        ]);
        // Parse project statistics
        const projectData = projectResult.rows[0] ? {
            total: parseInt(projectResult.rows[0].total_projects) || 0,
            active: parseInt(projectResult.rows[0].active_projects) || 0,
            completed: parseInt(projectResult.rows[0].completed_projects) || 0,
            planning: parseInt(projectResult.rows[0].planning_projects) || 0,
            onHold: parseInt(projectResult.rows[0].on_hold_projects) || 0
        } : {
            total: 0,
            active: 0,
            completed: 0,
            planning: 0,
            onHold: 0
        };
        // Parse work entries statistics
        const workData = workResult.rows[0] ? {
            total: parseInt(workResult.rows[0].total_work_entries) || 0,
            pendingApprovals: parseInt(workResult.rows[0].pending_approvals) || 0,
            approved: parseInt(workResult.rows[0].approved_entries) || 0,
            thisWeek: parseInt(workResult.rows[0].entries_this_week) || 0
        } : {
            total: 0,
            pendingApprovals: 0,
            approved: 0,
            thisWeek: 0
        };
        // Parse team statistics
        const teamData = teamResult.rows[0] ? {
            totalWorkers: parseInt(teamResult.rows[0].total_workers) || 0,
            activeWorkers: parseInt(teamResult.rows[0].active_workers) || 0,
            totalCrews: parseInt(teamResult.rows[0].total_crews) || 0,
            activeCrews: parseInt(teamResult.rows[0].active_crews) || 0
        } : {
            totalWorkers: 0,
            activeWorkers: 0,
            totalCrews: 0,
            activeCrews: 0
        };
        // Parse material statistics
        const materialData = materialResult.rows[0] ? {
            totalMaterials: parseInt(materialResult.rows[0].total_materials) || 0,
            activeMaterials: parseInt(materialResult.rows[0].active_materials) || 0,
            inactiveMaterials: parseInt(materialResult.rows[0].inactive_materials) || 0,
            avgPrice: parseFloat(materialResult.rows[0].avg_material_price) || 0
        } : {
            totalMaterials: 0,
            activeMaterials: 0,
            inactiveMaterials: 0,
            avgPrice: 0
        };
        // Parse activity statistics
        const activityData = activityResult.rows[0] ? {
            recentActivities: parseInt(activityResult.rows[0].recent_activities) || 0
        } : {
            recentActivities: 0
        };
        console.log('Dashboard statistics fetched successfully:', {
            projects: projectData,
            workEntries: workData,
            team: teamData,
            materials: materialData,
            activities: activityData
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            projects: projectData,
            workEntries: workData,
            team: teamData,
            materials: materialData,
            activities: activityData,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Dashboard statistics API error:', error);
        // Return fallback data in case of database errors
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            projects: {
                total: 0,
                active: 0,
                completed: 0,
                planning: 0,
                onHold: 0
            },
            workEntries: {
                total: 0,
                pendingApprovals: 0,
                approved: 0,
                thisWeek: 0
            },
            team: {
                totalWorkers: 0,
                activeWorkers: 0,
                totalCrews: 0,
                activeCrews: 0
            },
            materials: {
                totalMaterials: 0,
                inStock: 0,
                outOfStock: 0,
                totalValue: 0
            },
            activities: {
                recentActivities: 0
            },
            lastUpdated: new Date().toISOString(),
            error: 'Database connection failed - showing fallback data'
        }, {
            status: 200
        }); // Still return 200 to not break the frontend
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0d972fc8._.js.map