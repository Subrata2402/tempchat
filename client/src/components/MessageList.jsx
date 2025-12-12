/**
 * MessageList Component
 * Displays all chat messages for the active connection
 */

import { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import './MessageList.css';

const MessageList = ({ myUserId }) => {
  const { getActiveConnection } = useChatContext();
  const messagesEndRef = useRef(null);

  const activeConnection = getActiveConnection();
  const messages = activeConnection?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-messages">
          <div className="empty-icon">💬</div>
          <p className="empty-text">No messages yet</p>
          <p className="empty-subtext">Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.from === myUserId}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
