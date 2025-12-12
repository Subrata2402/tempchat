/**
 * ChatList Component
 * Sidebar with user info and active chat connections
 */

import { useState } from 'react';
import { useChatContext } from '../context/ChatContext';
import NewConnectionModal from './NewConnectionModal';
import './ChatList.css';

const ChatList = ({ onDisconnect, onShowSnackbar, onConnect, isMobileOpen, onCloseMobile }) => {
  const { myUserId, connections, activeConnectionId, setActiveConnectionId, markAsRead } = useChatContext();
  const [showModal, setShowModal] = useState(false);

  const connectionList = Object.values(connections);

  const copyUserId = () => {
    if (myUserId) {
      navigator.clipboard.writeText(myUserId);
      onShowSnackbar('User ID copied to clipboard!');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile}></div>}
      
      <div className={`chat-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile close button */}
      <button 
        className="sidebar-close-btn"
        onClick={onCloseMobile}
        aria-label="Close sidebar"
      >
        ×
      </button>
      
      {/* User Info Section */}
      <div className="sidebar-user-info">
        {/* Mobile close button */}
        <button 
          className="sidebar-close-btn"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          ×
        </button>
        
        <div className="user-avatar">
          <span className="avatar-text">{myUserId ? myUserId.substring(5, 7).toUpperCase() : 'ME'}</span>
        </div>
        <div className="user-details">
          <div className="user-label">Your ID</div>
          <div className="user-id-container">
            <span className="user-id" title={myUserId}>{myUserId}</span>
            <button className="copy-id-btn" onClick={copyUserId} title="Copy ID">
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Active Chats Section */}
      <div className="sidebar-chats">
        <div className="chats-header">
          <h3>Active Chats</h3>
          <div className="chats-header-actions">
            <span className="chats-count">{connectionList.length}</span>
            <button 
              className="new-chat-btn" 
              onClick={() => setShowModal(true)}
              title="New Connection"
            >
              +
            </button>
          </div>
        </div>
        
        {connectionList.length === 0 ? (
          <div className="no-chats">
            <div className="no-chats-icon">💬</div>
            <p className="no-chats-text">No active chats</p>
            <p className="no-chats-hint">Connect with someone to start chatting</p>
          </div>
        ) : (
          <div className="chat-list-items">
            {connectionList.map((connection) => {
              const lastMessage = connection.messages[connection.messages.length - 1];
              const preview = lastMessage
                ? lastMessage.type === 'text'
                  ? lastMessage.message.substring(0, 35)
                  : lastMessage.type === 'file'
                  ? `📎 ${lastMessage.file.name}`
                  : 'Message'
                : 'No messages yet';

              return (
                <div
                  key={connection.connectionId}
                  className={`chat-list-item ${connection.connectionId === activeConnectionId ? 'active' : ''}`}
                  onClick={() => {
                    setActiveConnectionId(connection.connectionId);
                    markAsRead(connection.connectionId);
                  }}
                >
                  <div className="chat-item-avatar">
                    <span className="chat-avatar-text">
                      {connection.userId.substring(5, 7).toUpperCase()}
                    </span>
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-header">
                      <div className="chat-item-user">{connection.userId}</div>
                      {connection.unreadCount > 0 && (
                        <span className="chat-item-count">{connection.unreadCount}</span>
                      )}
                    </div>
                    <div className="chat-item-preview">{preview}</div>
                  </div>
                  <button
                    className="chat-item-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDisconnect(connection.userId, connection.roomId);
                    }}
                    title="Disconnect"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewConnectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConnect={onConnect}
      />
    </div>
    </>
  );
};

export default ChatList;
