/**
 * ChatInterface Component
 * Main chat UI with messages and input - Multi-connection support
 */

import { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import MessageList from './MessageList';
import ChatList from './ChatList';
import Snackbar from './Snackbar';
import './ChatInterface.css';

const ChatInterface = ({ onSendMessage, onSendFile, onStartTyping, onStopTyping, onDisconnect, requestConnection }) => {
  const { myUserId, getActiveConnection, markAsRead, activeConnectionId } = useChatContext();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mark messages as read when active connection changes
  useEffect(() => {
    if (activeConnectionId) {
      markAsRead(activeConnectionId);
      // Close sidebar on mobile when selecting a chat
      setIsSidebarOpen(false);
    }
  }, [activeConnectionId, markAsRead]);

  const showSnackbar = (message) => {
    setSnackbar({ isOpen: true, message });
  };

  const closeSnackbar = () => {
    setSnackbar({ isOpen: false, message: '' });
  };

  const activeConnection = getActiveConnection();

  if (!activeConnection) {
    return (
      <div className="chat-interface">
        <div className="no-active-chat">
          <p>Select a chat from the list or connect to a new user</p>
        </div>
        <ChatList onDisconnect={onDisconnect} />
      </div>
    );
  }

  const { userId: connectedUserId, roomId, isTyping } = activeConnection;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // Typing indicator logic
    if (value.trim() && roomId && connectedUserId) {
      onStartTyping(roomId, connectedUserId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping(roomId, connectedUserId);
      }, 2000);
    } else {
      onStopTyping(roomId, connectedUserId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = inputMessage.trim();
    if (!message || !roomId || !connectedUserId) return;

    onSendMessage(message, roomId, connectedUserId, 'text');
    setInputMessage('');
    onStopTyping(roomId, connectedUserId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter adds new line (default textarea behavior)
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !roomId || !connectedUserId || uploading) return;

    setUploading(true);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: reader.result
        };

        onSendFile(fileData, roomId, connectedUserId, (error) => {
          console.error('Error sending file:', error);
          showSnackbar('Failed to send file');
          setUploading(false);
        });
        
        setSelectedFile(null);
        setUploading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        showSnackbar('Failed to read file');
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error sending file:', error);
      showSnackbar('Failed to send file');
      setUploading(false);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="chat-interface">
      <ChatList 
        onDisconnect={onDisconnect} 
        onShowSnackbar={showSnackbar} 
        onConnect={requestConnection}
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />
      <div className="chat-main-area">
        {!activeConnection ? (
          <div className="no-active-chat">
            <div className="no-active-chat-icon">💬</div>
            <p>Select a chat from the sidebar or connect to a new user to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              {/* Mobile menu toggle */}
              <button 
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <span className="hamburger-icon"></span>
              </button>
              
              <div className="chat-header-info">
                <div className="connection-status">
                  <span className="status-indicator connected"></span>
                  <span className="status-text">Connected</span>
                </div>
                <div className="chat-users">
                  <span className="user-badge you">You: {myUserId}</span>
                  <span className="user-separator">↔</span>
                  <span className="user-badge them">{connectedUserId}</span>
                </div>
              </div>
              <button 
                onClick={() => onDisconnect(connectedUserId, roomId)} 
                className="disconnect-button" 
                title="Disconnect"
              >
                ✕
              </button>
            </div>

            <MessageList myUserId={myUserId} />

            {isTyping && (
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-text">{connectedUserId} is typing...</span>
              </div>
            )}

            {selectedFile && (
              <div className="file-preview">
                <div className="file-preview-content">
                  <span className="file-icon">📎</span>
                  <div className="file-info">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCancelFile} 
                    className="file-cancel"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSendFile} 
                    className="file-send"
                    disabled={uploading}
                  >
                    {uploading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="file-input"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="attach-button"
                title="Attach file"
                disabled={uploading}
              >
                📎
              </button>
              <textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="chat-input"
                autoFocus
                rows="1"
              />
              <button type="submit" className="send-button" disabled={!inputMessage.trim() || uploading}>
                <span className="send-icon">➤</span>
              </button>
            </form>
          </>
        )}
      </div>
      <Snackbar 
        message={snackbar.message} 
        isOpen={snackbar.isOpen} 
        onClose={closeSnackbar} 
      />
    </div>
  );
};

export default ChatInterface;
