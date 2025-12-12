# TempChat - Real-time Temporary Chat Application

A modern, real-time chat application where users can communicate temporarily without registration. Each user receives a random temporary ID valid only for the current session.

![TempChat](https://img.shields.io/badge/React-18.2.0-blue) ![Express](https://img.shields.io/badge/Express-4.18.2-green) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-black)

## Features

✨ **No Registration Required** - Just open and chat  
🔑 **Temporary User IDs** - Random 6-character IDs generated on connection  
⚡ **Real-time Messaging** - Instant message delivery using WebSocket  
🔒 **Session-based** - All data is temporary and cleared when users disconnect  
👥 **Peer-to-Peer Connection** - Connect directly with another user using their ID  
💬 **Typing Indicators** - See when the other user is typing  
📱 **Responsive Design** - Works seamlessly on desktop and mobile  

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - WebSocket client
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **ES Modules** - Modern JavaScript module system

## Project Structure

```
tempchat/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── WelcomeScreen.css
│   │   │   ├── ConnectionRequest.jsx
│   │   │   ├── ConnectionRequest.css
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── ChatInterface.css
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageList.css
│   │   │   ├── MessageBubble.jsx
│   │   │   └── MessageBubble.css
│   │   ├── context/          # React context for state management
│   │   │   └── ChatContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useSocket.js
│   │   ├── services/         # Service layer
│   │   │   └── socketService.js
│   │   ├── App.jsx           # Main App component
│   │   ├── App.css
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   └── socketController.js
│   │   ├── services/         # Business logic
│   │   │   └── userService.js
│   │   ├── utils/            # Utility functions
│   │   │   └── logger.js
│   │   └── index.js          # Server entry point
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── package.json              # Root package.json
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd tempchat

# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install:all
```

## Running the Application

### Development Mode

Run both client and server concurrently:

```bash
npm run dev
```

This will start:
- Frontend dev server at `http://localhost:5173`
- Backend server at `http://localhost:5000`

### Run Separately

**Start Backend:**
```bash
npm run dev:server
```

**Start Frontend:**
```bash
npm run dev:client
```

## Environment Variables

### Server (.env)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (.env)
```env
VITE_SERVER_URL=http://localhost:5000
```

## How to Use

1. **Open the Application** - Navigate to `http://localhost:5173`

2. **Get Your ID** - The system automatically assigns you a temporary user ID (e.g., `ABC123`)

3. **Share Your ID** - Share your ID with someone you want to chat with

4. **Connect** - Enter the other user's ID in the connection form and click "Connect"

5. **Chat** - Once connected, start sending messages in real-time

6. **Disconnect** - Click the disconnect button (✕) to end the conversation

## API Endpoints

### REST Endpoints

```
GET /health              # Health check endpoint
GET /api/info           # API information
```

### Socket.IO Events

#### Client → Server
- `connection:request` - Request connection to another user
- `connection:accept` - Accept incoming connection request
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `connection:disconnect` - Disconnect from current chat

#### Server → Client
- `user:assigned` - Receive assigned user ID
- `connection:success` - Connection established
- `connection:request:received` - Incoming connection request
- `connection:accepted` - Connection request accepted
- `connection:error` - Connection error
- `connection:ended` - Connection terminated
- `message:received` - New message received
- `typing:user` - Other user typing status

## Architecture Highlights

### Backend Architecture
- **Service Layer Pattern** - Business logic separated into services
- **Event-driven Architecture** - Socket.IO handles real-time events
- **In-memory Storage** - User data stored temporarily in memory
- **Room-based Communication** - Isolated chat rooms for each connection

### Frontend Architecture
- **Context API** - Global state management
- **Custom Hooks** - Reusable logic for Socket.IO integration
- **Component-based** - Modular and maintainable UI components
- **Service Layer** - Socket.IO client abstraction

## Key Features Implementation

### Temporary User IDs
- 6-character alphanumeric IDs (e.g., `A1B2C3`)
- Generated on connection
- Unique across active sessions
- Automatically cleaned up on disconnect

### Session Management
- No database required
- All data stored in memory
- Automatic cleanup on disconnect
- No persistent user data

### Real-time Communication
- WebSocket-based (Socket.IO)
- Instant message delivery
- Typing indicators
- Connection status updates

## Development

### Adding New Features

1. **Backend**: Add socket events in `socketController.js`
2. **Frontend**: Add event handlers in `useSocket.js` hook
3. **UI**: Create components in `client/src/components/`

### Code Style
- ES6+ features
- Functional components with hooks
- CSS modules for styling
- Comprehensive comments

## Production Deployment

### Build Frontend
```bash
cd client
npm run build
```

### Environment Setup
Update environment variables for production:
- Set proper CORS origins
- Update server URLs
- Set NODE_ENV to `production`

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Heroku
- **Note**: Ensure WebSocket support on hosting platform

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Limitations

- No message persistence
- No chat history
- Single active connection per user
- No file sharing
- No group chats

## Future Enhancements

- [ ] Message history (in-session)
- [ ] File/image sharing
- [ ] Group chat support
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Audio/video calls
- [ ] End-to-end encryption
- [ ] Multiple simultaneous connections
- [ ] User status (online/offline)
- [ ] Dark mode

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ using React and Express**
