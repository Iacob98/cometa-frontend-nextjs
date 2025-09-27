module.exports = [
"[project]/.next-internal/server/app/api/materials/allocations/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/materials/allocations/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const offset = (page - 1) * per_page;
        const project_id = searchParams.get('project_id');
        const status = searchParams.get('status');
        const material_id = searchParams.get('material_id');
        // Build the query for material allocations with related data
        let query = supabase.from('material_allocations').select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        project:projects!material_allocations_project_id_fkey(
          id,
          name,
          city,
          address
        ),
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        ),
        allocator:users!material_allocations_allocated_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `, {
            count: 'exact'
        }).order('created_at', {
            ascending: false
        }).range(offset, offset + per_page - 1);
        // Apply filters
        if (project_id) {
            query = query.eq('project_id', project_id);
        }
        if (material_id) {
            query = query.eq('material_id', material_id);
        }
        if (status) {
            query = query.eq('status', status);
        }
        const { data: allocations, error, count } = await query;
        if (error) {
            console.error('Supabase material allocations query error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch material allocations data'
            }, {
                status: 500
            });
        }
        // Format response to ensure proper structure for frontend
        const formattedAllocations = (allocations || []).map((allocation)=>({
                id: allocation.id,
                project_id: allocation.project_id,
                material_id: allocation.material_id,
                quantity_allocated: Number(allocation.quantity_allocated) || 0,
                quantity_used: Number(allocation.quantity_used) || 0,
                quantity_remaining: Number(allocation.quantity_allocated) - Number(allocation.quantity_used || 0),
                allocated_date: allocation.allocated_date,
                allocated_by: allocation.allocated_by,
                status: allocation.status || 'allocated',
                notes: allocation.notes || '',
                project: allocation.project ? {
                    id: allocation.project.id,
                    name: allocation.project.name,
                    city: allocation.project.city,
                    address: allocation.project.address
                } : null,
                material: allocation.material ? {
                    id: allocation.material.id,
                    name: allocation.material.name,
                    category: allocation.material.category,
                    unit: allocation.material.unit,
                    unit_price_eur: Number(allocation.material.unit_price_eur) || 0,
                    supplier_name: allocation.material.supplier_name
                } : null,
                allocator: allocation.allocator ? {
                    id: allocation.allocator.id,
                    name: `${allocation.allocator.first_name} ${allocation.allocator.last_name}`,
                    first_name: allocation.allocator.first_name,
                    last_name: allocation.allocator.last_name,
                    email: allocation.allocator.email,
                    role: allocation.allocator.role
                } : null,
                total_value: allocation.material ? Number(allocation.quantity_allocated) * Number(allocation.material.unit_price_eur || 0) : 0,
                created_at: allocation.created_at,
                updated_at: allocation.updated_at
            }));
        // Calculate summary statistics
        const totalAllocations = formattedAllocations.length;
        const totalValue = formattedAllocations.reduce((sum, alloc)=>sum + alloc.total_value, 0);
        const totalQuantityAllocated = formattedAllocations.reduce((sum, alloc)=>sum + alloc.quantity_allocated, 0);
        const totalQuantityUsed = formattedAllocations.reduce((sum, alloc)=>sum + alloc.quantity_used, 0);
        const statusCounts = {
            allocated: formattedAllocations.filter((a)=>a.status === 'allocated').length,
            partially_used: formattedAllocations.filter((a)=>a.status === 'partially_used').length,
            fully_used: formattedAllocations.filter((a)=>a.status === 'fully_used').length,
            returned: formattedAllocations.filter((a)=>a.status === 'returned').length,
            lost: formattedAllocations.filter((a)=>a.status === 'lost').length
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            allocations: formattedAllocations,
            pagination: {
                page,
                per_page,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / per_page)
            },
            summary: {
                total_allocations: count || 0,
                total_value: totalValue,
                total_quantity_allocated: totalQuantityAllocated,
                total_quantity_used: totalQuantityUsed,
                utilization_rate: totalQuantityAllocated > 0 ? (totalQuantityUsed / totalQuantityAllocated * 100).toFixed(2) : 0,
                status_counts: statusCounts
            }
        });
    } catch (error) {
        console.error('Material allocations API error:', error);
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
        const { project_id, material_id, quantity_allocated, allocated_by, status = 'allocated', notes = '', allocated_date } = body;
        // Validate required fields
        if (!project_id || !material_id || !quantity_allocated) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID, material ID, and quantity allocated are required'
            }, {
                status: 400
            });
        }
        // Validate quantity is positive
        if (Number(quantity_allocated) <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Quantity allocated must be greater than 0'
            }, {
                status: 400
            });
        }
        // Create new material allocation
        const { data: newAllocation, error: allocationError } = await supabase.from('material_allocations').insert({
            project_id,
            material_id,
            quantity_allocated: Number(quantity_allocated),
            quantity_used: 0,
            allocated_by: allocated_by || null,
            status,
            notes,
            allocated_date: allocated_date || new Date().toISOString().split('T')[0]
        }).select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        project:projects!material_allocations_project_id_fkey(
          id,
          name,
          city
        ),
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        ),
        allocator:users!material_allocations_allocated_by_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `).single();
        if (allocationError) {
            console.error('Supabase material allocation creation error:', allocationError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create material allocation'
            }, {
                status: 500
            });
        }
        // Format response
        const formattedAllocation = {
            id: newAllocation.id,
            project_id: newAllocation.project_id,
            material_id: newAllocation.material_id,
            quantity_allocated: Number(newAllocation.quantity_allocated),
            quantity_used: Number(newAllocation.quantity_used),
            quantity_remaining: Number(newAllocation.quantity_allocated) - Number(newAllocation.quantity_used),
            allocated_date: newAllocation.allocated_date,
            allocated_by: newAllocation.allocated_by,
            status: newAllocation.status,
            notes: newAllocation.notes,
            project: newAllocation.project ? {
                id: newAllocation.project.id,
                name: newAllocation.project.name,
                city: newAllocation.project.city
            } : null,
            material: newAllocation.material ? {
                id: newAllocation.material.id,
                name: newAllocation.material.name,
                category: newAllocation.material.category,
                unit: newAllocation.material.unit,
                unit_price_eur: Number(newAllocation.material.unit_price_eur || 0),
                supplier_name: newAllocation.material.supplier_name
            } : null,
            allocator: newAllocation.allocator ? {
                id: newAllocation.allocator.id,
                name: `${newAllocation.allocator.first_name} ${newAllocation.allocator.last_name}`,
                email: newAllocation.allocator.email
            } : null,
            total_value: newAllocation.material ? Number(newAllocation.quantity_allocated) * Number(newAllocation.material.unit_price_eur || 0) : 0,
            created_at: newAllocation.created_at,
            updated_at: newAllocation.updated_at
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Material allocation created successfully',
            allocation: formattedAllocation
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Material allocations POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create material allocation'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { id, quantity_used, status, notes } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Allocation ID is required'
            }, {
                status: 400
            });
        }
        // Prepare update data
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (quantity_used !== undefined) {
            updateData.quantity_used = Number(quantity_used);
        }
        if (status !== undefined) {
            updateData.status = status;
        }
        if (notes !== undefined) {
            updateData.notes = notes;
        }
        // Update material allocation
        const { data: updatedAllocation, error: updateError } = await supabase.from('material_allocations').update(updateData).eq('id', id).select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          unit_price_eur
        )
      `).single();
        if (updateError) {
            console.error('Supabase material allocation update error:', updateError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to update material allocation'
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Material allocation updated successfully',
            allocation: updatedAllocation
        });
    } catch (error) {
        console.error('Material allocations PUT error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update material allocation'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e7a6201b._.js.map