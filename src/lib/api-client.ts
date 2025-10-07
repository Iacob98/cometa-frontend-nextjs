import type {
  ApiResponse,
  PaginatedResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  WorkEntry,
  CreateWorkEntryRequest,
  WorkEntryFilters,
  User,
  Crew,
  LoginRequest,
  TokenResponse,
  Material,
  MaterialFilters,
  Supplier,
  MaterialAllocation,
  AllocationFilters,
  AllocationRequest,
  MaterialOrder,
  MaterialOrderStatus,
  MaterialOrderItem,
  OrderFilters,
  House,
  HouseFilters,
  CreateHouseRequest,
  UpdateHouseRequest,
  ScheduleAppointmentRequest,
  StartConnectionRequest,
  CompleteConnectionRequest,
  HouseAppointment,
  AppointmentFilters,
  Notification,
  NotificationFilters,
  CreateNotificationRequest,
  UpdateNotificationPreferencesRequest,
  NotificationPreferences,
  NotificationTemplate,
  WebSocketMessage,
  RealtimeEvent,
  Document,
  DocumentFilters,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentVersion,
  DocumentAccess,
  DocumentShare,
  DocumentTemplate,
  DocumentSearchRequest,
  DocumentSearchResult,
  DocumentClassificationRequest,
  DocumentClassificationResult,
  DocumentCategory,
  DocumentCategoryCode,
  GeospatialFeature,
  GeospatialFilters,
  CreateGeospatialFeatureRequest,
  UpdateGeospatialFeatureRequest,
  GeospatialSearchRequest,
  GeoRoute,
  CreateGeoRouteRequest,
  GeoLayer,
  CreateGeoLayerRequest,
  GeoMeasurement,
  CreateGeoMeasurementRequest,
  GeoAnnotation,
  CreateGeoAnnotationRequest,
  MapTile,
  GeoAnalysis,
  CreateGeoAnalysisRequest,
  GeoBounds,
  GeoPoint,
} from "@/types";

// API Configuration
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Base API client
class BaseApiClient {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = undefined;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new ApiError(
            response.status,
            `HTTP ${response.status}: ${response.statusText}`
          );
        }
        return response.text() as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || data.detail || `HTTP ${response.status}`,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        0,
        error instanceof Error ? error.message : "Network error"
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.toString().replace(this.baseURL, ""));
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Service clients
export class AuthApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/auth`);
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return this.post<TokenResponse>("/login", credentials);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return this.post<TokenResponse>("/refresh", { refresh_token: refreshToken });
  }

  async logout(): Promise<void> {
    return this.post<void>("/logout");
  }

  async me(): Promise<User> {
    return this.get<User>("/me");
  }
}

export class ProjectsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/projects`);
  }

  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    return this.get<PaginatedResponse<Project>>("/", filters);
  }

  async getProject(id: string): Promise<Project> {
    return this.get<Project>(`/${id}`);
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return this.post<Project>("/", data);
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return this.patch<Project>(`/${id}`, data);
  }

  async deleteProject(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}


