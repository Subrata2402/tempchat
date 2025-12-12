/**
 * Main Entry Point
 * Renders the React application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
