module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/ui/sonner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
const Toaster = ({ ...props })=>{
    const { theme = "system" } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
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
;
}),
"[project]/src/lib/api-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
// API Configuration
const getApiBaseUrl = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};
class ApiError extends Error {
    status;
    response;
    constructor(status, message, response){
        super(message), this.status = status, this.response = response;
        this.name = "ApiError";
    }
}
// Base API client
class BaseApiClient {
    baseURL;
    authToken;
    constructor(baseURL){
        this.baseURL = baseURL;
    }
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
            headers.Authorization = `Bearer ${this.authToken}`;
        }
        return headers;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
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
            if (!contentType?.includes("application/json")) {
                if (!response.ok) {
                    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            }
            const data = await response.json();
            if (!response.ok) {
                throw new ApiError(response.status, data.message || data.detail || `HTTP ${response.status}`, data);
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
        const url = new URL(`${this.baseURL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value])=>{
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
}
class AuthApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/auth`);
    }
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
}
class ProjectsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/projects`);
    }
    async getProjects(filters) {
        return this.get("/", filters);
    }
    async getProject(id) {
        return this.get(`/${id}`);
    }
    async createProject(data) {
        return this.post("/", data);
    }
    async updateProject(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteProject(id) {
        return this.delete(`/${id}`);
    }
}
class WorkEntriesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/work-entries`);
    }
    async getWorkEntries(filters) {
        return this.get("/", filters);
    }
    async getWorkEntry(id) {
        return this.get(`/${id}`);
    }
    async createWorkEntry(data) {
        return this.post("/", data);
    }
    async updateWorkEntry(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteWorkEntry(id) {
        return this.delete(`/${id}`);
    }
    async approveWorkEntry(id) {
        return this.post(`/${id}/approve`);
    }
}
class UsersApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/users`);
    }
    async getUsers(filters) {
        return this.get("/", filters);
    }
    async getUser(id) {
        return this.get(`/${id}`);
    }
    async createUser(data) {
        return this.post("/", data);
    }
    async updateUser(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteUser(id) {
        return this.delete(`/${id}`);
    }
}
class TeamsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/teams`);
    }
    async getCrews() {
        return this.get("/crews");
    }
    async getCrew(id) {
        return this.get(`/crews/${id}`);
    }
    async createCrew(data) {
        return this.post("/crews", data);
    }
    async updateCrew(id, data) {
        return this.patch(`/crews/${id}`, data);
    }
    async deleteCrew(id) {
        return this.delete(`/crews/${id}`);
    }
}
class MaterialsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/materials`);
    }
    async getMaterials(filters) {
        return this.get("/", filters);
    }
    async getMaterial(id) {
        return this.get(`/${id}`);
    }
    async createMaterial(data) {
        return this.post("/", data);
    }
    async updateMaterial(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteMaterial(id) {
        return this.delete(`/${id}`);
    }
    async getLowStockMaterials() {
        return this.get("/low-stock");
    }
    async adjustStock(id, adjustment) {
        return this.post(`/${id}/adjust-stock`, adjustment);
    }
}
class SuppliersApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/suppliers`);
    }
    async getSuppliers() {
        return this.get("/");
    }
    async getSupplier(id) {
        return this.get(`/${id}`);
    }
    async createSupplier(data) {
        return this.post("/", data);
    }
    async updateSupplier(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteSupplier(id) {
        return this.delete(`/${id}`);
    }
}
class MaterialAllocationsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/materials/allocations`);
    }
    async getAllocations(filters) {
        return this.get("/", filters);
    }
    async getAllocation(id) {
        return this.get(`/${id}`);
    }
    async createAllocation(data) {
        return this.post("/", data);
    }
    async updateAllocation(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteAllocation(id) {
        return this.delete(`/${id}`);
    }
    async recordUsage(id, usage) {
        return this.post(`/${id}/usage`, usage);
    }
}
class MaterialOrdersApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/materials/orders`);
    }
    async getOrders(filters) {
        return this.get("/", filters);
    }
    async getOrder(id) {
        return this.get(`/${id}`);
    }
    async createOrder(data) {
        return this.post("/", data);
    }
    async updateOrder(id, data) {
        return this.put(`/${id}`, data);
    }
    async deleteOrder(id) {
        return this.delete(`/${id}`);
    }
    async updateOrderStatus(id, status) {
        return this.patch(`/${id}/status`, {
            status
        });
    }
    async addOrderItem(orderId, item) {
        return this.post(`/${orderId}/items`, item);
    }
    async removeOrderItem(orderId, itemId) {
        return this.delete(`/${orderId}/items/${itemId}`);
    }
}
class HousesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/houses`);
    }
    async getHouses(filters) {
        return this.get("/", filters);
    }
    async getHouse(id) {
        return this.get(`/${id}`);
    }
    async createHouse(data) {
        return this.post("/", data);
    }
    async updateHouse(id, data) {
        return this.put(`/${id}`, data);
    }
    async deleteHouse(id) {
        return this.delete(`/${id}`);
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
            formData.append(`after_photos`, photo);
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
        // Fetch houses for a specific project
        const response = await this.get("/", {
            project_id: projectId
        });
        return {
            houses: response.items || []
        };
    }
    async getTeamHouses(teamId) {
        return this.get(`/team/${teamId}`);
    }
    // Document methods
    async getHouseDocuments(houseId) {
        return this.get(`/${houseId}/documents`);
    }
    async uploadHouseDocument(houseId, file, documentType = 'connection_plan', description, uploadedBy) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);
        if (description) formData.append('description', description);
        if (uploadedBy) formData.append('uploaded_by', uploadedBy);
        // Don't set Content-Type header for FormData - browser will set it automatically with boundary
        return this.request(`/${houseId}/documents`, {
            method: 'POST',
            body: formData
        });
    }
    async getHouseDocument(houseId, documentId) {
        return this.get(`/${houseId}/documents/${documentId}`);
    }
    async deleteHouseDocument(houseId, documentId) {
        return this.delete(`/${houseId}/documents/${documentId}`);
    }
}
class AppointmentsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/appointments`);
    }
    async getAppointments(filters) {
        return this.get("/", filters);
    }
    async getAppointment(id) {
        return this.get(`/${id}`);
    }
    async updateAppointment(id, data) {
        return this.patch(`/${id}`, data);
    }
    async cancelAppointment(id, reason) {
        return this.patch(`/${id}/cancel`, {
            reason
        });
    }
    async rescheduleAppointment(id, newDate) {
        return this.patch(`/${id}/reschedule`, {
            scheduled_date: newDate
        });
    }
    async confirmAppointment(id) {
        return this.patch(`/${id}/confirm`);
    }
    async startAppointment(id) {
        return this.patch(`/${id}/start`);
    }
    async completeAppointment(id, notes) {
        return this.patch(`/${id}/complete`, {
            notes
        });
    }
}
class NotificationsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/notifications`);
    }
    async getNotifications(filters) {
        return this.get("/", filters);
    }
    async getNotification(id) {
        return this.get(`/${id}`);
    }
    async createNotification(data) {
        return this.post("/", data);
    }
    async markAsRead(id) {
        return this.patch(`/${id}/read`);
    }
    async markAllAsRead(userId) {
        return this.patch(`/user/${userId}/read-all`);
    }
    async deleteNotification(id) {
        return this.delete(`/${id}`);
    }
    async getUnreadCount(userId) {
        return this.get(`/user/${userId}/unread-count`);
    }
}
class NotificationPreferencesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/notification-preferences`);
    }
    async getPreferences(userId) {
        return this.get(`/user/${userId}`);
    }
    async updatePreferences(userId, data) {
        return this.patch(`/user/${userId}`, data);
    }
}
class NotificationTemplatesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/notification-templates`);
    }
    async getTemplates() {
        return this.get("/");
    }
    async getTemplate(id) {
        return this.get(`/${id}`);
    }
    async updateTemplate(id, data) {
        return this.patch(`/${id}`, data);
    }
}
class WebSocketApiClient {
    authToken;
    ws;
    reconnectAttempts;
    maxReconnectAttempts;
    reconnectInterval;
    messageHandlers;
    constructor(authToken){
        this.authToken = authToken;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.messageHandlers = new Map();
    }
    connect(userId) {
        return new Promise((resolve, reject)=>{
            const wsBaseUrl = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
            const wsUrl = `${wsBaseUrl}/ws/${userId}`;
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
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
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
}
class DocumentsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/documents`);
    }
    async getDocuments(filters) {
        return this.get("/", filters);
    }
    async getDocument(id) {
        return this.get(`/${id}`);
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
        return this.patch(`/${id}`, data);
    }
    async deleteDocument(id) {
        return this.delete(`/${id}`);
    }
    async downloadDocument(id) {
        const response = await fetch(`${this.baseURL}/${id}/download`, {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new ApiError(response.status, `Download failed: ${response.statusText}`);
        }
        return response.blob();
    }
    async getDocumentVersions(id) {
        return this.get(`/${id}/versions`);
    }
    async createNewVersion(id, file, comment) {
        const formData = new FormData();
        formData.append("file", file);
        if (comment) formData.append("comment", comment);
        return this.request(`/${id}/versions`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: this.getHeaders().Authorization
            }
        });
    }
    async revertToVersion(id, versionId) {
        return this.post(`/${id}/versions/${versionId}/revert`);
    }
    async searchDocuments(searchRequest) {
        return this.post("/search", searchRequest);
    }
    async classifyDocument(data) {
        return this.post("/classify", data);
    }
    async getOCRResult(id) {
        return this.get(`/${id}/ocr`);
    }
    async triggerOCR(id) {
        return this.post(`/${id}/ocr`);
    }
}
class DocumentCategoriesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/document-categories`);
    }
    async getCategories() {
        return this.get("/");
    }
    async getCategory(code) {
        return this.get(`/${code}`);
    }
    async createCategory(data) {
        return this.post("/", data);
    }
    async updateCategory(code, data) {
        return this.patch(`/${code}`, data);
    }
    async deleteCategory(code) {
        return this.delete(`/${code}`);
    }
}
class DocumentAccessApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/document-access`);
    }
    async getDocumentAccess(documentId) {
        return this.get(`/document/${documentId}`);
    }
    async grantAccess(data) {
        return this.post("/grant", data);
    }
    async revokeAccess(accessId) {
        return this.delete(`/${accessId}`);
    }
    async updateAccess(accessId, data) {
        return this.patch(`/${accessId}`, data);
    }
}
class DocumentSharesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/document-shares`);
    }
    async createShare(data) {
        return this.post("/", data);
    }
    async getShare(token) {
        return this.get(`/token/${token}`);
    }
    async getDocumentShares(documentId) {
        return this.get(`/document/${documentId}`);
    }
    async updateShare(shareId, data) {
        return this.patch(`/${shareId}`, data);
    }
    async deleteShare(shareId) {
        return this.delete(`/${shareId}`);
    }
    async accessSharedDocument(token, password) {
        return this.post(`/access/${token}`, {
            password
        });
    }
}
class DocumentTemplatesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/document-templates`);
    }
    async getTemplates() {
        return this.get("/");
    }
    async getTemplate(id) {
        return this.get(`/${id}`);
    }
    async createTemplate(data) {
        return this.post("/", data);
    }
    async updateTemplate(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteTemplate(id) {
        return this.delete(`/${id}`);
    }
    async createDocumentFromTemplate(templateId, data) {
        return this.post(`/${templateId}/create-document`, data);
    }
}
class GeospatialApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/geospatial`);
    }
    async getFeatures(filters) {
        return this.get("/features", filters);
    }
    async getFeature(id) {
        return this.get(`/features/${id}`);
    }
    async createFeature(data) {
        return this.post("/features", data);
    }
    async updateFeature(id, data) {
        return this.patch(`/features/${id}`, data);
    }
    async deleteFeature(id) {
        return this.delete(`/features/${id}`);
    }
    async searchNearby(searchRequest) {
        return this.post("/features/search/nearby", searchRequest);
    }
    async getProjectBounds(projectId) {
        return this.get(`/projects/${projectId}/bounds`);
    }
    async calculateSegmentLength(segmentId) {
        return this.get(`/segments/${segmentId}/length`);
    }
    async getProjectFeatures(projectId) {
        return this.get(`/projects/${projectId}/features`);
    }
}
class GeoRoutesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/geo-routes`);
    }
    async getRoutes(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getRoute(id) {
        return this.get(`/${id}`);
    }
    async createRoute(data) {
        return this.post("/", data);
    }
    async updateRoute(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteRoute(id) {
        return this.delete(`/${id}`);
    }
    async optimizeRoute(id, parameters) {
        return this.post(`/${id}/optimize`, parameters || {});
    }
    async calculateRoute(waypoints, routeType) {
        return this.post("/calculate", {
            waypoints,
            route_type: routeType
        });
    }
}
class GeoLayersApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/geo-layers`);
    }
    async getLayers(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getLayer(id) {
        return this.get(`/${id}`);
    }
    async createLayer(data) {
        return this.post("/", data);
    }
    async updateLayer(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteLayer(id) {
        return this.delete(`/${id}`);
    }
    async toggleLayerVisibility(id, visible) {
        return this.patch(`/${id}/visibility`, {
            is_visible: visible
        });
    }
    async updateLayerOpacity(id, opacity) {
        return this.patch(`/${id}/opacity`, {
            opacity
        });
    }
    async reorderLayers(layerIds) {
        return this.post("/reorder", {
            layer_ids: layerIds
        });
    }
}
class GeoMeasurementsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/geo-measurements`);
    }
    async getMeasurements(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getMeasurement(id) {
        return this.get(`/${id}`);
    }
    async createMeasurement(data) {
        return this.post("/", data);
    }
    async updateMeasurement(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteMeasurement(id) {
        return this.delete(`/${id}`);
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
}
class GeoAnnotationsApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/geo-annotations`);
    }
    async getAnnotations(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getAnnotation(id) {
        return this.get(`/${id}`);
    }
    async createAnnotation(data) {
        return this.post("/", data);
    }
    async updateAnnotation(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteAnnotation(id) {
        return this.delete(`/${id}`);
    }
}
class MapTilesApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/map-tiles`);
    }
    async getTiles() {
        return this.get("/");
    }
    async getTile(id) {
        return this.get(`/${id}`);
    }
    async createTile(data) {
        return this.post("/", data);
    }
    async updateTile(id, data) {
        return this.patch(`/${id}`, data);
    }
    async deleteTile(id) {
        return this.delete(`/${id}`);
    }
    async setActiveTile(id) {
        return this.post(`/${id}/activate`);
    }
}
class GeoAnalysisApiClient extends BaseApiClient {
    constructor(){
        super(`${getApiBaseUrl()}/api/geo-analysis`);
    }
    async getAnalyses(projectId) {
        return this.get("/", projectId ? {
            project_id: projectId
        } : undefined);
    }
    async getAnalysis(id) {
        return this.get(`/${id}`);
    }
    async createAnalysis(data) {
        return this.post("/", data);
    }
    async deleteAnalysis(id) {
        return this.delete(`/${id}`);
    }
    async getAnalysisResult(id) {
        return this.get(`/${id}/result`);
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
}),
"[project]/src/hooks/use-auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
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
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function getStoredRefreshToken() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function getStoredUser() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
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
    document.cookie = `cometa_auth_token=${tokenResponse.access_token}; expires=${expiryDate.toUTCString()}; path=/; samesite=strict${secureFlag}`;
    // Set token for API clients
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAuthTokenForAllClients"])(tokenResponse.access_token);
}
function clearAuthData() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Clear cookie
    document.cookie = "cometa_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Clear tokens from API clients
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearAuthTokenForAllClients"])();
}
function initializeAuth() {
    const token = getStoredToken();
    if (token) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAuthTokenForAllClients"])(token);
    }
}
function useAuth() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: authKeys.user(),
        queryFn: ()=>{
            const user = getStoredUser();
            if (!user) throw new Error("Not authenticated");
            return user;
        },
        staleTime: Infinity,
        retry: false
    });
}
function useLogin() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (credentials)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authApi"].login(credentials),
        onSuccess: (tokenResponse)=>{
            // Store auth data
            storeAuthData(tokenResponse);
            // Update auth query cache
            const authUser = {
                ...tokenResponse.user,
                permissions: tokenResponse.permissions
            };
            queryClient.setQueryData(authKeys.user(), authUser);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(`Welcome back, ${tokenResponse.user.first_name}!`);
            // Redirect to dashboard after successful login
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Login failed: ${error.message}`);
        }
    });
}
function useLogout() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authApi"].logout(),
        onSuccess: ()=>{
            // Clear auth data
            clearAuthData();
            // Clear all auth-related queries
            queryClient.removeQueries({
                queryKey: authKeys.all
            });
            // Clear all cached data to prevent data leaks
            queryClient.clear();
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Logged out successfully");
        },
        onError: (_error)=>{
            // Even if logout fails on server, clear local data
            clearAuthData();
            queryClient.removeQueries({
                queryKey: authKeys.all
            });
            queryClient.clear();
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Logout failed");
        },
        onSettled: ()=>{
            // Redirect to login page
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
    });
}
function useRefreshToken() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ()=>{
            const refreshToken = getStoredRefreshToken();
            if (!refreshToken) throw new Error("No refresh token available");
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authApi"].refreshToken(refreshToken);
        },
        onSuccess: (tokenResponse)=>{
            storeAuthData(tokenResponse);
            const authUser = {
                ...tokenResponse.user,
                permissions: tokenResponse.permissions
            };
            queryClient.setQueryData(authKeys.user(), authUser);
        },
        onError: (error)=>{
            // If refresh fails, logout user
            clearAuthData();
            queryClient.removeQueries({
                queryKey: authKeys.all
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Session expired. Please login again.");
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
    });
}
function usePermissions() {
    const { data: user } = useAuth();
    const hasPermission = (permission)=>{
        return user?.permissions?.includes(permission) ?? false;
    };
    const hasRole = (role)=>{
        return user?.role === role;
    };
    const hasAnyRole = (roles)=>{
        return user?.role ? roles.includes(user.role) : false;
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
function useRequireAuth() {
    const { data: user, isLoading, error } = useAuth();
    const isAuthenticated = !!user && !error;
    return {
        user,
        isLoading,
        isAuthenticated,
        error
    };
}
}),
"[project]/src/lib/websocket-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebSocketProvider",
    ()=>WebSocketProvider,
    "useWebSocket",
    ()=>useWebSocket,
    "useWebSocketSend",
    ()=>useWebSocketSend
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const WebSocketContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function WebSocketProvider({ children }) {
    const { user, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const isConnectedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const connectionAttempts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const maxConnectionAttempts = 5;
    const handleNotification = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback((notification)=>{
        // Update notification-related queries
        queryClient.invalidateQueries({
            queryKey: [
                "notifications"
            ]
        });
        if (user?.id) {
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(notification.title, {
                description: notification.body,
                action: notification.priority === "urgent" ? {
                    label: "View",
                    onClick: ()=>{
                        // Could implement navigation to specific pages based on notification data
                        console.log("Navigate to notification:", notification.id);
                    }
                } : undefined
            });
        }
    }, [
        queryClient,
        user?.id
    ]);
    const handleRealtimeUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback((event)=>{
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
        if (event.type === "status_changed" && event.data?.status) {
            const entityName = event.entity_type.replace("_", " ");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(`${entityName} status updated`, {
                description: `Status changed to: ${event.data.status}`
            });
        }
        // Show toast for assignment changes
        if (event.type === "assignment_changed" && user?.id && event.data?.assigned_to === user.id) {
            const entityName = event.entity_type.replace("_", " ");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(`New ${entityName} assigned`, {
                description: `You have been assigned to a ${entityName}`
            });
        }
    }, [
        queryClient,
        user?.id
    ]);
    const handleUserStatus = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback((data)=>{
        console.log("User status update:", data);
    // Could implement user presence indicators here
    }, []);
    const handleTypingIndicator = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback((data)=>{
        console.log("Typing indicator:", data);
    // Could implement typing indicators for chat/comments
    }, []);
    const connectWebSocket = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback(async ()=>{
        if (!user?.id || !token) {
            return;
        }
        try {
            // Set auth token for WebSocket
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].setAuthToken(token);
            // Connect to WebSocket
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].connect(user.id);
            isConnectedRef.current = true;
            connectionAttempts.current = 0;
            console.log("WebSocket connected successfully");
            // Subscribe to all message types
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].subscribe("notification", handleNotification);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].subscribe("realtime_update", handleRealtimeUpdate);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].subscribe("user_status", handleUserStatus);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].subscribe("typing_indicator", handleTypingIndicator);
            // Send initial presence update
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
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
                console.log(`Retrying WebSocket connection in ${delay}ms (attempt ${connectionAttempts.current}/${maxConnectionAttempts})`);
                setTimeout(()=>{
                    connectWebSocket();
                }, delay);
            } else {
                console.error("Max WebSocket connection attempts reached");
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Failed to establish real-time connection", {
                    description: "Some features may not work properly. Please refresh the page."
                });
            }
        }
    }, [
        user?.id,
        token,
        handleNotification,
        handleRealtimeUpdate,
        handleUserStatus,
        handleTypingIndicator
    ]);
    const disconnectWebSocket = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback(()=>{
        if (isConnectedRef.current) {
            // Send offline status before disconnecting
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                status: "offline",
                timestamp: new Date().toISOString()
            });
            // Unsubscribe from all message types
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("notification", handleNotification);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("realtime_update", handleRealtimeUpdate);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("user_status", handleUserStatus);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe("typing_indicator", handleTypingIndicator);
            // Disconnect
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].disconnect();
            isConnectedRef.current = false;
            connectionAttempts.current = 0;
            console.log("WebSocket disconnected");
        }
    }, [
        handleNotification,
        handleRealtimeUpdate,
        handleUserStatus,
        handleTypingIndicator
    ]);
    // Connect when user and token are available
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (user?.id && token) {
            connectWebSocket();
        } else {
            disconnectWebSocket();
        }
        // Cleanup on unmount
        return ()=>{
            disconnectWebSocket();
        };
    }, [
        user?.id,
        token,
        connectWebSocket,
        disconnectWebSocket
    ]);
    // Handle page visibility changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleVisibilityChange = ()=>{
            if (document.hidden) {
                // Page is hidden, send away status
                if (isConnectedRef.current) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                        status: "away",
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                // Page is visible, send online status and reconnect if needed
                if (user?.id && token) {
                    if (!isConnectedRef.current) {
                        connectWebSocket();
                    } else {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                            status: "online",
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return ()=>{
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [
        user?.id,
        token,
        connectWebSocket
    ]);
    // Handle beforeunload to send offline status
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleBeforeUnload = ()=>{
            if (isConnectedRef.current) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].send("user_status", {
                    status: "offline",
                    timestamp: new Date().toISOString()
                });
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return ()=>{
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    const contextValue = {
        isConnected: isConnectedRef.current,
        send: (type, data)=>{
            if (isConnectedRef.current) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].send(type, data);
            } else {
                console.warn("WebSocket not connected, cannot send message:", {
                    type,
                    data
                });
            }
        },
        subscribe: (messageType, handler)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].subscribe(messageType, handler);
        },
        unsubscribe: (messageType, handler)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wsApi"].unsubscribe(messageType, handler);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WebSocketContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/websocket-provider.tsx",
        lineNumber: 298,
        columnNumber: 5
    }, this);
}
function useWebSocket() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
function useWebSocketSend() {
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
}),
"[project]/src/lib/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query-devtools/build/modern/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sonner.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$websocket$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/websocket-provider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function Providers({ children }) {
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    // OPTIMIZATION: Enhanced cache configuration for better performance
                    staleTime: 5 * 60 * 1000,
                    gcTime: 10 * 60 * 1000,
                    refetchOnWindowFocus: false,
                    refetchOnMount: true,
                    refetchOnReconnect: true,
                    // OPTIMIZATION: Smart retry strategy based on error type
                    retry: (failureCount, error)=>{
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
                    },
                    // OPTIMIZATION: Exponential backoff with jitter
                    retryDelay: (attemptIndex)=>{
                        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
                        const jitter = Math.random() * 0.1 * baseDelay;
                        return baseDelay + jitter;
                    },
                    // OPTIMIZATION: Network-aware configurations
                    networkMode: 'online'
                },
                mutations: {
                    // OPTIMIZATION: Strategic mutation retry for critical operations
                    retry: (failureCount, error)=>{
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
                    },
                    networkMode: 'online'
                }
            }
        }));
    // OPTIMIZATION: Monitor cache size in development
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            const monitorInterval = setInterval(()=>{
                const cache = queryClient.getQueryCache();
                const queries = cache.getAll();
                const cacheSize = queries.length;
                console.log(`[React Query] Cache size: ${cacheSize} queries`);
                if (cacheSize > 100) {
                    console.warn(`⚠️ [React Query] Cache is growing large (${cacheSize} queries). ` + `Consider more aggressive GC or refactoring query keys.`);
                }
                // Log breakdown by query type
                const queryTypes = queries.reduce((acc, query)=>{
                    const key = query.queryKey[0];
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                console.log('[React Query] Cache breakdown:', queryTypes);
            }, 60000); // Every minute
            return ()=>clearInterval(monitorInterval);
        }
    }, [
        queryClient
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$websocket$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WebSocketProvider"], {
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
                    position: "bottom-right",
                    richColors: true
                }, void 0, false, {
                    fileName: "[project]/src/lib/providers.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReactQueryDevtools"], {
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
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0b9c0d58._.js.map