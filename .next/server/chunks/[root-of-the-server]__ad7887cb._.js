module.exports = [
"[project]/.next-internal/server/app/api/equipment/assignments/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/equipment/assignments/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const ASSIGNMENTS_FILE = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), 'temp_assignments.json');
function loadAssignments() {
    try {
        if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(ASSIGNMENTS_FILE)) {
            const data = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(ASSIGNMENTS_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error loading assignments:', error);
        return [];
    }
}
function saveAssignments(assignments) {
    try {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["writeFileSync"])(ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
    } catch (error) {
        console.error('Error saving assignments:', error);
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const active_only = searchParams.get('active_only') === 'true';
        const crew_id = searchParams.get('crew_id');
        const equipment_id = searchParams.get('equipment_id');
        const project_id = searchParams.get('project_id');
        let assignments = loadAssignments();
        // Apply filters
        if (active_only) {
            assignments = assignments.filter((assignment)=>!assignment.returned_at);
        }
        if (crew_id) {
            assignments = assignments.filter((assignment)=>assignment.crew_id === crew_id);
        }
        if (equipment_id) {
            assignments = assignments.filter((assignment)=>assignment.equipment_id === equipment_id);
        }
        if (project_id) {
            assignments = assignments.filter((assignment)=>assignment.project_id === project_id);
        }
        // Sort by created_at descending
        const sortedAssignments = assignments.sort((a, b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // Paginate
        const offset = (page - 1) * per_page;
        const paginatedAssignments = sortedAssignments.slice(offset, offset + per_page);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: paginatedAssignments,
            page,
            per_page,
            total: assignments.length,
            total_pages: Math.ceil(assignments.length / per_page)
        });
    } catch (error) {
        console.error('Equipment assignments API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { resource_type, equipment_id, vehicle_id, crew_id, project_id, assigned_at, returned_at, daily_rental_cost, notes } = body;
        // Validate required fields
        if (!crew_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Crew is required'
            }, {
                status: 400
            });
        }
        if (!resource_type || resource_type !== 'equipment' && resource_type !== 'vehicle') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Resource type must be either "equipment" or "vehicle"'
            }, {
                status: 400
            });
        }
        if (resource_type === 'equipment' && !equipment_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Equipment ID is required when resource type is equipment'
            }, {
                status: 400
            });
        }
        if (resource_type === 'vehicle' && !vehicle_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Vehicle ID is required when resource type is vehicle'
            }, {
                status: 400
            });
        }
        if (!assigned_at) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Assignment start date is required'
            }, {
                status: 400
            });
        }
        // Generate unique ID
        const assignmentId = `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Create assignment
        const newAssignment = {
            id: assignmentId,
            resource_type,
            crew_id,
            assigned_at: new Date(assigned_at).toISOString(),
            daily_rental_cost: daily_rental_cost ? parseFloat(daily_rental_cost.toString()) : undefined,
            notes: notes || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        // Add resource ID based on type
        if (resource_type === 'equipment') {
            newAssignment.equipment_id = equipment_id;
        } else {
            newAssignment.vehicle_id = vehicle_id;
        }
        // Add optional fields
        if (project_id) {
            newAssignment.project_id = project_id;
        }
        if (returned_at) {
            newAssignment.returned_at = new Date(returned_at).toISOString();
        }
        // Save to file storage
        const assignments = loadAssignments();
        assignments.push(newAssignment);
        saveAssignments(assignments);
        console.log(`✅ Created ${resource_type} assignment:`, {
            assignmentId: newAssignment.id,
            crewId: crew_id,
            resourceId: resource_type === 'equipment' ? equipment_id : vehicle_id,
            projectId: project_id
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: `${resource_type.charAt(0).toUpperCase() + resource_type.slice(1)} assignment created successfully`,
            assignment: newAssignment
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Equipment assignment POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create assignment'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ad7887cb._.js.map