export class WorkEntriesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/work-entries`);
  }

  async getWorkEntries(filters?: WorkEntryFilters): Promise<PaginatedResponse<WorkEntry>> {
    return this.get<PaginatedResponse<WorkEntry>>("/", filters);
  }

  async getWorkEntry(id: string): Promise<WorkEntry> {
    return this.get<WorkEntry>(`/${id}`);
  }

  async createWorkEntry(data: CreateWorkEntryRequest): Promise<WorkEntry> {
    return this.post<WorkEntry>("/", data);
  }

  async updateWorkEntry(id: string, data: Partial<CreateWorkEntryRequest>): Promise<WorkEntry> {
    return this.patch<WorkEntry>(`/${id}`, data);
  }

  async deleteWorkEntry(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async approveWorkEntry(id: string): Promise<WorkEntry> {
    return this.post<WorkEntry>(`/${id}/approve`);
  }
}

export class UsersApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/users`);
  }

  async getUsers(filters?: { role?: string; is_active?: string; page?: number; per_page?: number }): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>("/", filters);
  }

  async getUser(id: string): Promise<User> {
    return this.get<User>(`/${id}`);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.post<User>("/", data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.patch<User>(`/${id}`, data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}

export class TeamsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/teams`);
  }

  async getCrews(): Promise<Crew[]> {
    return this.get<Crew[]>("/crews");
  }

  async getCrew(id: string): Promise<Crew> {
    return this.get<Crew>(`/crews/${id}`);
  }

  async createCrew(data: Partial<Crew>): Promise<Crew> {
    return this.post<Crew>("/crews", data);
  }

  async updateCrew(id: string, data: Partial<Crew>): Promise<Crew> {
    return this.patch<Crew>(`/crews/${id}`, data);
  }

  async deleteCrew(id: string): Promise<void> {
    return this.delete<void>(`/crews/${id}`);
  }
}

export class MaterialsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/materials`);
  }

  async getMaterials(filters?: MaterialFilters): Promise<PaginatedResponse<Material>> {
    return this.get<PaginatedResponse<Material>>("/", filters);
  }

  async getMaterial(id: string): Promise<Material> {
    return this.get<Material>(`/${id}`);
  }

  async createMaterial(data: Partial<Material>): Promise<Material> {
    return this.post<Material>("/", data);
  }

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    return this.patch<Material>(`/${id}`, data);
  }

  async deleteMaterial(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async getLowStockMaterials(): Promise<Material[]> {
    return this.get<Material[]>("/low-stock");
  }

  async adjustStock(id: string, adjustment: { quantity: number; reason: string }): Promise<Material> {
    return this.post<Material>(`/${id}/adjust-stock`, adjustment);
  }
}

export class SuppliersApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/suppliers`);
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.get<Supplier[]>("/");
  }

  async getSupplier(id: string): Promise<Supplier> {
    return this.get<Supplier>(`/${id}`);
  }

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    return this.post<Supplier>("/", data);
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return this.patch<Supplier>(`/${id}`, data);
  }

  async deleteSupplier(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}

export class MaterialAllocationsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/materials/allocations`);
  }

  async getAllocations(filters?: AllocationFilters): Promise<PaginatedResponse<MaterialAllocation>> {
    return this.get<PaginatedResponse<MaterialAllocation>>("/", filters);
  }

  async getAllocation(id: string): Promise<MaterialAllocation> {
    return this.get<MaterialAllocation>(`/${id}`);
  }

  async createAllocation(data: AllocationRequest): Promise<MaterialAllocation> {
    return this.post<MaterialAllocation>("/", data);
  }

  async updateAllocation(id: string, data: Partial<MaterialAllocation>): Promise<MaterialAllocation> {
    return this.patch<MaterialAllocation>(`/${id}`, data);
  }

  async deleteAllocation(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async recordUsage(id: string, usage: { used_qty: number; notes?: string }): Promise<MaterialAllocation> {
    return this.post<MaterialAllocation>(`/${id}/usage`, usage);
  }
}

