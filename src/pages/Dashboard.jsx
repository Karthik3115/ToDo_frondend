import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border)' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>
    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{value || '—'}</span>
  </div>
);

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    year: user?.year || '',
    Department: user?.Department || '',
    Age: user?.Age || '',
    password: '',
  });
  const [serverMsg, setServerMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setServerMsg({ type: '', text: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (payload.year) payload.year = Number(payload.year);
      if (payload.Age) payload.Age = Number(payload.Age);
      if (!payload.year) delete payload.year;
      if (!payload.Age) delete payload.Age;

      const { data } = await api.patch('/user/updateuser', payload);
      updateUser(data.user);
      setServerMsg({ type: 'success', text: 'Profile updated successfully!' });
      setForm((f) => ({ ...f, password: '' }));
      setEditMode(false);
    } catch (err) {
      if (!err.response) {
        setServerMsg({ type: 'error', text: 'Cannot reach the server. Please check your connection and MongoDB status.' });
      } else {
        const msg = err.response?.data?.message || 'Update failed.';
        setServerMsg({ type: 'error', text: msg });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    <div className="min-h-screen px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">TodoApp</span>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 relative z-10">
        {/* Profile summary card */}
        <div className="glass-card p-6 md:col-span-1 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <p className="text-lg font-semibold text-white">@{user?.username}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
          <div className="mt-4 flex gap-2 flex-wrap justify-center">
            {user?.Department && (
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.3)' }}>
                {user.Department}
              </span>
            )}
            {user?.year && (
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}>
                Year {user.year}
              </span>
            )}
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>

        {/* Details / Edit card */}
        <div className="glass-card p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Profile Details</h2>
            <button
              id="edit-toggle-btn"
              onClick={() => setEditMode(!editMode)}
              className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
              style={{ background: editMode ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)', color: editMode ? '#fca5a5' : 'var(--accent-light)', border: `1px solid ${editMode ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}` }}
            >
              {editMode ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          {serverMsg.text && (
            <div className={`mb-5 ${serverMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {serverMsg.type === 'success' ? '✅' : '⚠️'} {serverMsg.text}
            </div>
          )}

          {!editMode ? (
            /* Read-only view */
            <div>
              <InfoRow label="User ID" value={user?.userId} />
              <InfoRow label="Username" value={user?.username} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Year" value={user?.year} />
              <InfoRow label="Department" value={user?.Department} />
              <InfoRow label="Age" value={user?.Age} />
              <InfoRow label="Last Updated" value={user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'} />
            </div>
          ) : (
            /* Edit form */
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Username</label>
                  <input id="upd-username" name="username" value={form.username} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input id="upd-email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input id="upd-year" name="year" type="number" value={form.year} onChange={handleChange} className="input-field" min={1} max={5} />
                </div>
                <div>
                  <label className="form-label">Age</label>
                  <input id="upd-age" name="Age" type="number" value={form.Age} onChange={handleChange} className="input-field" />
                </div>
              </div>
              <div>
                <label className="form-label">Department</label>
                <input id="upd-dept" name="Department" value={form.Department} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="form-label">New Password <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(leave blank to keep current)</span></label>
                <input id="upd-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="input-field" />
              </div>
              <button id="save-btn" type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
