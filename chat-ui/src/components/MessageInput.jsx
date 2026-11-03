export default function MessageInput({ value, onChange, onSend, disabled }) {
  return (
    <div className="input-area">
      <form onSubmit={onSend} className="input-form">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Type a message..."
          className="message-input"
          disabled={disabled}
        />
        <button type="submit" className="send-btn" disabled={disabled}>Send</button>
      </form>
    </div>
  );
}