export class MaterialOrdersApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/material-orders`);
  }

  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<MaterialOrder>> {
    return this.get<PaginatedResponse<MaterialOrder>>("/", filters);
  }

  async getOrder(id: string): Promise<MaterialOrder> {
    return this.get<MaterialOrder>(`/${id}`);
  }

  async createOrder(data: Partial<MaterialOrder>): Promise<MaterialOrder> {
    return this.post<MaterialOrder>("/", data);
  }

  async updateOrder(id: string, data: Partial<MaterialOrder>): Promise<MaterialOrder> {
    return this.patch<MaterialOrder>(`/${id}`, data);
  }

  async deleteOrder(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async updateOrderStatus(id: string, status: MaterialOrderStatus): Promise<MaterialOrder> {
    return this.patch<MaterialOrder>(`/${id}/status`, { status });
  }

  async addOrderItem(orderId: string, item: Partial<MaterialOrderItem>): Promise<MaterialOrderItem> {
    return this.post<MaterialOrderItem>(`/${orderId}/items`, item);
  }

  async removeOrderItem(orderId: string, itemId: string): Promise<void> {
    return this.delete<void>(`/${orderId}/items/${itemId}`);
  }
}

export class HousesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/houses`);
  }

  async getHouses(filters?: HouseFilters): Promise<PaginatedResponse<House>> {
    return this.get<PaginatedResponse<House>>("/", filters);
  }

  async getHouse(id: string): Promise<House> {
    return this.get<House>(`/${id}`);
  }

  async createHouse(data: CreateHouseRequest): Promise<House> {
    return this.post<House>("/", data);
  }

  async updateHouse(id: string, data: UpdateHouseRequest): Promise<House> {
    return this.patch<House>(`/${id}`, data);
  }

  async deleteHouse(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async scheduleAppointment(data: ScheduleAppointmentRequest): Promise<HouseAppointment> {
    return this.post<HouseAppointment>("/appointments", data);
  }

  async startConnection(data: StartConnectionRequest): Promise<House> {
    const formData = new FormData();
    formData.append("house_id", data.house_id);
    formData.append("worker_id", data.worker_id);
    formData.append("before_photo", data.before_photo);
    formData.append("gps_location", JSON.stringify(data.gps_location));
    if (data.notes) formData.append("notes", data.notes);

    return this.request<House>("/start-connection", {
      method: "POST",
      body: formData,
      headers: {
        ...this.getHeaders(),
      },
    });
  }

  async completeConnection(data: CompleteConnectionRequest): Promise<House> {
    const formData = new FormData();
    formData.append("house_id", data.house_id);
    formData.append("connection_type", data.connection_type);
    data.after_photos.forEach((photo, index) => {
      formData.append(`after_photos`, photo);
    });
    formData.append("measurements", JSON.stringify(data.measurements));
    formData.append("quality_checks", JSON.stringify(data.quality_checks));
    if (data.customer_signature) formData.append("customer_signature", data.customer_signature);
    if (data.notes) formData.append("notes", data.notes);

    return this.request<House>("/complete-connection", {
      method: "POST",
      body: formData,
      headers: {
        ...this.getHeaders(),
      },
    });
  }

  async getProjectHouses(projectId: string): Promise<House[]> {
    // Use housing-units API instead of houses/project API
    const response = await fetch(`/api/housing-units?project_id=${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project houses');
    }
    const data = await response.json();
    return data.items || [];
  }

  async getTeamHouses(teamId: string): Promise<House[]> {
    return this.get<House[]>(`/team/${teamId}`);
  }
}

export class AppointmentsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/appointments`);
  }

  async getAppointments(filters?: AppointmentFilters): Promise<PaginatedResponse<HouseAppointment>> {
    return this.get<PaginatedResponse<HouseAppointment>>("/", filters);
  }

  async getAppointment(id: string): Promise<HouseAppointment> {
    return this.get<HouseAppointment>(`/${id}`);
  }

  async updateAppointment(id: string, data: Partial<HouseAppointment>): Promise<HouseAppointment> {
    return this.patch<HouseAppointment>(`/${id}`, data);
  }

  async cancelAppointment(id: string, reason: string): Promise<HouseAppointment> {
    return this.patch<HouseAppointment>(`/${id}/cancel`, { reason });
  }

  async rescheduleAppointment(id: string, newDate: string): Promise<HouseAppointment> {
    return this.patch<HouseAppointment>(`/${id}/reschedule`, { scheduled_date: newDate });
  }

  async confirmAppointment(id: string): Promise<HouseAppointment> {
    return this.patch<HouseAppointment>(`/${id}/confirm`);
  }

  async startAppointment(id: string): Promise<HouseAppointment> {
    return this.patch<HouseAppointment>(`/${id}/start`);
  }

  async completeAppointment(id: string, notes?: string): Promise<HouseAppointment> {
    return this.patch<HouseAppointment>(`/${id}/complete`, { notes });
  }
}

