/**
 * WelcomeScreen Component
 * Displays assigned user ID and connection form
 */

import { useState } from 'react';
import { useChatContext } from '../context/ChatContext';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onConnect }) => {
  const { myUserId, connectionStatus } = useChatContext();
  const [targetUserId, setTargetUserId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyUserId = async () => {
    if (!myUserId) return;
    
    try {
      await navigator.clipboard.writeText(myUserId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const userId = targetUserId.trim().toUpperCase();

    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    if (userId === myUserId) {
      setError('You cannot connect to yourself');
      return;
    }

    if (userId.length !== 6) {
      setError('User ID must be 6 characters');
      return;
    }

    onConnect(userId);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1 className="app-title">
            <span className="title-temp">Temp</span>
            <span className="title-chat">Chat</span>
          </h1>
          <p className="app-subtitle">Real-time Temporary Messaging</p>
        </div>

        <div className="user-id-card">
          <div className="user-id-label">Your Temporary ID</div>
          <div className="user-id-display">
            {myUserId ? (
              <>
                <span className="user-id-value">{myUserId}</span>
                <button 
                  onClick={handleCopyUserId}
                  className="copy-button"
                  title="Copy User ID"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </>
            ) : (
              <span className="user-id-loading">Generating...</span>
            )}
          </div>
          <p className="user-id-note">
            Share this ID with someone to start chatting
          </p>
        </div>

        <div className="connection-form-card">
          <h2 className="form-title">Connect to a User</h2>
          <form onSubmit={handleSubmit} className="connection-form">
            <div className="form-group">
              <label htmlFor="targetUserId" className="form-label">
                Enter User ID
              </label>
              <input
                type="text"
                id="targetUserId"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="form-input"
                disabled={connectionStatus === 'connecting' || connectionStatus === 'waiting'}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            {connectionStatus === 'waiting' && (
              <div className="waiting-message">
                Waiting for {targetUserId} to accept...
              </div>
            )}

            <button
              type="submit"
              className="connect-button"
              disabled={!myUserId || connectionStatus === 'connecting' || connectionStatus === 'waiting'}
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <span className="button-spinner"></span>
                  Connecting...
                </>
              ) : connectionStatus === 'waiting' ? (
                <>
                  <span className="button-spinner"></span>
                  Waiting for response...
                </>
              ) : (
                'Connect'
              )}
            </button>
          </form>
        </div>

        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">Temporary & Secure</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Real-time Messaging</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <span className="feature-text">No Registration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
