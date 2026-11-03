import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import api from './api';
import { socket } from './socket';
import './App.css';
//import Login from './components/Login.jsx';


const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// backend message -> shape the UI components expect
const normalize = (m) => ({
  id: m._id,
  tempId: m.tempId,
  text: m.content,
  senderId: m.sender?._id || m.sender,
  time: fmtTime(m.createdAt || Date.now()),
  status: m.status,
});

export default function App() {
  const [me, setMe] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'midnight');

  const activeConvRef = useRef(null);
  useEffect(() => { activeConvRef.current = conversationId; }, [conversationId]);

  // ---- theme (own effect so it updates instantly) ----
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socket.disconnect();
    setMe(null);
    setUsers([]);
    setConversations([]);
    setSelectedUserId(null);
    setConversationId(null);
    setChatMessages([]);
  }, []);

  const loadConversations = useCallback(async () => {
    const { data } = await api.get('/conversations');
    setConversations(data.conversations);
  }, []);

  // add or replace a message (matches by real id or by tempId)
  const upsert = useCallback((m) => {
    setChatMessages((prev) => {
      if (prev.some((x) => x.id === m.id)) return prev;
      const i = m.tempId ? prev.findIndex((x) => x.tempId === m.tempId) : -1;
      if (i !== -1) {
        const copy = [...prev];
        copy[i] = m;
        return copy;
      }
      return [...prev, m];
    });
  }, []);

  // ---- load users + conversations after login ----
  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        const [u] = await Promise.all([api.get('/users'), loadConversations()]);
        setUsers(u.data.users);
      } catch (err) {
        if (err.response?.status === 401) logout(); // token expired or invalid
      }
    })();
  }, [me, loadConversations, logout]);

  // ---- socket connection ----
  useEffect(() => {
    if (!me) return;
    socket.connect();

    const onNew = ({ conversationId: cid, message }) => {
      if (cid === activeConvRef.current) upsert(normalize(message));
      loadConversations(); // refresh sidebar previews
    };
    const setOnline = (userId, online) =>
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, online } : u)));
    const onOnline = ({ userId }) => setOnline(userId, true);
    const onOffline = ({ userId }) => setOnline(userId, false);

    socket.on('new_message', onNew);
    socket.on('user_online', onOnline);
    socket.on('user_offline', onOffline);
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    return () => {
      socket.off('new_message', onNew);
      socket.off('user_online', onOnline);
      socket.off('user_offline', onOffline);
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [me, upsert, loadConversations]);

  // ---- open a chat ----
  const selectUser = async (userId) => {
    setSelectedUserId(userId);
    setSidebarOpen(false);
    setChatMessages([]);
    try {
      const { data } = await api.post('/conversations', { participantId: userId });
      const cid = data.conversation._id;
      if (activeConvRef.current) socket.emit('leave_conversation', activeConvRef.current);
      activeConvRef.current = cid;
      setConversationId(cid);
      socket.emit('join_conversation', cid);
      const res = await api.get(`/messages/${cid}`);
      if (activeConvRef.current === cid) setChatMessages(res.data.messages.map(normalize));
    } catch (err) {
      console.error('Could not open chat', err);
    }
  };

  // ---- send ----
  const handleSend = (e) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content || !conversationId) return;

    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    upsert({ id: tempId, tempId, text: content, senderId: me.id, time: fmtTime(Date.now()), status: 'pending' });
    setInputValue('');

    socket.emit('send_message', { conversationId, content, tempId }, (res) => {
      if (res?.error) {
        setChatMessages((prev) => prev.filter((x) => x.tempId !== tempId));
        alert(res.error);
      } else if (res?.message) {
        upsert(normalize(res.message));
      }
    });
  };

  if (!me) return <Login onAuth={setMe} />;

  // sidebar rows: every other user + last message of your chat with them
  const sidebarUsers = users.map((u) => {
    const convo = conversations.find(
      (c) => !c.isGroup && c.participants.some((p) => p._id === u._id)
    );
    return {
      id: u._id,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      online: u.online,
      lastMessage: convo?.lastMessage?.content || '',
      time: convo?.lastMessage ? fmtTime(convo.lastMessage.createdAt) : '',
    };
  });
  const selectedUser = sidebarUsers.find((u) => u.id === selectedUserId);

  return (
    <div className="app">
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        theme={theme}
        setTheme={setTheme}
        users={sidebarUsers}
        selectedUserId={selectedUserId}
        onSelectUser={selectUser}
        open={sidebarOpen}
        onLogout={logout}
      />

      <div className="chat-main">
        <ChatWindow
          currentUser={me}
          selectedUser={selectedUser}
          messages={chatMessages}
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSend={handleSend}
          onBack={() => setSidebarOpen(true)}
        />
      </div>

      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
    </div>
  );
}
