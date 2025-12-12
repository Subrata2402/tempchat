/**
 * Snackbar Component
 * Shows temporary notification messages
 */

import { useEffect } from 'react';
import '../styles/components/Snackbar.css';

const Snackbar = ({ message, isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="snackbar">
      <span className="snackbar-icon">✓</span>
      <span className="snackbar-message">{message}</span>
    </div>
  );
};

export default Snackbar;
