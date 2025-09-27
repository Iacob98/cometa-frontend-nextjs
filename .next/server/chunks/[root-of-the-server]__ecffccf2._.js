module.exports = [
"[project]/.next-internal/server/app/api/users/[id]/documents/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/lib/document-storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Shared in-memory storage for documents (replace with database in production)
__turbopack_context__.s([
    "deleteDocument",
    ()=>deleteDocument,
    "getDocument",
    ()=>getDocument,
    "getFile",
    ()=>getFile,
    "getUserDocuments",
    ()=>getUserDocuments,
    "storeDocument",
    ()=>storeDocument,
    "storeFile",
    ()=>storeFile,
    "uploadedDocuments",
    ()=>uploadedDocuments,
    "uploadedFiles",
    ()=>uploadedFiles
]);
const uploadedDocuments = {};
const uploadedFiles = {};
function storeDocument(userId, document) {
    if (!uploadedDocuments[userId]) {
        uploadedDocuments[userId] = [];
    }
    uploadedDocuments[userId].push(document);
    console.log('📝 Document stored:', {
        userId,
        documentId: document.id,
        fileName: document.file_name,
        totalUserDocs: uploadedDocuments[userId].length
    });
}
function storeFile(documentId, fileBuffer) {
    uploadedFiles[documentId] = fileBuffer;
    console.log('💾 File stored:', {
        documentId,
        fileSize: fileBuffer.length,
        totalFiles: Object.keys(uploadedFiles).length
    });
}
function getDocument(userId, documentId) {
    const userDocuments = uploadedDocuments[userId] || [];
    const document = userDocuments.find((doc)=>doc.id === documentId);
    console.log('🔍 Get document:', {
        userId,
        documentId,
        totalUserDocs: userDocuments.length,
        found: !!document,
        fileName: document?.file_name
    });
    return document;
}
function getFile(documentId) {
    const file = uploadedFiles[documentId];
    console.log('🔍 Get file:', {
        documentId,
        totalFiles: Object.keys(uploadedFiles).length,
        found: !!file,
        fileSize: file?.length
    });
    return file;
}
function deleteDocument(userId, documentId) {
    const userDocuments = uploadedDocuments[userId] || [];
    const documentIndex = userDocuments.findIndex((doc)=>doc.id === documentId);
    if (documentIndex !== -1) {
        const deletedDoc = userDocuments.splice(documentIndex, 1)[0];
        // Also delete the file content
        delete uploadedFiles[documentId];
        return deletedDoc;
    }
    return null;
}
function getUserDocuments(userId) {
    return uploadedDocuments[userId] || [];
}
}),
"[project]/src/app/api/users/[id]/documents/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/document-storage.ts [app-route] (ecmascript)");
;
;
;
// Service role client for bypassing RLS
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User ID is required'
            }, {
                status: 400
            });
        }
        // Get documents from shared storage
        const documents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserDocuments"])(id);
        const categories = [
            // Mock categories for testing - replace with actual database query when implemented
            {
                id: "work_permit",
                code: "WORK_PERMIT",
                name_en: "Work Permit",
                name_ru: "Разрешение на работу",
                name_de: "Arbeitserlaubnis",
                required_for_work: true,
                color: "#22c55e",
                created_at: new Date().toISOString()
            },
            {
                id: "passport",
                code: "PASSPORT",
                name_en: "Passport",
                name_ru: "Паспорт",
                name_de: "Reisepass",
                required_for_work: true,
                color: "#3b82f6",
                created_at: new Date().toISOString()
            },
            {
                id: "driver_license",
                code: "DRIVER_LICENSE",
                name_en: "Driver's License",
                name_ru: "Водительские права",
                name_de: "Führerschein",
                required_for_work: false,
                color: "#f59e0b",
                created_at: new Date().toISOString()
            },
            {
                id: "medical_certificate",
                code: "MEDICAL_CERT",
                name_en: "Medical Certificate",
                name_ru: "Медицинская справка",
                name_de: "Ärztliches Attest",
                required_for_work: true,
                color: "#ef4444",
                created_at: new Date().toISOString()
            },
            {
                id: "contract",
                code: "CONTRACT",
                name_en: "Employment Contract",
                name_ru: "Трудовой договор",
                name_de: "Arbeitsvertrag",
                required_for_work: true,
                color: "#8b5cf6",
                created_at: new Date().toISOString()
            }
        ];
        const stats = {
            total: documents.length,
            active: documents.filter((d)=>d.status === 'active').length,
            expired: documents.filter((d)=>d.status === 'expired').length,
            expiring_soon: documents.filter((d)=>d.status === 'expiring_soon').length
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            documents,
            categories,
            stats
        });
    } catch (error) {
        console.error('User documents GET API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch user documents'
        }, {
            status: 500
        });
    }
}
async function POST(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User ID is required'
            }, {
                status: 400
            });
        }
        // Parse the form data for file upload
        const formData = await request.formData();
        const file = formData.get('file');
        const categoryId = formData.get('category_id');
        const documentNumber = formData.get('document_number');
        const issuingAuthority = formData.get('issuing_authority');
        const issueDate = formData.get('issue_date');
        const expiryDate = formData.get('expiry_date');
        const notes = formData.get('notes');
        // Log received file data for debugging
        console.log('📄 API: Получен документ для загрузки:', {
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
            fileConstructor: file?.constructor?.name,
            hasArrayBuffer: typeof file?.arrayBuffer === 'function',
            hasStream: typeof file?.stream === 'function',
            isFile: file instanceof File,
            categoryId,
            documentNumber,
            issuingAuthority,
            issueDate,
            expiryDate,
            notes,
            userId: id
        });
        console.log('📋 API: Все FormData ключи:');
        for (const [key, value] of formData.entries()){
            if (value instanceof File) {
                console.log(`  ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
            } else {
                console.log(`  ${key}: "${value}"`);
            }
        }
        if (!file) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'File is required'
            }, {
                status: 400
            });
        }
        if (!categoryId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Category is required'
            }, {
                status: 400
            });
        }
        // Convert file to buffer and store it
        let fileBuffer;
        try {
            // First try arrayBuffer method
            if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
                const arrayBuffer = await file.arrayBuffer();
                fileBuffer = Buffer.from(arrayBuffer);
            } else if (file.stream && typeof file.stream === 'function') {
                // Fallback to stream method
                const chunks = [];
                const reader = file.stream().getReader();
                try {
                    while(true){
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                    }
                } finally{
                    reader.releaseLock();
                }
                // Combine all chunks into a single buffer
                const totalLength = chunks.reduce((acc, chunk)=>acc + chunk.length, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks){
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }
                fileBuffer = Buffer.from(combined);
            } else {
                // If neither method is available, try direct buffer conversion
                if (file instanceof Buffer) {
                    fileBuffer = file;
                } else if (file instanceof Uint8Array) {
                    fileBuffer = Buffer.from(file);
                } else {
                    throw new Error('File object does not have supported read methods');
                }
            }
        } catch (error) {
            console.error('Error reading file content:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to read file content'
            }, {
                status: 400
            });
        }
        // Create document with proper category information
        const documentId = `doc-${Date.now()}`;
        // Store the actual file content
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeFile"])(documentId, fileBuffer);
        // Define categories (same as in GET method)
        const categories = [
            // Mock categories for testing - replace with actual database query when implemented
            {
                id: "work_permit",
                code: "WORK_PERMIT",
                name_en: "Work Permit",
                name_ru: "Разрешение на работу",
                name_de: "Arbeitserlaubnis",
                required_for_work: true,
                color: "#22c55e",
                created_at: new Date().toISOString()
            },
            {
                id: "passport",
                code: "PASSPORT",
                name_en: "Passport",
                name_ru: "Паспорт",
                name_de: "Reisepass",
                required_for_work: true,
                color: "#3b82f6",
                created_at: new Date().toISOString()
            },
            {
                id: "driver_license",
                code: "DRIVER_LICENSE",
                name_en: "Driver's License",
                name_ru: "Водительские права",
                name_de: "Führerschein",
                required_for_work: false,
                color: "#f59e0b",
                created_at: new Date().toISOString()
            },
            {
                id: "medical_certificate",
                code: "MEDICAL_CERT",
                name_en: "Medical Certificate",
                name_ru: "Медицинская справка",
                name_de: "Ärztliches Attest",
                required_for_work: true,
                color: "#ef4444",
                created_at: new Date().toISOString()
            },
            {
                id: "contract",
                code: "CONTRACT",
                name_en: "Employment Contract",
                name_ru: "Трудовой договор",
                name_de: "Arbeitsvertrag",
                required_for_work: true,
                color: "#8b5cf6",
                created_at: new Date().toISOString()
            }
        ];
        // Find matching category
        const matchingCategory = categories.find((cat)=>cat.id === categoryId);
        const newDocument = {
            id: documentId,
            user_id: id,
            category_id: categoryId,
            document_number: documentNumber || '',
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_url: `/api/users/${id}/documents/${documentId}/download`,
            status: 'active',
            notes: notes || '',
            issuing_authority: issuingAuthority || '',
            issue_date: issueDate || null,
            expiry_date: expiryDate || null,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: matchingCategory || {
                id: categoryId,
                code: categoryId.toUpperCase(),
                name_en: categoryId,
                name_ru: categoryId,
                name_de: categoryId,
                required_for_work: false,
                color: "#6b7280",
                created_at: new Date().toISOString()
            }
        };
        // Store document metadata
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeDocument"])(id, newDocument);
        console.log('✅ Документ сохранен:', {
            documentId: newDocument.id,
            fileName: newDocument.file_name,
            userId: id,
            category: newDocument.category.name_ru || newDocument.category.name_en,
            totalUserDocs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserDocuments"])(id).length
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Document uploaded successfully',
            document: newDocument
        });
    } catch (error) {
        console.error('User documents POST API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to upload document'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ecffccf2._.js.map