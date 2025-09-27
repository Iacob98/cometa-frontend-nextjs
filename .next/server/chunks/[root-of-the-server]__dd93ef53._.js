module.exports = [
"[project]/.next-internal/server/app/api/project-preparation/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/project-preparation/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const projectId = searchParams.get('project_id');
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID is required'
            }, {
                status: 400
            });
        }
        // Get project basic info from Supabase
        const { data: project, error: projectError } = await supabase.from('projects').select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        manager:users!projects_pm_user_id_fkey(
          id,
          first_name,
          last_name
        )
      `).eq('id', projectId).single();
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
        // Get real preparation data from database
        const [facilitiesResult, housingResult, plansResult, utilityContactsResult] = await Promise.all([
            // Get facilities
            supabase.from('facilities').select(`
          id,
          name,
          type,
          floor,
          access_info,
          contact_info,
          notes,
          created_at
        `).eq('project_id', projectId).order('created_at', {
                ascending: false
            }),
            // Get housing units
            supabase.from('housing_units').select(`
          id,
          unit_number,
          unit_type,
          floor,
          room_count,
          area_sqm,
          contact_person,
          contact_phone,
          access_instructions,
          installation_notes,
          status,
          created_at
        `).eq('project_id', projectId).order('created_at', {
                ascending: false
            }),
            // Get project plans
            supabase.from('project_plans').select(`
          id,
          title,
          description,
          plan_type,
          filename,
          file_size,
          file_url,
          file_path,
          uploaded_at
        `).eq('project_id', projectId).order('uploaded_at', {
                ascending: false
            }),
            // Get utility contacts
            supabase.from('utility_contacts').select(`
          id,
          kind,
          organization,
          contact_person,
          phone,
          email,
          notes,
          created_at
        `).eq('project_id', projectId).order('created_at', {
                ascending: false
            })
        ]);
        // Check for errors
        if (facilitiesResult.error) {
            console.error('Facilities query error:', facilitiesResult.error);
        }
        if (housingResult.error) {
            console.error('Housing query error:', housingResult.error);
        }
        if (plansResult.error) {
            console.error('Plans query error:', plansResult.error);
        }
        if (utilityContactsResult.error) {
            console.error('Utility contacts query error:', utilityContactsResult.error);
        }
        // Calculate completion percentage based on real data
        const totalItems = (facilitiesResult.data?.length || 0) + (housingResult.data?.length || 0) + (plansResult.data?.length || 0) + (utilityContactsResult.data?.length || 0);
        const completedHousing = housingResult.data?.filter((h)=>h.status === 'completed').length || 0;
        const completionPercentage = totalItems > 0 ? Math.round(completedHousing / totalItems * 100) : 0;
        const preparationData = {
            project: {
                ...project,
                manager_name: project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : null
            },
            preparation: {
                phase: completionPercentage > 75 ? 'ready' : completionPercentage > 25 ? 'planning' : 'initial',
                completion_percentage: completionPercentage,
                facilities: facilitiesResult.data || [],
                housing: housingResult.data || [],
                plans: plansResult.data || [],
                utility_contacts: utilityContactsResult.data || []
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(preparationData);
    } catch (error) {
        console.error('Project preparation API error:', error);
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
        const { project_id, item_type, data } = body;
        if (!project_id || !item_type || !data) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID, item type, and data are required'
            }, {
                status: 400
            });
        }
        let result;
        let error;
        // Create different types of preparation items based on type
        switch(item_type){
            case 'facility':
                ({ data: result, error } = await supabase.from('facilities').insert({
                    project_id,
                    name: data.name,
                    type: data.type || 'apartment',
                    floor: data.floor,
                    access_info: data.access_info,
                    contact_info: data.contact_info,
                    notes: data.notes
                }).select().single());
                break;
            case 'housing_unit':
                ({ data: result, error } = await supabase.from('housing_units').insert({
                    project_id,
                    unit_number: data.unit_number,
                    unit_type: data.unit_type || 'apartment',
                    floor: data.floor,
                    room_count: data.room_count,
                    area_sqm: data.area_sqm,
                    contact_person: data.contact_person,
                    contact_phone: data.contact_phone,
                    access_instructions: data.access_instructions,
                    installation_notes: data.installation_notes,
                    status: data.status || 'pending'
                }).select().single());
                break;
            case 'utility_contact':
                ({ data: result, error } = await supabase.from('utility_contacts').insert({
                    project_id,
                    kind: data.kind,
                    organization: data.organization,
                    contact_person: data.contact_person,
                    phone: data.phone,
                    email: data.email,
                    notes: data.notes
                }).select().single());
                break;
            case 'project_plan':
                ({ data: result, error } = await supabase.from('project_plans').insert({
                    project_id,
                    title: data.title,
                    description: data.description,
                    plan_type: data.plan_type,
                    filename: data.filename,
                    file_size: data.file_size,
                    file_url: data.file_url,
                    file_path: data.file_path
                }).select().single());
                break;
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid item type. Must be one of: facility, housing_unit, utility_contact, project_plan'
                }, {
                    status: 400
                });
        }
        if (error) {
            console.error(`Supabase ${item_type} creation error:`, error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Failed to create ${item_type} in database`
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: `${item_type.replace('_', ' ')} added successfully`,
            item: result,
            type: item_type
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Project preparation POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create preparation item'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dd93ef53._.js.map