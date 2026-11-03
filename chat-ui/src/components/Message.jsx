export default function Message({ message, isSent }) {
  return (
    <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
      <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
        {message.text}
        <div className="message-meta">
          <span className="time">{message.time}</span>
          {isSent && (
            <span className="status">
              {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
