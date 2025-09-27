module.exports = [
"[project]/.next-internal/server/app/api/notifications/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/notifications/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://oijmohlhdxoawzvctnxx.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro"));
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const offset = (page - 1) * per_page;
        const user_id = searchParams.get('user_id');
        const read = searchParams.get('read');
        const priority = searchParams.get('priority');
        const created_after = searchParams.get('created_after');
        // Build the query with filters
        let query = supabase.from('in_app_notifications').select(`
        id,
        user_id,
        title,
        message,
        notification_type,
        priority,
        is_read,
        read_at,
        action_url,
        action_label,
        expires_at,
        created_at
      `).order('created_at', {
            ascending: false
        }).range(offset, offset + per_page - 1);
        // Apply filters
        if (user_id) {
            query = query.eq('user_id', user_id);
        }
        if (read !== null) {
            const isRead = read === 'true';
            query = query.eq('is_read', isRead);
        }
        if (priority) {
            query = query.eq('priority', priority);
        }
        if (created_after) {
            query = query.gte('created_at', created_after);
        }
        // Execute the query
        const { data: notifications, error } = await query;
        if (error) {
            console.error('Notifications query error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch notifications'
            }, {
                status: 500
            });
        }
        // Get total count for pagination
        let countQuery = supabase.from('in_app_notifications').select('*', {
            count: 'exact',
            head: true
        });
        if (user_id) {
            countQuery = countQuery.eq('user_id', user_id);
        }
        if (read !== null) {
            const isRead = read === 'true';
            countQuery = countQuery.eq('is_read', isRead);
        }
        if (priority) {
            countQuery = countQuery.eq('priority', priority);
        }
        if (created_after) {
            countQuery = countQuery.gte('created_at', created_after);
        }
        const { count: totalCount } = await countQuery;
        // Get summary counts
        let summaryQueries = [
            supabase.from('in_app_notifications').select('*', {
                count: 'exact',
                head: true
            }),
            supabase.from('in_app_notifications').select('*', {
                count: 'exact',
                head: true
            }).eq('is_read', false),
            supabase.from('in_app_notifications').select('*', {
                count: 'exact',
                head: true
            }).eq('priority', 'urgent').eq('is_read', false)
        ];
        // Apply user filter to summary queries if specified
        if (user_id) {
            summaryQueries = summaryQueries.map((q)=>q.eq('user_id', user_id));
        }
        const [{ count: totalAllCount }, { count: unreadCount }, { count: urgentUnreadCount }] = await Promise.all(summaryQueries);
        // Transform data to match frontend expectations
        const transformedNotifications = (notifications || []).map((notif)=>({
                ...notif,
                type: notif.notification_type,
                body: notif.message
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: transformedNotifications,
            total: totalCount || 0,
            page,
            per_page,
            total_pages: Math.ceil((totalCount || 0) / per_page),
            summary: {
                total_count: totalAllCount || 0,
                unread_count: unreadCount || 0,
                urgent_count: urgentUnreadCount || 0
            }
        });
    } catch (error) {
        console.error('Notifications API error:', error);
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
        const { user_id, title, message, type = 'info', priority = 'normal', action_url, action_label, expires_at } = body;
        if (!title || !message) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Title and message are required'
            }, {
                status: 400
            });
        }
        // Set default expiration to 30 days from now if not provided
        const defaultExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: newNotification, error } = await supabase.from('in_app_notifications').insert({
            user_id: user_id || null,
            title,
            message,
            notification_type: type,
            priority,
            is_read: false,
            action_url: action_url || null,
            action_label: action_label || null,
            expires_at: expires_at || defaultExpiresAt,
            created_at: new Date().toISOString()
        }).select(`
        id,
        user_id,
        title,
        message,
        notification_type,
        priority,
        is_read,
        read_at,
        action_url,
        action_label,
        expires_at,
        created_at
      `).single();
        if (error) {
            console.error('Supabase notification creation error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create notification in database'
            }, {
                status: 500
            });
        }
        // Transform response to match frontend expectations
        const transformedNotification = {
            ...newNotification,
            type: newNotification.notification_type,
            body: newNotification.message
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Notification created successfully',
            notification: transformedNotification
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Notifications POST error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create notification'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { notification_id, read = true } = body;
        if (!notification_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Notification ID is required'
            }, {
                status: 400
            });
        }
        const updateData = {
            is_read: read,
            read_at: read ? new Date().toISOString() : null
        };
        const { data: updatedNotification, error } = await supabase.from('in_app_notifications').update(updateData).eq('id', notification_id).select(`
        id,
        user_id,
        title,
        message,
        notification_type,
        priority,
        is_read,
        read_at,
        action_url,
        action_label,
        expires_at,
        created_at
      `).single();
        if (error) {
            console.error('Supabase notification update error:', error);
            if (error.code === 'PGRST116') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Notification not found'
                }, {
                    status: 404
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to update notification in database'
            }, {
                status: 500
            });
        }
        // Transform response to match frontend expectations
        const transformedNotification = {
            ...updatedNotification,
            type: updatedNotification.notification_type,
            body: updatedNotification.message
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Notification updated successfully',
            notification: transformedNotification
        });
    } catch (error) {
        console.error('Notifications PUT error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update notification'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__980ec8dd._.js.map