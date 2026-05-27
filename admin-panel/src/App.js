import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, DollarSign, Activity, Lock, Plus, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [players, setPlayers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const playersRes = await axios.get(`${API_URL}/admin/players`, config);
      const transRes = await axios.get(`${API_URL}/admin/transactions`, config);
      setPlayers(playersRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) handleLogout();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      if (res.data.user.isAdmin) {
        setToken(res.data.token);
        localStorage.setItem('adminToken', res.data.token);
      } else {
        alert('Not an admin');
      }
    } catch (err) {
      alert('Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const createPlayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/admin/players`, { username: newPlayer.username, initialPassword: newPlayer.password }, config);
      setNewPlayer({ username: '', password: '' });
      fetchData();
    } catch (err) {
      alert('Error creating player');
    } finally {
      setLoading(false);
    }
  };

  const adjustBalance = async (userId, amount, type) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/admin/balance`, { userId, amount: parseFloat(amount), type }, config);
      fetchData();
    } catch (err) {
      alert('Error updating balance');
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#2a2a2a', padding: '2rem', borderRadius: '8px', width: '300px' }}>
          <h2 style={{ color: '#d4af37', textAlign: 'center' }}>LoneStar Admin</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="admin-username">Username</label>
            <input id="admin-username" type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <button disabled={authLoading} type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#d4af37', border: 'none', borderRadius: '4px', cursor: authLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: authLoading ? 0.7 : 1 }}>
            {authLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'sans-serif', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#d4af37' }}>LoneStar Luck <span style={{ color: '#888', fontSize: '0.8rem' }}>ADMIN PORTAL</span></h1>
        <button aria-label="Logout" onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#888', border: '1px solid #333', padding: '5px 15px', cursor: 'pointer' }}><LogOut size={16} /></button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <section>
          <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3><Plus size={18} /> Add New Player</h3>
            <form onSubmit={createPlayer}>
              <input placeholder="Username" value={newPlayer.username} onChange={e => setNewPlayer({ ...newPlayer, username: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', border: 'none', color: 'white' }} />
              <input placeholder="Initial Password" value={newPlayer.password} onChange={e => setNewPlayer({ ...newPlayer, password: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', border: 'none', color: 'white' }} />
              <button disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#d4af37', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Adding...' : 'Add Player'}
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '8px' }}>
            <h3><Activity size={18} /> Recent Transactions</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {transactions.map(t => (
                <div key={t.id} style={{ borderBottom: '1px solid #333', padding: '10px 0', fontSize: '0.9rem' }}>
                  <span style={{ color: '#d4af37' }}>{t.username}</span>: {t.type} <span style={{ color: t.type === 'load' ? '#4caf50' : '#f44336' }}>${t.amount}</span>
                  <div style={{ color: '#666', fontSize: '0.7rem' }}>{new Date(t.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '8px' }}>
          <h3><Users size={18} /> Player Management</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '10px' }}>Username</th>
                <th>Balance</th>
                <th>Vault</th>
                <th>Password (Admin View)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '10px' }}>{p.username}</td>
                  <td>${p.balance}</td>
                  <td>${p.vault_balance}</td>
                  <td style={{ color: p.password_changed_by_user ? '#ff9800' : '#888' }}>{p.plain_password} {p.password_changed_by_user && '(User Changed)'}</td>
                  <td>
                    <button aria-label={`Load balance for ${p.username}`} onClick={() => {
                      const amt = prompt('Amount to load?');
                      if (amt) adjustBalance(p.id, amt, 'load');
                    }} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '5px', marginRight: '5px', cursor: 'pointer' }}>Load</button>
                    <button aria-label={`Cash out for ${p.username}`} onClick={() => {
                      const amt = prompt('Amount to cash out?');
                      if (amt) adjustBalance(p.id, amt, 'cashout');
                    }} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}>Cashout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;
