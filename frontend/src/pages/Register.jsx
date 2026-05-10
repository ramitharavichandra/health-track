import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';
import styles from './Auth.module.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', weight: '', height: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.age && Number(form.age) < 1) return setError('Age must be at least 1');
    if (form.weight && Number(form.weight) <= 0) return setError('Weight must be positive');
    if (form.height && Number(form.height) <= 0) return setError('Height must be positive');
    setLoading(true);
    try {
      await register({ ...form, age: Number(form.age) || undefined, weight: Number(form.weight) || undefined, height: Number(form.height) || undefined });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const minFor = { age: 1, weight: 0.1, height: 1 };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className={styles.field}>
      <label>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        required={['name','email','password'].includes(key)}
        min={type === 'number' ? (minFor[key] ?? 0) : undefined}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Activity size={36} color="#6366f1" />
          <h1>HealthTrack</h1>
          <p>Create your account</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          {field('name', 'Full Name', 'text', 'John Doe')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', '••••••••')}
          <div className={styles.row}>
            {field('age', 'Age', 'number', '25')}
            {field('weight', 'Weight (kg)', 'number', '70')}
            {field('height', 'Height (cm)', 'number', '170')}
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
