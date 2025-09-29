module.exports = [
"[project]/.next-internal/server/app/api/zone-layout/cabinets/[id]/upload/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/zone-layout/cabinets/[id]/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function POST(request, { params }) {
    try {
        const { id: cabinetId } = await params;
        if (!cabinetId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cabinet ID is required"
            }, {
                status: 400
            });
        }
        // Check if cabinet exists
        const { data: cabinet, error: cabinetError } = await supabase.from('cabinets').select('id, project_id, code, name').eq('id', cabinetId).single();
        if (cabinetError || !cabinet) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Cabinet not found'
            }, {
                status: 404
            });
        }
        const formData = await request.formData();
        const file = formData.get('file');
        const installationType = formData.get('installation_type') || 'connection_plan';
        if (!file) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No file provided'
            }, {
                status: 400
            });
        }
        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/dwg',
            'application/dxf',
            'image/bmp',
            'image/tiff'
        ];
        if (!allowedTypes.includes(file.type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid file type. Allowed types: images, PDF, Word, Excel, DWG, DXF',
                allowedTypes
            }, {
                status: 400
            });
        }
        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'File size too large. Maximum size is 50MB'
            }, {
                status: 400
            });
        }
        console.log('Uploading cabinet file to Supabase Storage:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            cabinetId,
            installationType
        });
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
        const uniqueFileName = `${sanitizedName.replace(`.${fileExtension}`, '')}_${timestamp}_${randomSuffix}.${fileExtension}`;
        // Upload to Supabase Storage
        const filePath = `projects/${cabinet.project_id}/cabinets/${cabinetId}/${installationType}/${uniqueFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('project-documents').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });
        if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to upload file to storage'
            }, {
                status: 500
            });
        }
        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from('project-documents').getPublicUrl(filePath);
        console.log('File uploaded successfully:', {
            success: true,
            url: publicUrl,
            path: filePath
        });
        // For now, we'll store file info in cabinet notes or use simple storage
        // Future enhancement: create cabinet_installation_files table
        console.log('File uploaded successfully, metadata not stored in database yet');
        const response = {
            success: true,
            message: `Installation file uploaded successfully for cabinet ${cabinet.code}`,
            file: {
                cabinet_id: cabinetId,
                installation_type: installationType,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size,
                file_type: file.type,
                uploaded_at: new Date().toISOString()
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 201
        });
    } catch (error) {
        console.error("Cabinet file upload error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to upload file"
        }, {
            status: 500
        });
    }
}
async function GET(request, { params }) {
    try {
        const { id: cabinetId } = await params;
        const { searchParams } = new URL(request.url);
        const installationType = searchParams.get('installation_type') || 'connection_plan';
        if (!cabinetId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cabinet ID is required"
            }, {
                status: 400
            });
        }
        // Check if cabinet exists
        const { data: cabinet, error: cabinetError } = await supabase.from('cabinets').select('id, project_id, code, name').eq('id', cabinetId).single();
        if (cabinetError || !cabinet) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Cabinet not found'
            }, {
                status: 404
            });
        }
        // List files from storage
        const folderPath = `projects/${cabinet.project_id}/cabinets/${cabinetId}/${installationType}/`;
        const { data: files, error: listError } = await supabase.storage.from('project-documents').list(folderPath);
        if (listError) {
            console.error('Storage list error:', listError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to list files'
            }, {
                status: 500
            });
        }
        // Transform file list to include URLs
        const fileList = (files || []).map((file)=>{
            const filePath = `${folderPath}${file.name}`;
            const { data: { publicUrl } } = supabase.storage.from('project-documents').getPublicUrl(filePath);
            return {
                cabinet_id: cabinetId,
                installation_type: installationType,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.metadata?.size || 0,
                file_type: file.metadata?.mimetype || 'application/octet-stream',
                uploaded_at: file.created_at
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fileList);
    } catch (error) {
        console.error("Cabinet files fetch error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch files"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__23d9bb46._.js.map