export class NotificationsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/notifications`);
  }

  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    return this.get<PaginatedResponse<Notification>>("/", filters);
  }

  async getNotification(id: string): Promise<Notification> {
    return this.get<Notification>(`/${id}`);
  }

  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    return this.post<Notification>("/", data);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.patch<Notification>(`/${id}/read`);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.patch<void>(`/user/${userId}/read-all`);
  }

  async deleteNotification(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    return this.get<{ count: number }>(`/user/${userId}/unread-count`);
  }
}

export class NotificationPreferencesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/notification-preferences`);
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return this.get<NotificationPreferences>(`/user/${userId}`);
  }

  async updatePreferences(userId: string, data: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> {
    return this.patch<NotificationPreferences>(`/user/${userId}`, data);
  }
}

export class NotificationTemplatesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/notification-templates`);
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    return this.get<NotificationTemplate[]>("/");
  }

  async getTemplate(id: string): Promise<NotificationTemplate> {
    return this.get<NotificationTemplate>(`/${id}`);
  }

  async updateTemplate(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    return this.patch<NotificationTemplate>(`/${id}`, data);
  }
}

export class WebSocketApiClient {
  private ws?: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor(private authToken?: string) {}

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsBaseUrl = typeof window !== 'undefined'
        ? window.location.origin.replace(/^http/, 'ws')
        : process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      const wsUrl = `${wsBaseUrl}/ws/${userId}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        // Send auth token if available
        if (this.authToken) {
          this.send("auth", { token: this.authToken });
        }

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.reconnect(userId);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    });
  }

  private reconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(userId).catch(console.error);
      }, this.reconnectInterval);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.data));
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(messageType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  unsubscribe(messageType: string, handler: (data: any) => void) {
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

  setAuthToken(token: string) {
    this.authToken = token;
  }
}

export class DocumentsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/documents`);
  }

  async getDocuments(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    return this.get<PaginatedResponse<Document>>("/", filters);
  }

  async getDocument(id: string): Promise<Document> {
    return this.get<Document>(`/${id}`);
  }

  async uploadDocument(data: CreateDocumentRequest): Promise<Document> {
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

    return this.request<Document>("/upload", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: this.getHeaders().Authorization,
      } as HeadersInit,
    });
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    return this.patch<Document>(`/${id}`, data);
  }

  async deleteDocument(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/${id}/download`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    return this.get<DocumentVersion[]>(`/${id}/versions`);
  }

  async createNewVersion(id: string, file: File, comment?: string): Promise<DocumentVersion> {
    const formData = new FormData();
    formData.append("file", file);
    if (comment) formData.append("comment", comment);

    return this.request<DocumentVersion>(`/${id}/versions`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: this.getHeaders().Authorization,
      } as HeadersInit,
    });
  }

  async revertToVersion(id: string, versionId: string): Promise<Document> {
    return this.post<Document>(`/${id}/versions/${versionId}/revert`);
  }

  async searchDocuments(searchRequest: DocumentSearchRequest): Promise<{
    results: DocumentSearchResult[];
    total: number;
  }> {
    return this.post<{
      results: DocumentSearchResult[];
      total: number;
    }>("/search", searchRequest);
  }

  async classifyDocument(data: DocumentClassificationRequest): Promise<DocumentClassificationResult> {
    return this.post<DocumentClassificationResult>("/classify", data);
  }

  async getOCRResult(id: string): Promise<any> {
    return this.get<any>(`/${id}/ocr`);
  }

  async triggerOCR(id: string): Promise<{ job_id: string }> {
    return this.post<{ job_id: string }>(`/${id}/ocr`);
  }
}

export class DocumentCategoriesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/document-categories`);
  }

  async getCategories(): Promise<DocumentCategory[]> {
    return this.get<DocumentCategory[]>("/");
  }

  async getCategory(code: string): Promise<DocumentCategory> {
    return this.get<DocumentCategory>(`/${code}`);
  }

  async createCategory(data: Partial<DocumentCategory>): Promise<DocumentCategory> {
    return this.post<DocumentCategory>("/", data);
  }

  async updateCategory(code: string, data: Partial<DocumentCategory>): Promise<DocumentCategory> {
    return this.patch<DocumentCategory>(`/${code}`, data);
  }

  async deleteCategory(code: string): Promise<void> {
    return this.delete<void>(`/${code}`);
  }
}

export class DocumentAccessApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/document-access`);
  }

  async getDocumentAccess(documentId: string): Promise<DocumentAccess[]> {
    return this.get<DocumentAccess[]>(`/document/${documentId}`);
  }

  async grantAccess(data: Omit<DocumentAccess, 'id' | 'granted_at'>): Promise<DocumentAccess> {
    return this.post<DocumentAccess>("/grant", data);
  }

  async revokeAccess(accessId: string): Promise<void> {
    return this.delete<void>(`/${accessId}`);
  }

  async updateAccess(accessId: string, data: Partial<DocumentAccess>): Promise<DocumentAccess> {
    return this.patch<DocumentAccess>(`/${accessId}`, data);
  }
}

