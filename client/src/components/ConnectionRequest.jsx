/**
 * ConnectionRequest Component
 * Shows incoming connection request
 */

import './ConnectionRequest.css';

const ConnectionRequest = ({ request, onAccept, onDecline }) => {
  if (!request) return null;

  return (
    <div className="connection-request-overlay">
      <div className="connection-request-modal">
        <div className="request-icon">📞</div>
        <h2 className="request-title">Incoming Connection</h2>
        <p className="request-message">
          User <strong>{request.from}</strong> wants to connect with you
        </p>
        <div className="request-actions">
          <button
            onClick={() => onAccept(request.from, request.roomId, request.connectionId)}
            className="accept-button"
          >
            Accept
          </button>
          <button 
            onClick={() => onDecline(request.from, request.roomId, request.connectionId)} 
            className="decline-button"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequest;
