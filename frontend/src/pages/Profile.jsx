import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Goals.module.css';

const errBox = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13 };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', age: user?.age || '', weight: user?.weight || '', height: user?.height || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.age && Number(form.age) < 1) return setError('Age must be at least 1');
    if (form.weight && Number(form.weight) <= 0) return setError('Weight must be positive');
    if (form.height && Number(form.height) <= 0) return setError('Height must be positive');
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: form.name, age: Number(form.age) || undefined, weight: Number(form.weight) || undefined, height: Number(form.height) || undefined });
      updateUser(data);
      setSuccess('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('New passwords do not match');
    if (pwForm.newPassword.length < 6) return setPwError('New password must be at least 6 characters');
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const bmi = form.weight && form.height ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1) : null;
  const bmiCategory = (b) => {
    if (b < 18.5) return { label: 'Underweight', color: '#06b6d4' };
    if (b < 25)   return { label: 'Normal',      color: '#10b981' };
    if (b < 30)   return { label: 'Overweight',  color: '#f59e0b' };
    return               { label: 'Obese',        color: '#ef4444' };
  };
  const { label: bmiLabel, color: bmiColor } = bmi ? bmiCategory(Number(bmi)) : {};

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Profile</h2>
        <p>Update your personal information</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className={styles.form} style={{ marginBottom: 24 }}>
        {bmi && (
          <div style={{ background: 'var(--bg)', border: `1px solid ${bmiColor}44`, borderRadius: 8, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>BMI</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: bmiColor }}>{bmi}</div>
            </div>
            <div style={{ fontSize: 14, color: bmiColor, fontWeight: 600, background: `${bmiColor}22`, padding: '6px 12px', borderRadius: 20 }}>{bmiLabel}</div>
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
              <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} min={1} max={150} />
              <span className={styles.unit}>yrs</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>Weight</label>
            <div className={styles.inputWrap}>
              <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} min={0.1} step={0.1} />
              <span className={styles.unit}>kg</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>Height</label>
            <div className={styles.inputWrap}>
              <input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} min={1} />
              <span className={styles.unit}>cm</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Email:</strong> {user?.email}
        </div>
        {error && <div style={errBox}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <button type="submit" className={styles.btn} disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</button>
      </form>

      {/* Password change form */}
      <form onSubmit={handlePasswordChange} className={styles.form}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: -8 }}>Change Password</div>
        <div className={styles.field}>
          <label>Current Password</label>
          <div className={styles.inputWrap}>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required placeholder="••••••••" />
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>New Password</label>
            <div className={styles.inputWrap}>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required placeholder="••••••••" minLength={6} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Confirm New Password</label>
            <div className={styles.inputWrap}>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required placeholder="••••••••" />
            </div>
          </div>
        </div>
        {pwError && <div style={errBox}>{pwError}</div>}
        {pwSuccess && <div className={styles.success}>{pwSuccess}</div>}
        <button type="submit" className={styles.btn} disabled={pwSaving}>{pwSaving ? 'Changing...' : 'Change Password'}</button>
      </form>
    </div>
  );
}