export class DocumentSharesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/document-shares`);
  }

  async createShare(data: Omit<DocumentShare, 'id' | 'share_token' | 'access_count' | 'created_at' | 'last_accessed_at'>): Promise<DocumentShare> {
    return this.post<DocumentShare>("/", data);
  }

  async getShare(token: string): Promise<DocumentShare> {
    return this.get<DocumentShare>(`/token/${token}`);
  }

  async getDocumentShares(documentId: string): Promise<DocumentShare[]> {
    return this.get<DocumentShare[]>(`/document/${documentId}`);
  }

  async updateShare(shareId: string, data: Partial<DocumentShare>): Promise<DocumentShare> {
    return this.patch<DocumentShare>(`/${shareId}`, data);
  }

  async deleteShare(shareId: string): Promise<void> {
    return this.delete<void>(`/${shareId}`);
  }

  async accessSharedDocument(token: string, password?: string): Promise<Document> {
    return this.post<Document>(`/access/${token}`, { password });
  }
}

export class DocumentTemplatesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/document-templates`);
  }

  async getTemplates(): Promise<DocumentTemplate[]> {
    return this.get<DocumentTemplate[]>("/");
  }

  async getTemplate(id: string): Promise<DocumentTemplate> {
    return this.get<DocumentTemplate>(`/${id}`);
  }

  async createTemplate(data: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentTemplate> {
    return this.post<DocumentTemplate>("/", data);
  }

  async updateTemplate(id: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    return this.patch<DocumentTemplate>(`/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async createDocumentFromTemplate(templateId: string, data: Record<string, any>): Promise<Document> {
    return this.post<Document>(`/${templateId}/create-document`, data);
  }
}

export class GeospatialApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/geospatial`);
  }

  async getFeatures(filters?: GeospatialFilters): Promise<PaginatedResponse<GeospatialFeature>> {
    return this.get<PaginatedResponse<GeospatialFeature>>("/features", filters);
  }

  async getFeature(id: string): Promise<GeospatialFeature> {
    return this.get<GeospatialFeature>(`/features/${id}`);
  }

  async createFeature(data: CreateGeospatialFeatureRequest): Promise<GeospatialFeature> {
    return this.post<GeospatialFeature>("/features", data);
  }

  async updateFeature(id: string, data: UpdateGeospatialFeatureRequest): Promise<GeospatialFeature> {
    return this.patch<GeospatialFeature>(`/features/${id}`, data);
  }

  async deleteFeature(id: string): Promise<void> {
    return this.delete<void>(`/features/${id}`);
  }

  async searchNearby(searchRequest: GeospatialSearchRequest): Promise<GeospatialFeature[]> {
    return this.post<GeospatialFeature[]>("/features/search/nearby", searchRequest);
  }

  async getProjectBounds(projectId: string): Promise<GeoBounds> {
    return this.get<GeoBounds>(`/projects/${projectId}/bounds`);
  }

  async calculateSegmentLength(segmentId: string): Promise<{ length_meters: number }> {
    return this.get<{ length_meters: number }>(`/segments/${segmentId}/length`);
  }

  async getProjectFeatures(projectId: string): Promise<GeospatialFeature[]> {
    return this.get<GeospatialFeature[]>(`/projects/${projectId}/features`);
  }
}

