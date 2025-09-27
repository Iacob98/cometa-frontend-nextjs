module.exports = [
"[project]/.next-internal/server/app/api/notifications/document-expiration/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/document-expiration.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDocumentExpiration",
    ()=>calculateDocumentExpiration,
    "calculateDocumentsExpiration",
    ()=>calculateDocumentsExpiration,
    "generateExpirationNotifications",
    ()=>generateExpirationNotifications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$differenceInDays$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/differenceInDays.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isPast$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isPast.js [app-route] (ecmascript)");
;
function calculateDocumentExpiration(document) {
    const defaultResult = {
        status: 'active',
        daysUntilExpiry: Infinity,
        warningLevel: 'none',
        priority: 'normal',
        notificationTitle: '',
        notificationMessage: ''
    };
    if (!document.expiry_date) {
        return defaultResult;
    }
    const expiryDate = new Date(document.expiry_date);
    const today = new Date();
    const daysUntilExpiry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$differenceInDays$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["differenceInDays"])(expiryDate, today);
    // Check if already expired
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isPast$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPast"])(expiryDate)) {
        return {
            status: 'expired',
            daysUntilExpiry: Math.abs(daysUntilExpiry),
            warningLevel: 'critical',
            priority: 'urgent',
            notificationTitle: 'Document Expired',
            notificationMessage: `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expired ${Math.abs(daysUntilExpiry)} days ago`
        };
    }
    // Calculate warning levels based on days until expiry
    const oneMonthInDays = 30;
    const twoMonthsInDays = 60;
    const threeMonthsInDays = 90;
    let warningLevel = 'none';
    let priority = 'normal';
    let status = 'active';
    let notificationTitle = '';
    let notificationMessage = '';
    if (daysUntilExpiry <= oneMonthInDays) {
        warningLevel = 'one_month';
        priority = 'urgent';
        status = 'expiring_soon';
        notificationTitle = '🚨 Critical: Document expiring within a month';
        notificationMessage = `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expires in ${daysUntilExpiry} days`;
    } else if (daysUntilExpiry <= twoMonthsInDays) {
        warningLevel = 'two_months';
        priority = 'high';
        status = 'expiring_soon';
        notificationTitle = '⚠️ Warning: Document expiring within 2 months';
        notificationMessage = `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expires in ${daysUntilExpiry} days`;
    } else if (daysUntilExpiry <= threeMonthsInDays) {
        warningLevel = 'three_months';
        priority = 'normal';
        status = 'expiring_soon';
        notificationTitle = 'ℹ️ Reminder: Document expiring within 3 months';
        notificationMessage = `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expires in ${daysUntilExpiry} days`;
    }
    return {
        status,
        daysUntilExpiry,
        warningLevel,
        priority,
        notificationTitle,
        notificationMessage
    };
}
function calculateDocumentsExpiration(documents) {
    const expirationInfo = documents.map((doc)=>({
            ...doc,
            ...calculateDocumentExpiration(doc)
        }));
    const summary = {
        total: documents.length,
        active: expirationInfo.filter((doc)=>doc.status === 'active').length,
        expiring_soon: expirationInfo.filter((doc)=>doc.status === 'expiring_soon').length,
        expired: expirationInfo.filter((doc)=>doc.status === 'expired').length,
        critical_count: expirationInfo.filter((doc)=>doc.warningLevel === 'critical').length,
        urgent_count: expirationInfo.filter((doc)=>doc.priority === 'urgent').length,
        high_priority_count: expirationInfo.filter((doc)=>doc.priority === 'high').length
    };
    return {
        expirationInfo,
        summary
    };
}
function generateExpirationNotifications(documents) {
    const notifications = [];
    documents.forEach((document)=>{
        const expiration = calculateDocumentExpiration(document);
        // Only create notifications for documents that need warnings
        if (expiration.warningLevel !== 'none') {
            notifications.push({
                user_id: document.user_id,
                title: expiration.notificationTitle,
                message: expiration.notificationMessage,
                notification_type: 'info',
                priority: expiration.priority,
                action_url: `/dashboard/teams/${document.user_id}`,
                action_label: 'View Documents',
                document_id: document.id,
                warning_level: expiration.warningLevel
            });
        }
    });
    return notifications;
}
}),
"[project]/src/lib/document-storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteDocument",
    ()=>deleteDocument,
    "getAllDocuments",
    ()=>getAllDocuments,
    "getAllDocumentsWithExpiration",
    ()=>getAllDocumentsWithExpiration,
    "getDocument",
    ()=>getDocument,
    "getFile",
    ()=>getFile,
    "getUserDocuments",
    ()=>getUserDocuments,
    "storeDocument",
    ()=>storeDocument,
    "storeFile",
    ()=>storeFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$expiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/document-expiration.ts [app-route] (ecmascript)");
