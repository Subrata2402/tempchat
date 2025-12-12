/**
 * NewConnectionModal Component
 * Modal for creating new connections by entering user ID
 */

import { useState } from 'react';
import '../styles/components/NewConnectionModal.css';

const NewConnectionModal = ({ isOpen, onClose, onConnect }) => {
  const [targetUserId, setTargetUserId] = useState('');

  const handleConnect = () => {
    if (targetUserId.trim()) {
      onConnect(targetUserId.trim());
      setTargetUserId('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConnect();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    setTargetUserId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="new-connection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Connection</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <label htmlFor="userId">Enter User ID</label>
          <input
            id="userId"
            type="text"
            placeholder="Paste or type User ID here..."
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="connect-btn" 
            onClick={handleConnect}
            disabled={!targetUserId.trim()}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConnectionModal;
