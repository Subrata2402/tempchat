/**
 * Main App Component
 * Orchestrates the application flow with multi-connection support
 */

import { useState } from 'react';
import { useChatContext } from './context/ChatContext';
import { useSocket } from './hooks/useSocket';
import WelcomeScreen from './components/WelcomeScreen';
import ConnectionRequest from './components/ConnectionRequest';
import ChatInterface from './components/ChatInterface';
import Modal from './components/Modal';
import './App.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

function App() {
  const { connections, activeConnectionId, pendingRequests } = useChatContext();
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  
  const {
    requestConnection,
    acceptConnection,
    declineConnection,
    sendMessage,
    sendFile,
    startTyping,
    stopTyping,
    disconnectChat
  } = useSocket(SERVER_URL, setModal);

  const handleConnect = (targetUserId) => {
    requestConnection(targetUserId);
  };

  const handleAcceptConnection = (fromUserId, roomId, connectionId) => {
    acceptConnection(fromUserId, roomId, connectionId);
  };

  const handleDeclineConnection = (fromUserId, roomId, connectionId) => {
    declineConnection(fromUserId, roomId, connectionId);
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const hasActiveConnections = Object.keys(connections).length > 0;

  return (
    <div className="app">
      <div className="app-container">
        {hasActiveConnections ? (
          <ChatInterface
            onSendMessage={sendMessage}
            onSendFile={sendFile}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            onDisconnect={disconnectChat}
            requestConnection={requestConnection}
          />
        ) : (
          <WelcomeScreen onConnect={handleConnect} />
        )}

        {pendingRequests.map((request) => (
          <ConnectionRequest
            key={request.connectionId}
            request={request}
            onAccept={handleAcceptConnection}
            onDecline={handleDeclineConnection}
          />
        ))}

        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={closeModal}
        />
      </div>
    </div>
  );
}

export default App;
