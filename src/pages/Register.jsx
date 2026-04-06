import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Field = ({ name, label, type = 'text', placeholder, required = false, value, onChange, error }) => (
  <div>
    <label className="form-label">{label}{required && <span style={{ color: 'var(--error)' }}> *</span>}</label>
    <input
      id={`reg_v2_${name}`}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field"
      autoComplete="new-password"
    />
    {error && <p className="error-msg">{error}</p>}
  </div>
);

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    year: '', Department: '', Age: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.length < 3) errs.username = 'Min 3 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.year && (isNaN(form.year) || form.year < 1 || form.year > 5)) errs.year = 'Year must be 1–5';
    if (form.Age && (isNaN(form.Age) || form.Age < 1 || form.Age > 120)) errs.Age = 'Invalid age';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.year) delete payload.year;
      if (!payload.Age) delete payload.Age;
      if (!payload.Department) delete payload.Department;
      if (payload.year) payload.year = Number(payload.year);
      if (payload.Age) payload.Age = Number(payload.Age);

      const { data } = await api.post('/auth/register', payload);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setServerError('Cannot reach the server. Please make sure the backend is running.');
      } else if (err.response.status === 503) {
        setServerError(
          <div>
            <strong>Database connection failed.</strong><br />
            Your IP might not be whitelisted in MongoDB Atlas.<br />
            <a 
              href="https://cloud.mongodb.com/v2/69d345b50449c3015882e2c1#/security/network/whitelist" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#fff', textDecoration: 'underline', fontWeight: 'bold' }}
            >
              Click here to add your IP to Atlas Network Access
            </a>
          </div>
        );
      } else {
        const msg = err.response?.data?.message || 'Registration failed. Please try again.';
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      </div>

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join TodoApp today</p>
        </div>

        {serverError && <div className="alert-error mb-5">⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Field 
            name="username" 
            label="Username" 
            placeholder="johndoe" 
            required 
            value={form.username}
            onChange={handleChange}
            error={errors.username}
          />
          <Field 
            name="email" 
            label="Email address" 
            type="email" 
            placeholder="you@example.com" 
            required 
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Field 
            name="password" 
            label="Password" 
            type="password" 
            placeholder="Min 6 characters" 
            required 
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          {/* 3-col row */}
          <div className="grid grid-cols-3 gap-3">
            <Field 
              name="year" 
              label="Year" 
              placeholder="1–5" 
              type="number" 
              value={form.year}
              onChange={handleChange}
              error={errors.year}
            />
            <Field 
              name="Age" 
              label="Age" 
              placeholder="e.g. 20" 
              type="number" 
              value={form.Age}
              onChange={handleChange}
              error={errors.Age}
            />
            <div>
              <label className="form-label">Department</label>
              <input
                id="reg_v2_Dept"
                name="Department"
                value={form.Department}
                onChange={handleChange}
                placeholder="CS"
                className="input-field"
                autoComplete="off"
              />
            </div>
          </div>

          <button id="register-submit" type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--accent-light)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
