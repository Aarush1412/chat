import { useEffect, useRef } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

export default function ChatWindow({ currentUser, selectedUser, messages, inputValue, onInputChange, onSend, onBack }) {
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="chat-window">
      <header className="chat-header">
        <div className="back-btn" title="Back" onClick={onBack}>‹</div>
        <div className="chat-user">
          {selectedUser && (
            <>
              <img src={selectedUser.avatar} alt={selectedUser.name} className="chat-avatar" />
              <div className="chat-user-info">
                <div className="chat-user-name">{selectedUser.name}</div>
                <div className={`chat-status ${selectedUser.online ? 'online' : 'offline'}`}>
                  {selectedUser.online ? 'Online' : 'Offline'}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="chat-actions">
          <button className="icon-btn" aria-label="Voice call">📞</button>
          <button className="icon-btn" aria-label="Video call">📹</button>
          <button className="icon-btn" aria-label="More options">⋮</button>
        </div>
      </header>

      <div className="messages-container" ref={messagesContainerRef}>
        {!selectedUser && <div className="empty-note">Select a chat to start messaging</div>}
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} isSent={msg.senderId === currentUser.id} />
        ))}
      </div>

      <MessageInput value={inputValue} onChange={onInputChange} onSend={onSend} disabled={!selectedUser} />
    </main>
  );
}
