# TempChat - Multi-Connection Support

## What's New

Your TempChat application now supports **multiple simultaneous connections**! Users can now chat with multiple people at the same time, with each conversation in its own separate chat.

## Features

### 1. Multiple Active Chats
- Connect to multiple users simultaneously
- Each connection is independent with its own message history
- Switch between active chats easily

### 2. Chat List Sidebar
- View all your active connections in a sidebar
- Shows the last message preview for each chat
- Click on any chat to switch to that conversation
- Disconnect from individual chats using the × button

### 3. Individual Chat Management
- Each chat has its own:
  - Message history
  - Typing indicator
  - File sharing
  - Room ID
- Disconnect from specific chats without affecting others

### 4. Multiple Connection Requests
- Accept multiple connection requests
- Each request appears as a separate modal
- Can have connections from different users pending

## How It Works

### Backend Changes

1. **UserService** (`server/src/services/userService.js`)
   - Changed from single `connectedTo` to array `activeConnections`
   - Added `connections` Map to track all connection states
   - New methods:
     - `acceptConnection()` - Accepts a pending connection
     - `declineConnection()` - Declines a connection request
     - `disconnectConnection()` - Disconnects a specific user pair
     - `getUserConnections()` - Gets all connections for a user

2. **SocketController** (`server/src/controllers/socketController.js`)
   - Updated all socket events to include `targetUserId` and `connectionId`
   - Messages now route to specific connections
   - Typing indicators are connection-specific
   - Disconnect events handle specific connections

### Frontend Changes

1. **ChatContext** (`client/src/context/ChatContext.jsx`)
   - Changed from single connection state to `connections` object
   - Added `activeConnectionId` to track which chat is currently open
   - New state management:
     - `connections: { connectionId: { userId, roomId, messages, isTyping } }`
     - `pendingRequests: []` - Array of pending connection requests
   - Helper methods:
     - `addConnection()` - Adds a new connection
     - `removeConnection()` - Removes a connection
     - `getActiveConnection()` - Gets currently active chat
     - `getConnectionByUserId()` - Finds connection by user ID

2. **useSocket Hook** (`client/src/hooks/useSocket.js`)
   - Updated to work with multiple connections
   - All socket events now include connection identifiers
   - Message routing based on connection ID

3. **New ChatList Component** (`client/src/components/ChatList.jsx`)
   - Displays all active connections in a sidebar
   - Shows message previews
   - Allows switching between chats
   - Individual disconnect buttons

4. **Updated Components**
   - **ChatInterface** - Now shows ChatList and works with active connection
   - **MessageList** - Displays messages for the active connection only
   - **ConnectionRequest** - Handles multiple pending requests
   - **App** - Manages multiple connection requests simultaneously

## Usage Example

### Scenario: User A wants to chat with User B and User C

1. User A connects to User B (gets ID from User B)
2. Connection is established, chat starts
3. User A connects to User C (while still connected to B)
4. Both chats appear in the sidebar
5. User A can switch between chats by clicking in the sidebar
6. Each chat maintains its own:
   - Message history
   - Typing indicators
   - File uploads
7. User A can disconnect from User B without affecting chat with User C

## Technical Details

### Connection Flow
```
1. User A → connection:request → User B
2. Server creates pending connection with connectionId
3. User B receives connection:request:received
4. User B → connection:accept → Server
5. Server activates connection
6. Both users receive connection:success with connectionId
7. Both users can now exchange messages via roomId
```

### Message Routing
```
1. User sends message with: { message, roomId, targetUserId }
2. Server validates user is in activeConnections with target
3. Server broadcasts to room with from/to/roomId
4. Client routes message to correct connection based on userId
5. Message appears in specific chat's message list
```

### Data Structure

**Server - User Object:**
```javascript
{
  userId: 'user_abc123',
  socketId: 'socket_xyz',
  activeConnections: ['user_def456', 'user_ghi789'],
  connectedAt: '2024-01-01T00:00:00.000Z'
}
```

**Client - Connections State:**
```javascript
{
  'user_abc123-user_def456': {
    connectionId: 'user_abc123-user_def456',
    userId: 'user_def456',
    roomId: 'room-user_abc123-user_def456',
    messages: [...],
    isTyping: false
  },
  'user_abc123-user_ghi789': {
    connectionId: 'user_abc123-user_ghi789',
    userId: 'user_ghi789',
    roomId: 'room-user_abc123-user_ghi789',
    messages: [...],
    isTyping: false
  }
}
```

## Testing the Feature

1. Open the app in two browser tabs (Tab 1 and Tab 2)
2. Note the user IDs for each tab
3. In Tab 1, connect to Tab 2's user ID
4. Accept the connection in Tab 2
5. Send some messages
6. Open a third tab (Tab 3)
7. In Tab 1, connect to Tab 3's user ID (while still connected to Tab 2)
8. Accept in Tab 3
9. Now Tab 1 should show a sidebar with both connections
10. Click between chats in the sidebar to switch conversations
11. Each chat maintains its own history

## What Stays the Same

- User ID generation (temporary IDs)
- File sharing (images, PDFs, documents)
- Typing indicators
- Connection request/accept/decline flow
- Custom modals
- Responsive design
- All existing styling

## Future Enhancements (Optional)

- Add notification badges for unread messages
- Add last activity timestamp
- Allow renaming connections (nicknames)
- Add search within chat list
- Add "active now" status indicators
- Persist connection history in browser storage
- Add group chat support
- Add voice/video call support

---

**Built with:** React, Express, Socket.IO
**Multi-connection support added:** December 2024
