// WebSocket client for real-time communication
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  projectId?: string;
  room?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'work_entry_created' | 'work_entry_approved' | 'project_status_changed' | 'resource_request' | 'budget_alert' | 'deadline_reminder';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'navigate' | 'api_call' | 'dismiss';
  payload?: any;
}

export interface RealTimeUpdate {
  type: 'project_progress' | 'work_entry_update' | 'team_location' | 'material_allocation' | 'budget_update';
  entityId: string;
  data: any;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  online: boolean;
  lastSeen: Date;
  currentProject?: string;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private currentUser: any = null;
  private isConnected = false;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
      auth: {
        token: this.getAuthToken(),
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Send queued messages
      this.flushMessageQueue();

      // Join user room for personal notifications
      if (this.currentUser) {
        this.joinRoom(`user_${this.currentUser.id}`);
      }

      toast.success('Real-time connection established');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Handle incoming notifications
    this.socket.on('notification', (notification: NotificationMessage) => {
      this.handleNotification(notification);
    });

    // Handle real-time updates
    this.socket.on('real_time_update', (update: RealTimeUpdate) => {
      this.handleRealTimeUpdate(update);
    });

    // Handle user presence updates
    this.socket.on('user_presence', (presence: UserPresence) => {
      this.handleUserPresence(presence);
    });

    // Handle room-specific messages
    this.socket.on('room_message', (message: WebSocketMessage) => {
      this.handleRoomMessage(message);
    });

    // Handle typing indicators
    this.socket.on('user_typing', (data: { userId: string; roomId: string; typing: boolean }) => {
      this.notifySubscribers('user_typing', data);
    });

    // Handle file upload progress
    this.socket.on('upload_progress', (data: { uploadId: string; progress: number; status: string }) => {
      this.notifySubscribers('upload_progress', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      toast.error('Connection lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, delay);
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private handleNotification(notification: NotificationMessage) {
    // Show toast notification
    const toastOptions = {
      id: notification.id,
      duration: notification.priority === 'urgent' ? 0 : 5000, // Urgent notifications stay until dismissed
    };

    switch (notification.priority) {
      case 'urgent':
        toast.error(notification.message, toastOptions);
        break;
      case 'high':
        toast.warning(notification.message, toastOptions);
        break;
      case 'normal':
        toast.success(notification.message, toastOptions);
        break;
      case 'low':
        toast.info(notification.message, toastOptions);
        break;
    }

    // Notify subscribers
    this.notifySubscribers('notification', notification);

    // Handle notification actions
    if (notification.actions) {
      // Add action buttons to toast or show in notification center
      this.showNotificationActions(notification);
    }
  }

  private handleRealTimeUpdate(update: RealTimeUpdate) {
    // Notify subscribers based on update type
    this.notifySubscribers(update.type, update);
    this.notifySubscribers('real_time_update', update);
  }

  private handleUserPresence(presence: UserPresence) {
    this.notifySubscribers('user_presence', presence);
  }

  private handleRoomMessage(message: WebSocketMessage) {
    this.notifySubscribers(`room_${message.room}`, message);
    this.notifySubscribers('room_message', message);
  }

  private showNotificationActions(notification: NotificationMessage) {
    // This would integrate with your notification center component
    // For now, we'll just log the actions
    console.log('Notification actions available:', notification.actions);
  }

  private notifySubscribers(event: string, data: any) {
    const subscribers = this.subscriptions.get(event);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket subscription callback:', error);
        }
      });
    }
  }

  // Public methods
  public setCurrentUser(user: any) {
    this.currentUser = user;
    if (this.isConnected && user) {
      this.joinRoom(`user_${user.id}`);
    }
  }

  public sendMessage(message: WebSocketMessage) {
    if (!this.isConnected || !this.socket) {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      return;
    }

    this.socket.emit('message', {
      ...message,
      timestamp: new Date(),
      userId: this.currentUser?.id,
    });
  }

  public joinRoom(roomId: string) {
    if (!this.isConnected || !this.socket) {
      console.warn('Cannot join room: WebSocket not connected');
      return;
    }

    this.socket.emit('join_room', { roomId });
    console.log(`Joined room: ${roomId}`);
  }

  public leaveRoom(roomId: string) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit('leave_room', { roomId });
    console.log(`Left room: ${roomId}`);
  }

  public subscribeToProject(projectId: string) {
    this.joinRoom(`project_${projectId}`);
  }

  public unsubscribeFromProject(projectId: string) {
    this.leaveRoom(`project_${projectId}`);
  }

  public subscribeToTeam(teamId: string) {
    this.joinRoom(`team_${teamId}`);
  }

  public unsubscribeFromTeam(teamId: string) {
    this.leaveRoom(`team_${teamId}`);
  }

  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }

    this.subscriptions.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscriptions.get(event);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscriptions.delete(event);
        }
      }
    };
  }

  public updateLocation(location: { lat: number; lng: number; accuracy: number }) {
    this.sendMessage({
      type: 'location_update',
      data: location,
      timestamp: new Date(),
    });
  }

  public startTyping(roomId: string) {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing_start', { roomId });
    }
  }

  public stopTyping(roomId: string) {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing_stop', { roomId });
    }
  }

  public markNotificationAsRead(notificationId: string) {
    this.sendMessage({
      type: 'mark_notification_read',
      data: { notificationId },
      timestamp: new Date(),
    });
  }

  public requestWorkEntryUpdate(workEntryId: string) {
    this.sendMessage({
      type: 'request_work_entry_update',
      data: { workEntryId },
      timestamp: new Date(),
    });
  }

  public broadcastProjectUpdate(projectId: string, updateData: any) {
    this.sendMessage({
      type: 'project_update',
      data: updateData,
      projectId,
      room: `project_${projectId}`,
      timestamp: new Date(),
    });
  }

  public isOnline(): boolean {
    return this.isConnected;
  }

  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.socket) return 'disconnected';

    switch (this.socket.connected) {
      case true:
        return 'connected';
      default:
        return this.socket.connecting ? 'connecting' : 'disconnected';
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.subscriptions.clear();
    this.messageQueue.length = 0;
  }

  private getAuthToken(): string | null {
    // Get JWT token from localStorage or your auth system
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
}

// Singleton instance
export const websocketManager = new WebSocketManager();

// React hook for easy WebSocket usage
export function useWebSocket() {
  return {
    isConnected: websocketManager.isOnline(),
    subscribe: websocketManager.subscribe.bind(websocketManager),
    sendMessage: websocketManager.sendMessage.bind(websocketManager),
    joinRoom: websocketManager.joinRoom.bind(websocketManager),
    leaveRoom: websocketManager.leaveRoom.bind(websocketManager),
    updateLocation: websocketManager.updateLocation.bind(websocketManager),
    startTyping: websocketManager.startTyping.bind(websocketManager),
    stopTyping: websocketManager.stopTyping.bind(websocketManager),
    markNotificationAsRead: websocketManager.markNotificationAsRead.bind(websocketManager),
    subscribeToProject: websocketManager.subscribeToProject.bind(websocketManager),
    unsubscribeFromProject: websocketManager.unsubscribeFromProject.bind(websocketManager),
    getConnectionStatus: websocketManager.getConnectionStatus.bind(websocketManager),
  };
}