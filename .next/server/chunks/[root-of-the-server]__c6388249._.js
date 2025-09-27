module.exports = [
"[project]/.next-internal/server/app/api/vehicles/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/vehicles/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const available_only = searchParams.get('available_only') === 'true';
        const project_id = searchParams.get('project_id');
        // Build the query for vehicles with assignments
        let query = supabase.from('vehicles').select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        created_at,
        updated_at,
        vehicle_assignments(
          id,
          project_id,
          crew_id,
          user_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          notes,
          created_at,
          project:projects(id, name, city),
          crew:crews(id, name),
          user:users(id, first_name, last_name, email)
        )
      `, {
            count: 'exact'
        }).eq('is_active', true).order('created_at', {
            ascending: false
        }).range(offset, offset + per_page - 1);
        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (type) {
            query = query.eq('type', type);
        }
        if (search) {
            query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%,plate_number.ilike.%${search}%`);
        }
        if (available_only) {
            query = query.eq('status', 'available');
        }
        const { data: vehicles, error, count } = await query;
        if (error) {
            console.error('Supabase vehicles query error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch vehicles data'
            }, {
                status: 500
            });
        }
        // Format response to ensure proper structure for frontend
        const formattedVehicles = (vehicles || []).map((vehicle)=>{
            // Filter current assignments (active assignments)
            const currentAssignments = (vehicle.vehicle_assignments || []).filter((assignment)=>{
                if (!assignment.to_ts) return true; // Permanent or ongoing assignments
                return new Date(assignment.to_ts) > new Date(); // Future end date
            });
            // Find current assignment for project filter
            let currentAssignment = null;
            if (currentAssignments.length > 0) {
                currentAssignment = currentAssignments[0];
            }
            // Skip if project filter doesn't match current assignment
            if (project_id && (!currentAssignment || currentAssignment.project_id !== project_id)) {
                return null;
            }
            return {
                id: vehicle.id,
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                plate_number: vehicle.plate_number,
                type: vehicle.type || 'truck',
                status: vehicle.status || 'available',
                rental_cost_per_day: Number(vehicle.rental_cost_per_day) || 0,
                fuel_type: vehicle.fuel_type || 'diesel',
                year_manufactured: vehicle.year_manufactured,
                description: vehicle.description || '',
                is_active: vehicle.is_active,
                owned: true,
                purchase_price_eur: 0,
                rental_price_per_day_eur: Number(vehicle.rental_cost_per_day) || 0,
                rental_price_per_hour_eur: 0,
                current_location: '',
                full_name: `${vehicle.brand || ''} ${vehicle.model || ''} (${vehicle.plate_number})`.trim(),
                age: vehicle.year_manufactured ? new Date().getFullYear() - vehicle.year_manufactured : null,
                current_assignment: currentAssignment ? {
                    id: currentAssignment.id,
                    project_id: currentAssignment.project_id,
                    crew_id: currentAssignment.crew_id,
                    user_id: currentAssignment.user_id,
                    from_ts: currentAssignment.from_ts,
                    to_ts: currentAssignment.to_ts,
                    is_permanent: currentAssignment.is_permanent,
                    rental_cost_per_day: Number(currentAssignment.rental_cost_per_day) || 0,
                    notes: currentAssignment.notes || '',
                    project: currentAssignment.project ? {
                        id: currentAssignment.project.id,
                        name: currentAssignment.project.name,
                        city: currentAssignment.project.city
                    } : null,
                    crew: currentAssignment.crew ? {
                        id: currentAssignment.crew.id,
                        name: currentAssignment.crew.name
                    } : null,
                    assigned_user: currentAssignment.user ? {
                        id: currentAssignment.user.id,
                        name: `${currentAssignment.user.first_name} ${currentAssignment.user.last_name}`,
                        email: currentAssignment.user.email
                    } : null,
                    duration_days: currentAssignment.to_ts ? Math.ceil((new Date(currentAssignment.to_ts).getTime() - new Date(currentAssignment.from_ts).getTime()) / (1000 * 60 * 60 * 24)) : null
                } : null,
                assignments_count: vehicle.vehicle_assignments?.length || 0,
                created_at: vehicle.created_at,
                updated_at: vehicle.updated_at
            };
        }).filter((vehicle)=>vehicle !== null); // Remove filtered out vehicles
        // Calculate summary statistics
        const totalVehicles = count || 0;
        const statusCounts = {
            available: 0,
            in_use: 0,
            maintenance: 0,
            broken: 0
        };
        const typeCounts = {
            car: 0,
            truck: 0,
            van: 0,
            trailer: 0
        };
        formattedVehicles.forEach((vehicle)=>{
            if (statusCounts.hasOwnProperty(vehicle.status)) {
                statusCounts[vehicle.status]++;
            }
            if (typeCounts.hasOwnProperty(vehicle.type)) {
                typeCounts[vehicle.type]++;
            }
        });
        const averageRentalCost = formattedVehicles.length > 0 ? formattedVehicles.reduce((sum, v)=>sum + v.rental_cost_per_day, 0) / formattedVehicles.length : 0;
        const averageAge = formattedVehicles.filter((v)=>v.age !== null).length > 0 ? formattedVehicles.filter((v)=>v.age !== null).reduce((sum, v)=>sum + v.age, 0) / formattedVehicles.filter((v)=>v.age !== null).length : 0;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            vehicles: formattedVehicles,
            pagination: {
                page,
                per_page,
                total: project_id ? formattedVehicles.length : totalVehicles,
                total_pages: Math.ceil((project_id ? formattedVehicles.length : totalVehicles) / per_page)
            },
            summary: {
                total_vehicles: project_id ? formattedVehicles.length : totalVehicles,
                status_counts: statusCounts,
                type_counts: typeCounts,
                assigned_vehicles: formattedVehicles.filter((v)=>v.current_assignment).length,
                available_vehicles: statusCounts.available,
                average_rental_cost: Math.round(averageRentalCost * 100) / 100,
                average_age: Math.round(averageAge * 10) / 10
            }
        });
    } catch (error) {
        console.error('Vehicles API error:', error);
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
        const { brand, model, plate_number, type = 'truck', status = 'available', rental_cost_per_day = 0, fuel_type = 'diesel', year_manufactured, description = '' } = body;
        // Validate required fields
        if (!plate_number) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Plate number is required'
            }, {
                status: 400
            });
        }
        // Validate enum values
        const validStatuses = [
            'available',
            'in_use',
            'maintenance',
            'broken'
        ];
        const validTypes = [
            'car',
            'truck',
            'van',
            'trailer'
        ];
        const validFuelTypes = [
            'diesel',
            'petrol',
            'electric',
            'hybrid'
        ];
        if (!validStatuses.includes(status)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            }, {
                status: 400
            });
        }
        if (!validTypes.includes(type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            }, {
                status: 400
            });
        }
        if (!validFuelTypes.includes(fuel_type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Invalid fuel type. Must be one of: ${validFuelTypes.join(', ')}`
            }, {
                status: 400
            });
        }
        // Check for duplicate plate number
        const { data: existingVehicle } = await supabase.from('vehicles').select('id').eq('plate_number', plate_number).single();
        if (existingVehicle) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Vehicle with this plate number already exists'
            }, {
                status: 409
            });
        }
        // Create new vehicle
        const { data: newVehicle, error: vehicleError } = await supabase.from('vehicles').insert({
            brand: brand || '',
            model: model || '',
            plate_number,
            type,
            status,
            rental_cost_per_day: Number(rental_cost_per_day),
            fuel_type,
            year_manufactured: year_manufactured ? parseInt(year_manufactured) : null,
            description,
            is_active: true
        }).select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        created_at,
        updated_at
      `).single();
        if (vehicleError) {
            console.error('Supabase vehicle creation error:', vehicleError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create vehicle'
            }, {
                status: 500
            });
        }
        // Format response
        const formattedVehicle = {
            id: newVehicle.id,
            brand: newVehicle.brand || '',
            model: newVehicle.model || '',
            plate_number: newVehicle.plate_number,
            type: newVehicle.type,
            status: newVehicle.status,
            rental_cost_per_day: Number(newVehicle.rental_cost_per_day),
            fuel_type: newVehicle.fuel_type,
            year_manufactured: newVehicle.year_manufactured,
            description: newVehicle.description || '',
            is_active: newVehicle.is_active,
            owned: true,
            purchase_price_eur: 0,
            rental_price_per_day_eur: Number(newVehicle.rental_cost_per_day) || 0,
            rental_price_per_hour_eur: 0,
            current_location: '',
            fuel_consumption_l_100km: 0,
            full_name: `${newVehicle.brand || ''} ${newVehicle.model || ''} (${newVehicle.plate_number})`.trim(),
            age: newVehicle.year_manufactured ? new Date().getFullYear() - newVehicle.year_manufactured : null,
            current_assignment: null,
            assignments_count: 0,
            created_at: newVehicle.created_at,
            updated_at: newVehicle.updated_at
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Vehicle created successfully',
            vehicle: formattedVehicle
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Vehicles POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create vehicle'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { id, brand, model, status, rental_cost_per_day, fuel_type, year_manufactured, description, owned, purchase_price_eur, rental_price_per_day_eur, rental_price_per_hour_eur, current_location, fuel_consumption_l_100km } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Vehicle ID is required'
            }, {
                status: 400
            });
        }
        // Prepare update data
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (brand !== undefined) updateData.brand = brand;
        if (model !== undefined) updateData.model = model;
        if (status !== undefined) updateData.status = status;
        if (rental_cost_per_day !== undefined) updateData.rental_cost_per_day = Number(rental_cost_per_day);
        if (fuel_type !== undefined) updateData.fuel_type = fuel_type;
        if (year_manufactured !== undefined) updateData.year_manufactured = year_manufactured ? parseInt(year_manufactured) : null;
        if (description !== undefined) updateData.description = description;
        if (owned !== undefined) updateData.owned = owned;
        if (purchase_price_eur !== undefined) updateData.purchase_price_eur = Number(purchase_price_eur);
        if (rental_price_per_day_eur !== undefined) updateData.rental_price_per_day_eur = Number(rental_price_per_day_eur);
        if (rental_price_per_hour_eur !== undefined) updateData.rental_price_per_hour_eur = Number(rental_price_per_hour_eur);
        if (current_location !== undefined) updateData.current_location = current_location;
        if (fuel_consumption_l_100km !== undefined) updateData.fuel_consumption_l_100km = Number(fuel_consumption_l_100km);
        // Update vehicle
        const { data: updatedVehicle, error: updateError } = await supabase.from('vehicles').update(updateData).eq('id', id).select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        owned,
        purchase_price_eur,
        rental_price_per_day_eur,
        rental_price_per_hour_eur,
        current_location,
        fuel_consumption_l_100km,
        created_at,
        updated_at
      `).single();
        if (updateError) {
            console.error('Supabase vehicle update error:', updateError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to update vehicle'
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Vehicle updated successfully',
            vehicle: updatedVehicle
        });
    } catch (error) {
        console.error('Vehicles PUT error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update vehicle'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6388249._.js.map