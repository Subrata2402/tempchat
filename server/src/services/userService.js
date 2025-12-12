/**
 * User Service
 * Manages temporary user sessions and ID generation
 */

class UserService {
  constructor() {
    this.users = new Map(); // Map<socketId, userData>
    this.userIdToSocketId = new Map(); // Map<userId, socketId>
    this.connections = new Map(); // Map<connectionId, connectionData>
  }

  /**
   * Generate a random user ID
   * @returns {string} Random 6-character alphanumeric ID
   */
  generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let userId;
    
    do {
      userId = '';
      for (let i = 0; i < 6; i++) {
        userId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.userIdToSocketId.has(userId));
    
    return userId;
  }

  /**
   * Add a new user to the session
   * @param {string} socketId - Socket.IO socket ID
   * @returns {Object} User data with generated ID
   */
  addUser(socketId) {
    const userId = this.generateUserId();
    const userData = {
      userId,
      socketId,
      activeConnections: [], // Array of userIds this user is connected to
      connectedAt: new Date().toISOString()
    };

    this.users.set(socketId, userData);
    this.userIdToSocketId.set(userId, socketId);

    return userData;
  }

  /**
   * Get user data by socket ID
   * @param {string} socketId
   * @returns {Object|null} User data
   */
  getUserBySocketId(socketId) {
    return this.users.get(socketId) || null;
  }

  /**
   * Get user data by user ID
   * @param {string} userId
   * @returns {Object|null} User data
   */
  getUserByUserId(userId) {
    const socketId = this.userIdToSocketId.get(userId);
    return socketId ? this.users.get(socketId) : null;
  }

  /**
   * Connect two users
   * @param {string} initiatorSocketId
   * @param {string} targetUserId
   * @returns {Object} Result with success status and message
   */
  connectUsers(initiatorSocketId, targetUserId) {
    const initiator = this.users.get(initiatorSocketId);
    const target = this.getUserByUserId(targetUserId);

    if (!initiator) {
      return { success: false, message: 'Initiator not found' };
    }

    if (!target) {
      return { success: false, message: 'Target user not found' };
    }

    if (initiator.userId === targetUserId) {
      return { success: false, message: 'Cannot connect to yourself' };
    }

    // Check if already connected
    if (initiator.activeConnections.includes(targetUserId)) {
      return { success: false, message: 'Already connected to this user' };
    }

    // Add pending connection (will be confirmed on acceptance)
    const connectionId = `${initiator.userId}-${targetUserId}`;
    this.connections.set(connectionId, {
      initiator: initiator.userId,
      target: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Connection request sent',
      data: {
        connectionId,
        initiator: {
          userId: initiator.userId,
          socketId: initiator.socketId
        },
        target: {
          userId: target.userId,
          socketId: target.socketId
        }
      }
    };
  }

  /**
   * Accept a connection request
   * @param {string} initiatorUserId
   * @param {string} targetUserId
   * @returns {boolean} Success status
   */
  acceptConnection(initiatorUserId, targetUserId) {
    const connectionId = `${initiatorUserId}-${targetUserId}`;
    const connection = this.connections.get(connectionId);

    if (!connection || connection.status !== 'pending') {
      return false;
    }

    // Update connection status
    connection.status = 'active';

    // Add to both users' active connections
    const initiator = this.getUserByUserId(initiatorUserId);
    const target = this.getUserByUserId(targetUserId);

    if (initiator && target) {
      if (!initiator.activeConnections.includes(targetUserId)) {
        initiator.activeConnections.push(targetUserId);
      }
      if (!target.activeConnections.includes(initiatorUserId)) {
        target.activeConnections.push(initiatorUserId);
      }
      return true;
    }

    return false;
  }

  /**
   * Decline a connection request
   * @param {string} initiatorUserId
   * @param {string} targetUserId
   */
  declineConnection(initiatorUserId, targetUserId) {
    const connectionId = `${initiatorUserId}-${targetUserId}`;
    this.connections.delete(connectionId);
  }

  /**
   * Disconnect a specific connection between two users
   * @param {string} userId1
   * @param {string} userId2
   */
  disconnectConnection(userId1, userId2) {
    const user1 = this.getUserByUserId(userId1);
    const user2 = this.getUserByUserId(userId2);

    if (user1) {
      user1.activeConnections = user1.activeConnections.filter(id => id !== userId2);
    }

    if (user2) {
      user2.activeConnections = user2.activeConnections.filter(id => id !== userId1);
    }

    // Remove connection record
    const connectionId1 = `${userId1}-${userId2}`;
    const connectionId2 = `${userId2}-${userId1}`;
    this.connections.delete(connectionId1);
    this.connections.delete(connectionId2);
  }

  /**
   * Disconnect a user from all their conversations
   * @param {string} socketId
   * @returns {Array} Array of other users who were connected
   */
  disconnectUser(socketId) {
    const user = this.users.get(socketId);
    
    if (!user) {
      return [];
    }

    const connectedUsers = [];

    // Disconnect from all active connections
    for (const otherUserId of user.activeConnections) {
      const otherUser = this.getUserByUserId(otherUserId);
      if (otherUser) {
        otherUser.activeConnections = otherUser.activeConnections.filter(
          id => id !== user.userId
        );
        connectedUsers.push(otherUser);
      }
    }

    // Clear user's connections
    user.activeConnections = [];

    // Remove any pending connections
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.initiator === user.userId || connection.target === user.userId) {
        this.connections.delete(connectionId);
      }
    }

    return connectedUsers;
  }

  /**
   * Remove a user from the session
   * @param {string} socketId
   */
  removeUser(socketId) {
    const user = this.users.get(socketId);
    
    if (user) {
      // Disconnect from all connections first
      this.disconnectUser(socketId);
      
      this.userIdToSocketId.delete(user.userId);
      this.users.delete(socketId);
    }
  }

  /**
   * Get total active users count
   * @returns {number}
   */
  getActiveUsersCount() {
    return this.users.size;
  }

  /**
   * Check if a user has any active connections
   * @param {string} socketId
   * @returns {boolean}
   */
  isUserConnected(socketId) {
    const user = this.users.get(socketId);
    return user && user.activeConnections.length > 0;
  }

  /**
   * Get all active connections for a user
   * @param {string} userId
   * @returns {Array} Array of connected user IDs
   */
  getUserConnections(userId) {
    const user = this.getUserByUserId(userId);
    return user ? user.activeConnections : [];
  }
}

export default new UserService();
