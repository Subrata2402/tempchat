/**
 * Socket Controller
 * Handles all Socket.IO events and real-time communication
 */

import userService from '../services/userService.js';
import { logInfo, logError, logWarning } from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // Generate and assign a temporary user ID
    const userData = userService.addUser(socket.id);
    logInfo(`New user connected: ${userData.userId} (${socket.id})`);

    // Send the user their assigned ID
    socket.emit('user:assigned', {
      userId: userData.userId,
      timestamp: new Date().toISOString()
    });

    // Handle connection request to another user
    socket.on('connection:request', ({ targetUserId }) => {
      logInfo(`${userData.userId} requesting connection to ${targetUserId}`);

      const result = userService.connectUsers(socket.id, targetUserId);

      if (result.success) {
        const { connectionId, initiator, target } = result.data;

        // Create a room for these two users
        const roomId = `room-${connectionId}`;
        socket.join(roomId);
        io.sockets.sockets.get(target.socketId)?.join(roomId);

        // Only notify sender that request is sent (not connected yet)
        socket.emit('connection:request:sent', {
          targetUserId: target.userId,
          roomId,
          connectionId,
          timestamp: new Date().toISOString()
        });

        // Notify receiver of incoming connection request
        io.to(target.socketId).emit('connection:request:received', {
          from: initiator.userId,
          roomId,
          connectionId,
          timestamp: new Date().toISOString()
        });

        logInfo(`Connection request: ${initiator.userId} -> ${target.userId} (${connectionId})`);
      } else {
        socket.emit('connection:error', {
          message: result.message,
          timestamp: new Date().toISOString()
        });
        logWarning(`Connection failed: ${result.message}`);
      }
    });

    // Handle accepting a connection request
    socket.on('connection:accept', ({ fromUserId, roomId, connectionId }) => {
      const fromUser = userService.getUserByUserId(fromUserId);
      
      if (fromUser) {
        // Accept the connection in the service
        userService.acceptConnection(fromUserId, userData.userId);

        // Notify both users that connection is now established
        io.to(fromUser.socketId).emit('connection:success', {
          connectedTo: userData.userId,
          roomId,
          connectionId,
          timestamp: new Date().toISOString()
        });

        socket.emit('connection:success', {
          connectedTo: fromUserId,
          roomId,
          connectionId,
          timestamp: new Date().toISOString()
        });

        logInfo(`Connection accepted: ${userData.userId} accepted ${fromUserId} (${connectionId})`);
      }
    });

    // Handle declining a connection request
    socket.on('connection:decline', ({ fromUserId, roomId, connectionId }) => {
      const fromUser = userService.getUserByUserId(fromUserId);
      
      if (fromUser) {
        // Decline the connection
        userService.declineConnection(fromUserId, userData.userId);

        // Leave the room
        socket.leave(roomId);
        io.sockets.sockets.get(fromUser.socketId)?.leave(roomId);

        // Notify the requester that connection was declined
        io.to(fromUser.socketId).emit('connection:declined', {
          declinedBy: userData.userId,
          timestamp: new Date().toISOString()
        });

        logInfo(`Connection declined: ${userData.userId} declined ${fromUserId} (${connectionId})`);
      }
    });

    // Handle sending messages
    socket.on('message:send', ({ message, roomId, targetUserId, type = 'text' }) => {
      const user = userService.getUserBySocketId(socket.id);

      if (!user || !user.activeConnections.includes(targetUserId)) {
        socket.emit('message:error', {
          message: 'Not connected to this user',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: user.userId,
        to: targetUserId,
        message: type === 'text' ? message.trim() : message,
        type,
        roomId,
        timestamp: new Date().toISOString()
      };

      // Send to the room (excluding sender for text, sender already has it in UI)
      socket.to(roomId).emit('message:received', messageData);
      
      logInfo(`Message from ${user.userId} to ${targetUserId} in ${roomId} (type: ${type})`);
    });

    // Handle sending files
    socket.on('file:send', ({ file, roomId, targetUserId }) => {
      const user = userService.getUserBySocketId(socket.id);

      if (!user || !user.activeConnections.includes(targetUserId)) {
        socket.emit('message:error', {
          message: 'Not connected to this user',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: user.userId,
        to: targetUserId,
        type: 'file',
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          data: file.data
        },
        roomId,
        timestamp: new Date().toISOString()
      };

      // Send to the room (excluding sender to avoid duplicates)
      socket.to(roomId).emit('message:received', messageData);
      
      logInfo(`File from ${user.userId} to ${targetUserId} in ${roomId}: ${file.name}`);
    });

    // Handle typing indicator
    socket.on('typing:start', ({ roomId, targetUserId }) => {
      const user = userService.getUserBySocketId(socket.id);
      if (user && user.activeConnections.includes(targetUserId)) {
        socket.to(roomId).emit('typing:user', {
          userId: user.userId,
          isTyping: true,
          roomId
        });
      }
    });

    socket.on('typing:stop', ({ roomId, targetUserId }) => {
      const user = userService.getUserBySocketId(socket.id);
      if (user && user.activeConnections.includes(targetUserId)) {
        socket.to(roomId).emit('typing:user', {
          userId: user.userId,
          isTyping: false,
          roomId
        });
      }
    });

    // Handle disconnection from a specific chat
    socket.on('connection:disconnect', ({ targetUserId, roomId }) => {
      const user = userService.getUserBySocketId(socket.id);
      
      if (user && targetUserId) {
        userService.disconnectConnection(user.userId, targetUserId);

        const otherUser = userService.getUserByUserId(targetUserId);
        
        if (otherUser) {
          io.to(otherUser.socketId).emit('connection:ended', {
            fromUserId: user.userId,
            roomId,
            message: 'The other user has disconnected',
            timestamp: new Date().toISOString()
          });
          logInfo(`${userData.userId} disconnected from ${otherUser.userId}`);
        }

        // Leave the room
        socket.leave(roomId);
        io.sockets.sockets.get(otherUser?.socketId)?.leave(roomId);

        socket.emit('connection:ended', {
          targetUserId,
          roomId,
          message: 'You have disconnected',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle socket disconnection (user closes browser/tab)
    socket.on('disconnect', () => {
      const connectedUsers = userService.disconnectUser(socket.id);
      
      // Notify all connected users
      connectedUsers.forEach(otherUser => {
        io.to(otherUser.socketId).emit('connection:ended', {
          fromUserId: userData.userId,
          message: 'The other user has left',
          timestamp: new Date().toISOString()
        });
      });

      userService.removeUser(socket.id);
      logInfo(`User disconnected: ${userData.userId} (${socket.id})`);
      logInfo(`Active users: ${userService.getActiveUsersCount()}`);
    });
  });
};
