/**
 * Chat Context
 * Global state management for chat application with multi-connection support
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [myUserId, setMyUserId] = useState(null);
  
  // Multi-connection state: { connectionId: { userId, roomId, messages, isTyping } }
  const [connections, setConnections] = useState({});
  
  // Current active chat
  const [activeConnectionId, setActiveConnectionId] = useState(null);
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, waiting, connected
  const [pendingRequests, setPendingRequests] = useState([]); // Array of pending requests

  // Add a new connection
  const addConnection = useCallback((connectionId, userId, roomId) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: {
        userId,
        roomId,
        connectionId,
        messages: [],
        isTyping: false,
        unreadCount: 0
      }
    }));
    setActiveConnectionId(connectionId);
  }, []);

  // Remove a connection
  const removeConnection = useCallback((connectionId) => {
    setConnections(prev => {
      const newConns = { ...prev };
      delete newConns[connectionId];
      return newConns;
    });
    
    // If this was the active connection, switch to another or clear
    if (activeConnectionId === connectionId) {
      const remainingIds = Object.keys(connections).filter(id => id !== connectionId);
      setActiveConnectionId(remainingIds.length > 0 ? remainingIds[0] : null);
    }
  }, [activeConnectionId, connections]);

  // Add message to a specific connection
  const addMessage = useCallback((connectionId, message) => {
    setConnections(prev => {
      const connection = prev[connectionId];
      if (!connection) return prev;
      
      // Only increment unread if this is not the active connection and message is from other user
      const shouldIncrementUnread = connectionId !== activeConnectionId && message.from !== myUserId;
      
      return {
        ...prev,
        [connectionId]: {
          ...connection,
          messages: [...connection.messages, message],
          unreadCount: shouldIncrementUnread ? (connection.unreadCount || 0) + 1 : connection.unreadCount || 0
        }
      };
    });
  }, [activeConnectionId, myUserId]);

  // Set typing status for a connection
  const setTypingStatus = useCallback((connectionId, isTyping) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        isTyping
      }
    }));
  }, []);

  // Add pending request
  const addPendingRequest = useCallback((request) => {
    setPendingRequests(prev => [...prev, request]);
  }, []);

  // Remove pending request
  const removePendingRequest = useCallback((fromUserId) => {
    setPendingRequests(prev => prev.filter(req => req.from !== fromUserId));
  }, []);

  // Clear all pending requests
  const clearPendingRequests = useCallback(() => {
    setPendingRequests([]);
  }, []);

  // Reset all connections
  const resetAllConnections = useCallback(() => {
    setConnections({});
    setActiveConnectionId(null);
    setConnectionStatus('disconnected');
    setPendingRequests([]);
  }, []);

  // Get active connection data
  const getActiveConnection = useCallback(() => {
    return activeConnectionId ? connections[activeConnectionId] : null;
  }, [activeConnectionId, connections]);

  // Get connection by userId
  const getConnectionByUserId = useCallback((userId) => {
    return Object.values(connections).find(conn => conn.userId === userId);
  }, [connections]);

  // Mark connection messages as read
  const markAsRead = useCallback((connectionId) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        unreadCount: 0
      }
    }));
  }, []);

  const value = {
    myUserId,
    setMyUserId,
    connections,
    addConnection,
    removeConnection,
    activeConnectionId,
    setActiveConnectionId,
    addMessage,
    setTypingStatus,
    connectionStatus,
    setConnectionStatus,
    pendingRequests,
    addPendingRequest,
    removePendingRequest,
    clearPendingRequests,
    resetAllConnections,
    getActiveConnection,
    getConnectionByUserId,
    markAsRead
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};
