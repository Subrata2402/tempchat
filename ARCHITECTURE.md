# TempChat - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                     http://localhost:5173                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐     │
│  │ Components  │────│  Context     │────│  Custom Hooks   │     │
│  │             │    │  (State)     │    │  (useSocket)    │     │
│  │ - Welcome   │    │              │    │                 │     │
│  │ - Chat      │    │ - User IDs   │    │ - Connect       │     │
│  │ - Messages  │    │ - Messages   │    │ - Send Message  │     │
│  │ - Request   │    │ - Status     │    │ - Typing        │     │
│  └─────────────┘    └──────────────┘    └─────────────────┘     │
│         │                   │                     │             │
│         └───────────────────┴─────────────────────┘             │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │ Socket Service  │                          │
│                    │ (Socket.IO)     │                          │
│                    └────────┬────────┘                          │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                      WebSocket Connection
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    SERVER (Express + Socket.IO)                 │
│                      http://localhost:5000                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                 │
│  │ Socket           │────│  User Service    │                 │
│  │ Controller       │    │                  │                 │
│  │                  │    │ - Generate IDs   │                 │
│  │ - Connections    │    │ - Store Users    │                 │
│  │ - Messages       │    │ - Match Users    │                 │
│  │ - Typing         │    │ - Clean Up       │                 │
│  │ - Disconnect     │    │                  │                 │
│  └──────────────────┘    └──────────────────┘                 │
│           │                       │                            │
│           └───────────┬───────────┘                            │
│                       │                                        │
│              ┌────────▼────────┐                              │
│              │   In-Memory     │                              │
│              │   Storage       │                              │
│              │                 │                              │
│              │ • Active Users  │                              │
│              │ • Connections   │                              │
│              │ • Temp Data     │                              │
│              └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Connection Flow

```
User Opens App
      │
      ▼
Browser connects to Server
      │
      ▼
Server generates random User ID (ABC123)
      │
      ▼
Server sends User ID to Client
      │
      ▼
Client displays User ID on Welcome Screen
```

### 2. Connection Request Flow

```
User A enters User B's ID (XYZ789)
      │
      ▼
Client A → connection:request → Server
      │
      ▼
Server validates and creates connection
      │
      ├──→ Client A: connection:success
      │
      └──→ Client B: connection:request:received
      
User B accepts connection
      │
      ▼
Client B → connection:accept → Server
      │
      ├──→ Client A: connection:accepted
      │
      └──→ Client B: connection:success
      
Both users now connected in a room
```

### 3. Messaging Flow

```
User A types message
      │
      ▼
Client A → message:send → Server
      │
      ▼
Server validates sender is in room
      │
      ▼
Server → message:received → Both Clients
      │
      ├──→ Client A (shows as own message)
      │
      └──→ Client B (shows as received message)
```

### 4. Typing Indicator Flow

```
User A starts typing
      │
      ▼
Client A → typing:start → Server
      │
      ▼
Server → typing:user → Client B only
      │
      ▼
Client B shows "User A is typing..."
      
After 2 seconds of no typing
      │
      ▼
Client A → typing:stop → Server
      │
      ▼
Server → typing:user → Client B
      │
      ▼
Client B hides typing indicator
```

### 5. Disconnection Flow

```
User clicks disconnect OR closes browser
      │
      ▼
Client → disconnect event → Server
      │
      ▼
Server removes user from connections
      │
      ▼
Server → connection:ended → Other User
      │
      ▼
Both users return to Welcome Screen
```

## Component Hierarchy

```
App
 │
 ├─ ChatProvider (Context)
 │   │
 │   ├─ WelcomeScreen
 │   │   └─ Connection Form
 │   │
 │   ├─ ChatInterface
 │   │   ├─ Chat Header
 │   │   ├─ MessageList
 │   │   │   └─ MessageBubble (multiple)
 │   │   ├─ Typing Indicator
 │   │   └─ Chat Input Form
 │   │
 │   └─ ConnectionRequest (Modal)
 │
 └─ useSocket Hook
     └─ socketService
```

## State Management

### Global State (ChatContext)

```javascript
{
  myUserId: "ABC123",           // Current user's ID
  connectedUserId: "XYZ789",    // Connected peer's ID
  roomId: "room-ABC123-XYZ789", // Chat room identifier
  messages: [...],              // Array of message objects
  connectionStatus: "connected",// disconnected|connecting|connected
  pendingRequest: {...},        // Incoming connection request
  isTyping: false              // Other user typing status
}
```

### Server State (UserService)

```javascript
{
  users: Map {
    "socket-id-1" => {
      userId: "ABC123",
      socketId: "socket-id-1",
      connectedTo: "XYZ789",
      connectedAt: "2025-12-11T10:30:00Z"
    },
    "socket-id-2" => {
      userId: "XYZ789",
      socketId: "socket-id-2",
      connectedTo: "ABC123",
      connectedAt: "2025-12-11T10:30:05Z"
    }
  },
  userIdToSocketId: Map {
    "ABC123" => "socket-id-1",
    "XYZ789" => "socket-id-2"
  }
}
```

## Socket.IO Events

### Client Events (Emitted by Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `connection:request` | `{ targetUserId }` | Request to connect with another user |
| `connection:accept` | `{ fromUserId, roomId }` | Accept incoming connection |
| `message:send` | `{ message, roomId }` | Send a chat message |
| `typing:start` | `{ roomId }` | User started typing |
| `typing:stop` | `{ roomId }` | User stopped typing |
| `connection:disconnect` | - | End current conversation |

### Server Events (Emitted by Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `user:assigned` | `{ userId, timestamp }` | User ID assigned on connect |
| `connection:success` | `{ connectedTo, roomId }` | Connection established |
| `connection:request:received` | `{ from, roomId }` | Incoming connection request |
| `connection:accepted` | `{ acceptedBy, roomId }` | Request accepted |
| `connection:error` | `{ message }` | Connection failed |
| `connection:ended` | `{ message }` | Connection terminated |
| `message:received` | `{ id, from, message, timestamp }` | New message |
| `typing:user` | `{ userId, isTyping }` | Typing status update |

## Security Considerations

1. **No Persistence**: All data is temporary and in-memory
2. **Session-based**: User IDs valid only for current session
3. **Room Isolation**: Users can only communicate within their room
4. **Validation**: Server validates all connection and message operations
5. **No Authentication**: No passwords or personal data stored

## Scalability Considerations

Current implementation is suitable for:
- Small to medium user base
- Single server instance
- Development and demo purposes

For production scale:
- Implement Redis for state management
- Add horizontal scaling with Socket.IO adapter
- Implement load balancing
- Add rate limiting
- Implement message queues
