/**
 * MessageBubble Component
 * Individual message display
 */

import { useState } from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isOwn }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMessageContent = (text) => {
    // Match code blocks with ```language\ncode``` or ```code```
    const codeBlockRegex = /```([a-z]*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let codeBlockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block (with link detection)
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
            {renderTextWithLinks(beforeText)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || '';
      const code = match[2];
      const blockIndex = codeBlockIndex++;
      
      parts.push(
        <div key={`code-${match.index}`} className="code-block-container">
          <div className="code-block-header">
            {language && <span className="code-language">{language}</span>}
            <button
              className="code-copy-btn"
              onClick={() => copyToClipboard(code, blockIndex)}
              title="Copy code"
            >
              {copiedIndex === blockIndex ? '✓' : '📋'}
            </button>
          </div>
          <pre className="code-block">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text (with link detection)
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(
        <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
          {renderTextWithLinks(remainingText)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span style={{ whiteSpace: 'pre-wrap' }}>{renderTextWithLinks(text)}</span>;
  };

  const renderTextWithLinks = (text) => {
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before URL
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add clickable link
      const url = match[0];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="message-link"
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageClick = (data) => {
    // Create a modal overlay to view the image
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: zoom-out;
      padding: 2rem;
    `;
    
    const img = document.createElement('img');
    img.src = data;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
    `;
    
    overlay.appendChild(img);
    overlay.onclick = () => document.body.removeChild(overlay);
    document.body.appendChild(overlay);
  };

  const renderFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="file-message image-message">
          <img 
            src={file.data} 
            alt={file.name} 
            className="message-image"
            onClick={() => handleImageClick(file.data)}
          />
          <div className="file-details-image">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <div className="file-message video-message">
          <video 
            src={file.data} 
            controls
            className="message-video"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          <div className="file-details-video">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }

    if (file.type.startsWith('audio/')) {
      return (
        <div className="file-message audio-message">
          <div className="audio-player-container">
            <div className="audio-icon">🎵</div>
            <div className="audio-info">
              <span className="file-name">{file.name}</span>
              <audio 
                src={file.data} 
                controls
                className="message-audio"
                preload="metadata"
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
          <div className="file-details-audio">
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="file-message document-message">
        <div className="file-content-wrapper">
          <div className="file-icon-large">{getFileIcon(file.type)}</div>
          <div className="file-details">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
        <button 
          onClick={() => handleDownload(file)} 
          className="download-button"
          title="Download file"
        >
          <span className="download-icon">⬇</span>
          <span className="download-text">Download</span>
        </button>
      </div>
    );
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {message.type === 'file' ? (
          <>
            {renderFilePreview(message.file)}
            <span className="message-time">{formatTime(message.timestamp)}</span>
          </>
        ) : (
          <>
            <div className="message-text">{renderMessageContent(message.message)}</div>
            <span className="message-time">{formatTime(message.timestamp)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
