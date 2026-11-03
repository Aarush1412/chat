import { useState } from 'react';
import api from '../api';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const { data } = await api.post(`/auth/${mode}`, body);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot reach the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        {mode === 'register' && (
          <input className="auth-input" placeholder="Name" value={name}
            onChange={(e) => setName(e.target.value)} required />
        )}
        <input className="auth-input" type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="auth-input" type="password" placeholder="Password (min 6 characters)"
          value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        {error && <div className="auth-error">{error}</div>}
        <button className="send-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <button type="button" className="auth-switch"
          onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'No account? Sign up' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}
