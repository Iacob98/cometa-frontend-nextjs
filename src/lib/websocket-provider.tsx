"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { wsApi } from "@/lib/api-client";
import type { WebSocketMessage, RealtimeEvent, Notification } from "@/types";

interface WebSocketContextType {
  isConnected: boolean;
  send: (type: string, data: any) => void;
  subscribe: (messageType: string, handler: (data: any) => void) => void;
  unsubscribe: (messageType: string, handler: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 5;

  const handleNotification = React.useCallback((notification: Notification) => {
    // Update notification-related queries
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count", user.id] });
    }

    // Add notification to cache
    queryClient.setQueryData(["notifications", "detail", notification.id], notification);

    // Show toast for important notifications
    if (notification.priority === "high" || notification.priority === "urgent") {
      toast.info(notification.title, {
        description: notification.body,
        action: notification.priority === "urgent" ? {
          label: "View",
          onClick: () => {
            // Could implement navigation to specific pages based on notification data
            console.log("Navigate to notification:", notification.id);
          }
        } : undefined,
      });
    }
  }, [queryClient, user?.id]);

  const handleRealtimeUpdate = React.useCallback((event: RealtimeEvent) => {
    console.log("Realtime update received:", event);

    // Invalidate queries based on entity type
    switch (event.entity_type) {
      case "project":
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        if (event.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["projects", "detail", event.entity_id] });
        }
        break;

      case "work_entry":
        queryClient.invalidateQueries({ queryKey: ["work-entries"] });
        if (event.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["work-entries", "detail", event.entity_id] });
        }
        break;

      case "material":
        queryClient.invalidateQueries({ queryKey: ["materials"] });
        if (event.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["materials", "detail", event.entity_id] });
        }
        break;

      case "material_allocation":
        queryClient.invalidateQueries({ queryKey: ["material-allocations"] });
        break;

      case "house":
        queryClient.invalidateQueries({ queryKey: ["houses"] });
        if (event.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["houses", "detail", event.entity_id] });
        }
        break;

      case "appointment":
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        if (event.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["appointments", "detail", event.entity_id] });
        }
        break;

      case "crew":
        queryClient.invalidateQueries({ queryKey: ["crews"] });
        if (event.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["crews", "detail", event.entity_id] });
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
      toast.info(`${entityName} status updated`, {
        description: `Status changed to: ${event.data.status}`,
      });
    }

    // Show toast for assignment changes
    if (event.type === "assignment_changed" && user?.id && event.data?.assigned_to === user.id) {
      const entityName = event.entity_type.replace("_", " ");
      toast.info(`New ${entityName} assigned`, {
        description: `You have been assigned to a ${entityName}`,
      });
    }
  }, [queryClient, user?.id]);

  const handleUserStatus = React.useCallback((data: any) => {
    console.log("User status update:", data);
    // Could implement user presence indicators here
  }, []);

  const handleTypingIndicator = React.useCallback((data: any) => {
    console.log("Typing indicator:", data);
    // Could implement typing indicators for chat/comments
  }, []);

  const connectWebSocket = React.useCallback(async () => {
    if (!user?.id || !token) {
      return;
    }

    try {
      // Set auth token for WebSocket
      wsApi.setAuthToken(token);

      // Connect to WebSocket
      await wsApi.connect(user.id);

      isConnectedRef.current = true;
      connectionAttempts.current = 0;

      console.log("WebSocket connected successfully");

      // Subscribe to all message types
      wsApi.subscribe("notification", handleNotification);
      wsApi.subscribe("realtime_update", handleRealtimeUpdate);
      wsApi.subscribe("user_status", handleUserStatus);
      wsApi.subscribe("typing_indicator", handleTypingIndicator);

      // Send initial presence update
      wsApi.send("user_status", {
        status: "online",
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("WebSocket connection failed:", error);
      isConnectedRef.current = false;

      // Implement exponential backoff for reconnection
      if (connectionAttempts.current < maxConnectionAttempts) {
        connectionAttempts.current++;
        const delay = Math.pow(2, connectionAttempts.current) * 1000; // 2s, 4s, 8s, 16s, 32s

        console.log(`Retrying WebSocket connection in ${delay}ms (attempt ${connectionAttempts.current}/${maxConnectionAttempts})`);

        setTimeout(() => {
          connectWebSocket();
        }, delay);
      } else {
        console.error("Max WebSocket connection attempts reached");
        toast.error("Failed to establish real-time connection", {
          description: "Some features may not work properly. Please refresh the page.",
        });
      }
    }
  }, [user?.id, token, handleNotification, handleRealtimeUpdate, handleUserStatus, handleTypingIndicator]);

  const disconnectWebSocket = React.useCallback(() => {
    if (isConnectedRef.current) {
      // Send offline status before disconnecting
      wsApi.send("user_status", {
        status: "offline",
        timestamp: new Date().toISOString(),
      });

      // Unsubscribe from all message types
      wsApi.unsubscribe("notification", handleNotification);
      wsApi.unsubscribe("realtime_update", handleRealtimeUpdate);
      wsApi.unsubscribe("user_status", handleUserStatus);
      wsApi.unsubscribe("typing_indicator", handleTypingIndicator);

      // Disconnect
      wsApi.disconnect();
      isConnectedRef.current = false;
      connectionAttempts.current = 0;

      console.log("WebSocket disconnected");
    }
  }, [handleNotification, handleRealtimeUpdate, handleUserStatus, handleTypingIndicator]);

  // Connect when user and token are available
  useEffect(() => {
    if (user?.id && token) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [user?.id, token, connectWebSocket, disconnectWebSocket]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, send away status
        if (isConnectedRef.current) {
          wsApi.send("user_status", {
            status: "away",
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Page is visible, send online status and reconnect if needed
        if (user?.id && token) {
          if (!isConnectedRef.current) {
            connectWebSocket();
          } else {
            wsApi.send("user_status", {
              status: "online",
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id, token, connectWebSocket]);

  // Handle beforeunload to send offline status
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isConnectedRef.current) {
        wsApi.send("user_status", {
          status: "offline",
          timestamp: new Date().toISOString(),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const contextValue: WebSocketContextType = {
    isConnected: isConnectedRef.current,
    send: (type: string, data: any) => {
      if (isConnectedRef.current) {
        wsApi.send(type, data);
      } else {
        console.warn("WebSocket not connected, cannot send message:", { type, data });
      }
    },
    subscribe: (messageType: string, handler: (data: any) => void) => {
      wsApi.subscribe(messageType, handler);
    },
    unsubscribe: (messageType: string, handler: (data: any) => void) => {
      wsApi.unsubscribe(messageType, handler);
    },
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

// Hook for sending specific message types
export function useWebSocketSend() {
  const { send, isConnected } = useWebSocket();

  const sendNotification = (notification: Partial<Notification>) => {
    send("create_notification", notification);
  };

  const sendRealtimeEvent = (event: Partial<RealtimeEvent>) => {
    send("realtime_event", event);
  };

  const sendUserStatus = (status: "online" | "away" | "offline") => {
    send("user_status", {
      status,
      timestamp: new Date().toISOString(),
    });
  };

  const sendTypingIndicator = (isTyping: boolean, context?: string) => {
    send("typing_indicator", {
      typing: isTyping,
      context,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    sendNotification,
    sendRealtimeEvent,
    sendUserStatus,
    sendTypingIndicator,
    isConnected,
  };
}