;
;
;
// Persistent storage directories
const STORAGE_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), '.tmp', 'documents');
const METADATA_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(STORAGE_DIR, 'metadata.json');
// Ensure storage directory exists
if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(STORAGE_DIR)) {
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(STORAGE_DIR, {
        recursive: true
    });
}
// Load metadata from file or initialize empty
let uploadedDocuments = {};
try {
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(METADATA_FILE)) {
        const data = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(METADATA_FILE, 'utf8');
        uploadedDocuments = JSON.parse(data);
    }
} catch (error) {
    console.warn('Could not load document metadata:', error);
    uploadedDocuments = {};
}
// Save metadata to file
function saveMetadata() {
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(METADATA_FILE, JSON.stringify(uploadedDocuments, null, 2));
    } catch (error) {
        console.error('Could not save document metadata:', error);
    }
}
function storeDocument(userId, document) {
    if (!uploadedDocuments[userId]) {
        uploadedDocuments[userId] = [];
    }
    uploadedDocuments[userId].push(document);
    saveMetadata(); // Save to file
    console.log('📝 Document stored:', {
        userId,
        documentId: document.id,
        fileName: document.file_name,
        totalUserDocs: uploadedDocuments[userId].length
    });
}
function storeFile(documentId, fileBuffer) {
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(STORAGE_DIR, `${documentId}.bin`);
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, fileBuffer);
        console.log('💾 File stored:', {
            documentId,
            fileSize: fileBuffer.length,
            filePath
        });
    } catch (error) {
        console.error('Error storing file:', error);
    }
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
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(STORAGE_DIR, `${documentId}.bin`);
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) {
            const file = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath);
            console.log('🔍 Get file:', {
                documentId,
                filePath,
                found: true,
                fileSize: file.length
            });
            return file;
        } else {
            console.log('🔍 Get file:', {
                documentId,
                filePath,
                found: false,
                fileSize: undefined
            });
            return null;
        }
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
}
function deleteDocument(userId, documentId) {
    const userDocuments = uploadedDocuments[userId] || [];
    const documentIndex = userDocuments.findIndex((doc)=>doc.id === documentId);
    if (documentIndex !== -1) {
        const deletedDoc = userDocuments.splice(documentIndex, 1)[0];
        saveMetadata(); // Save to file
        // Also delete the file content
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(STORAGE_DIR, `${documentId}.bin`);
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) {
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
        return deletedDoc;
    }
    return null;
}
function getUserDocuments(userId) {
    const documents = uploadedDocuments[userId] || [];
    // Calculate expiration info for each document
    const { expirationInfo } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$expiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateDocumentsExpiration"])(documents);
    return expirationInfo;
}
function getAllDocuments() {
    const allDocuments = [];
    Object.values(uploadedDocuments).forEach((userDocs)=>{
        allDocuments.push(...userDocs);
    });
    return allDocuments;
}
function getAllDocumentsWithExpiration() {
    const allDocuments = getAllDocuments();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$expiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateDocumentsExpiration"])(allDocuments);
}
}),
"[project]/src/app/api/notifications/document-expiration/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$expiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/document-expiration.ts [app-route] (ecmascript)");
;
;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request) {
    try {
        // Get all documents with expiration info
        const { expirationInfo, summary } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllDocumentsWithExpiration"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            documents: expirationInfo,
            summary
        });
    } catch (error) {
        console.error('Document expiration API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to get document expiration info'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { force = false } = body;
        // Get all documents with expiration info
        const { expirationInfo } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllDocumentsWithExpiration"])();
        // Generate notifications for expiring documents
        const notifications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$expiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateExpirationNotifications"])(expirationInfo);
        if (notifications.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'No expiring documents found',
                notifications_created: 0
            });
        }
        // Check if we should only create new notifications or force create all
        const existingNotificationsQuery = await supabase.from('in_app_notifications').select('id, user_id, title').eq('notification_type', 'info').ilike('title', '%Document expiring%').eq('is_read', false);
        let filteredNotifications = notifications;
        if (!force && existingNotificationsQuery.data) {
            // Filter out notifications that already exist with the same title for the same user
            const existingMap = new Map();
            existingNotificationsQuery.data.forEach((notif)=>{
                const key = `${notif.user_id}-${notif.title}`;
                existingMap.set(key, true);
            });
            filteredNotifications = notifications.filter((notif)=>{
                const key = `${notif.user_id}-${notif.title}`;
                return !existingMap.has(key);
            });
        }
        if (filteredNotifications.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'All expiration notifications already exist',
                notifications_created: 0,
                existing_notifications: existingNotificationsQuery.data?.length || 0
            });
        }
        // Create notifications in database
        const notificationsToInsert = filteredNotifications.map((notif)=>({
                user_id: notif.user_id,
                title: notif.title,
                message: notif.message,
                notification_type: notif.notification_type,
                priority: notif.priority,
                is_read: false,
                action_url: notif.action_url,
                action_label: notif.action_label,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            }));
        const { data: createdNotifications, error } = await supabase.from('in_app_notifications').insert(notificationsToInsert).select();
        if (error) {
            console.error('Supabase notification creation error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create notifications in database'
            }, {
                status: 500
            });
        }
        console.log(`✅ Created ${createdNotifications?.length || 0} document expiration notifications`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Document expiration notifications created successfully',
            notifications_created: createdNotifications?.length || 0,
            total_expiring_documents: notifications.length,
            notifications: createdNotifications
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Document expiration notifications POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create document expiration notifications'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a83b9a97._.js.map