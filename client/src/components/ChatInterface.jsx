/**
 * ChatInterface Component
 * Main chat UI with messages and input - Multi-connection support
 */

import { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import MessageList from './MessageList';
import ChatList from './ChatList';
import Snackbar from './Snackbar';
import '../styles/components/ChatInterface.css';

const ChatInterface = ({ onSendMessage, onSendFile, onStartTyping, onStopTyping, onDisconnect, requestConnection }) => {
  const { myUserId, getActiveConnection, markAsRead, activeConnectionId, addMessage } = useChatContext();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

    // Add message to UI immediately
    const textMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: myUserId,
      to: connectedUserId,
      message: message,
      type: 'text',
      roomId,
      timestamp: new Date().toISOString()
    };
    
    addMessage(activeConnectionId, textMessage);
    
    // Send to server
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

    // Check file size (max 1GB)
    const maxSize = 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      showSnackbar('File size must be less than 1GB');
      return;
    }

    setSelectedFile(file);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !roomId || !connectedUserId || uploading) return;

    setUploading(true);
    setUploadProgress(5);
    
    try {
      const reader = new FileReader();
      
      // Track reading progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 80); // 0-80% for reading
          setUploadProgress(Math.max(progress, 5));
        }
      };
      
      reader.onload = () => {
        setUploadProgress(85);
        
        const fileData = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: reader.result
        };

        // Create message that will be sent
        const fileMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from: myUserId,
          to: connectedUserId,
          type: 'file',
          file: fileData,
          roomId,
          timestamp: new Date().toISOString()
        };
        
        // Add to UI immediately
        addMessage(activeConnectionId, fileMessage);
        
        setUploadProgress(90);
        
        // Send to server
        onSendFile(fileData, roomId, connectedUserId, (error) => {
          if (error) {
            console.error('Error sending file:', error);
            showSnackbar('Failed to send file');
          }
        });
        
        setUploadProgress(100);
        
        // Clean up
        setTimeout(() => {
          setSelectedFile(null);
          setUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 300);
      };

      reader.onerror = () => {
        showSnackbar('Failed to read file');
        setUploading(false);
        setUploadProgress(0);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error sending file:', error);
      showSnackbar('Failed to send file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
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
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    {uploading && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{uploadProgress}%</span>
                      </div>
                    )}
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
                    {uploading ? 'Uploading...' : 'Send'}
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
