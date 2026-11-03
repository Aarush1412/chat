export default function UserItem({ user, isActive, onSelect }) {
  return (
    <div
      className={`user-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(user.id)}
    >
      <div className="avatar">
        <img src={user.avatar} alt={user.name} />
        {user.online && <span className="status-dot online"></span>}
      </div>
      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-preview">{user.lastMessage || "No messages yet"}</div>
      </div>
      <div className="user-time">{user.time}</div>
    </div>
  );
}
