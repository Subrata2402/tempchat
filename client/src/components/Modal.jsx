/**
 * Modal Component
 * Reusable modal for alerts and notifications
 */

import './Modal.css';

const Modal = ({ isOpen, title, message, type = 'info', onClose, icon }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">{getIcon()}</div>
        {title && <h2 className="modal-title">{title}</h2>}
        <p className="modal-message">{message}</p>
        <button onClick={onClose} className="modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;
