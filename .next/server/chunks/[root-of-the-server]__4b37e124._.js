module.exports = [
"[project]/.next-internal/server/app/api/users/[id]/documents/[documentId]/download/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/users/[id]/documents/[documentId]/download/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/document-storage.ts [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    try {
        const { id, documentId } = await params;
        if (!id || !documentId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User ID and Document ID are required'
            }, {
                status: 400
            });
        }
        // First check if we have the actual file stored
        const fileContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFile"])(documentId);
        const document = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDocument"])(id, documentId);
        console.log('🔍 Download Debug:', {
            userId: id,
            documentId,
            hasFileContent: !!fileContent,
            hasDocument: !!document,
            documentFileName: document?.file_name
        });
        if (fileContent && document) {
            // Ensure fileContent is properly handled as Uint8Array for Response
            const uint8Array = new Uint8Array(fileContent);
            return new Response(uint8Array, {
                status: 200,
                headers: {
                    'Content-Type': document.file_type || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${document.file_name}"`,
                    'Content-Length': uint8Array.length.toString()
                }
            });
        }
        // Fall back to mock PDF if no real file is found
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/ProcSet [/PDF /Text]
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Mock Document Content) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000110 00000 n
0000000297 00000 n
0000000389 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;
        // Return the mock PDF with appropriate headers
        return new Response(pdfContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
                'Content-Length': pdfContent.length.toString()
            }
        });
    } catch (error) {
        console.error('Document download API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to download document'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4b37e124._.js.map