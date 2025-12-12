# TempChat Project Structure

## Overview
A real-time chat application built with React, Socket.IO, and Express.

## Directory Structure

```
tempchat/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ChatInterface.jsx    # Main chat interface with sidebar
│   │   │   ├── ChatList.jsx         # Sidebar with user info and active chats
│   │   │   ├── ConnectionRequest.jsx # Connection request notification
│   │   │   ├── MessageBubble.jsx    # Individual message display with code blocks
│   │   │   ├── MessageList.jsx      # Messages container
│   │   │   ├── Modal.jsx            # Generic modal component
│   │   │   ├── NewConnectionModal.jsx # New connection dialog
│   │   │   ├── Snackbar.jsx         # Toast notifications
│   │   │   └── WelcomeScreen.jsx    # Initial connection screen
│   │   │
│   │   ├── context/                 # React Context API
│   │   │   └── ChatContext.jsx      # Global state management
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useSocket.js         # Socket.IO connection management
│   │   │
│   │   ├── services/                # External services
│   │   │   └── socketService.js     # Socket.IO client wrapper
│   │   │
│   │   ├── styles/                  # CSS files organized by type
│   │   │   ├── components/          # Component-specific styles
│   │   │   │   ├── ChatInterface.css
│   │   │   │   ├── ChatList.css
│   │   │   │   ├── ConnectionRequest.css
│   │   │   │   ├── MessageBubble.css
│   │   │   │   ├── MessageList.css
│   │   │   │   ├── Modal.css
│   │   │   │   ├── NewConnectionModal.css
│   │   │   │   ├── Snackbar.css
│   │   │   │   └── WelcomeScreen.css
│   │   │   ├── App.css              # App-level styles
│   │   │   └── index.css            # Global styles and CSS variables
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Application entry point
│   │
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   ├── vite.config.js              # Vite configuration
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Backend Node.js application
│   ├── src/
│   │   ├── controllers/             # Socket event handlers
│   │   │   └── socketController.js  # Socket.IO event logic
│   │   │
│   │   ├── services/                # Business logic
│   │   │   └── userService.js       # User and connection management
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   └── logger.js            # Colored console logging
│   │   │
│   │   └── index.js                 # Server entry point
│   │
│   ├── .env                         # Environment variables
│   └── package.json                 # Backend dependencies
│
├── ARCHITECTURE.md                  # System architecture documentation
├── PROJECT_STRUCTURE.md            # This file
└── README.md                        # Project documentation

```

## Key Features by Component

### Frontend Components

**ChatInterface.jsx**
- Main chat window layout
- Integrates sidebar and message area
- Handles message sending (text/file)
- Typing indicators
- Mobile-responsive with hamburger menu

**ChatList.jsx**
- User information display
- Active connections list
- Connection count badges
- Unread message counts
- New connection button

**MessageBubble.jsx**
- Individual message rendering
- Code block syntax highlighting with copy button
- Clickable URL detection
- Image preview with zoom
- Audio/Video players
- File download functionality

**NewConnectionModal.jsx**
- Modal for creating new connections
- User ID input validation
- Keyboard shortcuts (Enter/Escape)

### Context & Hooks

**ChatContext.jsx**
- Multi-connection state management
- Message history per connection
- Unread count tracking
- Active connection selection

**useSocket.js**
- Socket.IO event listeners
- Connection management
- Message sending/receiving
- Typing indicators
- Disconnect handling

### Backend Structure

**socketController.js**
- Connection request/accept/decline
- Message routing
- File transfer
- Typing indicators
- Disconnect cleanup

**userService.js**
- User session management
- Active connections tracking
- Connection validation

## Styling Organization

All CSS files are organized in the `styles/` directory:
- **components/**: Component-specific styles
- **App.css**: Application-level styles
- **index.css**: Global styles, CSS variables, and resets

## State Management

- **Local State**: Component-level state with useState
- **Context API**: Global chat state (connections, messages, users)
- **Refs**: Socket management and preventing re-renders

## Communication Flow

1. Client connects → Server assigns User ID
2. User A requests connection → Server notifies User B
3. User B accepts → Server creates room, notifies both
4. Messages sent to room → Server broadcasts to participants
5. Disconnect → Server cleans up and notifies other user

## Development Notes

- Vite for fast development and building
- Socket.IO for real-time bidirectional communication
- React Context for state management
- Fish shell terminal commands
- ES Modules throughout (import/export)
