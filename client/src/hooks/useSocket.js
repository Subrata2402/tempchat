/**
 * useSocket Hook
 * Manages Socket.IO connection and event listeners with multi-connection support
 */

import { useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
import { useChatContext } from '../context/ChatContext';

export const useSocket = (serverUrl, setModal) => {
  const context = useChatContext();
  const contextRef = useRef(context);
  
  // Update ref when context changes
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    const socket = socketService.connect(serverUrl);

    // User assigned event
    socket.on('user:assigned', ({ userId }) => {
      contextRef.current.setMyUserId(userId);
      console.log('Assigned User ID:', userId);
    });

    // Connection request sent (waiting for acceptance)
    socket.on('connection:request:sent', ({ targetUserId, roomId, connectionId }) => {
      contextRef.current.setConnectionStatus('waiting');
      console.log('Connection request sent to:', targetUserId, 'connectionId:', connectionId);
    });

    // Connection success
    socket.on('connection:success', ({ connectedTo, roomId, connectionId }) => {
      contextRef.current.addConnection(connectionId, connectedTo, roomId);
      contextRef.current.setConnectionStatus('connected');
      console.log('Connected to:', connectedTo, 'connectionId:', connectionId);
    });

    // Connection request received
    socket.on('connection:request:received', ({ from, roomId, connectionId }) => {
      contextRef.current.addPendingRequest({ from, roomId, connectionId });
      console.log('Connection request from:', from, 'connectionId:', connectionId);
    });

    // Connection declined
    socket.on('connection:declined', ({ declinedBy }) => {
      contextRef.current.setConnectionStatus('disconnected');
      setModal({
        isOpen: true,
        title: 'Connection Declined',
        message: `User ${declinedBy} declined your connection request.`,
        type: 'warning'
      });
    });

    // Connection error
    socket.on('connection:error', ({ message }) => {
      contextRef.current.setConnectionStatus('disconnected');
      setModal({
        isOpen: true,
        title: 'Connection Error',
        message: message,
        type: 'error'
      });
    });

    // Message received
    socket.on('message:received', (messageData) => {
      const { from, to } = messageData;
      
      // Find the connection - look for the other user (not yourself)
      const myUserId = contextRef.current.myUserId;
      const otherUserId = from === myUserId ? to : from;
      const connection = contextRef.current.getConnectionByUserId(otherUserId);
      
      if (connection) {
        contextRef.current.addMessage(connection.connectionId, messageData);
      } else {
        console.warn('Connection not found for message:', { otherUserId, messageData });
      }
    });

    // Typing indicator
    socket.on('typing:user', ({ userId, isTyping, roomId }) => {
      const connection = contextRef.current.getConnectionByUserId(userId);
      if (connection) {
        contextRef.current.setTypingStatus(connection.connectionId, isTyping);
      }
    });

    // Message or file send error
    socket.on('message:error', ({ message }) => {
      setModal({
        isOpen: true,
        title: 'Send Error',
        message: message || 'Failed to send message or file.',
        type: 'error'
      });
    });

    // Connection ended
    socket.on('connection:ended', ({ fromUserId, roomId, message }) => {
      const connection = contextRef.current.getConnectionByUserId(fromUserId);
      
      if (connection) {
        setModal({
          isOpen: true,
          title: 'Connection Ended',
          message: message || 'The other user has disconnected.',
          type: 'info'
        });
        contextRef.current.removeConnection(connection.connectionId);
      }
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [serverUrl, setModal]);

  const {
    setConnectionStatus,
    removePendingRequest,
    getConnectionByUserId,
    removeConnection
  } = context;

  const requestConnection = useCallback((targetUserId) => {
    setConnectionStatus('connecting');
    socketService.emit('connection:request', { targetUserId });
  }, [setConnectionStatus]);

  const acceptConnection = useCallback((fromUserId, roomId, connectionId) => {
    socketService.emit('connection:accept', { fromUserId, roomId, connectionId });
    removePendingRequest(fromUserId);
  }, [removePendingRequest]);

  const sendMessage = useCallback((message, roomId, targetUserId, type = 'text') => {
    socketService.emit('message:send', { message, roomId, targetUserId, type });
  }, []);

  const sendFile = useCallback((file, roomId, targetUserId, onError) => {
    try {
      socketService.emit('file:send', { file, roomId, targetUserId });
    } catch (error) {
      console.error('Failed to send file:', error);
      if (onError) onError(error);
    }
  }, []);

  const startTyping = useCallback((roomId, targetUserId) => {
    socketService.emit('typing:start', { roomId, targetUserId });
  }, []);

  const stopTyping = useCallback((roomId, targetUserId) => {
    socketService.emit('typing:stop', { roomId, targetUserId });
  }, []);

  const disconnectChat = useCallback((targetUserId, roomId) => {
    // Find and remove connection immediately from UI
    const connection = getConnectionByUserId(targetUserId);
    if (connection) {
      removeConnection(connection.connectionId);
    }
    
    // Emit socket event to notify server and other user
    socketService.emit('connection:disconnect', { targetUserId, roomId });
  }, [getConnectionByUserId, removeConnection]);

  const declineConnection = useCallback((fromUserId, roomId, connectionId) => {
    socketService.emit('connection:decline', { fromUserId, roomId, connectionId });
    removePendingRequest(fromUserId);
    setConnectionStatus('disconnected');
  }, [removePendingRequest, setConnectionStatus]);

  return {
    requestConnection,
    acceptConnection,
    declineConnection,
    sendMessage,
    sendFile,
    startTyping,
    stopTyping,
    disconnectChat
  };
};