export class GeoRoutesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/geo-routes`);
  }

  async getRoutes(projectId?: string): Promise<GeoRoute[]> {
    return this.get<GeoRoute[]>("/", projectId ? { project_id: projectId } : undefined);
  }

  async getRoute(id: string): Promise<GeoRoute> {
    return this.get<GeoRoute>(`/${id}`);
  }

  async createRoute(data: CreateGeoRouteRequest): Promise<GeoRoute> {
    return this.post<GeoRoute>("/", data);
  }

  async updateRoute(id: string, data: Partial<CreateGeoRouteRequest>): Promise<GeoRoute> {
    return this.patch<GeoRoute>(`/${id}`, data);
  }

  async deleteRoute(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async optimizeRoute(id: string, parameters?: Record<string, any>): Promise<GeoRoute> {
    return this.post<GeoRoute>(`/${id}/optimize`, parameters || {});
  }

  async calculateRoute(waypoints: GeoPoint[], routeType: string): Promise<{
    distance_meters: number;
    duration_minutes: number;
    route_geometry: any;
  }> {
    return this.post<{
      distance_meters: number;
      duration_minutes: number;
      route_geometry: any;
    }>("/calculate", { waypoints, route_type: routeType });
  }
}

export class GeoLayersApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/geo-layers`);
  }

  async getLayers(projectId?: string): Promise<GeoLayer[]> {
    return this.get<GeoLayer[]>("/", projectId ? { project_id: projectId } : undefined);
  }

  async getLayer(id: string): Promise<GeoLayer> {
    return this.get<GeoLayer>(`/${id}`);
  }

  async createLayer(data: CreateGeoLayerRequest): Promise<GeoLayer> {
    return this.post<GeoLayer>("/", data);
  }

  async updateLayer(id: string, data: Partial<CreateGeoLayerRequest>): Promise<GeoLayer> {
    return this.patch<GeoLayer>(`/${id}`, data);
  }

  async deleteLayer(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async toggleLayerVisibility(id: string, visible: boolean): Promise<GeoLayer> {
    return this.patch<GeoLayer>(`/${id}/visibility`, { is_visible: visible });
  }

  async updateLayerOpacity(id: string, opacity: number): Promise<GeoLayer> {
    return this.patch<GeoLayer>(`/${id}/opacity`, { opacity });
  }

  async reorderLayers(layerIds: string[]): Promise<GeoLayer[]> {
    return this.post<GeoLayer[]>("/reorder", { layer_ids: layerIds });
  }
}

export class GeoMeasurementsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/geo-measurements`);
  }

  async getMeasurements(projectId?: string): Promise<GeoMeasurement[]> {
    return this.get<GeoMeasurement[]>("/", projectId ? { project_id: projectId } : undefined);
  }

  async getMeasurement(id: string): Promise<GeoMeasurement> {
    return this.get<GeoMeasurement>(`/${id}`);
  }

  async createMeasurement(data: CreateGeoMeasurementRequest): Promise<GeoMeasurement> {
    return this.post<GeoMeasurement>("/", data);
  }

  async updateMeasurement(id: string, data: Partial<CreateGeoMeasurementRequest>): Promise<GeoMeasurement> {
    return this.patch<GeoMeasurement>(`/${id}`, data);
  }

  async deleteMeasurement(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async calculateDistance(coordinates: [number, number][]): Promise<{ distance_meters: number }> {
    return this.post<{ distance_meters: number }>("/calculate/distance", { coordinates });
  }

  async calculateArea(coordinates: [number, number][][]): Promise<{ area_square_meters: number }> {
    return this.post<{ area_square_meters: number }>("/calculate/area", { coordinates });
  }
}

export class GeoAnnotationsApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/geo-annotations`);
  }

  async getAnnotations(projectId?: string): Promise<GeoAnnotation[]> {
    return this.get<GeoAnnotation[]>("/", projectId ? { project_id: projectId } : undefined);
  }

  async getAnnotation(id: string): Promise<GeoAnnotation> {
    return this.get<GeoAnnotation>(`/${id}`);
  }

  async createAnnotation(data: CreateGeoAnnotationRequest): Promise<GeoAnnotation> {
    return this.post<GeoAnnotation>("/", data);
  }

  async updateAnnotation(id: string, data: Partial<CreateGeoAnnotationRequest>): Promise<GeoAnnotation> {
    return this.patch<GeoAnnotation>(`/${id}`, data);
  }

  async deleteAnnotation(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
}

