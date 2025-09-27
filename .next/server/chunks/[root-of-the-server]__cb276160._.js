module.exports = [
"[project]/.next-internal/server/app/api/resources/unified-assignments/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/resources/unified-assignments/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const crew_id = searchParams.get("crew_id");
        const project_id = searchParams.get("project_id");
        const active_only = searchParams.get("active_only") === "true";
        const assignments = [];
        // Get equipment assignments
        let equipmentQuery = supabase.from("equipment_assignments").select(`
        id,
        equipment_id,
        crew_id,
        project_id,
        from_ts,
        to_ts,
        is_permanent,
        rental_cost_per_day,
        is_active,
        equipment:equipment(
          id,
          name,
          type,
          inventory_no
        )
      `);
        if (crew_id) {
            equipmentQuery = equipmentQuery.eq("crew_id", crew_id);
        }
        if (project_id) {
            equipmentQuery = equipmentQuery.eq("project_id", project_id);
        }
        if (active_only) {
            equipmentQuery = equipmentQuery.eq("is_active", true);
        }
        const { data: equipmentData, error: equipmentError } = await equipmentQuery.order("from_ts", {
            ascending: false
        });
        if (equipmentError) {
            console.error("Equipment assignments query error:", equipmentError);
        } else {
            // Transform equipment assignments
            (equipmentData || []).forEach((assignment)=>{
                assignments.push({
                    id: assignment.id,
                    resource_id: assignment.equipment_id,
                    resource_type: "equipment",
                    assignment_type: "equipment",
                    crew_id: assignment.crew_id,
                    project_id: assignment.project_id,
                    from_ts: assignment.from_ts,
                    to_ts: assignment.to_ts,
                    is_permanent: assignment.is_permanent,
                    rental_cost_per_day: assignment.rental_cost_per_day,
                    is_active: assignment.is_active,
                    equipment: assignment.equipment,
                    // For unified interface
                    name: assignment.equipment?.name || 'Unknown Equipment',
                    type: assignment.equipment?.type || 'equipment',
                    inventory_no: assignment.equipment?.inventory_no
                });
            });
        }
        // Get vehicle assignments
        let vehicleQuery = supabase.from("vehicle_assignments").select(`
        id,
        vehicle_id,
        crew_id,
        project_id,
        from_ts,
        to_ts,
        is_permanent,
        rental_cost_per_day,
        is_active,
        vehicle:vehicles(
          id,
          brand,
          model,
          plate_number,
          type
        )
      `);
        if (crew_id) {
            vehicleQuery = vehicleQuery.eq("crew_id", crew_id);
        }
        if (project_id) {
            vehicleQuery = vehicleQuery.eq("project_id", project_id);
        }
        if (active_only) {
            vehicleQuery = vehicleQuery.eq("is_active", true);
        }
        const { data: vehicleData, error: vehicleError } = await vehicleQuery.order("from_ts", {
            ascending: false
        });
        if (vehicleError) {
            console.error("Vehicle assignments query error:", vehicleError);
        } else {
            // Transform vehicle assignments
            (vehicleData || []).forEach((assignment)=>{
                assignments.push({
                    id: assignment.id,
                    resource_id: assignment.vehicle_id,
                    resource_type: "vehicle",
                    assignment_type: "vehicle",
                    crew_id: assignment.crew_id,
                    project_id: assignment.project_id,
                    from_ts: assignment.from_ts,
                    to_ts: assignment.to_ts,
                    is_permanent: assignment.is_permanent,
                    rental_cost_per_day: assignment.rental_cost_per_day,
                    is_active: assignment.is_active,
                    vehicle: assignment.vehicle,
                    // For unified interface
                    name: assignment.vehicle ? `${assignment.vehicle.brand} ${assignment.vehicle.model}` : 'Unknown Vehicle',
                    type: assignment.vehicle?.type || 'vehicle',
                    plate_number: assignment.vehicle?.plate_number
                });
            });
        }
        // Sort by from_ts descending
        assignments.sort((a, b)=>{
            const dateA = new Date(a.from_ts || 0).getTime();
            const dateB = new Date(b.from_ts || 0).getTime();
            return dateB - dateA;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(assignments);
    } catch (error) {
        console.error("Unified assignments API error:", error);
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
        const { resource_type, resource_id, crew_id, project_id, from_ts, to_ts, is_permanent, rental_cost_per_day } = body;
        // Validate required fields
        if (!resource_type || !resource_id || !crew_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "resource_type, resource_id, and crew_id are required"
            }, {
                status: 400
            });
        }
        let result;
        if (resource_type === "equipment") {
            const { data: assignment, error } = await supabase.from("equipment_assignments").insert([
                {
                    equipment_id: resource_id,
                    crew_id,
                    project_id,
                    from_ts,
                    to_ts,
                    is_permanent: is_permanent || false,
                    rental_cost_per_day: rental_cost_per_day || 0,
                    is_active: true
                }
            ]).select(`
          id,
          equipment_id,
          crew_id,
          project_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          is_active,
          equipment:equipment(id, name, type, inventory_no)
        `).single();
            if (error) throw error;
            result = assignment;
        } else if (resource_type === "vehicle") {
            const { data: assignment, error } = await supabase.from("vehicle_assignments").insert([
                {
                    vehicle_id: resource_id,
                    crew_id,
                    project_id,
                    from_ts,
                    to_ts,
                    is_permanent: is_permanent || false,
                    rental_cost_per_day: rental_cost_per_day || 0,
                    is_active: true
                }
            ]).select(`
          id,
          vehicle_id,
          crew_id,
          project_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          is_active,
          vehicle:vehicles(id, brand, model, plate_number, type)
        `).single();
            if (error) throw error;
            result = assignment;
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid resource_type. Must be 'equipment' or 'vehicle'"
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            assignment_id: result.id,
            message: `${resource_type} assignment created successfully`,
            assignment: result
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Unified assignment creation error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create assignment"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cb276160._.js.map