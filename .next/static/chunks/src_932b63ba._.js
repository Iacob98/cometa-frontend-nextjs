(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/sonner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const Toaster = (param)=>{
    let { ...props } = param;
    _s();
    const { theme = "system" } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
        theme: theme,
        className: "toaster group",
        toastOptions: {
            classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
            }
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sonner.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toaster, "EriOrahfenYKDCErPq+L6926Dw4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Toaster;
;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "AppointmentsApiClient",
    ()=>AppointmentsApiClient,
    "AuthApiClient",
    ()=>AuthApiClient,
    "DocumentAccessApiClient",
    ()=>DocumentAccessApiClient,
    "DocumentCategoriesApiClient",
    ()=>DocumentCategoriesApiClient,
    "DocumentSharesApiClient",
    ()=>DocumentSharesApiClient,
    "DocumentTemplatesApiClient",
    ()=>DocumentTemplatesApiClient,
    "DocumentsApiClient",
    ()=>DocumentsApiClient,
    "GeoAnalysisApiClient",
    ()=>GeoAnalysisApiClient,
    "GeoAnnotationsApiClient",
    ()=>GeoAnnotationsApiClient,
    "GeoLayersApiClient",
    ()=>GeoLayersApiClient,
    "GeoMeasurementsApiClient",
    ()=>GeoMeasurementsApiClient,
    "GeoRoutesApiClient",
    ()=>GeoRoutesApiClient,
    "GeospatialApiClient",
    ()=>GeospatialApiClient,
    "HousesApiClient",
    ()=>HousesApiClient,
    "MapTilesApiClient",
    ()=>MapTilesApiClient,
    "MaterialAllocationsApiClient",
    ()=>MaterialAllocationsApiClient,
    "MaterialOrdersApiClient",
    ()=>MaterialOrdersApiClient,
    "MaterialsApiClient",
    ()=>MaterialsApiClient,
    "NotificationPreferencesApiClient",
    ()=>NotificationPreferencesApiClient,
    "NotificationTemplatesApiClient",
    ()=>NotificationTemplatesApiClient,
    "NotificationsApiClient",
    ()=>NotificationsApiClient,
    "ProjectsApiClient",
    ()=>ProjectsApiClient,
    "SuppliersApiClient",
    ()=>SuppliersApiClient,
    "TeamsApiClient",
    ()=>TeamsApiClient,
    "UsersApiClient",
    ()=>UsersApiClient,
    "WebSocketApiClient",
    ()=>WebSocketApiClient,
    "WorkEntriesApiClient",
    ()=>WorkEntriesApiClient,
    "appointmentsApi",
    ()=>appointmentsApi,
    "authApi",
    ()=>authApi,
    "clearAuthTokenForAllClients",
    ()=>clearAuthTokenForAllClients,
    "documentAccessApi",
    ()=>documentAccessApi,
    "documentCategoriesApi",
    ()=>documentCategoriesApi,
    "documentSharesApi",
    ()=>documentSharesApi,
    "documentTemplatesApi",
    ()=>documentTemplatesApi,
    "documentsApi",
    ()=>documentsApi,
    "geoAnalysisApi",
    ()=>geoAnalysisApi,
    "geoAnnotationsApi",
    ()=>geoAnnotationsApi,
    "geoLayersApi",
    ()=>geoLayersApi,
    "geoMeasurementsApi",
    ()=>geoMeasurementsApi,
    "geoRoutesApi",
    ()=>geoRoutesApi,
    "geospatialApi",
    ()=>geospatialApi,
    "housesApi",
    ()=>housesApi,
    "mapTilesApi",
    ()=>mapTilesApi,
    "materialAllocationsApi",
    ()=>materialAllocationsApi,
    "materialOrdersApi",
    ()=>materialOrdersApi,
    "materialsApi",
    ()=>materialsApi,
    "notificationPreferencesApi",
    ()=>notificationPreferencesApi,
    "notificationTemplatesApi",
    ()=>notificationTemplatesApi,
    "notificationsApi",
    ()=>notificationsApi,
    "projectsApi",
    ()=>projectsApi,
    "setAuthTokenForAllClients",
    ()=>setAuthTokenForAllClients,
    "suppliersApi",
    ()=>suppliersApi,
    "teamsApi",
    ()=>teamsApi,
    "usersApi",
    ()=>usersApi,
    "workEntriesApi",
    ()=>workEntriesApi,
    "wsApi",
    ()=>wsApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
// API Configuration
const getApiBaseUrl = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return window.location.origin;
    }
    //TURBOPACK unreachable
    ;
};
class ApiError extends Error {
    constructor(status, message, response){
        super(message), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "status", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "response", void 0), this.status = status, this.response = response;
        this.name = "ApiError";
    }
}
// Base API client
class BaseApiClient {
    setAuthToken(token) {
        this.authToken = token;
    }
    clearAuthToken() {
        this.authToken = undefined;
    }
    getHeaders() {
        const headers = {
            "Content-Type": "application/json"
        };
        if (this.authToken) {
            headers.Authorization = "Bearer ".concat(this.authToken);
        }
        return headers;
    }
    async request(endpoint) {
        let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        const url = "".concat(this.baseURL).concat(endpoint);
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };
        try {
            const response = await fetch(url, config);
            // Handle non-JSON responses
            const contentType = response.headers.get("content-type");
            if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes("application/json"))) {
                if (!response.ok) {
                    throw new ApiError(response.status, "HTTP ".concat(response.status, ": ").concat(response.statusText));
                }
                return response.text();
            }
            const data = await response.json();
            if (!response.ok) {
                throw new ApiError(response.status, data.message || data.detail || "HTTP ".concat(response.status), data);
            }
            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            // Network or other errors
            throw new ApiError(0, error instanceof Error ? error.message : "Network error");
        }
    }
    async get(endpoint, params) {
        const url = new URL("".concat(this.baseURL).concat(endpoint));
        if (params) {
            Object.entries(params).forEach((param)=>{
                let [key, value] = param;
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }
        return this.request(url.toString().replace(this.baseURL, ""));
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined
        });
    }
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined
        });
    }
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE"
        });
    }
    constructor(baseURL){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "baseURL", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "authToken", void 0);
        this.baseURL = baseURL;
    }
}
class AuthApiClient extends BaseApiClient {
    async login(credentials) {
        return this.post("/login", credentials);
    }
    async refreshToken(refreshToken) {
        return this.post("/refresh", {
            refresh_token: refreshToken
        });
    }
    async logout() {
        return this.post("/logout");
    }
    async me() {
        return this.get("/me");
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/auth"));
    }
}
class ProjectsApiClient extends BaseApiClient {
    async getProjects(filters) {
        return this.get("/", filters);
    }
    async getProject(id) {
        return this.get("/".concat(id));
    }
    async createProject(data) {
        return this.post("/", data);
    }
    async updateProject(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteProject(id) {
        return this.delete("/".concat(id));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/projects"));
    }
}
class WorkEntriesApiClient extends BaseApiClient {
    async getWorkEntries(filters) {
        return this.get("/", filters);
    }
    async getWorkEntry(id) {
        return this.get("/".concat(id));
    }
    async createWorkEntry(data) {
        return this.post("/", data);
    }
    async updateWorkEntry(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteWorkEntry(id) {
        return this.delete("/".concat(id));
    }
    async approveWorkEntry(id) {
        return this.post("/".concat(id, "/approve"));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/work-entries"));
    }
}
class UsersApiClient extends BaseApiClient {
    async getUsers(filters) {
        return this.get("/", filters);
    }
    async getUser(id) {
        return this.get("/".concat(id));
    }
    async createUser(data) {
        return this.post("/", data);
    }
    async updateUser(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteUser(id) {
        return this.delete("/".concat(id));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/users"));
    }
}
class TeamsApiClient extends BaseApiClient {
    async getCrews() {
        return this.get("/crews");
    }
    async getCrew(id) {
        return this.get("/crews/".concat(id));
    }
    async createCrew(data) {
        return this.post("/crews", data);
    }
    async updateCrew(id, data) {
        return this.patch("/crews/".concat(id), data);
    }
    async deleteCrew(id) {
        return this.delete("/crews/".concat(id));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/teams"));
    }
}
class MaterialsApiClient extends BaseApiClient {
    async getMaterials(filters) {
        return this.get("/", filters);
    }
    async getMaterial(id) {
        return this.get("/".concat(id));
    }
    async createMaterial(data) {
        return this.post("/", data);
    }
    async updateMaterial(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteMaterial(id) {
        return this.delete("/".concat(id));
    }
    async getLowStockMaterials() {
        return this.get("/low-stock");
    }
    async adjustStock(id, adjustment) {
        return this.post("/".concat(id, "/adjust-stock"), adjustment);
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/materials"));
    }
}
class SuppliersApiClient extends BaseApiClient {
    async getSuppliers() {
        return this.get("/");
    }
    async getSupplier(id) {
        return this.get("/".concat(id));
    }
    async createSupplier(data) {
        return this.post("/", data);
    }
    async updateSupplier(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteSupplier(id) {
        return this.delete("/".concat(id));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/suppliers"));
    }
}
class MaterialAllocationsApiClient extends BaseApiClient {
    async getAllocations(filters) {
        return this.get("/", filters);
    }
    async getAllocation(id) {
        return this.get("/".concat(id));
    }
    async createAllocation(data) {
        return this.post("/", data);
    }
    async updateAllocation(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteAllocation(id) {
        return this.delete("/".concat(id));
    }
    async recordUsage(id, usage) {
        return this.post("/".concat(id, "/usage"), usage);
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/materials/allocations"));
    }
}
class MaterialOrdersApiClient extends BaseApiClient {
    async getOrders(filters) {
        return this.get("/", filters);
    }
    async getOrder(id) {
        return this.get("/".concat(id));
    }
    async createOrder(data) {
        return this.post("/", data);
    }
    async updateOrder(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteOrder(id) {
        return this.delete("/".concat(id));
    }
    async updateOrderStatus(id, status) {
        return this.patch("/".concat(id, "/status"), {
            status
        });
    }
    async addOrderItem(orderId, item) {
        return this.post("/".concat(orderId, "/items"), item);
    }
    async removeOrderItem(orderId, itemId) {
        return this.delete("/".concat(orderId, "/items/").concat(itemId));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/material-orders"));
    }
}
class HousesApiClient extends BaseApiClient {
    async getHouses(filters) {
        return this.get("/", filters);
    }
    async getHouse(id) {
        return this.get("/".concat(id));
    }
    async createHouse(data) {
        return this.post("/", data);
    }
    async updateHouse(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteHouse(id) {
        return this.delete("/".concat(id));
    }
    async scheduleAppointment(data) {
        return this.post("/appointments", data);
    }
    async startConnection(data) {
        const formData = new FormData();
        formData.append("house_id", data.house_id);
        formData.append("worker_id", data.worker_id);
        formData.append("before_photo", data.before_photo);
        formData.append("gps_location", JSON.stringify(data.gps_location));
        if (data.notes) formData.append("notes", data.notes);
        return this.request("/start-connection", {
            method: "POST",
            body: formData,
            headers: {
                ...this.getHeaders()
            }
        });
    }
    async completeConnection(data) {
        const formData = new FormData();
        formData.append("house_id", data.house_id);
        formData.append("connection_type", data.connection_type);
        data.after_photos.forEach((photo, index)=>{
            formData.append("after_photos", photo);
        });
        formData.append("measurements", JSON.stringify(data.measurements));
        formData.append("quality_checks", JSON.stringify(data.quality_checks));
        if (data.customer_signature) formData.append("customer_signature", data.customer_signature);
        if (data.notes) formData.append("notes", data.notes);
        return this.request("/complete-connection", {
            method: "POST",
            body: formData,
            headers: {
                ...this.getHeaders()
            }
        });
    }
    async getProjectHouses(projectId) {
        // Use housing-units API instead of houses/project API
        const response = await fetch("/api/housing-units?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch project houses');
        }
        const data = await response.json();
        return data.items || [];
    }
    async getTeamHouses(teamId) {
        return this.get("/team/".concat(teamId));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/houses"));
    }
}
class AppointmentsApiClient extends BaseApiClient {
    async getAppointments(filters) {
        return this.get("/", filters);
    }
    async getAppointment(id) {
        return this.get("/".concat(id));
    }
    async updateAppointment(id, data) {
        return this.patch("/".concat(id), data);
    }
    async cancelAppointment(id, reason) {
        return this.patch("/".concat(id, "/cancel"), {
            reason
        });
    }
    async rescheduleAppointment(id, newDate) {
        return this.patch("/".concat(id, "/reschedule"), {
            scheduled_date: newDate
        });
    }
    async confirmAppointment(id) {
        return this.patch("/".concat(id, "/confirm"));
    }
    async startAppointment(id) {
        return this.patch("/".concat(id, "/start"));
    }
    async completeAppointment(id, notes) {
        return this.patch("/".concat(id, "/complete"), {
            notes
        });
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/appointments"));
    }
}
class NotificationsApiClient extends BaseApiClient {
    async getNotifications(filters) {
        return this.get("/", filters);
    }
    async getNotification(id) {
        return this.get("/".concat(id));
    }
    async createNotification(data) {
        return this.post("/", data);
    }
    async markAsRead(id) {
        return this.patch("/".concat(id, "/read"));
    }
    async markAllAsRead(userId) {
        return this.patch("/user/".concat(userId, "/read-all"));
    }
    async deleteNotification(id) {
        return this.delete("/".concat(id));
    }
    async getUnreadCount(userId) {
        return this.get("/user/".concat(userId, "/unread-count"));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/notifications"));
    }
}
class NotificationPreferencesApiClient extends BaseApiClient {
    async getPreferences(userId) {
        return this.get("/user/".concat(userId));
    }
    async updatePreferences(userId, data) {
        return this.patch("/user/".concat(userId), data);
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/notification-preferences"));
    }
}
class NotificationTemplatesApiClient extends BaseApiClient {
    async getTemplates() {
        return this.get("/");
    }
    async getTemplate(id) {
        return this.get("/".concat(id));
    }
    async updateTemplate(id, data) {
        return this.patch("/".concat(id), data);
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/notification-templates"));
    }
}
class WebSocketApiClient {
    connect(userId) {
        return new Promise((resolve, reject)=>{
            const wsBaseUrl = ("TURBOPACK compile-time truthy", 1) ? window.location.origin.replace(/^http/, 'ws') : "TURBOPACK unreachable";
            const wsUrl = "".concat(wsBaseUrl, "/ws/").concat(userId);
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = ()=>{
                console.log("WebSocket connected");
                this.reconnectAttempts = 0;
                // Send auth token if available
                if (this.authToken) {
                    this.send("auth", {
                        token: this.authToken
                    });
                }
                resolve();
            };
            this.ws.onmessage = (event)=>{
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error("Failed to parse WebSocket message:", error);
                }
            };
            this.ws.onclose = ()=>{
                console.log("WebSocket disconnected");
                this.reconnect(userId);
            };
            this.ws.onerror = (error)=>{
                console.error("WebSocket error:", error);
                reject(error);
            };
        });
    }
    reconnect(userId) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log("Attempting to reconnect... (".concat(this.reconnectAttempts, "/").concat(this.maxReconnectAttempts, ")"));
            setTimeout(()=>{
                this.connect(userId).catch(console.error);
            }, this.reconnectInterval);
        }
    }
    handleMessage(message) {
        const handlers = this.messageHandlers.get(message.type) || [];
        handlers.forEach((handler)=>handler(message.data));
    }
    send(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type,
                data,
                timestamp: new Date().toISOString()
            };
            this.ws.send(JSON.stringify(message));
        }
    }
    subscribe(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }
    unsubscribe(messageType, handler) {
        const handlers = this.messageHandlers.get(messageType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
        this.messageHandlers.clear();
    }
    setAuthToken(token) {
        this.authToken = token;
    }
    constructor(authToken){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "authToken", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "ws", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "reconnectAttempts", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "maxReconnectAttempts", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "reconnectInterval", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "messageHandlers", void 0);
        this.authToken = authToken;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.messageHandlers = new Map();
    }
}
class DocumentsApiClient extends BaseApiClient {
    async getDocuments(filters) {
        return this.get("/", filters);
    }
    async getDocument(id) {
        return this.get("/".concat(id));
    }
    async uploadDocument(data) {
        const formData = new FormData();
        formData.append("file", data.file);
        if (data.category) formData.append("category", data.category);
        if (data.tags) formData.append("tags", JSON.stringify(data.tags));
        if (data.project_id) formData.append("project_id", data.project_id);
        if (data.house_id) formData.append("house_id", data.house_id);
        if (data.work_entry_id) formData.append("work_entry_id", data.work_entry_id);
        if (data.team_id) formData.append("team_id", data.team_id);
        if (data.access_level) formData.append("access_level", data.access_level);
        if (data.description) formData.append("description", data.description);
        if (data.custom_fields) formData.append("custom_fields", JSON.stringify(data.custom_fields));
        return this.request("/upload", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: this.getHeaders().Authorization
            }
        });
    }
    async updateDocument(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteDocument(id) {
        return this.delete("/".concat(id));
    }
    async downloadDocument(id) {
        const response = await fetch("".concat(this.baseURL, "/").concat(id, "/download"), {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new ApiError(response.status, "Download failed: ".concat(response.statusText));
        }
        return response.blob();
    }
    async getDocumentVersions(id) {
        return this.get("/".concat(id, "/versions"));
    }
    async createNewVersion(id, file, comment) {
        const formData = new FormData();
        formData.append("file", file);
        if (comment) formData.append("comment", comment);
        return this.request("/".concat(id, "/versions"), {
            method: "POST",
            body: formData,
            headers: {
                Authorization: this.getHeaders().Authorization
            }
        });
    }
    async revertToVersion(id, versionId) {
        return this.post("/".concat(id, "/versions/").concat(versionId, "/revert"));
    }
    async searchDocuments(searchRequest) {
        return this.post("/search", searchRequest);
    }
    async classifyDocument(data) {
        return this.post("/classify", data);
    }
    async getOCRResult(id) {
        return this.get("/".concat(id, "/ocr"));
    }
    async triggerOCR(id) {
        return this.post("/".concat(id, "/ocr"));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/documents"));
    }
}
class DocumentCategoriesApiClient extends BaseApiClient {
    async getCategories() {
        return this.get("/");
    }
    async getCategory(code) {
        return this.get("/".concat(code));
    }
    async createCategory(data) {
        return this.post("/", data);
    }
    async updateCategory(code, data) {
        return this.patch("/".concat(code), data);
    }
    async deleteCategory(code) {
        return this.delete("/".concat(code));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/document-categories"));
    }
}
class DocumentAccessApiClient extends BaseApiClient {
    async getDocumentAccess(documentId) {
        return this.get("/document/".concat(documentId));
    }
    async grantAccess(data) {
        return this.post("/grant", data);
    }
    async revokeAccess(accessId) {
        return this.delete("/".concat(accessId));
    }
    async updateAccess(accessId, data) {
        return this.patch("/".concat(accessId), data);
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/document-access"));
    }
}
class DocumentSharesApiClient extends BaseApiClient {
    async createShare(data) {
        return this.post("/", data);
    }
    async getShare(token) {
        return this.get("/token/".concat(token));
    }
    async getDocumentShares(documentId) {
        return this.get("/document/".concat(documentId));
    }
    async updateShare(shareId, data) {
        return this.patch("/".concat(shareId), data);
    }
    async deleteShare(shareId) {
        return this.delete("/".concat(shareId));
    }
    async accessSharedDocument(token, password) {
        return this.post("/access/".concat(token), {
            password
        });
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/document-shares"));
    }
}
class DocumentTemplatesApiClient extends BaseApiClient {
    async getTemplates() {
        return this.get("/");
    }
    async getTemplate(id) {
        return this.get("/".concat(id));
    }
    async createTemplate(data) {
        return this.post("/", data);
    }
    async updateTemplate(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteTemplate(id) {
        return this.delete("/".concat(id));
    }
    async createDocumentFromTemplate(templateId, data) {
        return this.post("/".concat(templateId, "/create-document"), data);
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/document-templates"));
    }
}
class GeospatialApiClient extends BaseApiClient {
    async getFeatures(filters) {
        return this.get("/features", filters);
    }
    async getFeature(id) {
        return this.get("/features/".concat(id));
    }
    async createFeature(data) {
        return this.post("/features", data);
    }
    async updateFeature(id, data) {
        return this.patch("/features/".concat(id), data);
    }
    async deleteFeature(id) {
        return this.delete("/features/".concat(id));
    }
    async searchNearby(searchRequest) {
        return this.post("/features/search/nearby", searchRequest);
    }
    async getProjectBounds(projectId) {
        return this.get("/projects/".concat(projectId, "/bounds"));
    }
    async calculateSegmentLength(segmentId) {
        return this.get("/segments/".concat(segmentId, "/length"));
    }
    async getProjectFeatures(projectId) {
        return this.get("/projects/".concat(projectId, "/features"));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/geospatial"));
    }
}
class GeoRoutesApiClient extends BaseApiClient {
    async getRoutes(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getRoute(id) {
        return this.get("/".concat(id));
    }
    async createRoute(data) {
        return this.post("/", data);
    }
    async updateRoute(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteRoute(id) {
        return this.delete("/".concat(id));
    }
    async optimizeRoute(id, parameters) {
        return this.post("/".concat(id, "/optimize"), parameters || {});
    }
    async calculateRoute(waypoints, routeType) {
        return this.post("/calculate", {
            waypoints,
            route_type: routeType
        });
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/geo-routes"));
    }
}
class GeoLayersApiClient extends BaseApiClient {
    async getLayers(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getLayer(id) {
        return this.get("/".concat(id));
    }
    async createLayer(data) {
        return this.post("/", data);
    }
    async updateLayer(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteLayer(id) {
        return this.delete("/".concat(id));
    }
    async toggleLayerVisibility(id, visible) {
        return this.patch("/".concat(id, "/visibility"), {
            is_visible: visible
        });
    }
    async updateLayerOpacity(id, opacity) {
        return this.patch("/".concat(id, "/opacity"), {
            opacity
        });
    }
    async reorderLayers(layerIds) {
        return this.post("/reorder", {
            layer_ids: layerIds
        });
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/geo-layers"));
    }
}
class GeoMeasurementsApiClient extends BaseApiClient {
    async getMeasurements(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getMeasurement(id) {
        return this.get("/".concat(id));
    }
    async createMeasurement(data) {
        return this.post("/", data);
    }
    async updateMeasurement(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteMeasurement(id) {
        return this.delete("/".concat(id));
    }
    async calculateDistance(coordinates) {
        return this.post("/calculate/distance", {
            coordinates
        });
    }
    async calculateArea(coordinates) {
        return this.post("/calculate/area", {
            coordinates
        });
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/geo-measurements"));
    }
}
class GeoAnnotationsApiClient extends BaseApiClient {
    async getAnnotations(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getAnnotation(id) {
        return this.get("/".concat(id));
    }
    async createAnnotation(data) {
        return this.post("/", data);
    }
    async updateAnnotation(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteAnnotation(id) {
        return this.delete("/".concat(id));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/geo-annotations"));
    }
}
class MapTilesApiClient extends BaseApiClient {
    async getTiles() {
        return this.get("/");
    }
    async getTile(id) {
        return this.get("/".concat(id));
    }
    async createTile(data) {
        return this.post("/", data);
    }
    async updateTile(id, data) {
        return this.patch("/".concat(id), data);
    }
    async deleteTile(id) {
        return this.delete("/".concat(id));
    }
    async setActiveTile(id) {
        return this.post("/".concat(id, "/activate"));
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/map-tiles"));
    }
}
class GeoAnalysisApiClient extends BaseApiClient {
    async getAnalyses(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getAnalysis(id) {
        return this.get("/".concat(id));
    }
    async createAnalysis(data) {
        return this.post("/", data);
    }
    async deleteAnalysis(id) {
        return this.delete("/".concat(id));
    }
    async getAnalysisResult(id) {
        return this.get("/".concat(id, "/result"));
    }
    async runBufferAnalysis(featureIds, bufferDistance, unit) {
        return this.post("/buffer", {
            input_features: featureIds,
            parameters: {
                buffer_distance: bufferDistance,
                unit
            }
        });
    }
    async runIntersectionAnalysis(featureIds) {
        return this.post("/intersection", {
            input_features: featureIds,
            parameters: {}
        });
    }
    async runRouteOptimization(waypointIds, parameters) {
        return this.post("/route-optimization", {
            input_features: waypointIds,
            parameters
        });
    }
    constructor(){
        super("".concat(getApiBaseUrl(), "/api/geo-analysis"));
    }
}
const authApi = new AuthApiClient();
const projectsApi = new ProjectsApiClient();
const workEntriesApi = new WorkEntriesApiClient();
const usersApi = new UsersApiClient();
const teamsApi = new TeamsApiClient();
const materialsApi = new MaterialsApiClient();
const suppliersApi = new SuppliersApiClient();
const materialAllocationsApi = new MaterialAllocationsApiClient();
const materialOrdersApi = new MaterialOrdersApiClient();
const housesApi = new HousesApiClient();
const appointmentsApi = new AppointmentsApiClient();
const notificationsApi = new NotificationsApiClient();
const notificationPreferencesApi = new NotificationPreferencesApiClient();
const notificationTemplatesApi = new NotificationTemplatesApiClient();
const wsApi = new WebSocketApiClient();
const documentsApi = new DocumentsApiClient();
const documentCategoriesApi = new DocumentCategoriesApiClient();
const documentAccessApi = new DocumentAccessApiClient();
const documentSharesApi = new DocumentSharesApiClient();
const documentTemplatesApi = new DocumentTemplatesApiClient();
const geospatialApi = new GeospatialApiClient();
const geoRoutesApi = new GeoRoutesApiClient();
const geoLayersApi = new GeoLayersApiClient();
const geoMeasurementsApi = new GeoMeasurementsApiClient();
const geoAnnotationsApi = new GeoAnnotationsApiClient();
const mapTilesApi = new MapTilesApiClient();
const geoAnalysisApi = new GeoAnalysisApiClient();
function setAuthTokenForAllClients(token) {
    authApi.setAuthToken(token);
    projectsApi.setAuthToken(token);
    workEntriesApi.setAuthToken(token);
    usersApi.setAuthToken(token);
    teamsApi.setAuthToken(token);
    materialsApi.setAuthToken(token);
    suppliersApi.setAuthToken(token);
    materialAllocationsApi.setAuthToken(token);
    materialOrdersApi.setAuthToken(token);
    housesApi.setAuthToken(token);
    appointmentsApi.setAuthToken(token);
    notificationsApi.setAuthToken(token);
    notificationPreferencesApi.setAuthToken(token);
    notificationTemplatesApi.setAuthToken(token);
    wsApi.setAuthToken(token);
    documentsApi.setAuthToken(token);
    documentCategoriesApi.setAuthToken(token);
    documentAccessApi.setAuthToken(token);
    documentSharesApi.setAuthToken(token);
    documentTemplatesApi.setAuthToken(token);
    geospatialApi.setAuthToken(token);
    geoRoutesApi.setAuthToken(token);
    geoLayersApi.setAuthToken(token);
    geoMeasurementsApi.setAuthToken(token);
    geoAnnotationsApi.setAuthToken(token);
    mapTilesApi.setAuthToken(token);
    geoAnalysisApi.setAuthToken(token);
}
function clearAuthTokenForAllClients() {
    authApi.clearAuthToken();
    projectsApi.clearAuthToken();
    workEntriesApi.clearAuthToken();
    usersApi.clearAuthToken();
    teamsApi.clearAuthToken();
    materialsApi.clearAuthToken();
    suppliersApi.clearAuthToken();
    materialAllocationsApi.clearAuthToken();
    materialOrdersApi.clearAuthToken();
    housesApi.clearAuthToken();
    appointmentsApi.clearAuthToken();
    notificationsApi.clearAuthToken();
    notificationPreferencesApi.clearAuthToken();
    notificationTemplatesApi.clearAuthToken();
    documentsApi.clearAuthToken();
    documentCategoriesApi.clearAuthToken();
    documentAccessApi.clearAuthToken();
    documentSharesApi.clearAuthToken();
    documentTemplatesApi.clearAuthToken();
    geospatialApi.clearAuthToken();
    geoRoutesApi.clearAuthToken();
    geoLayersApi.clearAuthToken();
    geoMeasurementsApi.clearAuthToken();
    geoAnnotationsApi.clearAuthToken();
    mapTilesApi.clearAuthToken();
    geoAnalysisApi.clearAuthToken();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authKeys",
    ()=>authKeys,
    "getStoredRefreshToken",
    ()=>getStoredRefreshToken,
    "getStoredToken",
    ()=>getStoredToken,
    "getStoredUser",
    ()=>getStoredUser,
    "initializeAuth",
    ()=>initializeAuth,
    "useAuth",
    ()=>useAuth,
    "useLogin",
    ()=>useLogin,
    "useLogout",
    ()=>useLogout,
    "usePermissions",
    ()=>usePermissions,
    "useRefreshToken",
    ()=>useRefreshToken,
    "useRequireAuth",
    ()=>useRequireAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
;
;
;
const authKeys = {
    all: [
        "auth"
    ],
    user: ()=>[
            ...authKeys.all,
            "user"
        ],
    token: ()=>[
            ...authKeys.all,
            "token"
        ]
};
// Storage utilities
const TOKEN_STORAGE_KEY = "cometa_auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "cometa_refresh_token";
const USER_STORAGE_KEY = "cometa_user";
function getStoredToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}
function getStoredRefreshToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}
function getStoredUser() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}
function storeAuthData(tokenResponse) {
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenResponse.access_token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenResponse.refresh_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        ...tokenResponse.user,
        permissions: tokenResponse.permissions
    }));
    // Set cookie for middleware
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + tokenResponse.expires_in * 1000);
    // Only use secure flag in production
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; secure' : '';
    document.cookie = "cometa_auth_token=".concat(tokenResponse.access_token, "; expires=").concat(expiryDate.toUTCString(), "; path=/; samesite=strict").concat(secureFlag);
    // Set token for API clients
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAuthTokenForAllClients"])(tokenResponse.access_token);
}
function clearAuthData() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Clear cookie
    document.cookie = "cometa_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Clear tokens from API clients
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearAuthTokenForAllClients"])();
}
function initializeAuth() {
    const token = getStoredToken();
    if (token) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAuthTokenForAllClients"])(token);
    }
}
function useAuth() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: authKeys.user(),
        queryFn: {
            "useAuth.useQuery": ()=>{
                const user = getStoredUser();
                if (!user) throw new Error("Not authenticated");
                return user;
            }
        }["useAuth.useQuery"],
        staleTime: Infinity,
        retry: false
    });
}
_s(useAuth, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useLogin() {
    _s1();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useLogin.useMutation": (credentials)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].login(credentials)
        }["useLogin.useMutation"],
        onSuccess: {
            "useLogin.useMutation": (tokenResponse)=>{
                // Store auth data
                storeAuthData(tokenResponse);
                // Update auth query cache
                const authUser = {
                    ...tokenResponse.user,
                    permissions: tokenResponse.permissions
                };
                queryClient.setQueryData(authKeys.user(), authUser);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Welcome back, ".concat(tokenResponse.user.first_name, "!"));
                // Redirect to dashboard after successful login
                if ("TURBOPACK compile-time truthy", 1) {
                    window.location.href = "/dashboard";
                }
            }
        }["useLogin.useMutation"],
        onError: {
            "useLogin.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Login failed: ".concat(error.message));
            }
        }["useLogin.useMutation"]
    });
}
_s1(useLogin, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useLogout() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useLogout.useMutation": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].logout()
        }["useLogout.useMutation"],
        onSuccess: {
            "useLogout.useMutation": ()=>{
                // Clear auth data
                clearAuthData();
                // Clear all auth-related queries
                queryClient.removeQueries({
                    queryKey: authKeys.all
                });
                // Clear all cached data to prevent data leaks
                queryClient.clear();
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Logged out successfully");
            }
        }["useLogout.useMutation"],
        onError: {
            "useLogout.useMutation": (_error)=>{
                // Even if logout fails on server, clear local data
                clearAuthData();
                queryClient.removeQueries({
                    queryKey: authKeys.all
                });
                queryClient.clear();
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Logout failed");
            }
        }["useLogout.useMutation"],
        onSettled: {
            "useLogout.useMutation": ()=>{
                // Redirect to login page
                if ("TURBOPACK compile-time truthy", 1) {
                    window.location.href = "/login";
                }
            }
        }["useLogout.useMutation"]
    });
}
_s2(useLogout, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useRefreshToken() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useRefreshToken.useMutation": ()=>{
                const refreshToken = getStoredRefreshToken();
                if (!refreshToken) throw new Error("No refresh token available");
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].refreshToken(refreshToken);
            }
        }["useRefreshToken.useMutation"],
        onSuccess: {
            "useRefreshToken.useMutation": (tokenResponse)=>{
                storeAuthData(tokenResponse);
                const authUser = {
                    ...tokenResponse.user,
                    permissions: tokenResponse.permissions
                };
                queryClient.setQueryData(authKeys.user(), authUser);
            }
        }["useRefreshToken.useMutation"],
        onError: {
            "useRefreshToken.useMutation": (error)=>{
                // If refresh fails, logout user
                clearAuthData();
                queryClient.removeQueries({
                    queryKey: authKeys.all
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Session expired. Please login again.");
                if ("TURBOPACK compile-time truthy", 1) {
                    window.location.href = "/login";
                }
            }
        }["useRefreshToken.useMutation"]
    });
}
_s3(useRefreshToken, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function usePermissions() {
    _s4();
    const { data: user } = useAuth();
    const hasPermission = (permission)=>{
        var _user_permissions;
        var _user_permissions_includes;
        return (_user_permissions_includes = user === null || user === void 0 ? void 0 : (_user_permissions = user.permissions) === null || _user_permissions === void 0 ? void 0 : _user_permissions.includes(permission)) !== null && _user_permissions_includes !== void 0 ? _user_permissions_includes : false;
    };
    const hasRole = (role)=>{
        return (user === null || user === void 0 ? void 0 : user.role) === role;
    };
    const hasAnyRole = (roles)=>{
        return (user === null || user === void 0 ? void 0 : user.role) ? roles.includes(user.role) : false;
    };
    return {
        user,
        hasPermission,
        hasRole,
        hasAnyRole,
        isAdmin: hasRole("admin"),
        isProjectManager: hasRole("pm"),
        isForeman: hasRole("foreman"),
        isWorker: hasAnyRole([
            "crew",
            "worker"
        ]),
        isViewer: hasRole("viewer"),
        canManageTeams: hasAnyRole([
            "admin",
            "pm",
            "foreman"
        ]),
        canApproveWork: hasAnyRole([
            "admin",
            "pm",
            "foreman"
        ]),
        canManageWork: hasAnyRole([
            "admin",
            "pm",
            "foreman",
            "crew",
            "worker"
        ]),
        canViewFinances: hasAnyRole([
            "admin",
            "pm",
            "foreman"
        ]),
        canManageFinances: hasAnyRole([
            "admin",
            "pm"
        ]),
        canManageInventory: hasAnyRole([
            "admin",
            "pm",
            "foreman"
        ])
    };
}
_s4(usePermissions, "ikHAVKGQcHws73ObagEOZ/UK3wA=", false, function() {
    return [
        useAuth
    ];
});
function useRequireAuth() {
    _s5();
    const { data: user, isLoading, error } = useAuth();
    const isAuthenticated = !!user && !error;
    return {
        user,
        isLoading,
        isAuthenticated,
        error
    };
}
_s5(useRequireAuth, "Q9gEhEBuLvzJx5ngbz3N+cBObe0=", false, function() {
    return [
        useAuth
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/websocket-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebSocketProvider",
    ()=>WebSocketProvider,
    "useWebSocket",
    ()=>useWebSocket,
    "useWebSocketSend",
    ()=>useWebSocketSend
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const WebSocketContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function WebSocketProvider(param) {
    let { children } = param;
    _s();
    const { user, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const isConnectedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const connectionAttempts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const maxConnectionAttempts = 5;
    const handleNotification = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "WebSocketProvider.useCallback[handleNotification]": (notification)=>{
            // Update notification-related queries
            queryClient.invalidateQueries({
                queryKey: [
                    "notifications"
                ]
            });
            if (user === null || user === void 0 ? void 0 : user.id) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "notifications",
                        "unread-count",
                        user.id
                    ]
                });
            }
            // Add notification to cache
            queryClient.setQueryData([
                "notifications",
                "detail",
                notification.id
            ], notification);
            // Show toast for important notifications
            if (notification.priority === "high" || notification.priority === "urgent") {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(notification.title, {
                    description: notification.body,
                    action: notification.priority === "urgent" ? {
                        label: "View",
                        onClick: ({
                            "WebSocketProvider.useCallback[handleNotification]": ()=>{
                                // Could implement navigation to specific pages based on notification data
                                console.log("Navigate to notification:", notification.id);
                            }
                        })["WebSocketProvider.useCallback[handleNotification]"]
                    } : undefined
                });
            }
        }
    }["WebSocketProvider.useCallback[handleNotification]"], [
        queryClient,
        user === null || user === void 0 ? void 0 : user.id
    ]);
    const handleRealtimeUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "WebSocketProvider.useCallback[handleRealtimeUpdate]": (event)=>{
            var _event_data, _event_data1;
            console.log("Realtime update received:", event);
            // Invalidate queries based on entity type
            switch(event.entity_type){
                case "project":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "projects"
                        ]
                    });
                    if (event.entity_id) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "projects",
                                "detail",
                                event.entity_id
                            ]
                        });
                    }
                    break;
                case "work_entry":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "work-entries"
                        ]
                    });
                    if (event.entity_id) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "work-entries",
                                "detail",
                                event.entity_id
                            ]
                        });
                    }
                    break;
                case "material":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "materials"
                        ]
                    });
                    if (event.entity_id) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "materials",
                                "detail",
                                event.entity_id
                            ]
                        });
                    }
                    break;
                case "material_allocation":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "material-allocations"
                        ]
                    });
                    break;
                case "house":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "houses"
                        ]
                    });
                    if (event.entity_id) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "houses",
                                "detail",
                                event.entity_id
                            ]
                        });
                    }
                    break;
                case "appointment":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "appointments"
                        ]
                    });
                    if (event.entity_id) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "appointments",
                                "detail",
                                event.entity_id
                            ]
                        });
                    }
                    break;
                case "crew":
                    queryClient.invalidateQueries({
                        queryKey: [
                            "crews"
                        ]
                    });
                    if (event.entity_id) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "crews",
                                "detail",
                                event.entity_id
                            ]
                        });
                    }
                    break;
                default:
                    // Generic cache invalidation for unknown entity types
                    console.log("Unknown entity type for realtime update:", event.entity_type);
                    break;
            }
            // Show toast for critical status changes
            if (event.type === "status_changed" && ((_event_data = event.data) === null || _event_data === void 0 ? void 0 : _event_data.status)) {
                const entityName = event.entity_type.replace("_", " ");
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("".concat(entityName, " status updated"), {
                    description: "Status changed to: ".concat(event.data.status)
                });
            }
            // Show toast for assignment changes
            if (event.type === "assignment_changed" && (user === null || user === void 0 ? void 0 : user.id) && ((_event_data1 = event.data) === null || _event_data1 === void 0 ? void 0 : _event_data1.assigned_to) === user.id) {
                const entityName = event.entity_type.replace("_", " ");
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("New ".concat(entityName, " assigned"), {
                    description: "You have been assigned to a ".concat(entityName)
                });
            }
        }
    }["WebSocketProvider.useCallback[handleRealtimeUpdate]"], [
        queryClient,
        user === null || user === void 0 ? void 0 : user.id
    ]);
    const handleUserStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "WebSocketProvider.useCallback[handleUserStatus]": (data)=>{
            console.log("User status update:", data);
        // Could implement user presence indicators here
        }
    }["WebSocketProvider.useCallback[handleUserStatus]"], []);
    const handleTypingIndicator = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "WebSocketProvider.useCallback[handleTypingIndicator]": (data)=>{
            console.log("Typing indicator:", data);
        // Could implement typing indicators for chat/comments
        }
    }["WebSocketProvider.useCallback[handleTypingIndicator]"], []);
    const connectWebSocket = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "WebSocketProvider.useCallback[connectWebSocket]": async ()=>{
            if (!(user === null || user === void 0 ? void 0 : user.id) || !token) {
                return;
            }
            try {
                // Set auth token for WebSocket
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].setAuthToken(token);
                // Connect to WebSocket
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].connect(user.id);
                isConnectedRef.current = true;
                connectionAttempts.current = 0;
                console.log("WebSocket connected successfully");
                // Subscribe to all message types
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].subscribe("notification", handleNotification);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].subscribe("realtime_update", handleRealtimeUpdate);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].subscribe("user_status", handleUserStatus);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].subscribe("typing_indicator", handleTypingIndicator);
                // Send initial presence update
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                    status: "online",
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error("WebSocket connection failed:", error);
                isConnectedRef.current = false;
                // Implement exponential backoff for reconnection
                if (connectionAttempts.current < maxConnectionAttempts) {
                    connectionAttempts.current++;
                    const delay = Math.pow(2, connectionAttempts.current) * 1000; // 2s, 4s, 8s, 16s, 32s
                    console.log("Retrying WebSocket connection in ".concat(delay, "ms (attempt ").concat(connectionAttempts.current, "/").concat(maxConnectionAttempts, ")"));
                    setTimeout({
                        "WebSocketProvider.useCallback[connectWebSocket]": ()=>{
                            connectWebSocket();
                        }
                    }["WebSocketProvider.useCallback[connectWebSocket]"], delay);
                } else {
                    console.error("Max WebSocket connection attempts reached");
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to establish real-time connection", {
                        description: "Some features may not work properly. Please refresh the page."
                    });
                }
            }
        }
    }["WebSocketProvider.useCallback[connectWebSocket]"], [
        user === null || user === void 0 ? void 0 : user.id,
        token,
        handleNotification,
        handleRealtimeUpdate,
        handleUserStatus,
        handleTypingIndicator
    ]);
    const disconnectWebSocket = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "WebSocketProvider.useCallback[disconnectWebSocket]": ()=>{
            if (isConnectedRef.current) {
                // Send offline status before disconnecting
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                    status: "offline",
                    timestamp: new Date().toISOString()
                });
                // Unsubscribe from all message types
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("notification", handleNotification);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("realtime_update", handleRealtimeUpdate);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("user_status", handleUserStatus);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("typing_indicator", handleTypingIndicator);
                // Disconnect
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].disconnect();
                isConnectedRef.current = false;
                connectionAttempts.current = 0;
                console.log("WebSocket disconnected");
            }
        }
    }["WebSocketProvider.useCallback[disconnectWebSocket]"], [
        handleNotification,
        handleRealtimeUpdate,
        handleUserStatus,
        handleTypingIndicator
    ]);
    // Connect when user and token are available
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebSocketProvider.useEffect": ()=>{
            if ((user === null || user === void 0 ? void 0 : user.id) && token) {
                connectWebSocket();
            } else {
                disconnectWebSocket();
            }
            // Cleanup on unmount
            return ({
                "WebSocketProvider.useEffect": ()=>{
                    disconnectWebSocket();
                }
            })["WebSocketProvider.useEffect"];
        }
    }["WebSocketProvider.useEffect"], [
        user === null || user === void 0 ? void 0 : user.id,
        token,
        connectWebSocket,
        disconnectWebSocket
    ]);
    // Handle page visibility changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebSocketProvider.useEffect": ()=>{
            const handleVisibilityChange = {
                "WebSocketProvider.useEffect.handleVisibilityChange": ()=>{
                    if (document.hidden) {
                        // Page is hidden, send away status
                        if (isConnectedRef.current) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                                status: "away",
                                timestamp: new Date().toISOString()
                            });
                        }
                    } else {
                        // Page is visible, send online status and reconnect if needed
                        if ((user === null || user === void 0 ? void 0 : user.id) && token) {
                            if (!isConnectedRef.current) {
                                connectWebSocket();
                            } else {
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                                    status: "online",
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    }
                }
            }["WebSocketProvider.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "WebSocketProvider.useEffect": ()=>{
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                }
            })["WebSocketProvider.useEffect"];
        }
    }["WebSocketProvider.useEffect"], [
        user === null || user === void 0 ? void 0 : user.id,
        token,
        connectWebSocket
    ]);
    // Handle beforeunload to send offline status
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebSocketProvider.useEffect": ()=>{
            const handleBeforeUnload = {
                "WebSocketProvider.useEffect.handleBeforeUnload": ()=>{
                    if (isConnectedRef.current) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                            status: "offline",
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }["WebSocketProvider.useEffect.handleBeforeUnload"];
            window.addEventListener("beforeunload", handleBeforeUnload);
            return ({
                "WebSocketProvider.useEffect": ()=>{
                    window.removeEventListener("beforeunload", handleBeforeUnload);
                }
            })["WebSocketProvider.useEffect"];
        }
    }["WebSocketProvider.useEffect"], []);
    const contextValue = {
        isConnected: isConnectedRef.current,
        send: (type, data)=>{
            if (isConnectedRef.current) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].send(type, data);
            } else {
                console.warn("WebSocket not connected, cannot send message:", {
                    type,
                    data
                });
            }
        },
        subscribe: (messageType, handler)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].subscribe(messageType, handler);
        },
        unsubscribe: (messageType, handler)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe(messageType, handler);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WebSocketContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/websocket-provider.tsx",
        lineNumber: 298,
        columnNumber: 5
    }, this);
}
_s(WebSocketProvider, "vCQu6J8Ru+POnhVGCZx6J2yUMtY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"]
    ];
});
_c = WebSocketProvider;
function useWebSocket() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
_s1(useWebSocket, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function useWebSocketSend() {
    _s2();
    const { send, isConnected } = useWebSocket();
    const sendNotification = (notification)=>{
        send("create_notification", notification);
    };
    const sendRealtimeEvent = (event)=>{
        send("realtime_event", event);
    };
    const sendUserStatus = (status)=>{
        send("user_status", {
            status,
            timestamp: new Date().toISOString()
        });
    };
    const sendTypingIndicator = (isTyping, context)=>{
        send("typing_indicator", {
            typing: isTyping,
            context,
            timestamp: new Date().toISOString()
        });
    };
    return {
        sendNotification,
        sendRealtimeEvent,
        sendUserStatus,
        sendTypingIndicator,
        isConnected
    };
}
_s2(useWebSocketSend, "SSFKPJx/hLLHWJCD/Q078TKx2WM=", false, function() {
    return [
        useWebSocket
    ];
});
var _c;
__turbopack_context__.k.register(_c, "WebSocketProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query-devtools/build/modern/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sonner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$websocket$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/websocket-provider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Providers(param) {
    let { children } = param;
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        // OPTIMIZATION: Enhanced cache configuration for better performance
                        staleTime: 5 * 60 * 1000,
                        gcTime: 10 * 60 * 1000,
                        refetchOnWindowFocus: false,
                        refetchOnMount: true,
                        refetchOnReconnect: true,
                        // OPTIMIZATION: Smart retry strategy based on error type
                        retry: {
                            "Providers.useState": (failureCount, error)=>{
                                // Don't retry on 4xx client errors (except 408 timeout)
                                if (error instanceof Error && 'status' in error) {
                                    const status = error.status;
                                    if (status >= 400 && status < 500) {
                                        return status === 408; // Only retry timeouts
                                    }
                                    // Don't retry on 5xx for critical operations (auth, payments)
                                    if (status >= 500 && status < 600) {
                                        return failureCount < 2; // Reduced retries for server errors
                                    }
                                }
                                // Network errors and other issues - retry with exponential backoff
                                return failureCount < 3;
                            }
                        }["Providers.useState"],
                        // OPTIMIZATION: Exponential backoff with jitter
                        retryDelay: {
                            "Providers.useState": (attemptIndex)=>{
                                const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
                                const jitter = Math.random() * 0.1 * baseDelay;
                                return baseDelay + jitter;
                            }
                        }["Providers.useState"],
                        // OPTIMIZATION: Network-aware configurations
                        networkMode: 'online'
                    },
                    mutations: {
                        // OPTIMIZATION: Strategic mutation retry for critical operations
                        retry: {
                            "Providers.useState": (failureCount, error)=>{
                                if (error instanceof Error && 'status' in error) {
                                    const status = error.status;
                                    // Retry mutations only for network/server issues, not client errors
                                    if (status >= 500 && status < 600) {
                                        return failureCount < 2;
                                    }
                                    // Retry timeouts
                                    if (status === 408 || status === 504) {
                                        return failureCount < 3;
                                    }
                                }
                                return false; // Don't retry other mutation failures
                            }
                        }["Providers.useState"],
                        networkMode: 'online'
                    }
                }
            })
    }["Providers.useState"]);
    // OPTIMIZATION: Monitor cache size in development
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Providers.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                const monitorInterval = setInterval({
                    "Providers.useEffect.monitorInterval": ()=>{
                        const cache = queryClient.getQueryCache();
                        const queries = cache.getAll();
                        const cacheSize = queries.length;
                        console.log("[React Query] Cache size: ".concat(cacheSize, " queries"));
                        if (cacheSize > 100) {
                            console.warn("⚠️ [React Query] Cache is growing large (".concat(cacheSize, " queries). ") + "Consider more aggressive GC or refactoring query keys.");
                        }
                        // Log breakdown by query type
                        const queryTypes = queries.reduce({
                            "Providers.useEffect.monitorInterval.queryTypes": (acc, query)=>{
                                const key = query.queryKey[0];
                                acc[key] = (acc[key] || 0) + 1;
                                return acc;
                            }
                        }["Providers.useEffect.monitorInterval.queryTypes"], {});
                        console.log('[React Query] Cache breakdown:', queryTypes);
                    }
                }["Providers.useEffect.monitorInterval"], 60000); // Every minute
                return ({
                    "Providers.useEffect": ()=>clearInterval(monitorInterval)
                })["Providers.useEffect"];
            }
        }
    }["Providers.useEffect"], [
        queryClient
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$websocket$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebSocketProvider"], {
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                    position: "bottom-right",
                    richColors: true
                }, void 0, false, {
                    fileName: "[project]/src/lib/providers.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReactQueryDevtools"], {
                    initialIsOpen: false
                }, void 0, false, {
                    fileName: "[project]/src/lib/providers.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/lib/providers.tsx",
            lineNumber: 109,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/lib/providers.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(Providers, "c94rNS5UkpV4UBEurhV1ADl6gP8=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_932b63ba._.js.map