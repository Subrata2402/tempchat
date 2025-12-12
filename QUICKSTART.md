# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies (Already Done!)
All dependencies have been installed. Skip to Step 2.

### Step 2: Start the Application

Open a terminal and run:

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend dev server (port 5173).

### Step 3: Open Your Browser

Navigate to: **http://localhost:5173**

---

## 🧪 Testing the Application

### Test with Two Browser Windows

1. **Window 1:**
   - Open http://localhost:5173
   - Note your assigned User ID (e.g., `ABC123`)

2. **Window 2:**
   - Open http://localhost:5173 in another window/tab (or incognito)
   - Note your assigned User ID (e.g., `XYZ789`)

3. **Connect:**
   - In Window 1, enter the User ID from Window 2 (`XYZ789`)
   - Click "Connect"
   - In Window 2, accept the connection request
   - Start chatting!

---

## 📝 Available Commands

```bash
# Start both client and server
npm run dev

# Start only server
npm run dev:server

# Start only client
npm run dev:client

# Build client for production
npm run build:client
```

---

## 🔧 Troubleshooting

**Port Already in Use?**
- Backend (5000): Change `PORT` in `server/.env`
- Frontend (5173): Change `port` in `client/vite.config.js`

**Can't Connect?**
- Make sure both servers are running
- Check console for errors
- Verify firewall settings

**User ID Not Showing?**
- Check browser console for errors
- Ensure backend is running on port 5000
- Try refreshing the page

---

## 📁 Project Structure

```
tempchat/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/    # UI components
│       ├── context/       # State management
│       ├── hooks/         # Custom hooks
│       └── services/      # Socket.IO client
│
└── server/          # Express backend
    └── src/
        ├── controllers/   # Socket handlers
        ├── services/      # Business logic
        └── utils/         # Helper functions
```

---

## 🎯 Key Features

✅ Random temporary user IDs  
✅ Real-time messaging  
✅ Typing indicators  
✅ Connection requests  
✅ Clean, modern UI  
✅ Mobile responsive  

---

## 📚 Need More Help?

See the main **README.md** for detailed documentation.

Happy Chatting! 💬