export class MapTilesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/map-tiles`);
  }

  async getTiles(): Promise<MapTile[]> {
    return this.get<MapTile[]>("/");
  }

  async getTile(id: string): Promise<MapTile> {
    return this.get<MapTile>(`/${id}`);
  }

  async createTile(data: Omit<MapTile, 'id' | 'created_at' | 'updated_at'>): Promise<MapTile> {
    return this.post<MapTile>("/", data);
  }

  async updateTile(id: string, data: Partial<MapTile>): Promise<MapTile> {
    return this.patch<MapTile>(`/${id}`, data);
  }

  async deleteTile(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async setActiveTile(id: string): Promise<MapTile> {
    return this.post<MapTile>(`/${id}/activate`);
  }
}

export class GeoAnalysisApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/geo-analysis`);
  }

  async getAnalyses(projectId?: string): Promise<GeoAnalysis[]> {
    return this.get<GeoAnalysis[]>("/", projectId ? { project_id: projectId } : undefined);
  }

  async getAnalysis(id: string): Promise<GeoAnalysis> {
    return this.get<GeoAnalysis>(`/${id}`);
  }

  async createAnalysis(data: CreateGeoAnalysisRequest): Promise<GeoAnalysis> {
    return this.post<GeoAnalysis>("/", data);
  }

  async deleteAnalysis(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  async getAnalysisResult(id: string): Promise<any> {
    return this.get<any>(`/${id}/result`);
  }

  async runBufferAnalysis(featureIds: string[], bufferDistance: number, unit: string): Promise<GeoAnalysis> {
    return this.post<GeoAnalysis>("/buffer", {
      input_features: featureIds,
      parameters: { buffer_distance: bufferDistance, unit }
    });
  }

  async runIntersectionAnalysis(featureIds: string[]): Promise<GeoAnalysis> {
    return this.post<GeoAnalysis>("/intersection", {
      input_features: featureIds,
      parameters: {}
    });
  }

  async runRouteOptimization(waypointIds: string[], parameters: Record<string, any>): Promise<GeoAnalysis> {
    return this.post<GeoAnalysis>("/route-optimization", {
      input_features: waypointIds,
      parameters
    });
  }
}

// API client instances
export const authApi = new AuthApiClient();
export const projectsApi = new ProjectsApiClient();
export const workEntriesApi = new WorkEntriesApiClient();
export const usersApi = new UsersApiClient();
export const teamsApi = new TeamsApiClient();
export const materialsApi = new MaterialsApiClient();
export const suppliersApi = new SuppliersApiClient();
export const materialAllocationsApi = new MaterialAllocationsApiClient();
export const materialOrdersApi = new MaterialOrdersApiClient();
export const housesApi = new HousesApiClient();
export const appointmentsApi = new AppointmentsApiClient();
export const notificationsApi = new NotificationsApiClient();
export const notificationPreferencesApi = new NotificationPreferencesApiClient();
export const notificationTemplatesApi = new NotificationTemplatesApiClient();
export const wsApi = new WebSocketApiClient();
export const documentsApi = new DocumentsApiClient();
export const documentCategoriesApi = new DocumentCategoriesApiClient();
export const documentAccessApi = new DocumentAccessApiClient();
export const documentSharesApi = new DocumentSharesApiClient();
export const documentTemplatesApi = new DocumentTemplatesApiClient();
export const geospatialApi = new GeospatialApiClient();
export const geoRoutesApi = new GeoRoutesApiClient();
export const geoLayersApi = new GeoLayersApiClient();
export const geoMeasurementsApi = new GeoMeasurementsApiClient();
export const geoAnnotationsApi = new GeoAnnotationsApiClient();
export const mapTilesApi = new MapTilesApiClient();
export const geoAnalysisApi = new GeoAnalysisApiClient();

// Set auth token for all clients
export function setAuthTokenForAllClients(token: string) {
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

// Clear auth token for all clients
export function clearAuthTokenForAllClients() {
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