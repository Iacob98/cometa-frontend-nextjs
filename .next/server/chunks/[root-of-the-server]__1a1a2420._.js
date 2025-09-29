module.exports = [
"[project]/.next-internal/server/app/api/projects/[id]/documents/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/projects/[id]/documents/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
async function GET(request, { params }) {
    try {
        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const offset = (page - 1) * per_page;
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID is required'
            }, {
                status: 400
            });
        }
        // Get documents from the documents table (all, no pagination here)
        const { data: documents, error: documentsError } = await supabase.from('documents').select(`
        id,
        filename,
        original_filename,
        file_type,
        file_size,
        document_type,
        description,
        upload_date,
        uploaded_by,
        is_active,
        uploader:users!documents_uploaded_by_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `).eq('project_id', projectId).eq('is_active', true).order('upload_date', {
            ascending: false
        });
        // Get project plans as well
        const { data: projectPlans, error: plansError } = await supabase.from('project_plans').select(`
        id,
        filename,
        file_path,
        file_url,
        file_size,
        plan_type,
        description,
        created_at
      `).eq('project_id', projectId).order('created_at', {
            ascending: false
        });
        if (documentsError) {
            console.error('Documents query error:', documentsError);
        }
        if (plansError) {
            console.error('Project plans query error:', plansError);
        }
        // Transform documents for frontend compatibility
        const transformedDocuments = (documents || []).map((doc)=>({
                id: doc.id,
                project_id: projectId,
                document_type: doc.document_type,
                file_name: doc.original_filename || doc.filename,
                file_path: `/documents/${doc.document_type}s/${doc.filename}`,
                file_size: doc.file_size,
                uploaded_at: doc.upload_date,
                uploaded_by: doc.uploader?.email || null,
                notes: doc.description || '',
                status: doc.is_active ? 'active' : 'inactive',
                uploaded_by_name: doc.uploader ? `${doc.uploader.first_name} ${doc.uploader.last_name}` : 'Unknown',
                uploader_email: doc.uploader?.email || null,
                source: 'documents'
            }));
        // Transform project plans to match document format
        const transformedPlans = (projectPlans || []).map((plan)=>({
                id: plan.id,
                project_id: projectId,
                document_type: 'plan',
                file_name: plan.filename,
                file_path: `/api/project-preparation/plans/${plan.id}/download`,
                file_size: plan.file_size,
                uploaded_at: plan.created_at,
                uploaded_by: null,
                notes: plan.description || '',
                status: 'active',
                uploaded_by_name: 'User',
                uploader_email: null,
                source: 'plans',
                plan_type: plan.plan_type
            }));
        // Combine both document sources
        const allDocuments = [
            ...transformedDocuments,
            ...transformedPlans
        ].sort((a, b)=>new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()).slice(offset, offset + per_page);
        // Get total count for pagination (documents + plans)
        const { count: documentsCount, error: countError } = await supabase.from('documents').select('*', {
            count: 'exact',
            head: true
        }).eq('project_id', projectId).eq('is_active', true);
        const { count: plansCount, error: plansCountError } = await supabase.from('project_plans').select('*', {
            count: 'exact',
            head: true
        }).eq('project_id', projectId);
        if (countError) {
            console.error('Documents count query error:', countError);
        }
        if (plansCountError) {
            console.error('Plans count query error:', plansCountError);
        }
        const totalCount = (documentsCount || 0) + (plansCount || 0);
        // Calculate summary counts from combined data
        const documentCounts = {
            document_count: totalCount,
            active_count: allDocuments.filter((d)=>d.status === 'active').length,
            pending_count: allDocuments.filter((d)=>d.status === 'pending').length,
            plans_count: allDocuments.filter((d)=>d.document_type === 'plan').length,
            permits_count: allDocuments.filter((d)=>d.document_type === 'permit').length,
            reports_count: allDocuments.filter((d)=>d.document_type === 'report').length,
            photos_count: allDocuments.filter((d)=>d.document_type === 'photo').length
        };
        // Create categories for frontend compatibility
        const categories = [
            {
                id: 'plans',
                name: 'Plans',
                count: documentCounts.plans_count,
                color: '#3b82f6'
            },
            {
                id: 'permits',
                name: 'Permits',
                count: documentCounts.permits_count,
                color: '#22c55e'
            },
            {
                id: 'reports',
                name: 'Reports',
                count: documentCounts.reports_count,
                color: '#f59e0b'
            },
            {
                id: 'photos',
                name: 'Photos',
                count: documentCounts.photos_count,
                color: '#8b5cf6'
            },
            {
                id: 'total',
                name: 'Total',
                count: documentCounts.document_count,
                color: '#6b7280'
            }
        ];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            documents: allDocuments,
            summary: documentCounts,
            categories: categories,
            pagination: {
                page,
                per_page,
                total: totalCount,
                total_pages: Math.ceil(totalCount / per_page)
            }
        });
    } catch (error) {
        console.error('Project documents API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
async function POST(request, { params }) {
    try {
        const { id: projectId } = await params;
        const body = await request.json();
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID is required'
            }, {
                status: 400
            });
        }
        const { document_type, file_name, file_size, uploaded_by, notes } = body;
        if (!document_type || !file_name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Document type and file name are required'
            }, {
                status: 400
            });
        }
        // Create document in database
        const { data: newDocument, error: insertError } = await supabase.from('documents').insert({
            project_id: projectId,
            filename: file_name.replace(/[^a-zA-Z0-9.-]/g, '_'),
            original_filename: file_name,
            file_type: file_name.split('.').pop()?.toLowerCase() || 'unknown',
            file_size: file_size || 0,
            document_type: document_type,
            description: notes || null,
            uploaded_by: uploaded_by || null,
            is_active: true
        }).select(`
        id,
        filename,
        original_filename,
        file_type,
        file_size,
        document_type,
        description,
        upload_date,
        uploaded_by,
        is_active
      `).single();
        if (insertError) {
            console.error('Document creation error:', insertError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create document in database'
            }, {
                status: 500
            });
        }
        // Transform for frontend compatibility
        const transformedDocument = {
            id: newDocument.id,
            project_id: projectId,
            document_type: newDocument.document_type,
            file_name: newDocument.original_filename,
            file_path: `/documents/${newDocument.document_type}s/${newDocument.filename}`,
            file_size: newDocument.file_size,
            uploaded_at: newDocument.upload_date,
            uploaded_by: uploaded_by,
            notes: newDocument.description || '',
            status: newDocument.is_active ? 'active' : 'inactive',
            uploaded_by_name: 'Current User',
            uploader_email: uploaded_by
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Document uploaded successfully',
            document: transformedDocument
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Project documents POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to upload document'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1a1a2420._.js.map