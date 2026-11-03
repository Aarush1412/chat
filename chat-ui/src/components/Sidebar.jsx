import { useState } from 'react';
import UserItem from './UserItem';

const THEMES = ["midnight", "forest", "sunset", "ocean", "paper"];

export default function Sidebar({ users, selectedUserId, onSelectUser, theme, setTheme, open, onLogout }) {
  const [query, setQuery] = useState('');
  const shown = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Chats</h2>

        <select className="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
          {THEMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="search-box">
          <input type="text" placeholder="Search..." value={query}
            onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="user-list">
        {shown.length === 0 && <div className="empty-note">No users yet. Sign up a second account to chat.</div>}
        {shown.map((user) => (
          <UserItem key={user.id} user={user} isActive={user.id === selectedUserId} onSelect={onSelectUser} />
        ))}
      </div>

      <button className="logout-btn" onClick={onLogout}>Log out</button>
    </aside>
  );
}
