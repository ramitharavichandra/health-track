import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Goals.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', age: user?.age || '', weight: user?.weight || '', height: user?.height || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const { data } = await api.put('/auth/profile', { name: form.name, age: Number(form.age) || undefined, weight: Number(form.weight) || undefined, height: Number(form.height) || undefined });
      updateUser(data);
      setSuccess('Profile updated!');
    } finally {
      setSaving(false);
    }
  };

  const bmi = form.weight && form.height ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Profile</h2>
        <p>Update your personal information</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {bmi && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>BMI</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-light)' }}>{bmi}</div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{bmiLabel}</div>
          </div>
        )}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Full Name</label>
            <div className={styles.inputWrap}>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
          </div>
          <div className={styles.field}>
            <label>Age</label>
            <div className={styles.inputWrap}>
              <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} min={1} />
              <span className={styles.unit}>yrs</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>Weight</label>
            <div className={styles.inputWrap}>
              <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} min={0} step={0.1} />
              <span className={styles.unit}>kg</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>Height</label>
            <div className={styles.inputWrap}>
              <input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} min={0} />
              <span className={styles.unit}>cm</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Email:</strong> {user?.email}
        </div>
        {success && <div className={styles.success}>{success}</div>}
        <button type="submit" className={styles.btn} disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</button>
      </form>
    </div>
  );
}
